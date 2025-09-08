import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // In a real application, you would save the file to a persistent storage,
    // e.g., AWS S3, Cloudinary, or a dedicated 'public' folder.
    // For this example, we'll simulate saving and return a mock URL.

    // Create a unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Save the file (in a real app, handle errors and larger files carefully)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadDir, uniqueFileName);
    await fs.writeFile(filePath, buffer);

    // Return the URL to access the uploaded file
    const imageUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({ message: "File uploaded successfully", imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
