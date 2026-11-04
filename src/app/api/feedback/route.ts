
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/authorization";

// GET: View all customer feedback (Admin and Staff only)
export async function GET() {
  const auth = await requireRole(["ADMIN", "STAFF"]);

  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const client = await clientPromise;

    const db = client.db(
      process.env.MONGODB_DATABASE || "smart_canteen_nosqldb"
    );

    const collection = db.collection("customer_feedback");

    const feedback = await collection
      .find({})
      .sort({ _id: -1 })
      .toArray();

    const totalReviews = feedback.length;

    const averageRating =
      totalReviews > 0
        ? feedback.reduce(
            (sum, item) => sum + Number(item.rating || 0),
            0
          ) / totalReviews
        : 0;

    return NextResponse.json({
      success: true,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      feedback,
    });
  } catch (error) {
    console.error("Feedback GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// POST: Submit feedback (Customer only)
export async function POST(request: Request) {
  const auth = await requireRole(["CUSTOMER"]);

  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const body = await request.json();

    const { food_item, rating, comment } = body;

    if (
      typeof food_item !== "string" ||
      !food_item.trim() ||
      typeof comment !== "string" ||
      !comment.trim() ||
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide valid feedback details",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const db = client.db(
      process.env.MONGODB_DATABASE || "smart_canteen_nosqldb"
    );

    const result = await db.collection("customer_feedback").insertOne({
      customer_name: auth.user.full_name,
      customer_id: auth.user.user_id,
      food_item: food_item.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      created_at: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully",
        insertedId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Feedback POST error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
