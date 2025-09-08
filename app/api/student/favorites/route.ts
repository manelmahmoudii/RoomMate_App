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

    if (decodedToken.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const connection = await getConnection();
    const [rows] = await connection.query(
      `SELECT
        f.id AS favorite_id,
        l.id AS listing_id,
        l.title,
        l.description,
        l.price,
        l.city,
        l.images,
        l.status,
        l.number_of_roommates,
        l.amenities
      FROM favorites f
      JOIN listings l ON f.listing_id = l.id
      WHERE f.user_id = ?`,
      [decodedToken.id]
    );
    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching student favorites:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}
