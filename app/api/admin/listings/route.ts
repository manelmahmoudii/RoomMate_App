import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await getConnection();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    let query = `
      SELECT 
        l.*,
        u.first_name, 
        u.last_name 
      FROM listings l
      LEFT JOIN users u ON l.owner_id = u.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (status) {
      query += " AND l.status = ?";
      params.push(status);
    }

    const [rows] = await connection.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
