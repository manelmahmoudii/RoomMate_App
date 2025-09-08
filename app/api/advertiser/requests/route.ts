import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let decodedToken: { id: string; email: string; role: string; exp: number };
    try {
      decodedToken = jwt.verify(token, SECRET_KEY) as { id: string; email: string; role: string; exp: number };
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    if (decodedToken.role !== "advertiser") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const connection = await getConnection();
    const [rows] = await connection.query(
      `SELECT 
        rr.id, rr.student_id, rr.listing_id, rr.message, rr.status, rr.created_at,
        u.first_name AS student_first_name, u.last_name AS student_last_name, u.avatar_url AS student_avatar_url,
        l.title AS listing_title
      FROM roommate_requests rr
      JOIN listings l ON rr.listing_id = l.id
      JOIN users u ON rr.student_id = u.id
      WHERE l.owner_id = ?`,
      [decodedToken.id]
    );
    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching advertiser requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
