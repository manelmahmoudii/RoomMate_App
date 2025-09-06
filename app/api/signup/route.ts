import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getConnection, initDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await initDB(); // s’assure que la DB et la table existent
    const connection = await getConnection();

    const body = await req.json();
    const { firstName,lastName, email, password } = body;

    // Vérifier si email existe
    const [existing] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
    if ((existing as any).length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.query(
      "INSERT INTO users (id, email, first_name, last_name, password) VALUES (?, ?, ?, ?, ?)",
      [uuidv4(), email, firstName,lastName, hashedPassword]
    );

    await connection.end();

    return NextResponse.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
