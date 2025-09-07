// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getConnection, initDB } from "@/lib/db";

const SECRET_KEY = process.env.JWT_SECRET || "71553dd0e04e28ad0a85e9b6790afdd8e061f0f0526481f10fce6765a3989b23a0466cffaf0f7ffadd461e4e016a1c50c9c4b76d02764d32ed80711aaf431bfb";

export async function POST(req: NextRequest) {
  try {
    await initDB();
    const connection = await getConnection();

    const { email, password } = await req.json();

    const [rows] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = (rows as any)[0];

    if (!user) {
      await connection.end();
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      await connection.end();
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    }

    // Créer un JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.user_type },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    await connection.end();

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

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
