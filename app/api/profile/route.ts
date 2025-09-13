import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  let connection;
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!SECRET_KEY) {
      console.error("JWT_SECRET is not defined");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    let decodedToken: { id: string; email: string; role: string; exp: number };
    try {
      decodedToken = jwt.verify(token, SECRET_KEY) as unknown as { id: string; email: string; role: string; exp: number };
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const userId = decodedToken.id;

    connection = await getConnection();
    const [rows] = await connection.query(
      "SELECT id, email, first_name, last_name, phone, user_type, avatar_url, bio, university, study_level, preferences, account_type FROM users WHERE id = ?",
      [userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userProfile = rows[0];
    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function PUT(request: NextRequest) {
  let connection;
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!SECRET_KEY) {
      console.error("JWT_SECRET is not defined");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    let decodedToken: { id: string; email: string; role: string; exp: number };
    try {
      decodedToken = jwt.verify(token, SECRET_KEY) as unknown as { id: string; email: string; role: string; exp: number };
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const userId = decodedToken.id;
    const { first_name, last_name, phone, bio, university, study_level, preferences, avatar_url } = await request.json();

    connection = await getConnection();
    const [result] = await connection.query(
      "UPDATE users SET first_name = ?, last_name = ?, phone = ?, bio = ?, university = ?, study_level = ?, preferences = ?, avatar_url = ? WHERE id = ?",
      [first_name, last_name, phone, bio, university, study_level, preferences ? JSON.stringify(preferences) : null, avatar_url, userId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User not found or no changes made" }, { status: 404 });
    }

    const [updatedRows] = await connection.query(
      "SELECT id, email, first_name, last_name, phone, user_type, avatar_url, bio, university, study_level, preferences, account_type FROM users WHERE id = ?",
      [userId]
    );
    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      return NextResponse.json({ error: "Updated user not found" }, { status: 404 });
    }
    return NextResponse.json(updatedRows[0], { status: 200 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
