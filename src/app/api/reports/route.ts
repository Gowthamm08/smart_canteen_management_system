
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

// GET: Generate business reports (Admin and Staff only)
export async function GET() {
  try {
    const auth = await requireRole(["ADMIN", "STAFF"]);

    if (!auth.authorized) {
      return auth.response;
    }

    // 1. Overall order and revenue summary
    const summaryResult = await pool.query(`
      SELECT
        COUNT(*)::INTEGER AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COUNT(*) FILTER (
          WHERE order_status = 'COMPLETED'
        )::INTEGER AS completed_orders,
        COUNT(*) FILTER (
          WHERE order_status = 'CANCELLED'
        )::INTEGER AS cancelled_orders
      FROM orders;
    `);

    // 2. Daily sales for the last 7 days
    const dailySalesResult = await pool.query(`
      SELECT
        DATE(order_date) AS sale_date,
        COUNT(*)::INTEGER AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_revenue
      FROM orders
      WHERE order_status <> 'CANCELLED'
        AND order_date >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY DATE(order_date)
      ORDER BY sale_date;
    `);

    // 3. Most popular food items
    const popularItemsResult = await pool.query(`
      SELECT
        m.item_name,
        SUM(oi.quantity)::INTEGER AS total_quantity,
        SUM(oi.quantity * oi.unit_price) AS total_revenue
      FROM order_items oi
      INNER JOIN menu_items m
        ON oi.item_id = m.item_id
      INNER JOIN orders o
        ON oi.order_id = o.order_id
      WHERE o.order_status <> 'CANCELLED'
      GROUP BY m.item_id, m.item_name
      ORDER BY total_quantity DESC
      LIMIT 5;
    `);

    // 4. Low-stock ingredients
    const lowStockResult = await pool.query(`
      SELECT
        inventory_id,
        ingredient_name,
        quantity,
        unit,
        minimum_stock
      FROM inventory
      WHERE quantity <= minimum_stock
      ORDER BY ingredient_name;
    `);

    return NextResponse.json({
      success: true,
      summary: summaryResult.rows[0],
      dailySales: dailySalesResult.rows,
      popularItems: popularItemsResult.rows,
      lowStockItems: lowStockResult.rows,
    });
  } catch (error) {
    console.error("Reports API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate reports.",
      },
      { status: 500 }
    );
  }
}
