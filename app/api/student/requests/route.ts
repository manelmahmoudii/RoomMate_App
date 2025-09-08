import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

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
        rr.id AS request_id,
        rr.listing_id,
        rr.message,
        rr.status,
        rr.created_at,
        l.title AS listing_title,
        u.first_name AS owner_first_name,
        u.last_name AS owner_last_name,
        l.owner_id
      FROM roommate_requests rr
      JOIN listings l ON rr.listing_id = l.id
      JOIN users u ON l.owner_id = u.id
      WHERE rr.student_id = ?`,
      [decodedToken.id]
    );
    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching student requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
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

    if (decodedToken.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { listingId, message } = await request.json();

    if (!listingId || !message) {
      return NextResponse.json({ error: "Missing listing ID or message" }, { status: 400 });
    }

    const connection = await getConnection();

    // Check if a request already exists for this listing from this student
    const [existingRequest] = await connection.query(
      "SELECT id FROM roommate_requests WHERE student_id = ? AND listing_id = ?",
      [decodedToken.id, listingId]
    );

    if ((existingRequest as any[]).length > 0) {
      await connection.end();
      return NextResponse.json({ error: "You have already sent a request for this listing." }, { status: 409 });
    }

    const requestId = uuidv4();
    await connection.query(
      "INSERT INTO roommate_requests (id, student_id, listing_id, message, status) VALUES (?, ?, ?, ?, ?)",
      [requestId, decodedToken.id, listingId, message, "pending"]
    );
    await connection.end();

    return NextResponse.json({ message: "Roommate request sent successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error sending roommate request:", error);
    return NextResponse.json({ error: "Failed to send roommate request" }, { status: 500 });
  }
}
