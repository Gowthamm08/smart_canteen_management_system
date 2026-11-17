import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

type SupplierInput = {
  supplier_name?: unknown;
  contact_person?: unknown;
  phone?: unknown;
  email?: unknown;
  address?: unknown;
};

function normalizeSupplier(body: unknown) {
  const data = (typeof body === "object" && body !== null ? body : {}) as SupplierInput;
  const supplierName = typeof data.supplier_name === "string" ? data.supplier_name.trim() : "";
  const contactPerson = typeof data.contact_person === "string" ? data.contact_person.trim() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const address = typeof data.address === "string" ? data.address.trim() : "";

  if (!supplierName || supplierName.length > 100 || contactPerson.length > 100 ||
      phone.length > 15 || email.length > 150 ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
      (data.contact_person != null && typeof data.contact_person !== "string") ||
      (data.phone != null && typeof data.phone !== "string") ||
      (data.email != null && typeof data.email !== "string") ||
      (data.address != null && typeof data.address !== "string")) {
    return null;
  }

  return {
    supplierName,
    contactPerson: contactPerson || null,
    phone: phone || null,
    email: email || null,
    address: address || null,
  };
}

async function readBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isUniqueViolation(error: unknown) {
  return (error as { code?: string })?.code === "23505";
}

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.authorized) return auth.response;

  try {
    const result = await pool.query(
      `SELECT supplier_id, supplier_name, contact_person, phone, email, address, created_at
       FROM suppliers ORDER BY supplier_name`
    );
    return NextResponse.json({ success: true, count: result.rowCount, suppliers: result.rows });
  } catch (error) {
    console.error("Fetch suppliers error:", error);
    return NextResponse.json({ success: false, message: "Unable to fetch suppliers." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.authorized) return auth.response;

  const input = normalizeSupplier(await readBody(request));
  if (!input) {
    return NextResponse.json({ success: false, message: "Enter a valid supplier name and contact details." }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `INSERT INTO suppliers (supplier_name, contact_person, phone, email, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING supplier_id, supplier_name, contact_person, phone, email, address, created_at`,
      [input.supplierName, input.contactPerson, input.phone, input.email, input.address]
    );
    return NextResponse.json({ success: true, message: "Supplier created successfully.", supplier: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ success: false, message: "Supplier phone or email is already in use." }, { status: 409 });
    }
    console.error("Create supplier error:", error);
    return NextResponse.json({ success: false, message: "Unable to create supplier." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.authorized) return auth.response;

  const body = await readBody(request);
  const supplierId = Number(
    typeof body === "object" && body !== null && "supplier_id" in body
      ? (body as { supplier_id: unknown }).supplier_id
      : NaN
  );
  const input = normalizeSupplier(body);
  if (!Number.isSafeInteger(supplierId) || supplierId <= 0 || !input) {
    return NextResponse.json({ success: false, message: "Provide a valid supplier ID and contact details." }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `UPDATE suppliers
       SET supplier_name = $1, contact_person = $2, phone = $3, email = $4, address = $5
       WHERE supplier_id = $6
       RETURNING supplier_id, supplier_name, contact_person, phone, email, address, created_at`,
      [input.supplierName, input.contactPerson, input.phone, input.email, input.address, supplierId]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, message: "Supplier not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Supplier updated successfully.", supplier: result.rows[0] });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ success: false, message: "Supplier phone or email is already in use." }, { status: 409 });
    }
    console.error("Update supplier error:", error);
    return NextResponse.json({ success: false, message: "Unable to update supplier." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.authorized) return auth.response;

  const body = await readBody(request);
  const supplierId = Number(
    typeof body === "object" && body !== null && "supplier_id" in body
      ? (body as { supplier_id: unknown }).supplier_id
      : NaN
  );
  if (!Number.isSafeInteger(supplierId) || supplierId <= 0) {
    return NextResponse.json({ success: false, message: "Invalid supplier ID." }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `DELETE FROM suppliers s
       WHERE s.supplier_id = $1
         AND NOT EXISTS (SELECT 1 FROM inventory i WHERE i.supplier_id = s.supplier_id)
       RETURNING s.supplier_id`,
      [supplierId]
    );
    if (result.rowCount === 1) {
      return NextResponse.json({ success: true, message: "Supplier deleted successfully." });
    }
    const exists = await pool.query("SELECT 1 FROM suppliers WHERE supplier_id = $1", [supplierId]);
    if (exists.rowCount === 0) {
      return NextResponse.json({ success: false, message: "Supplier not found." }, { status: 404 });
    }
    return NextResponse.json(
      { success: false, message: "This supplier is linked to inventory and cannot be deleted." },
      { status: 409 }
    );
  } catch (error) {
    if ((error as { code?: string }).code === "23503") {
      return NextResponse.json(
        { success: false, message: "This supplier is linked to inventory and cannot be removed." },
        { status: 409 }
      );
    }
    console.error("Delete supplier error:", error);
    return NextResponse.json({ success: false, message: "Unable to delete supplier." }, { status: 500 });
  }
}
