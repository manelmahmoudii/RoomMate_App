import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const connection = await getConnection();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    let query = `
      SELECT 
        rr.*, 
        s.email AS student_email, s.first_name AS student_first_name, s.last_name AS student_last_name,
        l.title AS listing_title, l.description AS listing_description
      FROM roommate_requests rr
      LEFT JOIN users s ON rr.student_id = s.id
      LEFT JOIN listings l ON rr.listing_id = l.id
      WHERE 1=1
    `; // This is a simplified example, assuming 'roommate_requests' can act as reports for now.
       // A more robust solution would involve a dedicated 'reports' table.
    const params: (string | number)[] = [];

    if (status) {
      query += " AND rr.status = ?";
      params.push(status);
    }
    if (type) {
      // Additional filtering by report type if a dedicated table existed
    }

    const [rows] = await connection.execute(query, params);
    await connection.end();
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
