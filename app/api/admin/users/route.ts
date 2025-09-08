import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await getConnection();
    const searchParams = request.nextUrl.searchParams;
    const userType = searchParams.get("type");
    const userStatus = searchParams.get("status");

    let query = "SELECT id, email, first_name, last_name, user_type, avatar_url, created_at FROM users WHERE user_type != 'admin'";
    const params: (string | number)[] = [];

    if (userType && userType !== "all") {
      query += " AND user_type = ?";
      params.push(userType);
    }
    if (userStatus) {
      // Assuming 'status' might be a custom field or derived. For now, we'll skip direct filtering.
      // In a real app, you'd likely have a status field on the user table or derive it.
    }

    const [rows] = await connection.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
