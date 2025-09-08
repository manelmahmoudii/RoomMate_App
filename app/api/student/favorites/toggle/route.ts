import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key";

export async function POST(request: NextRequest) {
  let connection;
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

    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json({ error: "Missing listing ID" }, { status: 400 });
    }

    connection = await getConnection();

    // Check if the listing is already favorited by the student
    const [existingFavorite] = await connection.query(
      "SELECT id FROM favorites WHERE user_id = ? AND listing_id = ?",
      [decodedToken.id, listingId]
    );

    if ((existingFavorite as any[]).length > 0) {
      // If already favorited, remove it
      await connection.query("DELETE FROM favorites WHERE user_id = ? AND listing_id = ?", [
        decodedToken.id,
        listingId,
      ]);
      return NextResponse.json({ message: "Listing unfavorited successfully", favorited: false });
    } else {
      // If not favorited, add it
      const favoriteId = uuidv4();
      await connection.query("INSERT INTO favorites (id, user_id, listing_id) VALUES (?, ?, ?)", [
        favoriteId,
        decodedToken.id,
        listingId,
      ]);
      return NextResponse.json({ message: "Listing favorited successfully", favorited: true });
    }
  } catch (error) {
    console.error("Error toggling favorite listing:", error);
    return NextResponse.json({ error: "Failed to toggle favorite listing" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
