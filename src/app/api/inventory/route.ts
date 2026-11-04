
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

// GET: Retrieve inventory transaction history (Admin only)

export async function GET() {
  try {
    const auth = await requireRole(["ADMIN"]);

    if (!auth.authorized) {
      return auth.response;
    }

    const result = await pool.query(`
      SELECT
        i.inventory_id,
        i.ingredient_name,
        i.quantity,
        i.unit,
        i.minimum_stock,
        i.last_updated,
        s.supplier_name
      FROM inventory i
      LEFT JOIN suppliers s
        ON i.supplier_id = s.supplier_id
      ORDER BY i.ingredient_name;
    `);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      inventory: result.rows,
    });
  } catch (error) {
    console.error("Fetch inventory error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch inventory",
      },
      { status: 500 }
    );
  }
}


// POST: Add stock or remove stock (Admin only)
export async function POST(request: NextRequest) {
  const auth = await requireRole(["ADMIN"]);

  if (!auth.authorized) {
    return auth.response;
  }

  let client;

  try {
    const body = await request.json();

    const inventoryId = Number(body.inventory_id);
    const quantity = Number(body.quantity);
    const transactionType = body.transaction_type;

    if (
      !Number.isInteger(inventoryId) ||
      inventoryId <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid inventory item." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be greater than zero." },
        { status: 400 }
      );
    }

    if (!["STOCK_IN", "STOCK_OUT"].includes(transactionType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction type must be STOCK_IN or STOCK_OUT.",
        },
        { status: 400 }
      );
    }

    const notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : transactionType === "STOCK_IN"
          ? "Stock added through dashboard"
          : "Stock removed through dashboard";

    client = await pool.connect();

    await client.query("BEGIN");

    // Lock inventory row to prevent concurrent stock changes
    const inventoryResult = await client.query(
      `SELECT inventory_id, ingredient_name, quantity, unit
       FROM inventory
       WHERE inventory_id = $1
       FOR UPDATE`,
      [inventoryId]
    );

    if (inventoryResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { success: false, message: "Inventory item not found." },
        { status: 404 }
      );
    }

    const currentItem = inventoryResult.rows[0];
    const currentQuantity = Number(currentItem.quantity);

    // Prevent removal beyond available stock
    if (
      transactionType === "STOCK_OUT" &&
      quantity > currentQuantity
    ) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: `Insufficient stock. Available: ${currentQuantity} ${currentItem.unit}.`,
        },
        { status: 400 }
      );
    }

    // PostgreSQL trigger automatically updates inventory
    const transactionResult = await client.query(
      `INSERT INTO inventory_transactions
       (inventory_id, transaction_type, quantity, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING transaction_id, transaction_type, quantity, transaction_date`,
      [inventoryId, transactionType, quantity, notes]
    );

    const updatedResult = await client.query(
      `SELECT inventory_id, ingredient_name, quantity, unit
       FROM inventory
       WHERE inventory_id = $1`,
      [inventoryId]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message:
        transactionType === "STOCK_IN"
          ? "Stock added successfully."
          : "Stock removed successfully.",
      transaction: transactionResult.rows[0],
      inventory: updatedResult.rows[0],
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Inventory transaction error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process inventory transaction.",
      },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}
