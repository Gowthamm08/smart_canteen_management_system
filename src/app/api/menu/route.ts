
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

// GET: All authenticated users can view the menu
export async function GET() {
  try {
    const auth = await requireRole(["ADMIN", "STAFF", "CUSTOMER"]);

    if (!auth.authorized) return auth.response;

    const result = await pool.query(`
      SELECT
        m.item_id,
        m.item_name,
        m.description,
        m.price,
        m.is_available,
        m.category_id,
        m.image_url,
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
      { success: false, message: "Unable to fetch menu items" },
      { status: 500 }
    );
  }
}

// POST: Admin can add a food item
export async function POST(request: Request) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const body = await request.json();

    const {
      item_name,
      description,
      price,
      category_id,
      is_available = true,
      image_url = null,
    } = body;

    if (
      typeof item_name !== "string" ||
      !item_name.trim() ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0 ||
      !Number.isInteger(Number(category_id)) ||
      typeof is_available !== "boolean" ||
      (image_url !== null && typeof image_url !== "string")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid food item details" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO menu_items
       (item_name, description, price, category_id, is_available, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        item_name.trim(),
        description || null,
        Number(price),
        Number(category_id),
        is_available,
        image_url,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Food item added successfully",
        item: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add menu item error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to add food item. Check the category." },
      { status: 500 }
    );
  }
}

// PATCH: Admin can edit a food item
export async function PATCH(request: Request) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const body = await request.json();

    const {
      item_id,
      item_name,
      description,
      price,
      category_id,
      is_available,
      image_url,
    } = body;

    if (
      !Number.isInteger(Number(item_id)) ||
      Number(item_id) <= 0 ||
      typeof item_name !== "string" ||
      !item_name.trim() ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0 ||
      !Number.isInteger(Number(category_id)) ||
      typeof is_available !== "boolean" ||
      (image_url !== undefined &&
        image_url !== null &&
        typeof image_url !== "string")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid food item details" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE menu_items
       SET item_name = $1,
           description = $2,
           price = $3,
           category_id = $4,
           is_available = $5,
           image_url = COALESCE($6, image_url)
       WHERE item_id = $7
       RETURNING *`,
      [
        item_name.trim(),
        description || null,
        Number(price),
        Number(category_id),
        is_available,
        image_url ?? null,
        Number(item_id),
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Food item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Food item updated successfully",
      item: result.rows[0],
    });
  } catch (error) {
    console.error("Update menu item error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update food item" },
      { status: 500 }
    );
  }
}

// DELETE: Admin can delete a food item
export async function DELETE(request: Request) {
  try {
    const auth = await requireRole(["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const { item_id } = await request.json();
    const id = Number(item_id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid food item ID" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "DELETE FROM menu_items WHERE item_id = $1 RETURNING item_id",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Food item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Food item deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu item error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete item. It may already be used in an order.",
      },
      { status: 409 }
    );
  }
}
