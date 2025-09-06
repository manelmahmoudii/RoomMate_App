"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  MapPin,
  Users,
  Heart,
  Share2,
  ArrowLeft,
  CheckCircle,
  Home,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Shield,
  Send,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)
  const [listing, setListing] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [message, setMessage] = useState("")

  const router = useRouter()

  

  const toggleFavorite = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

   
  }

  

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading listing details...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Listing not found</h1>
          <p className="text-muted-foreground mb-4">
            The listing you're looking for doesn't exist or the database tables haven't been created yet.
          </p>
          <Button asChild>
            <Link href="/search">Back to Search</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">RoomMate TN</span>
            </Link>

            <div className="flex items-center space-x-4">
              {user ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/student">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/search"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={
                    listing.images?.[currentImageIndex] ||
                    "/placeholder.svg?height=400&width=800&query=modern apartment room" ||
                    "/placeholder.svg" ||
                    "/placeholder.svg"
                  }
                  alt={listing.title}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="secondary" className="bg-background/80" onClick={toggleFavorite}>
                    <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button size="icon" variant="secondary" className="bg-background/80">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                    {listing.price} TND/month
                  </Badge>
                </div>
              </div>

              {/* Image Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {listing.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          currentImageIndex === index ? "border-primary" : "border-border"
                        }`}
                      >
                        <img
                          src={image || "/placeholder.svg?height=80&width=80&query=apartment room"}
                          alt={`View ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Listing Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="text-lg">
                        {listing.address}, {listing.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="w-5 h-5 mr-1" />
                        <span>{listing.max_roommates} max roommates</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Home className="w-5 h-5 mr-1" />
                        <span>{listing.room_type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed mb-6">{listing.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-6">
                  <div>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Available from {new Date(listing.available_from).toLocaleDateString()}
                  </div>
                  <div>Posted {new Date(listing.created_at).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Amenities & Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {listing.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="text-foreground">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Comments & Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Ask a question or leave a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    <Button  disabled={!newComment.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 rounded-lg bg-muted/30">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={comment.profiles?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {comment.profiles?.full_name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{comment.profiles?.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No comments yet. Be the first to ask a question!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={listing.profiles?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {listing.profiles?.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{listing.profiles?.full_name}</h3>
                      <Shield className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Member since {new Date(listing.profiles?.created_at).getFullYear()}
                    </p>
                  </div>
                </div>

                {listing.profiles?.bio && <p className="text-sm text-muted-foreground mb-4">{listing.profiles.bio}</p>}

                <div className="space-y-3">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => setShowContactForm(!showContactForm)}
                    disabled={!user}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  {listing.profiles?.phone && (
                    <Button variant="outline" className="w-full bg-transparent">
                      <Phone className="w-4 h-4 mr-2" />
                      {listing.profiles.phone}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            {showContactForm && user && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Send a Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Hi! I'm interested in your room listing. Could you tell me more about..."
                    rows={4}
                    className="resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    
                    disabled={!message.trim()}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            )}

            {!user && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">Sign in to contact the owner</p>
                  <Button asChild className="w-full">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
