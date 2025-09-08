import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  let connection;
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing listing ID" }, { status: 400 });
    }

    const token = request.cookies.get("token")?.value;
    let decodedToken: { id: string; email: string; role: string; exp: number } | null = null;
    let userId = null;

    if (token) {
      try {
        decodedToken = jwt.verify(token, SECRET_KEY) as { id: string; email: string; role: string; exp: number };
        userId = decodedToken.id;
      } catch (error) {
        console.error("Token verification failed in /api/listings/[id] GET:", error);
      }
    }

    connection = await getConnection();

    // Fetch listing details
    const [listingRows] = await connection.query(
      `SELECT 
        l.id, l.owner_id, l.title, l.description, l.price, l.city, l.address, 
        l.latitude, l.longitude, l.room_type, l.number_of_roommates, l.current_roommates, 
        l.amenities, l.images, l.available_from, l.status, l.views_count, l.created_at, 
        u.first_name AS owner_first_name, u.last_name AS owner_last_name, 
        u.email AS owner_email, u.phone AS owner_phone, u.avatar_url AS owner_avatar_url, 
        u.bio AS owner_bio, u.created_at AS owner_created_at
      FROM listings l
      JOIN users u ON l.owner_id = u.id
      WHERE l.id = ?`,
      [id]
    );

    const listing = (listingRows as any[])[0];

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Increment view count (optional, can be moved to a separate API or handled differently)
    await connection.query("UPDATE listings SET views_count = views_count + 1 WHERE id = ?", [id]);

    // Fetch comments for the listing
    const [commentRows] = await connection.query(
      `SELECT 
        c.id, c.content, c.created_at, 
        u.id AS user_id, u.first_name, u.last_name, u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.listing_id = ?
      ORDER BY c.created_at DESC`,
      [id]
    );

    const comments = (commentRows as any[]).map(comment => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      profiles: {
        user_id: comment.user_id,
        full_name: `${comment.first_name} ${comment.last_name}`,
        avatar_url: comment.avatar_url,
      },
    }));

    // Check if the current user has favorited this listing
    let isFavorited = false;
    if (userId) {
      const [favoriteRows] = await connection.query(
        "SELECT id FROM favorites WHERE user_id = ? AND listing_id = ?",
        [userId, id]
      );
      isFavorited = (favoriteRows as any[]).length > 0;
    }

    return NextResponse.json({ listing, comments, isFavorited });
  } catch (error) {
    console.error("Error fetching listing details:", error);
    return NextResponse.json({ error: "Failed to fetch listing details" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release(); // Release connection back to the pool
    }
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  let connection;
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing listing ID" }, { status: 400 });
    }

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

    connection = await getConnection();

    // Verify that the logged-in user is the owner of the listing
    const [listingRows] = await connection.query("SELECT owner_id FROM listings WHERE id = ?", [id]);
    const listing = (listingRows as any[])[0];

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.owner_id !== decodedToken.id) {
      return NextResponse.json({ error: "Unauthorized to delete this listing" }, { status: 403 });
    }

    await connection.query("DELETE FROM listings WHERE id = ?", [id]);

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release(); // Release connection back to the pool
    }
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  let connection;
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing listing ID" }, { status: 400 });
    }

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

    connection = await getConnection();

    // Verify that the logged-in user is the owner of the listing
    const [listingRows] = await connection.query("SELECT owner_id FROM listings WHERE id = ?", [id]);
    const listing = (listingRows as any[])[0];

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.owner_id !== decodedToken.id) {
      return NextResponse.json({ error: "Unauthorized to update this listing" }, { status: 403 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      price, 
      city, 
      number_of_roommates, 
      amenities, 
      images, 
      status 
    } = body; // Destructure fields that can be updated

    // Construct UPDATE query dynamically based on provided fields
    const fields = [];
    const values = [];

    if (title !== undefined) { fields.push("title = ?"); values.push(title); }
    if (description !== undefined) { fields.push("description = ?"); values.push(description); }
    if (price !== undefined) { fields.push("price = ?"); values.push(price); }
    if (city !== undefined) { fields.push("city = ?"); values.push(city); }
    if (number_of_roommates !== undefined) { fields.push("number_of_roommates = ?"); values.push(number_of_roommates); }
    if (amenities !== undefined) { fields.push("amenities = ?"); values.push(JSON.stringify(amenities)); }
    if (images !== undefined) { fields.push("images = ?"); values.push(JSON.stringify(images)); }
    if (status !== undefined) { fields.push("status = ?"); values.push(status); }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updateQuery = `UPDATE listings SET ${fields.join(', ')} WHERE id = ?`;
    await connection.query(updateQuery, [...values, id]);

    return NextResponse.json({ message: "Listing updated successfully" });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release(); // Release connection back to the pool
    }
  }
}
