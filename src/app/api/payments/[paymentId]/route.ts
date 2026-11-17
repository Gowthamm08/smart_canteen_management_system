import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const auth = await requireRole(["ADMIN", "CUSTOMER"]);
  if (!auth.authorized) return auth.response;

  const { paymentId: rawId } = await params;
  const paymentId = Number(rawId);
  if (!Number.isSafeInteger(paymentId) || paymentId <= 0) {
    return NextResponse.json({ success: false, message: "Invalid payment ID." }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `SELECT p.payment_id, p.order_id, p.amount, p.payment_method,
              p.payment_status, p.payment_date, o.order_status,
              ${auth.user.role === "ADMIN" ? "u.full_name AS customer_name" : "NULL::text AS customer_name"}
       FROM payments p
       JOIN orders o ON o.order_id = p.order_id
       JOIN users u ON u.user_id = o.user_id
       WHERE p.payment_id = $1 ${auth.user.role === "CUSTOMER" ? "AND o.user_id = $2" : ""}`,
      auth.user.role === "CUSTOMER" ? [paymentId, auth.user.user_id] : [paymentId]
    );
    if (!result.rowCount) {
      return NextResponse.json({ success: false, message: "Payment not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, payment: result.rows[0] });
  } catch (error) {
    console.error("Payment detail GET error:", error);
    return NextResponse.json({ success: false, message: "Unable to load payment details." }, { status: 500 });
  }
}
