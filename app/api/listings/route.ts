import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key";

export async function GET(request: NextRequest) {
  let connection;
  try {
    const token = request.cookies.get("token")?.value;
    let decodedToken: { id: string; email: string; role: string; exp: number } | null = null;
    if (token) {
      try {
        decodedToken = jwt.verify(token, SECRET_KEY) as { id: string; email: string; role: string; exp: number };
      } catch (error) {
        console.error("Token verification failed in /api/listings GET:", error);
      }
    }
    connection = await getConnection();
    const searchParams = request.nextUrl.searchParams;
    
    let query = "SELECT id, owner_id, title, description, price, city, number_of_roommates, amenities, images, status, created_at FROM listings WHERE 1=1";
    const params: (string | number)[] = [];

    if (decodedToken?.role === "advertiser") {
      query += " AND owner_id = ?";
      params.push(decodedToken.id);
    } else {
      query += " AND status = 'active'";
    }

    // Apply filters from search parameters
    const searchTerm = searchParams.get("search");
    if (searchTerm) {
      query += " AND (title LIKE ? OR description LIKE ? OR city LIKE ?)";
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }

    const city = searchParams.get("city");
    if (city && city !== "all") {
      query += " AND city = ?";
      params.push(city);
    }

    const maxRoommates = searchParams.get("max_roommates");
    if (maxRoommates && maxRoommates !== "any") {
      query += " AND number_of_roommates <= ?";
      params.push(parseInt(maxRoommates));
    }

    const minPrice = searchParams.get("min_price");
    if (minPrice) {
      query += " AND price >= ?";
      params.push(parseFloat(minPrice));
    }

    const maxPrice = searchParams.get("max_price");
    if (maxPrice) {
      query += " AND price <= ?";
      params.push(parseFloat(maxPrice));
    }

    const verified = searchParams.get("verified");
    if (verified === "true") {
      // This would typically involve a join to the users table and checking a 'verified' status.
      // For now, let's assume a 'is_verified' column on listings or owner is needed.
      // For simplicity, we'll skip this or assume it's handled by 'active' status for now.
    }

    const sortBy = searchParams.get("sort_by");
    if (sortBy) {
      switch (sortBy) {
        case "newest":
          query += " ORDER BY created_at DESC";
          break;
        case "price-low":
          query += " ORDER BY price ASC";
          break;
        case "price-high":
          query += " ORDER BY price DESC";
          break;
        default:
          query += " ORDER BY created_at DESC";
      }
    }

    const [rows] = await connection.query(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

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
    if (decodedToken.role !== "advertiser") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { title, description, price, city, number_of_roommates, amenities, images } = await request.json();
    if (!title || !description || !price || !city || !number_of_roommates) {
      return NextResponse.json({ error: "Missing required listing fields" }, { status: 400 });
    }
    const listingId = uuidv4();
    connection = await getConnection();
    await connection.query(
      "INSERT INTO listings (id, owner_id, title, description, price, city, number_of_roommates, amenities, images, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [listingId, decodedToken.id, title, description, price, city, number_of_roommates, JSON.stringify(amenities || {}), JSON.stringify(images || []), "pending",]
    );
    return NextResponse.json({ message: "Listing created successfully", listingId }, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
