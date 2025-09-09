import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Header from './header/page' // Import Header
import { getUserSession } from '@/lib/auth' // Import auth utility
import { cookies } from 'next/headers' // Import cookies for server-side cookie access

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
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  const userSession = await getUserSession(undefined, token);

  const isLoggedIn = !!userSession;
  const userRole = userSession?.role || null;
  const userFirstName = userSession?.first_name || undefined;
  const userLastName = userSession?.last_name || undefined;
  const userAvatarUrl = userSession?.avatar_url || undefined;

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Header isLoggedIn={isLoggedIn} userRole={userRole} userFirstName={userFirstName} userLastName={userLastName} userAvatarUrl={userAvatarUrl} /> {/* Pass props to Header */}
        {children}
        <Analytics />
      </body>
    </html>
  )
}
