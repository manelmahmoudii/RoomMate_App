import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { getUserSession } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  let connection;
  try {
    const userSession = await getUserSession(request);

    if (!userSession || !userSession.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const listingId = params.id;
    const userId = userSession.id;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    connection = await getConnection();
    const commentId = uuidv4();

    await connection.query(
      "INSERT INTO comments (id, listing_id, user_id, content) VALUES (?, ?, ?, ?)",
      [commentId, listingId, userId, content]
    );

    return NextResponse.json({ message: "Comment posted successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error posting comment:", error);
    return NextResponse.json({ error: "An error occurred while posting the comment" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
