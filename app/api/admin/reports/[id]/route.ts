import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { action } = await request.json(); // 'resolve' or 'take_action'

    if (!id || !action) {
      return NextResponse.json({ error: "Missing report ID or action" }, { status: 400 });
    }

    const connection = await getConnection();
    let query = "";

    if (action === "resolve") {
      query = "UPDATE roommate_requests SET status = 'resolved' WHERE id = ?"; // Using roommate_requests as reports
    } else if (action === "take_action") {
      // This would typically involve more complex logic, like suspending a user or deleting content.
      // For this example, we'll just mark it as resolved.
      query = "UPDATE roommate_requests SET status = 'resolved' WHERE id = ?";
    } else {
      await connection.end();
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connection.execute(query, [id]);
    await connection.end();
    return NextResponse.json({ message: `Report ${id} ${action}d successfully` });
  } catch (error) {
    console.error("Error updating report status:", error);
    return NextResponse.json({ error: "Failed to update report status" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    const connection = await getConnection();
    await connection.execute("DELETE FROM roommate_requests WHERE id = ?", [id]);
    await connection.end();
    return NextResponse.json({ message: `Report ${id} deleted successfully` });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
