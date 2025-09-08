"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, Building, Shield, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface LoginErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState<"student" | "advertiser" | "admin">("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const router = useRouter()

  // Validation en temps réel
  useEffect(() => {
    validateFields()
  }, [email, password])

  const validateFields = (): boolean => {
    const newErrors: LoginErrors = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    if (!password.trim()) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Marquer tous les champs comme touchés pour afficher les erreurs
    setTouched({ email: true, password: true })
    
    if (!validateFields()) {
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, userType })
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors({ general: data.error || "An error occurred" })
        setLoading(false)
        return
      }

      // Store user data and remember me preference
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("rememberMe", "true")
        localStorage.setItem("token", data.token || data.accessToken)
      } else {
        sessionStorage.setItem("user", JSON.stringify(data.user))
        sessionStorage.setItem("token", data.token || data.accessToken)
      }

      // Redirect based on actual user role from API response
      // Use the role from the response instead of the selected tab
      const userRole = data.user?.role || data.user?.userType || userType
      
      let redirectPath = "/"
      if (userRole === "admin" || userRole === "administrator") {
        redirectPath = "/dashboard/admin/"
      } else if (userRole === "advertiser" || userRole === "property_owner" || userRole === "agency") {
        redirectPath = "/dashboard/advertiser"
      } else if (userRole === "student") {
        redirectPath = "/dashboard/student"
      }

      console.log(`Redirecting ${userRole} to: ${redirectPath}`)
      router.push(redirectPath)

    } catch (error) {
      console.error("Login error:", error)
      setErrors({ general: "An error occurred during login. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link 
          href="/" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="border-border shadow-xl animate-fade-in">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your RoomMate TN account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs value={userType} onValueChange={(value) => setUserType(value as "student" | "advertiser" | "admin")} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger value="student" className="flex items-center text-xs">
                  <Users className="w-4 h-4 mr-1" /> 
                  Student
                </TabsTrigger>
                <TabsTrigger value="advertiser" className="flex items-center text-xs">
                  <Building className="w-4 h-4 mr-1" /> 
                  Advertiser
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center text-xs">
                  <Shield className="w-4 h-4 mr-1" /> 
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Student Login
                  </Badge>
                </div>
              </TabsContent>

              <TabsContent value="advertiser" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                    Advertiser Login
                  </Badge>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                    Admin Login
                  </Badge>
                </div>
              </TabsContent>
            </Tabs>

            {/* Error Message */}
            {errors.general && (
              <div className="p-3 rounded-md bg-red-100 text-red-700 border border-red-300 text-sm font-medium">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.general}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className={`h-11 border-border focus:ring-primary transition-colors ${touched.email && errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-xs flex items-center mt-1">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`h-11 border-border focus:ring-primary pr-10 transition-colors ${touched.password && errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-500 text-xs flex items-center mt-1">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input 
                    id="remember" 
                    type="checkbox" 
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember me
                  </Label>
                </div>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary/90 transition-colors" 
                disabled={loading || Object.keys(errors).length > 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Social Login */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11 bg-transparent transition-colors">
                {/* Google Icon */}
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-11 bg-transparent transition-colors">
                {/* Facebook Icon */}
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                href="/auth/signup" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign up here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}