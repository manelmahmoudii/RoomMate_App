import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  let connection;
  try {
    const { id } = params; // This is the roommate_request ID

    if (!id) {
      return NextResponse.json({ error: "Missing request ID" }, { status: 400 });
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

    if (decodedToken.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    connection = await getConnection();

    // Verify that the logged-in user (student) is the owner of this request
    const [requestRows] = await connection.query(
      "SELECT student_id FROM roommate_requests WHERE id = ?",
      [id]
    );
    const requestDetails = (requestRows as any[])[0];

    if (!requestDetails) {
      return NextResponse.json({ error: "Roommate request not found" }, { status: 404 });
    }

    if (requestDetails.student_id !== decodedToken.id) {
      return NextResponse.json({ error: "Unauthorized to edit this request" }, { status: 403 });
    }

    const body = await request.json();
    const { message } = body; 

    if (!message) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    await connection.query("UPDATE roommate_requests SET message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [message, id]);

    return NextResponse.json({ message: `Request updated successfully` });
  } catch (error) {
    console.error("Error updating roommate request:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
