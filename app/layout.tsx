import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Header from './header/page' // Import Header
import { getUserSession } from '@/lib/auth' // Import auth utility
import { headers } from 'next/headers' // Import headers for server-side cookie access
import { NextRequest } from 'next/server' // Import NextRequest for getUserSession

export const metadata: Metadata = {
  title: 'RoomMate App',
  description: 'Find Your Perfect Roommate in Tunisia',
  generator: 'v0.app',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = headers();
  const cookieHeader = headersList.get('cookie');
  
  // Create a mock NextRequest object to pass to getUserSession
  // This is a workaround since `headers()` doesn't directly provide NextRequest
  const mockRequest = {
    cookies: {
      get: (name: string) => {
        const cookie = cookieHeader?.split(';').find(c => c.trim().startsWith(name + '='));
        return cookie ? { value: cookie.trim().substring(name.length + 1) } : undefined;
      }
    }
  } as unknown as NextRequest; // Cast to NextRequest

  const userSession = await getUserSession(mockRequest);

  const isLoggedIn = !!userSession;
  const userRole = userSession?.role || null;

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Header isLoggedIn={isLoggedIn} userRole={userRole} /> {/* Pass props to Header */}
        {children}
        <Analytics />
      </body>
    </html>
  )
}
