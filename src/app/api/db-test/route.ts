
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/authorization";

// GET: Test database connections (Admin only)
export async function GET() {
  const auth = await requireRole(["ADMIN"]);

  if (!auth.authorized) {
    return auth.response;
  }

  try {
    // Test PostgreSQL
    const pgResult = await pool.query(
      "SELECT current_database() AS database"
    );

    // Test MongoDB
    const mongoClient = await clientPromise;
    const mongoDatabase = process.env.MONGODB_DATABASE;

    if (!mongoDatabase) {
      throw new Error("MONGODB_DATABASE is missing");
    }

    const mongoResult = await mongoClient
      .db(mongoDatabase)
      .command({ ping: 1 });

    return NextResponse.json({
      success: true,
      postgres: {
        connected: true,
        database: pgResult.rows[0].database,
      },
      mongodb: {
        connected: mongoResult.ok === 1,
        database: mongoDatabase,
      },
    });
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed. Check server logs.",
      },
      { status: 500 }
    );
  }
}
