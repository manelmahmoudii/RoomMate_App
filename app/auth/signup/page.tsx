"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Users, Building, Eye, EyeOff, ArrowLeft, CheckCircle, Mail, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Types pour les données du formulaire
interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  university: string
  budget: string
  gender: string
  bio: string
  phone: string
  accountType: string
  location: string
}

interface FieldErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
  university?: string
  phone?: string
  accountType?: string
  terms?: string
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userType, setUserType] = useState<"student" | "advertiser">("student")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    budget: "",
    gender: "",
    bio: "",
    phone: "",
    accountType: "",
    location: "",
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const router = useRouter()

  // Validation en temps réel
  useEffect(() => {
    validateFields()
  }, [formData, userType, termsAccepted])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const validateFields = (): boolean => {
    const newErrors: FieldErrors = {}

    // Validation des champs requis
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    // Validation spécifique selon le type d'utilisateur
    if (userType === "student" && !formData.university) {
      newErrors.university = "Please select your university"
    }

    if (userType === "advertiser") {
      if (!formData.phone) {
        newErrors.phone = "Phone number is required"
      }
      if (!formData.accountType) {
        newErrors.accountType = "Please select account type"
      }
    }

    if (!termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Marquer tous les champs comme touchés pour afficher toutes les erreurs
    const allTouched: Record<string, boolean> = {}
    Object.keys(formData).forEach(key => {
      allTouched[key] = true
    })
    allTouched.terms = true
    setTouched(allTouched)

    if (!validateFields()) {
      setMessage("Please fix the errors in the form.")
      setMessageType("error")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          userType,
          university: formData.university,
          budget: formData.budget,
          gender: formData.gender,
          bio: formData.bio,
          phone: formData.phone,
          accountType: formData.accountType,
          location: formData.location,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage("Account created successfully! You can now log in.")
        setMessageType("success")
        setTimeout(() => {
          router.push("/auth/login")
        }, 1500)
      } else {
        setMessage(data.error || "Signup failed")
        setMessageType("error")
      }
    } catch (error) {
      console.error(error)
      setMessage("An error occurred during signup")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border shadow-xl animate-fade-in">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Check Your Email</CardTitle>
            <CardDescription className="text-muted-foreground">
              We've sent a verification link to <strong>{formData.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in your email to verify your account and complete the registration process.
            </p>
            <Button variant="outline" onClick={() => setEmailSent(false)} className="w-full">
              Back to Signup
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back to Home */}
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
            <CardTitle className="text-2xl font-bold text-foreground">Join RoomMate TN</CardTitle>
            <CardDescription className="text-muted-foreground">
              Create your account and find your perfect roommate
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* User Type Selection */}
            <Tabs value={userType}   onValueChange={(value) => setUserType(value as "student" | "advertiser")}
 className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="student" className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="advertiser" className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Advertiser
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Student Registration
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">Looking for roommates and shared spaces</p>
                </div>

                {/* Student Form */}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-foreground font-medium">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Ahmed"
                        className={`h-11 border-border focus:ring-primary transition-colors ${touched.firstName && errors.firstName ? "border-red-500 focus:ring-red-500" : ""}`}
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        onBlur={() => handleBlur("firstName")}
                        required
                      />
                      {touched.firstName && errors.firstName && (
                        <p className="text-red-500 text-xs flex items-center mt-1">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-foreground font-medium">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Ben Ali"
                        className={`h-11 border-border focus:ring-primary transition-colors ${touched.lastName && errors.lastName ? "border-red-500 focus:ring-red-500" : ""}`}
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        onBlur={() => handleBlur("lastName")}
                        required
                      />
                      {touched.lastName && errors.lastName && (
                        <p className="text-red-500 text-xs flex items-center mt-1">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ahmed.benali@university.tn"
                      className={`h-11 border-border focus:ring-primary transition-colors ${touched.email && errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      required
                    />
                    {touched.email && errors.email && (
                      <p className="text-red-500 text-xs flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university" className="text-foreground font-medium">
                      University *
                    </Label>
                    <Select
                      value={formData.university}
                      onValueChange={(value) => handleInputChange("university", value)}
                    >
                      <SelectTrigger className={`h-11 border-border ${touched.university && errors.university ? "border-red-500 focus:ring-red-500" : ""}`}>
                        <SelectValue placeholder="Select your university" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="university-tunis">University of Tunis</SelectItem>
                        <SelectItem value="university-sfax">University of Sfax</SelectItem>
                        <SelectItem value="university-sousse">University of Sousse</SelectItem>
                        <SelectItem value="university-monastir">University of Monastir</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {touched.university && errors.university && (
                      <p className="text-red-500 text-xs flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.university}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-foreground font-medium">
                        Budget (TND/month)
                      </Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="300"
                        className="h-11 border-border focus:ring-primary transition-colors"
                        value={formData.budget}
                        onChange={(e) => handleInputChange("budget", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-foreground font-medium">
                        Gender
                      </Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger className="h-11 border-border">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-foreground font-medium">
                      About You (Optional)
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about your interests, study habits, lifestyle..."
                      className="border-border focus:ring-primary resize-none transition-colors"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                    />
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="advertiser" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                    Advertiser Registration
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">Posting rooms and shared spaces</p>
                </div>

                {/* Advertiser Form */}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="advFirstName" className="text-foreground font-medium">
                        First Name *
                      </Label>
                      <Input
                        id="advFirstName"
                        placeholder="Fatma"
                        className={`h-11 border-border focus:ring-primary transition-colors ${touched.firstName && errors.firstName ? "border-red-500 focus:ring-red-500" : ""}`}
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        onBlur={() => handleBlur("firstName")}
                        required
                      />
                      {touched.firstName && errors.firstName && (
                        <p className="text-red-500 text-xs flex items-center mt-1">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="advLastName" className="text-foreground font-medium">
                        Last Name *
                      </Label>
                      <Input
                        id="advLastName"
                        placeholder="Trabelsi"
                        className={`h-11 border-border focus:ring-primary transition-colors ${touched.lastName && errors.lastName ? "border-red-500 focus:ring-red-500" : ""}`}
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        onBlur={() => handleBlur("lastName")}
                        required
                      />
                      {touched.lastName && errors.lastName && (
                        <p className="text-red-500 text-xs flex items-center mt-1">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="advEmail" className="text-foreground font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="advEmail"
                      type="email"
                      placeholder="fatma.trabelsi@email.com"
                      className={`h-11 border-border focus:ring-primary transition-colors ${touched.email && errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      required
                    />
                    {touched.email && errors.email && (
                      <p className="text-red-500 text-xs flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground font-medium">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+216 XX XXX XXX"
                      className={`h-11 border-border focus:ring-primary transition-colors ${touched.phone && errors.phone ? "border-red-500 focus:ring-red-500" : ""}`}
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      required
                    />
                    {touched.phone && errors.phone && (
                      <p className="text-red-500 text-xs flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountType" className="text-foreground font-medium">
                      Account Type *
                    </Label>
                    <Select
                      value={formData.accountType}
                      onValueChange={(value) => handleInputChange("accountType", value)}
                    >
                      <SelectTrigger className={`h-11 border-border ${touched.accountType && errors.accountType ? "border-red-500 focus:ring-red-500" : ""}`}>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student-owner">Student (Room Owner)</SelectItem>
                        <SelectItem value="property-owner">Property Owner</SelectItem>
                        <SelectItem value="agency">Real Estate Agency</SelectItem>
                      </SelectContent>
                    </Select>
                    {touched.accountType && errors.accountType && (
                      <p className="text-red-500 text-xs flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.accountType}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-foreground font-medium">
                      Primary Location
                    </Label>
                    <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                      <SelectTrigger className="h-11 border-border">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tunis">Tunis</SelectItem>
                        <SelectItem value="sfax">Sfax</SelectItem>
                        <SelectItem value="sousse">Sousse</SelectItem>
                        <SelectItem value="monastir">Monastir</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            {/* Password Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password (min. 6 characters)"
                    className={`h-11 border-border focus:ring-primary pr-10 transition-colors ${touched.password && errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    required
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`h-11 border-border focus:ring-primary pr-10 transition-colors ${touched.confirmPassword && errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-red-500 text-xs flex items-center mt-1">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <input
                id="terms"
                type="checkbox"
                className={`w-4 h-4 text-primary border-border rounded focus:ring-primary mt-1 ${touched.terms && errors.terms ? "border-red-500" : ""}`}
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked)
                  setTouched(prev => ({ ...prev, terms: true }))
                }}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {touched.terms && errors.terms && (
              <p className="text-red-500 text-xs flex items-center mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.terms}
              </p>
            )}

            {/* Message feedback */}
            {message && (
              <div
                className={`p-3 rounded-md text-sm font-medium transition-opacity duration-300 ${
                  messageType === "success"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}
              >
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 transition-colors"
              disabled={loading || Object.keys(errors).length > 0}
              onClick={handleSignup}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}