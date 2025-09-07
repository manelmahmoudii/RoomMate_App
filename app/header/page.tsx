"use client"

import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface HeaderProps {
  isLoggedIn?: boolean
}

export default function Header({ isLoggedIn = false }: HeaderProps) {
  const pathname = usePathname()

  // Fonction pour vérifier si un lien est actif
  const isActiveLink = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 smooth-transition">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 animate-fade-in">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center animate-float">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">RoomMate TN</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 animate-fade-in">
            <Link 
              href="/search" 
              className={`smooth-transition ${isActiveLink("/search") ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              Search Rooms
            </Link>
            <Link
              href="/dashboard/advertiser"
              className={`smooth-transition ${isActiveLink("/dashboard/advertiser") ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              Post Room
            </Link>
            <Link 
              href="/about" 
              className={`smooth-transition ${isActiveLink("/about") ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4 animate-fade-in">
            {!isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" className="smooth-transition" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 smooth-transition hover-lift" asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="smooth-transition" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <form action="/api/logout" method="POST">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="smooth-transition"
                    type="submit"
                  >
                    Logout
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}