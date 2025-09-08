import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { action } = await request.json(); // 'approve' or 'reject'

    if (!id || !action) {
      return NextResponse.json({ error: "Missing listing ID or action" }, { status: 400 });
    }

    const connection = await getConnection();
    let query = "";

    if (action === "approve") {
      query = "UPDATE listings SET status = 'active' WHERE id = ?";
    } else if (action === "reject") {
      query = "UPDATE listings SET status = 'rejected' WHERE id = ?";
    } else {
      await connection.end();
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connection.execute(query, [id]);
    await connection.end();
    return NextResponse.json({ message: `Listing ${id} ${action}d successfully` });
  } catch (error) {
    console.error("Error updating listing status:", error);
    return NextResponse.json({ error: "Failed to update listing status" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing listing ID" }, { status: 400 });
    }

    const connection = await getConnection();
    await connection.execute("DELETE FROM listings WHERE id = ?", [id]);
    await connection.end();
    return NextResponse.json({ message: `Listing ${id} deleted successfully` });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
