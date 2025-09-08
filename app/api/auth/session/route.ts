import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getConnection } from "@/lib/db";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key";

export async function GET(request: NextRequest) {
  let connection;
  try {
    const token = request.cookies.get("token")?.value;
    console.log("Session API: Received token from cookies:", token ? "exists" : "not found");

    if (!token) {
      console.log("Session API: No token provided, returning 401.");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    let decodedToken: { id: string; email: string; role: string; exp: number };
    try {
      decodedToken = jwt.verify(token, SECRET_KEY) as { id: string; email: string; role: string; exp: number };
      console.log("Session API: Token decoded successfully:", decodedToken.id, decodedToken.email, decodedToken.role);
    } catch (error) {
      console.error("Session API: Token verification failed:", error);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    console.log("Session API: Attempting to get database connection.");
    connection = await getConnection();
    console.log("Session API: Database connection obtained.");

    console.log("Session API: Querying for user with ID:", decodedToken.id);
    const [rows] = await connection.query(
      "SELECT id, email, first_name, last_name, user_type, avatar_url, created_at, status FROM users WHERE id = ?",
      [decodedToken.id]
    );
    const user = (rows as any)[0];
    console.log("Session API: User query result:", user ? "found" : "not found");

    if (!user) {
      console.log("Session API: User not found in DB, returning 404.");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: user.user_type,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      status: user.status,
    });
  } catch (error) {
    console.error("Session API: Error fetching user session:", error);
    return NextResponse.json({ error: "Failed to fetch user session" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
      console.log("Session API: Database connection released.");
    }
  }
}
