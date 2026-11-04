
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

// GET: All authenticated users can view the menu
export async function GET() {
  try {
    const auth = await requireRole(["ADMIN", "STAFF", "CUSTOMER"]);

    if (!auth.authorized) {
      return auth.response;
    }

    const result = await pool.query(`
      SELECT
        m.item_id,
        m.item_name,
        m.description,
        m.price,
        m.is_available,
        m.category_id,
        c.category_name
      FROM menu_items AS m
      JOIN categories AS c
        ON m.category_id = c.category_id
      ORDER BY m.item_id;
    `);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      menu: result.rows,
    });
  } catch (error) {
    console.error("Menu API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch menu items",
      },
      { status: 500 }
    );
  }
}
