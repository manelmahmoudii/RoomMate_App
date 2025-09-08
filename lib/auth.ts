import { NextRequest } from 'next/server';
import { jwtDecode } from "jwt-decode";
// No longer importing Cookies from 'js-cookie' here, as this is a server-side utility.

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export async function getUserSession(request: NextRequest): Promise<DecodedToken | null> {
  // This utility is intended for server-side use only. NextRequest is always available.
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      console.log("Token expired in lib/auth.ts");
      return null;
    }
    return decodedToken;
  } catch (error) {
    console.error("Error decoding or verifying token in lib/auth.ts:", error);
    return null;
  }
}
