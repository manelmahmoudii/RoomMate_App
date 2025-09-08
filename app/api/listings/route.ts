import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    let decodedToken: { id: string; email: string; role: string; exp: number } | null = null;

    if (token) {
      try {
        decodedToken = jwt.verify(token, SECRET_KEY) as { id: string; email: string; role: string; exp: number };
      } catch (error) {
        console.error("Token verification failed in /api/listings GET:", error);
        // If token is invalid/expired, proceed as unauthenticated to allow public listings
      }
    }

    const connection = await getConnection();
    let query = "SELECT id, owner_id, title, description, price, city, number_of_roommates, amenities, images, status, created_at FROM listings WHERE 1=1";
    const params: string[] = [];

    if (decodedToken?.role === "advertiser") {
      // If an advertiser is logged in, show only their listings
      query += " AND owner_id = ?";
      params.push(decodedToken.id);
    } else {
      // For all other users (students, guests), show only active listings
      query += " AND status = 'active'";
    }

    const [rows] = await connection.query(query, params);
    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { title, description, price, city, number_of_roommates, amenities, images } = await request.json();

    if (!title || !description || !price || !city || !number_of_roommates) {
      return NextResponse.json({ error: "Missing required listing fields" }, { status: 400 });
    }

    const listingId = uuidv4();
    const connection = await getConnection();

    await connection.query(
      "INSERT INTO listings (id, owner_id, title, description, price, city, number_of_roommates, amenities, images, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        listingId,
        decodedToken.id,
        title,
        description,
        price,
        city,
        number_of_roommates,
        JSON.stringify(amenities || {}),
        JSON.stringify(images || []),
        "pending", // New listings are pending approval by default
      ]
    );
    await connection.end();

    return NextResponse.json({ message: "Listing created successfully", listingId }, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
