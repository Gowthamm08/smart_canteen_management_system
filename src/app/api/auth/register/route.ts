
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName =
      typeof body.full_name === "string" ? body.full_name.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.toLowerCase().trim()
        : "";

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    // Validate required fields
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    if (fullName.length > 100) {
      return NextResponse.json(
        { success: false, message: "Name must not exceed 100 characters." },
        { status: 400 }
      );
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    // Validate phone
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Check existing email or phone
    const existingUser = await pool.query(
      `SELECT user_id
       FROM users
       WHERE email = $1 OR phone = $2
       LIMIT 1`,
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or phone number is already registered.",
        },
        { status: 409 }
      );
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    // Register as CUSTOMER only
    const result = await pool.query(
      `INSERT INTO users
       (full_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'CUSTOMER')
       RETURNING user_id, full_name, email, phone, role`,
      [fullName, email, phone, passwordHash]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please log in.",
        user: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create account. Please try again.",
      },
      { status: 500 }
    );
  }
}
