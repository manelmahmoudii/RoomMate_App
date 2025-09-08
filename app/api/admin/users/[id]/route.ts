import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { action } = await request.json(); // 'suspend' or 'activate'

    if (!id || !action) {
      return NextResponse.json({ error: "Missing user ID or action" }, { status: 400 });
    }

    const connection = await getConnection();
    let query = "";

    if (action === "suspend") {
      query = "UPDATE users SET status = 'suspended' WHERE id = ?"; // Assuming a 'status' column exists
    } else if (action === "activate") {
      query = "UPDATE users SET status = 'active' WHERE id = ?"; // Assuming a 'status' column exists
    } else {
      await connection.end();
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connection.execute(query, [id]);
    await connection.end();
    return NextResponse.json({ message: `User ${id} ${action}d successfully` });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const connection = await getConnection();
    await connection.execute("DELETE FROM users WHERE id = ?", [id]);
    await connection.end();
    return NextResponse.json({ message: `User ${id} deleted successfully` });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
