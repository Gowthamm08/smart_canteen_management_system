import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

const MAX_STOCK_VALUE = 99_999_999.99;

export async function POST(request: NextRequest) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.authorized) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  const data = (typeof body === "object" && body !== null ? body : {}) as {
    ingredient_name?: unknown;
    quantity?: unknown;
    unit?: unknown;
    minimum_stock?: unknown;
    supplier_id?: unknown;
  };
  const name = typeof data.ingredient_name === "string" ? data.ingredient_name.trim() : "";
  const unit = typeof data.unit === "string" ? data.unit.trim() : "";
  const quantity = data.quantity === undefined || data.quantity === "" ? 0 : Number(data.quantity);
  const minimumStock = data.minimum_stock === undefined || data.minimum_stock === ""
    ? 5
    : Number(data.minimum_stock);
  const supplierId = data.supplier_id === undefined || data.supplier_id === null || data.supplier_id === ""
    ? null
    : Number(data.supplier_id);
  const validStockNumber = (value: number) =>
    Number.isFinite(value) && value >= 0 && value <= MAX_STOCK_VALUE && Number(value.toFixed(2)) === value;

  if (!name || name.length > 100 || !unit || unit.length > 20 ||
      !validStockNumber(quantity) || !validStockNumber(minimumStock) ||
      (supplierId !== null && (!Number.isSafeInteger(supplierId) || supplierId <= 0))) {
    return NextResponse.json(
      { success: false, message: "Enter a valid ingredient, unit, stock level and supplier." },
      { status: 400 }
    );
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    if (supplierId !== null) {
      const supplier = await client.query(
        "SELECT 1 FROM suppliers WHERE supplier_id = $1",
        [supplierId]
      );
      if (supplier.rowCount === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { success: false, message: "Selected supplier was not found." },
          { status: 400 }
        );
      }
    }

    const inserted = await client.query(
      `INSERT INTO inventory (ingredient_name, quantity, unit, minimum_stock, supplier_id)
       VALUES ($1, 0, $2, $3, $4)
       RETURNING inventory_id`,
      [name, unit, minimumStock, supplierId]
    );
    const inventoryId = inserted.rows[0].inventory_id as number;

    if (quantity > 0) {
      await client.query(
        `INSERT INTO inventory_transactions
         (inventory_id, transaction_type, quantity, notes)
         VALUES ($1, 'STOCK_IN', $2, 'Opening stock on item creation')`,
        [inventoryId, quantity]
      );
    }

    const result = await client.query(
      `SELECT i.inventory_id, i.ingredient_name, i.quantity, i.unit,
              i.minimum_stock, i.last_updated, i.supplier_id, s.supplier_name
       FROM inventory i
       LEFT JOIN suppliers s ON s.supplier_id = i.supplier_id
       WHERE i.inventory_id = $1`,
      [inventoryId]
    );
    await client.query("COMMIT");

    return NextResponse.json(
      { success: true, message: "Inventory item created successfully.", inventory: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    console.error("Create inventory item error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create inventory item." },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}
