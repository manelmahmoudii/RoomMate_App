import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getConnection, initDB } from "@/lib/db";
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  let connection;
  try {
    await initDB();
    connection = await getConnection();

    const formData = await req.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const userType = formData.get("userType") as string;
    const university = formData.get("university") as string;
    const budget = formData.get("budget") as string;
    const gender = formData.get("gender") as string;
    const bio = formData.get("bio") as string;
    const phone = formData.get("phone") as string;
    const accountType = formData.get("accountType") as string;
    const location = formData.get("location") as string;
    const avatarFile = formData.get("avatar") as File | null;

    console.log("Received userType:", userType);

    // Vérifier si email existe
    const [existing] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
    if ((existing as any).length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    let avatarUrl: string | null = null;
    if (avatarFile && avatarFile.size > 0) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `${uniqueSuffix}-${avatarFile.name}`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Ensure the uploads directory exists
      await fs.mkdir(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, filename);
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      avatarUrl = `/uploads/${filename}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Requête SQL pour insérer l'utilisateur avec tous les champs
    await connection.query(
      `INSERT INTO users 
       (id, email, first_name, last_name, password, user_type, university, phone, study_level, bio, preferences, account_type, avatar_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        JSON.stringify({ budget, gender, location }), // Stocker budget et gender dans preferences JSON
        accountType || null,
        avatarUrl,
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