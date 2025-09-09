import { NextRequest, NextResponse } from "next/server";
import { serverLogout } from "@/lib/auth";
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    await serverLogout();
    revalidatePath('/'); // Revalidate the root path to update header state
    return NextResponse.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during server logout:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
