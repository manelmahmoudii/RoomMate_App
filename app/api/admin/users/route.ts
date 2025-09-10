import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

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

export async function POST(request: NextRequest) {
  let connection;
  try {
    // In a real application, you'd add authentication and authorization checks here
    // For example, verify if the current user is an admin.
    // const { user } = await auth(); // Assuming an auth utility exists
    // if (user?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const { first_name, last_name, email, password, user_type } = await request.json();

    if (!first_name || !last_name || !email || !password || !user_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Basic email format validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Password strength could be checked here
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    // Validate user_type
    const validUserTypes = ['student', 'advertiser', 'admin'];
    if (!validUserTypes.includes(user_type)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    connection = await getConnection();

    // Check if user with email already exists
    const [existingUsers] = await connection.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const [result] = await connection.execute(
      "INSERT INTO users (id, first_name, last_name, email, password, user_type) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, first_name, last_name, email, hashedPassword, user_type]
    );

    return NextResponse.json({ message: "User created successfully", userId }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
