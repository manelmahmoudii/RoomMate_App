import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const connection = await getConnection();

    // Verify that the logged-in user is the owner of the listing
    const [listingRows] = await connection.query("SELECT owner_id FROM listings WHERE id = ?", [id]);
    const listing = (listingRows as any[])[0];

    if (!listing) {
      await connection.end();
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.owner_id !== decodedToken.id) {
      await connection.end();
      return NextResponse.json({ error: "Unauthorized to delete this listing" }, { status: 403 });
    }

    await connection.query("DELETE FROM listings WHERE id = ?", [id]);
    await connection.end();

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const connection = await getConnection();

    // Verify that the logged-in user is the owner of the listing
    const [listingRows] = await connection.query("SELECT owner_id FROM listings WHERE id = ?", [id]);
    const listing = (listingRows as any[])[0];

    if (!listing) {
      await connection.end();
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.owner_id !== decodedToken.id) {
      await connection.end();
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
      await connection.end();
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updateQuery = `UPDATE listings SET ${fields.join(', ')} WHERE id = ?`;
    await connection.query(updateQuery, [...values, id]);
    await connection.end();

    return NextResponse.json({ message: "Listing updated successfully" });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}
