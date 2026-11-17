import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await requireRole(["ADMIN", "STAFF", "CUSTOMER"]);
  if (!auth.authorized) return auth.response;
  const { orderId: rawId } = await params;
  const orderId = Number(rawId);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ success: false, message: "Invalid order ID." }, { status: 400 });
  }

  try {
    if (auth.user.role === "CUSTOMER") {
      const owned = await pool.query("SELECT 1 FROM orders WHERE order_id = $1 AND user_id = $2", [orderId, auth.user.user_id]);
      if (!owned.rowCount) return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "smart_canteen_nosqldb");
    const activities = await db.collection("order_activity_logs")
      .find({ order_id: orderId })
      .sort({ activity_date: 1, _id: 1 })
      .toArray();
    return NextResponse.json({ success: true, activities });
  } catch (error) {
    console.error("Order activity GET error:", error);
    return NextResponse.json({ success: false, message: "Unable to load order activity." }, { status: 500 });
  }
}
