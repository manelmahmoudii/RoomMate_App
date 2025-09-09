import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key";

export async function GET(request: NextRequest) {
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

    if (decodedToken.role !== "student" && decodedToken.role !== "advertiser" && decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    connection = await getConnection();
    const userId = decodedToken.id;

    // Fetch messages where the user is either the sender or the receiver
    const [rows] = await connection.query(
      `SELECT
         m.id, m.sender_id, m.receiver_id, m.listing_id, m.content, m.is_read, m.created_at,
         s.first_name AS sender_first_name, s.last_name AS sender_last_name, s.avatar_url AS sender_avatar_url,
         r.first_name AS receiver_first_name, r.last_name AS receiver_last_name, r.avatar_url AS receiver_avatar_url,
         l.title AS listing_title, l.city AS listing_city
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       LEFT JOIN listings l ON m.listing_id = l.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.created_at DESC`,
      [userId, userId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
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

    if (decodedToken.role !== "student" && decodedToken.role !== "advertiser") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { recipientId, message, listingId } = await request.json();

    if (!recipientId || !message) {
      return NextResponse.json({ error: "Missing recipient ID or message" }, { status: 400 });
    }

    connection = await getConnection();
    const messageId = uuidv4();

    await connection.query(
      "INSERT INTO messages (id, sender_id, receiver_id, listing_id, content) VALUES (?, ?, ?, ?, ?)",
      [messageId, decodedToken.id, recipientId, listingId || null, message]
    );

    return NextResponse.json({ message: "Message sent successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
