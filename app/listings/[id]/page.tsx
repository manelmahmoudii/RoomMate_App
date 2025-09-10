"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'react-hot-toast'; // Import toast
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
  Plus,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"

// Helper function to generate a consistent color from a string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const getAvatarDisplayUrl = (url: string | null | undefined) => url === null || url === undefined ? undefined : url;

interface ListingDetail {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  room_type: string;
  number_of_roommates: number;
  current_roommates: number;
  amenities: string; // JSON string
  images: string; // JSON string
  available_from: string;
  status: string;
  views_count: number;
  created_at: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_phone: string;
  owner_avatar_url: string | null;
  owner_bio: string;
  owner_created_at: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface UserSession {
  id: string;
  email: string;
  role: string; // This will come from the decoded token directly or mapped from user_type
  first_name: string;
  last_name: string;
  avatar_url: string;
  user_type: string; // Add user_type to match API response more closely
  // Add other user properties if needed
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserSession | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [message, setMessage] = useState("")
  const [showRequestModal, setShowRequestModal] = useState(false); // New state for request modal
  const [requestMessage, setRequestMessage] = useState(""); // New state for request message content
  const [targetListingId, setTargetListingId] = useState<string | null>(null); // New state to store listing ID for request

  const router = useRouter()
  const { id } = params; // Get listing ID from params

  const getParsedImages = (imagesInput: string | string[] | null) => {
    if (!imagesInput) return [];

    // If it's already an array, return it directly
    if (Array.isArray(imagesInput)) {
      return imagesInput;
    }

    // Convert to string defensively before any string operations
    const imagesString = String(imagesInput);

    // If it's already a direct URL, return it as a single-item array.
    if (imagesString.startsWith('/') || imagesString.startsWith('http')) {
      return [imagesString];
    }

    try {
      const images = JSON.parse(imagesString);
      return Array.isArray(images) ? images : [];
    } catch (e) {
      console.error("Error parsing images JSON string:", imagesString, e);
      return [];
    }
  };

  const getParsedAmenities = (amenitiesInput: string | string[] | null) => {
    if (!amenitiesInput) return [];

    // If it's already an array, return it directly
    if (Array.isArray(amenitiesInput)) {
      return amenitiesInput;
    }

    // Convert to string defensively before any string operations
    const amenitiesString = String(amenitiesInput);

    if (typeof amenitiesString === 'string') {
      try {
        const amenities = JSON.parse(amenitiesString);
        return Array.isArray(amenities) ? amenities : [];
      } catch (e) {
        console.error("Error parsing amenities JSON string:", amenitiesString, e);
        return [];
      }
    }

    console.error("Unexpected type for amenitiesInput after string conversion:", typeof amenitiesInput, amenitiesInput);
    return [];
  };

  const fetchListing = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/listings/${id}`);
      if (response.ok) {
        const data = await response.json();
        setListing(data.listing);
        setComments(data.comments || []);
        setIsFavorited(data.isFavorited);
      } else {
        console.error("Failed to fetch listing");
        setListing(null);
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      setListing(null);
    } finally {
      setLoading(false);
    }
  };
  const fetchUserSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include", // Include cookies with the request
      });
      if (response.ok) {
        const data = await response.json();
        console.log("User session fetched successfully:", data);
        // Map user_type from API to role for consistency in UserSession interface
        setUser({ ...data, role: data.user_type });
      } else {
        console.error("Failed to fetch user session, status:", response.status);
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user session:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchListing();
    fetchUserSession();
  }, [id]);

  const toggleFavorite = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      const method = isFavorited ? "DELETE" : "POST";
      const response = await fetch("/api/student/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
        credentials: "include", // Include cookies with the request
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
        // Optionally, refetch listings or update UI to reflect new favorite status in saved listings
      } else {
        console.error("Failed to toggle favorite");
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to toggle favorite.");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("An error occurred while toggling favorite.");
    }
  };

  const handlePostComment = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/listings/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, userId: user.id }),
        credentials: "include", // Include cookies with the request
      });

      if (response.ok) {
        setNewComment("");
        fetchListing(); // Re-fetch listing to get new comments
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to post comment.");
        console.error("Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("An error occurred while posting the comment.");
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!message.trim()) return;
    if (!listing?.owner_id) {
      toast.error("Listing owner information is missing.");
      return;
    }

    console.log("Attempting to send message...");
    console.log("Current user:", user);
    console.log("Listing owner ID:", listing.owner_id);
    console.log("Message content:", message);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: listing.owner_id,
          message: message,
          listingId: id, // Pass listing ID for context
        }),
        credentials: "include", // Include cookies with the request
      });

      if (response.ok) {
        setMessage("");
        setShowContactForm(false);
        toast.success("Message sent successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send message!");
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred while sending the message.");
    }
  };

  const openRequestModal = (listingId: string) => {
    setTargetListingId(listingId);
    setRequestMessage("");
    setShowRequestModal(true);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!targetListingId || !requestMessage.trim()) {
      toast("Missing listing or request message.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/student/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: targetListingId,
          studentId: user.id,
          message: requestMessage,
        }),
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Roommate request sent successfully!");
        setShowRequestModal(false);
        setRequestMessage("");
        // Optionally, refetch requests for student dashboard if user navigates there
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send request.");
        console.error("Failed to send request:", response.status, errorData.error);
      }
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("An unexpected error occurred while sending the request.");
    } finally {
      setLoading(false);
    }
  };
  
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

  const displayedImages = getParsedImages(listing.images);
  const displayedAmenities = getParsedAmenities(listing.amenities);

  return (
    <div className="min-h-screen bg-background">
      {/* Removed Header component */}
      {/*
      <Header />
      */}

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
                  key={currentImageIndex} // Add key to trigger re-render and animation
                  src={
                    displayedImages[currentImageIndex] ||
                    "/placeholder.svg?height=400&width=800&query=modern apartment room"
                  }
                  alt={listing.title}
                  className="w-full h-96 object-cover transition-opacity duration-300 ease-in-out animate-fade-in" // Add transition and fade-in
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="secondary" className="bg-background/80 hover:scale-[1.05] transition-transform duration-200" onClick={toggleFavorite}>
                    <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button size="icon" variant="secondary" className="bg-background/80 hover:scale-[1.05] transition-transform duration-200">
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
              {displayedImages.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {displayedImages.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
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
            <Card className="animate-fade-in">
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
                        <span>{listing.number_of_roommates} max roommates</span>
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
            {displayedAmenities.length > 0 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-xl">Amenities & Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {displayedAmenities.map((amenity: string, index: number) => (
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
            <Card className="animate-fade-in">
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
                    <Button onClick={handlePostComment} disabled={!newComment.trim()} className="hover:scale-[1.02] transition-transform duration-200">
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 rounded-lg bg-muted/30">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={getAvatarDisplayUrl(comment.profiles?.avatar_url)} />
                        <AvatarFallback 
                          style={{ backgroundColor: comment.profiles?.user_id ? stringToColor(comment.profiles.user_id) : '#9ca3af' }}
                          className="text-white font-semibold"
                        >
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
            <Card className="animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={getAvatarDisplayUrl(listing.owner_avatar_url)} />
                    <AvatarFallback 
                      style={{ backgroundColor: listing.owner_email ? stringToColor(listing.owner_email) : '#9ca3af' }}
                      className="text-white font-semibold"
                    >
                      {listing.owner_first_name?.[0]}{listing.owner_last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{listing.owner_first_name} {listing.owner_last_name}</h3>
                      <Shield className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Member since {new Date(listing.owner_created_at).getFullYear()}
                    </p>
                  </div>
                </div>

                {listing.owner_bio && <p className="text-sm text-muted-foreground mb-4">{listing.owner_bio}</p>}

                <div className="space-y-3">
                  {user && user.id !== listing.owner_id && (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 hover:scale-[1.02] transition-transform duration-200"
                    onClick={() => setShowContactForm(!showContactForm)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  )}
                  {listing.owner_phone && (
                    <Button variant="outline" className="w-full bg-transparent hover:scale-[1.02] transition-transform duration-200">
                      <Phone className="w-4 h-4 mr-2" />
                      {listing.owner_phone}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            {showContactForm && user && user.id !== listing.owner_id && (
              <Card className="animate-fade-in">
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
                    className="w-full bg-primary hover:bg-primary/90 hover:scale-[1.02] transition-transform duration-200"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            )}

            {user && user.id !== listing.owner_id && user.role === 'student' && ( // Show send request button if logged in as student and not owner
              <Card className="animate-fade-in">
                <CardContent className="p-6 text-center">
                  <Button
                    className="w-full bg-secondary hover:bg-secondary/90 hover:scale-[1.02] transition-transform duration-200"
                    onClick={() => openRequestModal(listing.id)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Send Roommate Request
                  </Button>
                </CardContent>
              </Card>
            )}

            {!user && (
              <Card className="animate-fade-in">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">Sign in to contact the owner</p>
                  <Button asChild className="w-full hover:scale-[1.02] transition-transform duration-200">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal for Student */}
      {showRequestModal && user && user.role === 'student' && targetListingId === listing?.id && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out opacity-0 animate-fade-in-modal">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-95 transition-all duration-300 ease-out animate-scale-in-modal">
            <CardHeader>
              <CardTitle>Send Roommate Request for {listing?.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSendRequest}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="requestMessage">Your Message</Label>
                    <Textarea
                      id="requestMessage"
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Introduce yourself and explain why you're interested in this listing..."
                      rows={5}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent hover:scale-[1.02] transition-transform duration-200"
                    onClick={() => setShowRequestModal(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 hover:scale-[1.02] transition-transform duration-200" disabled={loading || !requestMessage.trim()}>
                    {loading ? <>Sending...</> : <>Send Request</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
