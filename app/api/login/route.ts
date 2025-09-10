// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getConnection } from "@/lib/db"; // Removed initDB from import
import { revalidatePath } from 'next/cache'; // Import revalidatePath

const SECRET_KEY = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  let connection;
  try {
    // await initDB(); // Removed direct call to initDB
    connection = await getConnection();

    const { email, password } = await req.json();

    const [rows] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = (rows as any)[0];

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    }

    // Créer un JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.user_type, first_name: user.first_name, last_name: user.last_name, avatar_url: user.avatar_url },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    // Réponse avec cookie HTTPOnly (sécurisé)
    const response = NextResponse.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.user_type,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 2 * 60 * 60, // 2h
    });

    revalidatePath('/'); // Revalidate the root path to ensure Header updates

    return response;
  } catch (error) {
    console.error("Login API error:", error); // Enhanced logging
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
