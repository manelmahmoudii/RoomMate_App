import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'react-hot-toast'; // Import Toaster
import './globals.css'
import { getUserSession } from '@/lib/auth' // Import auth utility
import { cookies } from 'next/headers' // Import cookies for server-side cookie access
import HeaderClientWrapper from '@/app/components/HeaderClientWrapper'; // Import the new client wrapper

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
  const userRole = userSession?.role || ''; // Ensure userRole is always a string
  const userFirstName = userSession?.first_name || undefined;
  const userLastName = userSession?.last_name || undefined;
  const userAvatarUrl = userSession?.avatar_url || undefined;

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <HeaderClientWrapper 
          isLoggedIn={isLoggedIn} 
          userRole={userRole} 
          userFirstName={userFirstName} 
          userLastName={userLastName} 
          userAvatarUrl={userAvatarUrl} 
        /> {/* Use the client wrapper */}
        {children}
        <Analytics />
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  )
}
