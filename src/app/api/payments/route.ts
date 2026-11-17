import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

const paymentMethods = ["CASH", "UPI", "CARD"] as const;
type PaymentMethod = (typeof paymentMethods)[number];

export async function GET(request: NextRequest) {
  const auth = await requireRole(["ADMIN", "CUSTOMER"]);
  if (!auth.authorized) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const method = url.searchParams.get("method");
  const validStatuses = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];
  if (auth.user.role === "ADMIN" && status && !validStatuses.includes(status)) {
    return NextResponse.json({ success: false, message: "Invalid payment status filter." }, { status: 400 });
  }
  if (auth.user.role === "ADMIN" && method && !paymentMethods.includes(method as PaymentMethod)) {
    return NextResponse.json({ success: false, message: "Invalid payment method filter." }, { status: 400 });
  }

  try {
    const values: unknown[] = [];
    const where: string[] = [];
    if (auth.user.role === "CUSTOMER") {
      values.push(auth.user.user_id);
      where.push(`o.user_id = $${values.length}`);
    } else {
      if (status) {
        values.push(status);
        where.push(`p.payment_status = $${values.length}`);
      }
      if (method) {
        values.push(method);
        where.push(`p.payment_method = $${values.length}`);
      }
    }

    const result = await pool.query(
      `SELECT p.payment_id, p.order_id, p.amount, p.payment_method,
              p.payment_status, p.payment_date, o.order_status,
              ${auth.user.role === "ADMIN" ? "u.full_name AS customer_name" : "NULL::text AS customer_name"}
       FROM payments p
       JOIN orders o ON o.order_id = p.order_id
       JOIN users u ON u.user_id = o.user_id
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY p.payment_date DESC, p.payment_id DESC`,
      values
    );

    if (auth.user.role === "CUSTOMER") {
      return NextResponse.json({ success: true, payments: result.rows });
    }

    const summary = await pool.query(`
      SELECT
        COALESCE(SUM(p.amount) FILTER (WHERE p.payment_status = 'SUCCESS' AND o.order_status <> 'CANCELLED'), 0) AS total_revenue,
        COUNT(*) FILTER (WHERE p.payment_status = 'SUCCESS' AND o.order_status <> 'CANCELLED')::INTEGER AS successful_payments,
        COUNT(*) FILTER (WHERE p.payment_status = 'PENDING')::INTEGER AS pending_payments,
        COUNT(*) FILTER (WHERE p.payment_status = 'FAILED')::INTEGER AS failed_payments
      FROM payments p JOIN orders o ON o.order_id = p.order_id
    `);

    return NextResponse.json({ success: true, payments: result.rows, summary: summary.rows[0] });
  } catch (error) {
    console.error("Payments GET error:", error);
    return NextResponse.json({ success: false, message: "Unable to fetch payments." }, { status: 500 });
  }
}

