import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (decodedToken.role !== "advertiser") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const connection = await getConnection();

    // Verify that the logged-in user (advertiser) is the owner of the listing associated with this request
    const [requestRows] = await connection.query(
      "SELECT l.owner_id FROM roommate_requests rr JOIN listings l ON rr.listing_id = l.id WHERE rr.id = ?",
      [id]
    );
    const requestDetails = (requestRows as any[])[0];

    if (!requestDetails) {
      await connection.end();
      return NextResponse.json({ error: "Roommate request not found" }, { status: 404 });
    }

    if (requestDetails.owner_id !== decodedToken.id) {
      await connection.end();
      return NextResponse.json({ error: "Unauthorized to manage this request" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body; // Expected status: 'accepted' or 'rejected'

    if (!status || !["accepted", "rejected"].includes(status)) {
      await connection.end();
      return NextResponse.json({ error: "Invalid status provided" }, { status: 400 });
    }

    await connection.query("UPDATE roommate_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, id]);
    await connection.end();

    return NextResponse.json({ message: `Request ${status} successfully` });
  } catch (error) {
    console.error("Error updating roommate request:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
