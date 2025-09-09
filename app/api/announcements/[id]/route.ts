import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  let connection;
  try {
    const userSession = await getUserSession(request);

    if (!userSession || !userSession.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const announcementId = params.id;
    const userId = userSession.id;

    if (!announcementId) {
      return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 });
    }

    connection = await getConnection();

    // Verify that the user is the owner of the announcement
    const [rows] = await connection.query("SELECT user_id FROM announcements WHERE id = ?", [announcementId]);
    const announcement = (rows as any)[0];

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    if (announcement.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized to delete this announcement" }, { status: 403 });
    }

    await connection.query("DELETE FROM announcements WHERE id = ?", [announcementId]);

    return NextResponse.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the announcement" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
