import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretjwtkey';

interface UserSession {
  id: string;
  email: string;
  role: string;
}

export async function getUserSession(request?: NextRequest, tokenString?: string): Promise<UserSession | null> {
  try {
    let token: string | undefined;

    if (tokenString) {
      token = tokenString;
    } else if (request) {
      token = request.cookies.get('token')?.value;
    }

    if (!token) {
      return null;
    }

    const decodedToken = jwt.verify(token, SECRET_KEY) as { id: string; email: string; role: string; exp: number };

    return {
      id: decodedToken.id,
      email: decodedToken.email,
      role: decodedToken.role,
    };
  } catch (error) {
    console.error('Error in getUserSession:', error);
    return null;
  }
}
