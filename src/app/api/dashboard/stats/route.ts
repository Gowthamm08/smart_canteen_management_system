import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

export async function GET() {
  const auth = await requireRole(["ADMIN", "CUSTOMER"]);

  if (!auth.authorized) {
    return auth.response;
  }

  try {
    if (auth.user.role === "CUSTOMER") {
      const result = await pool.query(
        `SELECT
           COUNT(*)::INTEGER AS total_orders,
           COALESCE(SUM(p.amount) FILTER (
             WHERE p.payment_status = 'SUCCESS' AND o.order_status <> 'CANCELLED'
           ), 0) AS total_spending,
           COUNT(*) FILTER (WHERE order_status = 'COMPLETED')::INTEGER AS completed_orders
         FROM orders o
         LEFT JOIN payments p ON p.order_id = o.order_id
         WHERE o.user_id = $1`,
        [auth.user.user_id]
      );

      const menuResult = await pool.query(
        "SELECT COUNT(*)::INTEGER AS available_menu_items FROM menu_items WHERE is_available = TRUE"
      );

      return NextResponse.json({
        success: true,
        role: "CUSTOMER",
        stats: {
          ...result.rows[0],
          available_menu_items: menuResult.rows[0].available_menu_items,
        },
      });
    }

    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE order_date >= CURRENT_DATE AND order_date < CURRENT_DATE + INTERVAL '1 day')::INTEGER AS today_orders,
        COALESCE(SUM(p.amount) FILTER (
          WHERE order_date >= CURRENT_DATE
            AND order_date < CURRENT_DATE + INTERVAL '1 day'
            AND order_status <> 'CANCELLED'
            AND p.payment_status = 'SUCCESS'
        ), 0) AS today_revenue,
        (SELECT COUNT(*)::INTEGER FROM menu_items) AS total_menu_items,
        (SELECT COUNT(*)::INTEGER FROM inventory WHERE quantity <= minimum_stock) AS low_stock_items
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.order_id
    `);

    return NextResponse.json({
      success: true,
      role: "ADMIN",
      stats: result.rows[0],
    });
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load dashboard statistics." },
      { status: 500 }
    );
  }
}
