import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

export async function GET() {
  const auth = await requireRole(["ADMIN", "STAFF", "CUSTOMER"]);
  if (!auth.authorized) return auth.response;

  try {
    const result = await pool.query(
      "SELECT category_id, category_name, description, created_at FROM categories ORDER BY category_name"
    );
    return NextResponse.json({
      success: true,
      count: result.rowCount,
      categories: result.rows,
    });
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to fetch categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.authorized) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body === "object" && body !== null && "category_name" in body
    ? (body as { category_name: unknown }).category_name
    : undefined;
  const description = typeof body === "object" && body !== null && "description" in body
    ? (body as { description: unknown }).description
    : null;

  if (typeof name !== "string" || !name.trim() || name.trim().length > 50 ||
      (description !== null && typeof description !== "string")) {
    return NextResponse.json(
      { success: false, message: "Enter a category name of at most 50 characters." },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      `INSERT INTO categories (category_name, description)
       VALUES ($1, $2)
       RETURNING category_id, category_name, description, created_at`,
      [name.trim(), typeof description === "string" ? description.trim() || null : null]
    );
    return NextResponse.json(
      { success: true, message: "Category created successfully.", category: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { success: false, message: "A category with that name already exists." },
        { status: 409 }
      );
    }
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create category." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.authorized) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  const values = body as { category_id?: unknown; category_name?: unknown; description?: unknown };
  const categoryId = Number(values?.category_id);
  if (!Number.isSafeInteger(categoryId) || categoryId <= 0 ||
      typeof values.category_name !== "string" || !values.category_name.trim() ||
      values.category_name.trim().length > 50 ||
      (values.description !== undefined && values.description !== null && typeof values.description !== "string")) {
    return NextResponse.json(
      { success: false, message: "Provide a valid category ID, name and description." },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      `UPDATE categories
       SET category_name = $1, description = $2
       WHERE category_id = $3
       RETURNING category_id, category_name, description, created_at`,
      [values.category_name.trim(), typeof values.description === "string" ? values.description.trim() || null : null, categoryId]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Category updated successfully.", category: result.rows[0] });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { success: false, message: "A category with that name already exists." },
        { status: 409 }
      );
    }
    console.error("Update category error:", error);
    return NextResponse.json({ success: false, message: "Unable to update category." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.authorized) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  const categoryId = Number(
    typeof body === "object" && body !== null && "category_id" in body
      ? (body as { category_id: unknown }).category_id
      : NaN
  );
  if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
    return NextResponse.json({ success: false, message: "Invalid category ID." }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `DELETE FROM categories c
       WHERE c.category_id = $1
         AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.category_id)
       RETURNING c.category_id`,
      [categoryId]
    );
    if (result.rowCount === 1) {
      return NextResponse.json({ success: true, message: "Category deleted successfully." });
    }
    const exists = await pool.query("SELECT 1 FROM categories WHERE category_id = $1", [categoryId]);
    if (exists.rowCount === 0) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, message: "This category is used by menu items and cannot be deleted." },
      { status: 409 }
    );
  } catch (error) {
    if ((error as { code?: string }).code === "23503") {
      return NextResponse.json(
        { success: false, message: "This category is used by menu items and cannot be deleted." },
        { status: 409 }
      );
    }
    console.error("Delete category error:", error);
    return NextResponse.json({ success: false, message: "Unable to delete category." }, { status: 500 });
  }
}
