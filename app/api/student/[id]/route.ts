import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { getUserSession } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  let connection;
  try {
    const userSession = await getUserSession(request);

    // For now, allow any authenticated user to view a student profile.
    // In a more complex app, you might restrict this further (e.g., only advertisers they've interacted with).
    if (!userSession || !userSession.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const studentId = params.id;

    connection = await getConnection();

    const [rows] = await connection.query(
      `SELECT
         id, email, first_name, last_name, user_type, avatar_url, created_at, status,
         university, study_level, bio, preferences
       FROM users
       WHERE id = ? AND user_type = 'student'`,
      [studentId]
    );
    const studentProfile = (rows as any)[0];

    if (!studentProfile) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(studentProfile);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json({ error: "Failed to fetch student profile" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
