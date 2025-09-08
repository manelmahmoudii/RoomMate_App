import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key";

export async function GET(request: NextRequest) {
  let connection;
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let decodedToken: { id: string; email: string; role: string; exp: number };
    try {
      decodedToken = jwt.verify(token, SECRET_KEY) as { id: string; email: string; role: string; exp: number };
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    if (decodedToken.role !== "advertiser") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    connection = await getConnection();

    // Fetch total views for advertiser's listings
    const [totalViewsRows] = await connection.query(
      "SELECT SUM(views_count) as totalViews FROM listings WHERE owner_id = ?", // Changed 'views' to 'views_count'
      [decodedToken.id]
    );
    const totalViews = (totalViewsRows as any[])[0].totalViews || 0;

    // Fetch total requests for advertiser's listings
    const [totalRequestsRows] = await connection.query(
      "SELECT COUNT(rr.id) as totalRequests FROM roommate_requests rr JOIN listings l ON rr.listing_id = l.id WHERE l.owner_id = ?",
      [decodedToken.id]
    );
    const totalRequests = (totalRequestsRows as any[])[0].totalRequests || 0;

    // Fetch active listings for advertiser
    const [activeListingsRows] = await connection.query(
      "SELECT COUNT(*) as activeListings FROM listings WHERE owner_id = ? AND status = 'active'",
      [decodedToken.id]
    );
    const activeListings = (activeListingsRows as any[])[0].activeListings || 0;

    // Placeholder for average rating (requires a ratings system)
    const averageRating = 4.7;
    const monthlyEarnings = 0; // Placeholder
    const responseRate = 95; // Placeholder

    return NextResponse.json({
      totalViews,
      totalRequests,
      activeListings,
      averageRating,
      monthlyEarnings,
      responseRate,
    });
  } catch (error) {
    console.error("Error fetching advertiser analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
