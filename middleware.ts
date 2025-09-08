import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const publicRoutes = [
  "/",
  "/about",
  "/search",
  "/announcements",
  "/auth/login",
  "/auth/signup",
  // Public static assets that can be accessed directly
  "/_next", // Next.js internal routes
  "/favicon.ico",
  "/apartment-thumbnail.jpg",
  "/cozy-student-room-sfax.jpg",
  "/modern-apartment-bedroom-tunis.jpg",
  "/modern-apartment-kitchen-tunis.jpg",
  "/modern-apartment-living-room-tunis.jpg",
  "/modern-room-tunis-university.jpg",
  "/modern-student-apartment-tunis.jpg",
  "/placeholder-logo.png",
  "/placeholder-logo.svg",
  "/placeholder-user.jpg",
  "/placeholder.svg",
  "/shared-apartment-sfax-center.jpg",
  "/shared-apartment-sousse-beach.jpg",
  "/student-apartment-monastir.jpg",
  "/student-woman.png",
  "/tn.png",
  "/tn.svg",
  "/tunisian-woman-profile.jpg",
  "/vibrant-tunisian-students-studying-together-in-mod.jpg",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow requests for explicitly public routes and static assets
  if (publicRoutes.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key"; 

  if (!token) {
    // If no token, redirect to login for any non-public route
    console.log("No token found. Redirecting to login.");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  let decodedToken: { id: string; email: string; role: string; exp: number } | null = null;
  try {
    decodedToken = jwt.verify(token, SECRET_KEY) as { id: string; email: string; role: string; exp: number };
    if (decodedToken.exp * 1000 < Date.now()) {
      console.log("Token expired. Redirecting to login.");
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete("token"); // Clear expired token
      return response;
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    // If token is invalid, clear it and redirect to login
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  // Role-based access control for dashboards
  if (pathname.startsWith("/dashboard")) {
    if (!decodedToken) { // Should not happen if previous checks passed, but for safety
      console.log("Decoded token missing for dashboard access. Redirecting to login.");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const userRole = decodedToken.role;
    const parts = pathname.split("/");
    const requestedDashboard = parts.length > 2 ? parts[2] : null; // e.g., "admin", "student", "advertiser"

    if (requestedDashboard && requestedDashboard !== userRole) {
      console.log(`User role mismatch: Requested ${requestedDashboard}, but user is ${userRole}. Redirecting to correct dashboard.`);
      // Redirect to the correct dashboard if trying to access another role's dashboard
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
    } else if (!requestedDashboard) {
        console.log(`Accessing /dashboard without specific role. Redirecting to user's role dashboard: ${userRole}.`);
        // If accessing /dashboard without a specific role, redirect to their role's dashboard
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
    }
  }
  
  // API route protection based on role
  if (pathname.startsWith("/api/")) {
    // Allow all users to GET /api/listings for browsing
    if (pathname.startsWith("/api/listings") && request.method === "GET") {
      return NextResponse.next();
    }

    if (!decodedToken) {
      console.log("Access to API without token. Redirecting to login.");
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const userRole = decodedToken.role;
    
    // Admin API routes
    if (pathname.startsWith("/api/admin")) {
      if (userRole !== "admin") {
        console.log(`Unauthorized access to admin API by ${userRole}.`);
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
      }
    }
    
    // Advertiser API routes (e.g., for managing their own listings)
    if (pathname.startsWith("/api/listings") && (request.method === "POST" || request.method === "PUT" || request.method === "DELETE")) {
      if (userRole !== "advertiser") {
        console.log(`Unauthorized access to listing management API by ${userRole}.`);
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
      }
    }

    // Student API routes (e.g., for favorites, messages, comments)
    if (pathname.startsWith("/api/favorites") || pathname.startsWith("/api/messages") || pathname.startsWith("/api/listings") && request.method === "POST" && pathname.endsWith("/comments")) {
      if (userRole !== "student" && userRole !== "advertiser") { // Advertisers can also comment
        console.log(`Unauthorized access to student/advertiser API by ${userRole}.`);
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
      }
    }
  }

  // For login/signup pages, if already logged in, redirect to user's dashboard
  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup")) {
    if (decodedToken) {
        console.log("Already logged in. Redirecting from auth page to dashboard.");
        return NextResponse.redirect(new URL(`/dashboard/${decodedToken.role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)?", "/api/:path*"] // Fixed matcher regex to catch all routes except static assets
}
