import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const SECRET_KEY = process.env.JWT_SECRET;
const KEY = new TextEncoder().encode(SECRET_KEY);
export async function encrypt(payload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // Token expires in 7 days
        .sign(KEY);
}
export async function decrypt(session = '') {
    try {
        const { payload } = await jwtVerify(session, KEY, {
            algorithms: ['HS256'],
        });
        return payload; // Explicitly cast to unknown first
    }
    catch (error) {
        console.error('Failed to decrypt session:', error);
        return null;
    }
}
export async function getUserSession(req, token) {
    let sessionToken = token;
    if (!sessionToken && req) {
        const cookieHeader = req.headers.get('cookie');
        const cookie = cookieHeader?.split('; ').find(row => row.startsWith('token='));
        sessionToken = cookie?.split('=')[1];
    }
    else if (!sessionToken) {
        const cookieStore = cookies();
        sessionToken = cookieStore.get('token')?.value;
    }
    if (!sessionToken) {
        return null;
    }
    try {
        const decoded = await decrypt(sessionToken);
        return decoded;
    }
    catch (error) {
        console.error('Error getting user session:', error);
        return null;
    }
}
// This function can only be called from a Server Component or API Route
export async function serverLogout() {
    cookies().delete('token');
}