// Demo-only payment processing. Amount and ownership always come from the locked order.
export async function POST(request: NextRequest) {
  const auth = await requireRole(["CUSTOMER"]);
  if (!auth.authorized) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  const orderId = typeof body === "object" && body !== null && "order_id" in body
    ? Number((body as { order_id: unknown }).order_id) : NaN;
  const method = typeof body === "object" && body !== null && "payment_method" in body
    ? (body as { payment_method: unknown }).payment_method : undefined;
  const simulationOutcome = typeof body === "object" && body !== null && "simulation_outcome" in body
    ? (body as { simulation_outcome: unknown }).simulation_outcome : undefined;

  if (!Number.isSafeInteger(orderId) || orderId <= 0 || typeof method !== "string" || !paymentMethods.includes(method as PaymentMethod)) {
    return NextResponse.json({ success: false, message: "Provide a valid order and payment method." }, { status: 400 });
  }
  if (method !== "CASH" && simulationOutcome !== "SUCCESS" && simulationOutcome !== "FAILED") {
    return NextResponse.json({ success: false, message: "Choose a simulated online payment outcome." }, { status: 400 });
  }
  if (method === "CASH" && simulationOutcome !== undefined) {
    return NextResponse.json({ success: false, message: "Cash on Delivery does not use an online simulation outcome." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const order = await client.query(
      "SELECT order_id, user_id, total_amount, order_status FROM orders WHERE order_id = $1 FOR UPDATE",
      [orderId]
    );
    if (!order.rowCount || Number(order.rows[0].user_id) !== auth.user.user_id) {
      await client.query("ROLLBACK");
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }
    if (order.rows[0].order_status === "CANCELLED") {
      await client.query("ROLLBACK");
      return NextResponse.json({ success: false, message: "Cancelled orders cannot be paid." }, { status: 409 });
    }
    const amount = String(order.rows[0].total_amount);
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ success: false, message: "Order amount is invalid." }, { status: 409 });
    }

    const existing = await client.query("SELECT payment_id, payment_status FROM payments WHERE order_id = $1 FOR UPDATE", [orderId]);
    let payment;
    const paymentStatus = method === "CASH" ? "PENDING" : simulationOutcome;
    if (existing.rowCount) {
      if (existing.rows[0].payment_status !== "FAILED" || method === "CASH") {
        await client.query("ROLLBACK");
        return NextResponse.json({ success: false, message: "A payment record already exists for this order." }, { status: 409 });
      }
      const updated = await client.query(
        `UPDATE payments SET amount = $1, payment_method = $2, payment_status = $3, payment_date = CURRENT_TIMESTAMP
         WHERE payment_id = $4 RETURNING payment_id, order_id, amount, payment_method, payment_status, payment_date`,
        [amount, method, paymentStatus, existing.rows[0].payment_id]
      );
      payment = updated.rows[0];
    } else {
      const inserted = await client.query(
        `INSERT INTO payments (order_id, amount, payment_method, payment_status)
         VALUES ($1, $2, $3, $4)
         RETURNING payment_id, order_id, amount, payment_method, payment_status, payment_date`,
        [orderId, amount, method, paymentStatus]
      );
      payment = inserted.rows[0];
    }

    await client.query("COMMIT");
    return NextResponse.json({
      success: true,
      message: payment.payment_status === "SUCCESS"
        ? "Simulated payment approved. No real money was charged."
        : payment.payment_status === "FAILED"
          ? "Simulated payment declined. No real money was charged."
          : "Cash on Delivery selected. Payment is pending collection.",
      payment,
    }, { status: existing.rowCount ? 200 : 201 });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Payment POST error:", error);
    return NextResponse.json({ success: false, message: "Unable to process payment." }, { status: 500 });
  } finally {
    client.release();
  }
}

// Only administrators can record COD collection; online demo statuses are immutable here.
export async function PATCH(request: NextRequest) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.authorized) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }
  const paymentId = typeof body === "object" && body !== null && "payment_id" in body
    ? Number((body as { payment_id: unknown }).payment_id) : NaN;
  if (!Number.isSafeInteger(paymentId) || paymentId <= 0) {
    return NextResponse.json({ success: false, message: "Provide a valid payment ID." }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `UPDATE payments SET payment_status = 'SUCCESS', payment_date = CURRENT_TIMESTAMP
       WHERE payment_id = $1 AND payment_method = 'CASH' AND payment_status = 'PENDING'
       RETURNING payment_id, order_id, amount, payment_method, payment_status, payment_date`,
      [paymentId]
    );
    if (!result.rowCount) {
      return NextResponse.json({ success: false, message: "Only pending Cash on Delivery payments can be marked collected." }, { status: 409 });
    }
    return NextResponse.json({ success: true, message: "Cash collection recorded.", payment: result.rows[0] });
  } catch (error) {
    console.error("Payment PATCH error:", error);
    return NextResponse.json({ success: false, message: "Unable to update payment." }, { status: 500 });
  }
}
