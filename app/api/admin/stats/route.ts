import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const connection = await getConnection();

    // Fetch total users
    const [totalUsersRows] = await connection.query("SELECT COUNT(*) as count FROM users");
    const totalUsers = (totalUsersRows as any[])[0].count;

    // Fetch active listings
    const [activeListingsRows] = await connection.query("SELECT COUNT(*) as count FROM listings WHERE status = 'active'");
    const activeListings = (activeListingsRows as any[])[0].count;

    // Fetch pending listings
    const [pendingListingsRows] = await connection.query("SELECT COUNT(*) as count FROM listings WHERE status = 'pending'");
    const pendingListings = (pendingListingsRows as any[])[0].count;

    // Fetch new users this month (example: last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [newUsersRows] = await connection.query("SELECT COUNT(*) as count FROM users WHERE created_at >= ?", [thirtyDaysAgo]);
    const newUsersThisMonth = (newUsersRows as any[])[0].count;

    // Fetch average listing rating (simplified, needs a ratings table for accuracy)
    const averageRating = 4.5; // Placeholder for now

    // Fetch flagged content (using roommate requests as a placeholder for reports)
    const [flaggedContentRows] = await connection.query("SELECT COUNT(*) as count FROM roommate_requests WHERE status = 'pending'");
    const flaggedContent = (flaggedContentRows as any[])[0].count;

    await connection.end();

    return NextResponse.json({
      totalUsers,
      activeListings,
      pendingListings,
      newUsersThisMonth,
      averageRating,
      flaggedContent,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
