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
      "INSERT INTO messages (id, sender_id, recipient_id, listing_id, content) VALUES (?, ?, ?, ?, ?)", // Changed message_content to content
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
