"use client"

import { Button } from "@/components/ui/button"
import { Users, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
// Removed: import Cookies from 'js-cookie';
// Removed: import { jwtDecode } from "jwt-decode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string
  isLoggedIn: boolean; // Now a required prop
  userRole: string | null; // Now a required prop
  userFirstName?: string; // New prop for first name
  userLastName?: string;  // New prop for last name
  userAvatarUrl?: string; // New prop for avatar URL
}

export default function Header({
  title = "RoomMate TN",
  isLoggedIn, // Receive as prop
  userRole,   // Receive as prop
  userFirstName, // Receive as prop
  userLastName,  // Receive as prop
  userAvatarUrl, // Receive as prop
}: HeaderProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  // Removed: const [isLoggedIn, setIsLoggedIn] = useState(false); // Internal state for isLoggedIn
  // Removed: const [userRole, setUserRole] = useState<string | null>(null)
  
  const getDashboardPath = () => {
    if (userRole) {
      return `/dashboard/${userRole}`;
    }
    return "/dashboard"; // Default dashboard path if role not found
  };
  // Define all navigation links centrally
  const defaultNavLinks = [
    { href: "/", label: "Home", authRequired: false },
    { href: "/about", label: "About", authRequired: false },
    { href: "/search", label: "Search Rooms", authRequired: false },
    { href: "/announcements", label: "Announcements", authRequired: false },
    { href: getDashboardPath(), label: "Dashboard", authRequired: true, roles: ["student", "advertiser", "admin"] }, // Dynamic dashboard link
  ];
  
  // Filter navigation links based on login status and role
  const filteredNavLinks = defaultNavLinks.filter(link => {
    if (!link.authRequired) {
      return true; // Always show public links
    }
    if (isLoggedIn) {
      if (!link.roles || link.roles.includes(userRole as string)) {
        return true; // Show authenticated links if logged in and role matches or no specific roles are required
      }
    }
    return false; // Hide authenticated links if not logged in or role doesn't match
  });

  // Détection du scroll pour l'effet de fond
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Removed: useEffect for client-side token reading and console logs
  /*
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken: { role: string, exp: number } = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);
        if (decodedToken.exp * 1000 > Date.now()) { // Check if token is expired
          setIsLoggedIn(true);
          setUserRole(decodedToken.role);
          console.log("User is logged in. Role:", decodedToken.role);
        } else {
          console.log("Token expired. Clearing token and redirecting.");
          setIsLoggedIn(false);
          setUserRole(null);
          Cookies.remove('token'); // Clear expired token
        }
      } catch (error) {
        console.error("Error decoding or verifying token in Header:", error);
        setIsLoggedIn(false);
        setUserRole(null);
        Cookies.remove('token'); // Ensure invalid token is removed
      }
    } else {
      console.log("No token found in cookies.");
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, [pathname]); // Run on component mount and when pathname changes
  */

  // Fermer le menu quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Fonction pour vérifier si un lien est actif
  const isActiveLink = (path: string) => {
    // For dashboard links, check if the pathname starts with the link href
    if (path.startsWith("/dashboard") && path.length > "/dashboard".length) {
      return pathname.startsWith(path);
    }
    return pathname === path;
  };

  // Fonction pour fermer le menu mobile
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Fonction pour basculer le menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // The getDashboardPath is now a simple function using the prop userRole
  // No changes needed here, as it directly uses the prop.

  return (
    <nav className={`border-b border-border sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm' 
        : 'bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 transition-transform hover:scale-105 duration-200"
            onClick={closeMobileMenu}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">{title}</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={`transition-all duration-200 hover:text-foreground ${
                  isActiveLink(link.href)
                    ? "text-foreground font-medium border-b-2 border-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          {/* Always render auth buttons based on isLoggedIn internal state */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="transition-all duration-200 hover:scale-105" 
                  asChild
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105" 
                  asChild
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="transition-all duration-200 hover:scale-105" 
                  asChild
                >
                  <Link href={getDashboardPath()}>Dashboard</Link>
                </Button>
                <form action="/api/logout" method="POST">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                    type="submit"
                  >
                    Logout
                  </Button>
                </form>
                {userAvatarUrl ? (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userAvatarUrl} alt={`${userFirstName} ${userLastName}`} />
                    <AvatarFallback>{userFirstName?.[0]}{userLastName?.[0]}</AvatarFallback>
                  </Avatar>
                ) : (userFirstName && userLastName && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{userFirstName?.[0]}{userLastName?.[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </div>

          {/* Hamburger Menu Button - Mobile */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-foreground transition-all duration-200 hover:bg-primary/10"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 transition-transform duration-200" />
              ) : (
                <Menu className="w-6 h-6 transition-transform duration-200" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu avec animation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100 border-t border-border' 
            : 'max-h-0 opacity-0 border-t-0'
        }`}>
          <div className="py-4 space-y-4 bg-background/95 backdrop-blur-md">
            {/* Navigation Links - Mobile */}
            <div className="flex flex-col space-y-3 px-2">
              {filteredNavLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className={`py-3 px-4 rounded-md transition-all duration-200 transform hover:translate-x-1 ${
                    isActiveLink(link.href) 
                      ? "bg-primary/10 text-primary font-medium border-l-4 border-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Buttons - Mobile */}
            {/* Always render auth buttons based on isLoggedIn internal state */}
            <div className="border-t border-border/50 pt-4 px-2">
              {!isLoggedIn ? (
                <div className="flex flex-col space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center transition-all duration-200 hover:scale-105" 
                    asChild
                  >
                    <Link href="/auth/login" onClick={closeMobileMenu}>
                      Sign In
                    </Link>
                  </Button>
                  <Button 
                    className="w-full justify-center bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105" 
                    asChild
                  >
                    <Link href="/auth/signup" onClick={closeMobileMenu}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center transition-all duration-200 hover:scale-105" 
                    asChild
                  >
                    <Link href={getDashboardPath()} onClick={closeMobileMenu}>
                      Dashboard
                    </Link>
                  </Button>
                  <form action="/api/logout" method="POST" className="w-full">
                    <Button
                      className="w-full justify-center bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
                      type="submit"
                      onClick={closeMobileMenu}
                    >
                      Logout
                    </Button>
                  </form>
                  {userAvatarUrl ? (
                    <Avatar className="w-8 h-8 mx-auto mt-4">
                      <AvatarImage src={userAvatarUrl} alt={`${userFirstName} ${userLastName}`} />
                      <AvatarFallback>{userFirstName?.[0]}{userLastName?.[0]}</AvatarFallback>
                    </Avatar>
                  ) : (userFirstName && userLastName && (
                    <Avatar className="w-8 h-8 mx-auto mt-4">
                      <AvatarFallback>{userFirstName?.[0]}{userLastName?.[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}