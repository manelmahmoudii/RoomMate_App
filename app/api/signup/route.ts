import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getConnection, initDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  let connection;
  try {
    await initDB();
    connection = await getConnection();

    const body = await req.json();
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      userType, // student ou advertiser
      university, 
      budget,
      gender,
      bio,
      phone, 
      accountType, // Pour advertiser
       
    } = body;

    console.log("Received userType:", userType);

    // Vérifier si email existe
    const [existing] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
    if ((existing as any).length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Requête SQL pour insérer l'utilisateur avec tous les champs
    await connection.query(
      `INSERT INTO users 
       (id, email, first_name, last_name, password, user_type, university, phone, study_level, bio, preferences, account_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(), 
        email, 
        firstName, 
        lastName, 
        hashedPassword, 
        userType || 'student', // Type d'utilisateur
        university || null,
        phone || null,
        null, // study_level (à adapter si nécessaire)
        bio || null,
        JSON.stringify({ budget, gender }), // Stocker budget et gender dans preferences JSON
        accountType || null,
        
      ]
    );

    return NextResponse.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}