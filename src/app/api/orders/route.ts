import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

class OrderRequestError extends Error {}

const orderStatusTransitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

// GET: Admin and Staff can view all orders.
// Customers can view only their own orders.
export async function GET() {
  try {
    const auth = await requireRole(["ADMIN", "STAFF", "CUSTOMER"]);

    if (!auth.authorized) {
      return auth.response;
    }

    const isCustomer = auth.user.role === "CUSTOMER";

    const result = await pool.query(
      `
      SELECT
        o.order_id,
        u.full_name AS customer_name,
        o.order_date,
        o.total_amount,
        o.order_status,
        MAX(p.payment_method) AS payment_method,
        MAX(p.payment_status) AS payment_status,
        MAX(p.payment_date) AS payment_date,
        COALESCE(
          json_agg(
            json_build_object(
              'item_name', m.item_name,
              'quantity', oi.quantity
            )
            ORDER BY oi.order_item_id
          ) FILTER (WHERE oi.order_item_id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN menu_items m ON oi.item_id = m.item_id
      LEFT JOIN payments p ON p.order_id = o.order_id
      ${isCustomer ? "WHERE o.user_id = $1" : ""}
      GROUP BY o.order_id, u.full_name
      ORDER BY o.order_date DESC
      `,
      isCustomer ? [auth.user.user_id] : []
    );

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      orders: result.rows,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch orders",
      },
      { status: 500 }
    );
  }
}

// PATCH: Admin and staff can advance an order through valid workflow states.
export async function PATCH(request: NextRequest) {
  const auth = await requireRole(["ADMIN", "STAFF"]);

  if (!auth.authorized) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const orderId =
    typeof body === "object" && body !== null && "order_id" in body
      ? Number((body as { order_id: unknown }).order_id)
      : NaN;
  const nextStatus =
    typeof body === "object" && body !== null && "order_status" in body
      ? (body as { order_status: unknown }).order_status
      : undefined;

  if (
    !Number.isSafeInteger(orderId) ||
    orderId <= 0 ||
    typeof nextStatus !== "string" ||
    !Object.hasOwn(orderStatusTransitions, nextStatus)
  ) {
    return NextResponse.json(
      { success: false, message: "Provide a valid order ID and status." },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const current = await client.query(
      `SELECT o.order_status, o.user_id, u.full_name AS customer_name
       FROM orders o JOIN users u ON u.user_id = o.user_id
       WHERE o.order_id = $1 FOR UPDATE OF o`,
      [orderId]
    );

    if (current.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    const currentStatus = String(current.rows[0].order_status);
    if (!orderStatusTransitions[currentStatus]?.includes(nextStatus)) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          success: false,
          message: `Order cannot move from ${currentStatus} to ${nextStatus}.`,
        },
        { status: 409 }
      );
    }

    const updated = await client.query(
      `UPDATE orders
       SET order_status = $1
       WHERE order_id = $2
       RETURNING order_id, order_status`,
      [nextStatus, orderId]
    );
    if (nextStatus === "CANCELLED") {
      await client.query(
        `UPDATE payments
         SET payment_status = CASE WHEN payment_status = 'SUCCESS' THEN 'REFUNDED' ELSE 'FAILED' END
         WHERE order_id = $1 AND payment_status IN ('SUCCESS', 'PENDING')`,
        [orderId]
      );
    }
    await client.query("COMMIT");

    try {
      const mongoClient = await clientPromise;
      const db = mongoClient.db(process.env.MONGODB_DATABASE || "smart_canteen_nosqldb");
      await db.collection("order_activity_logs").insertOne({
        order_id: orderId,
        customer_name: current.rows[0].customer_name,
        status: nextStatus,
        description: `Order status changed from ${currentStatus} to ${nextStatus}.`,
        activity_date: new Date(),
      });
    } catch (error) {
      console.error("Order activity log insert failed:", error);
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully.",
      order: updated.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Order status update error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update order status." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// POST: Customers can place orders only for their own session user ID.
export async function POST(request: NextRequest) {
  const auth = await requireRole(["CUSTOMER"]);

  if (!auth.authorized) {
    return auth.response;
  }

  let client;
  let transactionStarted = false;

  try {
    const body: unknown = await request.json();
    const items =
      typeof body === "object" && body !== null && "items" in body
        ? (body as { items?: unknown }).items
        : undefined;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart is empty",
        },
        { status: 400 }
      );
    }

    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    // Use the logged-in user's actual database ID.
    const userId = auth.user.user_id;

    const orderResult = await client.query(
      `INSERT INTO orders
       (user_id, total_amount, order_status)
       VALUES ($1, 0, 'PENDING')
       RETURNING order_id`,
      [userId]
    );

    const orderId = orderResult.rows[0].order_id;

    // Add food items.
    for (const item of items) {
      const itemId = Number(item.item_id);
      const quantity = Number(item.quantity);

      if (
        !Number.isSafeInteger(itemId) ||
        !Number.isSafeInteger(quantity) ||
        itemId <= 0 ||
        quantity <= 0
      ) {
        throw new OrderRequestError("Cart contains an invalid item or quantity.");
      }

      const menuResult = await client.query(
        `SELECT price, is_available
         FROM menu_items
         WHERE item_id = $1`,
        [itemId]
      );

      if (
        menuResult.rowCount === 0 ||
        !menuResult.rows[0].is_available
      ) {
        throw new OrderRequestError("A selected food item is unavailable.");
      }

      const price = menuResult.rows[0].price;

      await client.query(
        `INSERT INTO order_items
         (order_id, item_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, itemId, quantity, price]
      );
    }

    // Calculate total using stored procedure.
    await client.query(
      "CALL update_order_total($1)",
      [orderId]
    );

    const totalResult = await client.query(
      `SELECT total_amount
       FROM orders
       WHERE order_id = $1`,
      [orderId]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    try {
      const mongoClient = await clientPromise;
      const db = mongoClient.db(process.env.MONGODB_DATABASE || "smart_canteen_nosqldb");
      await db.collection("order_activity_logs").insertOne({
        order_id: orderId,
        customer_name: auth.user.full_name,
        status: "PENDING",
        description: "Customer placed a new order.",
        activity_date: new Date(),
      });
    } catch (error) {
      console.error("Order activity log insert failed:", error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        order_id: orderId,
        total_amount: totalResult.rows[0].total_amount,
      },
      { status: 201 }
    );
  } catch (error) {
    if (client && transactionStarted) {
      await client.query("ROLLBACK").catch(() => {});
    }

    const isRequestError = error instanceof OrderRequestError;

    if (!isRequestError) {
      console.error("Order creation error:", error);
    }

    return NextResponse.json(
      {
        success: false,
        message: isRequestError
          ? error.message
          : "Unable to place order. Please try again.",
      },
      { status: isRequestError ? 400 : 500 }
    );
  } finally {
    client?.release();
  }
}
