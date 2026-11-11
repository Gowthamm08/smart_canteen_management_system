import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

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

// POST: Authenticated customers can place orders.
export async function POST(request: NextRequest) {
  const auth = await requireRole(["ADMIN", "STAFF", "CUSTOMER"]);

  if (!auth.authorized) {
    return auth.response;
  }

  let client;
  let transactionStarted = false;

  try {
    const body = await request.json();
    const items = body.items;

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
        !Number.isInteger(itemId) ||
        !Number.isInteger(quantity) ||
        itemId <= 0 ||
        quantity <= 0
      ) {
        throw new Error("Invalid cart item");
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
        throw new Error(`Food item ${itemId} is unavailable`);
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

    console.error("Order creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to place order",
      },
      { status: 400 }
    );
  } finally {
    client?.release();
  }
}
