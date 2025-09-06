// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getConnection, initDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await initDB(); // s’assure que la DB et la table existent
    const connection = await getConnection();

    const body = await req.json();
    const { email, password } = body;

    // Vérifier si l'utilisateur existe
    const [rows] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = (rows as any)[0];

    if (!user) {
      await connection.end();
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 401 });
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      await connection.end();
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    }

    await connection.end();

    // Tout est bon → retourner les infos de l'utilisateur (ou un token)
    return NextResponse.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
