
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        t.transaction_id,
        t.inventory_id,
        i.ingredient_name,
        t.transaction_type,
        t.quantity,
        i.unit,
        t.transaction_date,
        t.notes
      FROM inventory_transactions t
      INNER JOIN inventory i
        ON t.inventory_id = i.inventory_id
      ORDER BY
        t.transaction_date DESC,
        t.transaction_id DESC;
    `);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      transactions: result.rows,
    });
  } catch (error) {
    console.error("Transaction history error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch inventory transaction history.",
      },
      { status: 500 }
    );
  }
}
