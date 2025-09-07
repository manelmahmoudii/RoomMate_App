"use client"

import { Button } from "@/components/ui/button"
import { Users, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface HeaderProps {
  isLoggedIn?: boolean
}

export default function Header({ isLoggedIn = false }: HeaderProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Fonction pour vérifier si un lien est actif
  const isActiveLink = (path: string) => {
    return pathname === path
  }

  // Fonction pour fermer le menu mobile
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 smooth-transition">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 animate-fade-in"
            onClick={closeMobileMenu}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center animate-float">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">RoomMate TN</span>
          </Link>

          {/* Navigation Links - Desktop */}
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

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4 animate-fade-in">
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
                    size="sm"
                    className="bg-primary hover:bg-primary/90 smooth-transition hover-lift"
                    type="submit"
                  >
                    Logout
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Hamburger Menu Button - Mobile */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-slide-down border-t border-border bg-background">
            <div className="py-4 space-y-4">
              {/* Navigation Links - Mobile */}
              <div className="flex flex-col space-y-3 px-2">
                <Link 
                  href="/search" 
                  className={`py-2 px-3 rounded-md smooth-transition ${isActiveLink("/search") ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  onClick={closeMobileMenu}
                >
                  Search Rooms
                </Link>
                <Link
                  href="/dashboard/advertiser"
                  className={`py-2 px-3 rounded-md smooth-transition ${isActiveLink("/dashboard/advertiser") ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  onClick={closeMobileMenu}
                >
                  Post Room
                </Link>
                <Link 
                  href="/about" 
                  className={`py-2 px-3 rounded-md smooth-transition ${isActiveLink("/about") ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
              </div>

              {/* Auth Buttons - Mobile */}
              <div className="border-t border-border pt-4 px-2">
                {!isLoggedIn ? (
                  <div className="flex flex-col space-y-3">
                    <Button variant="outline" className="w-full justify-center" asChild>
                      <Link href="/auth/login" onClick={closeMobileMenu}>
                        Sign In
                      </Link>
                    </Button>
                    <Button className="w-full justify-center bg-primary hover:bg-primary/90" asChild>
                      <Link href="/auth/signup" onClick={closeMobileMenu}>
                        Get Started
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Button variant="outline" className="w-full justify-center" asChild>
                      <Link href="/dashboard" onClick={closeMobileMenu}>
                        Dashboard
                      </Link>
                    </Button>
                    <form action="/api/logout" method="POST" className="w-full">
                      <Button
                        className="w-full justify-center bg-primary hover:bg-primary/90"
                        type="submit"
                        onClick={closeMobileMenu}
                      >
                        Logout
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}