"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Heart,
  MessageCircle,
  Settings,
  Search,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Edit3,
  Camera,
  Bell,
  Eye,
  Trash2,
  Filter,
  Plus,
} from "lucide-react"
import Link from "next/link"

interface StudentProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  avatar_url: string;
  created_at: string;
  status: 'active' | 'suspended';
  university?: string;
  study_level?: string;
  bio?: string;
  preferences?: { 
    budget?: number;
    gender?: string;
    location?: string;
    maxRoommates?: number;
    furnished?: boolean;
    wifi?: boolean;
    parking?: boolean;
    age?: number;
  };
}

interface SavedListing {
  favorite_id: string;
  listing_id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  images: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  number_of_roommates: number; // Added for student view
  amenities: string; // Added for student view (JSON string)
}

interface SentRequest {
  request_id: string;
  listing_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  listing_title: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_id: string; // Added owner_id
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [editingProfile, setEditingProfile] = useState(false)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<SentRequest | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [targetListingId, setTargetListingId] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRecipientId, setMessageRecipientId] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [messageListingId, setMessageListingId] = useState<string | null>(null);
  const [allListings, setAllListings] = useState<SavedListing[]>([]); // New state for all listings

  const fetchStudentProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setStudentProfile(data);
      } else {
        console.error("Failed to fetch student profile:", response.status);
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/student/favorites");
      if (response.ok) {
        const data = await response.json();
        setSavedListings(data);
      } else {
        console.error("Failed to fetch saved listings:", response.status);
      }
    } catch (error) {
      console.error("Error fetching saved listings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSentRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/student/requests");
      if (response.ok) {
        const data = await response.json();
        setSentRequests(data);
      } else {
        console.error("Failed to fetch sent requests:", response.status);
      }
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/listings"); // Public endpoint to get all listings
      if (response.ok) {
        const data = await response.json();
        // Filter out active listings and limit to a few for recommendations
        setAllListings(data.filter((l: any) => l.status === 'active').slice(0, 4)); 
      } else {
        console.error("Failed to fetch all listings:", response.status);
      }
    } catch (error) {
      console.error("Error fetching all listings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleFavorite = useCallback(async (listingId: string) => {
    try {
      const response = await fetch("/api/student/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        fetchSavedListings(); // Re-fetch saved listings to update UI
      } else {
        console.error("Failed to toggle favorite:", response.status);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }, [fetchSavedListings]);

  const handleSendRequest = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetListingId || !requestMessage) return;

    setLoading(true);
    try {
      const response = await fetch("/api/student/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: targetListingId, message: requestMessage }),
      });
      if (response.ok) {
        alert("Request sent successfully!");
        setShowRequestModal(false);
        setRequestMessage("");
        setTargetListingId(null);
        fetchSentRequests();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to send request.");
        console.error("Failed to send request:", response.status, errorData.error);
      }
    } catch (error) {
      alert("Error sending request.");
      console.error("Error sending request:", error);
    } finally {
      setLoading(false);
    }
  }, [targetListingId, requestMessage, fetchSentRequests]);

  const handleEditRequest = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest || !requestMessage) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/student/requests/${editingRequest.request_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: requestMessage }),
      });
      if (response.ok) {
        alert("Request updated successfully!");
        setShowRequestModal(false);
        setRequestMessage("");
        setEditingRequest(null);
        fetchSentRequests();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update request.");
        console.error("Failed to update request:", response.status, errorData.error);
      }
    } catch (error) {
      alert("Error updating request.");
      console.error("Error updating request:", error);
    } finally {
      setLoading(false);
    }
  }, [editingRequest, requestMessage, fetchSentRequests]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageRecipientId || !contactMessage) return;

    setLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: messageRecipientId, message: contactMessage, listingId: messageListingId }),
      });
      if (response.ok) {
        alert("Message sent successfully!");
        setShowMessageModal(false);
        setContactMessage("");
        setMessageRecipientId(null);
        setMessageListingId(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to send message.");
        console.error("Failed to send message:", response.status, errorData.error);
      }
    } catch (error) {
      alert("Error sending message.");
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  }, [messageRecipientId, contactMessage, messageListingId]);

  const openRequestModalForNew = (listingId: string) => {
    setEditingRequest(null);
    setRequestMessage("");
    setTargetListingId(listingId);
    setShowRequestModal(true);
  };

  const openRequestModalForEdit = (request: SentRequest) => {
    setEditingRequest(request);
    setRequestMessage(request.message);
    setTargetListingId(request.listing_id);
    setShowRequestModal(true);
  };

  const openMessageModal = (recipientId: string, listingId: string | null = null) => {
    setMessageRecipientId(recipientId);
    setMessageListingId(listingId);
    setContactMessage("");
    setShowMessageModal(true);
  };

  useEffect(() => {
    fetchStudentProfile();
    fetchSavedListings();
    fetchSentRequests();
    fetchAllListings(); // Fetch all listings on mount
  }, [fetchStudentProfile, fetchSavedListings, fetchSentRequests, fetchAllListings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "accepted":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "active":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getListingImageUrl = (images: string) => {
    try {
      const imageUrls = JSON.parse(images);
      return imageUrls.length > 0 ? imageUrls[0] : "/placeholder.svg";
    } catch (e) {
      console.error("Error parsing images:", e);
      return "/placeholder.svg";
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

    try {
      const amenities = JSON.parse(amenitiesString);
      return Array.isArray(amenities) ? amenities : [];
    } catch (e) {
      console.error("Error parsing amenities JSON string:", amenitiesString, e);
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={studentProfile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {studentProfile?.first_name?.[0]}{studentProfile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {studentProfile?.status === 'active' && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{studentProfile?.first_name} {studentProfile?.last_name}</h2>
                    <p className="text-sm text-muted-foreground">{studentProfile?.study_level || studentProfile?.user_type}</p>
                    <p className="text-xs text-muted-foreground">{studentProfile?.university}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("overview")}
                  >
                    <Users className="w-4 h-4 mr-3" />
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === "saved" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("saved")}
                  >
                    <Heart className="w-4 h-4 mr-3" />
                    Saved Listings
                  </Button>
                  <Button
                    variant={activeTab === "requests" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("requests")}
                  >
                    <MessageCircle className="w-4 h-4 mr-3" />
                    My Requests
                  </Button>
                  <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Profile Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div key="overview" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                  <Button className="bg-primary hover:bg-primary/90" asChild>
                    <Link href="/search">
                      <Search className="w-4 h-4 mr-2" />
                      Find Rooms
                    </Link>
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Saved Listings</p>
                          <p className="text-2xl font-bold text-foreground">{savedListings.length}</p>
                        </div>
                        <Heart className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Sent Requests</p>
                          <p className="text-2xl font-bold text-foreground">{sentRequests.length}</p>
                        </div>
                        <MessageCircle className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Profile Views</p>
                          <p className="text-2xl font-bold text-foreground">24</p>
                        </div>
                        <Eye className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Search */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Search</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input placeholder="Location" className="pl-10" />
                      </div>
                      <div className="flex-1">
                        <Input placeholder="Max Budget (TND)" type="number" />
                      </div>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading && <p>Loading recent activity...</p>}
                      {!loading && sentRequests.slice(0, 3).map((request, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-sm text-foreground">Sent request for {request.listing_title} to {request.owner_first_name} {request.owner_last_name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Saved Listings Tab */}
            {activeTab === "saved" && (
              <div key="saved" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Saved Listings</h1>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loading && <p>Loading saved listings...</p>}
                  {!loading && savedListings.length > 0 ? (savedListings.map((listing) => (
                    <Card key={listing.listing_id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
                      <div className="relative">
                        <img
                          src={getListingImageUrl(listing.images)}
                          alt={listing.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                          onClick={() => handleToggleFavorite(listing.listing_id)}
                        >
                          <Heart className={`w-4 h-4 ${savedListings.some(sl => sl.listing_id === listing.listing_id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                        </Button>
                        <Badge className={`absolute top-3 left-3 ${getStatusColor(listing.status)}`}>
                          {getStatusIcon(listing.status)}
                          {listing.status}
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2">{listing.title}</h3>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{listing.city}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <Users className="w-4 h-4 mr-1" />
                          <span className="text-sm">{listing.number_of_roommates} Roommate(s)</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {getParsedAmenities(listing.amenities).map((amenity: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-primary">{listing.price} TND/month</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">4.5</span>{/* Placeholder for rating */}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Added to favorites</p>
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
                            <Link href={`/listings/${listing.listing_id}`}>View Details</Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openRequestModalForNew(listing.listing_id)}>
                            <Plus className="w-4 h-4 mr-2" /> Send Request
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-lg text-muted-foreground mb-4">No saved listings found.</p>
                      <p className="text-md text-muted-foreground mb-8">Explore available rooms and add them to your favorites!</p>
                      <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href="/search">Find Rooms Now</Link>
                      </Button>

                      {!loading && allListings.length > 0 && (
                        <div className="mt-12">
                          <h2 className="text-2xl font-bold text-foreground mb-6">Recommended Listings</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {allListings.map((listing) => (
                              <Card key={listing.listing_id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
                                <div className="relative">
                                  <img
                                    src={getListingImageUrl(listing.images)}
                                    alt={listing.title}
                                    className="w-full h-48 object-cover rounded-t-lg"
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                                    onClick={() => handleToggleFavorite(listing.listing_id)}
                                  >
                                    <Heart className={`w-4 h-4 ${savedListings.some(sl => sl.listing_id === listing.listing_id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                                  </Button>
                                  <Badge className={`absolute top-3 left-3 ${getStatusColor(listing.status)}`}>
                                    {getStatusIcon(listing.status)}
                                    {listing.status}
                                  </Badge>
                                </div>

                                <CardContent className="p-4">
                                  <h3 className="font-semibold text-foreground mb-2">{listing.title}</h3>
                                  <div className="flex items-center text-muted-foreground mb-2">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span className="text-sm">{listing.city}</span>
                                  </div>
                                  <div className="flex items-center text-muted-foreground mb-2">
                                    <Users className="w-4 h-4 mr-1" />
                                    <span className="text-sm">{listing.number_of_roommates} Roommate(s)</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {getParsedAmenities(listing.amenities).map((amenity: string, index: number) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {amenity}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg font-bold text-primary">{listing.price} TND/month</span>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span className="text-sm">4.5</span>{/* Placeholder for rating */}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
                                      <Link href={`/listings/${listing.listing_id}`}>View Details</Link>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => openRequestModalForNew(listing.listing_id)}>
                                      <Plus className="w-4 h-4 mr-2" /> Send Request
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === "requests" && (
              <div key="requests" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">My Requests</h1>
                  <Badge variant="secondary">{sentRequests.length} total requests</Badge>
                </div>

                <div className="space-y-4">
                  {loading && <p>Loading requests...</p>}
                  {!loading && sentRequests.map((request) => {
                    const ownerId = studentProfile?.id; // Assuming studentProfile is available and has an ID
                    return (
                    <Card key={request.request_id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">{request.listing_title}</h3>
                            <p className="text-sm text-muted-foreground">To: {request.owner_first_name} {request.owner_last_name}</p>
                            <p className="text-xs text-muted-foreground">Sent {new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                            {getStatusIcon(request.status)}
                            {request.status}
                          </Badge>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4 mb-4">
                          <p className="text-sm text-muted-foreground italic">
                            "{request.message.substring(0, 100)}..."
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
                            <Link href={`/listings/${request.listing_id}`}>View Listing</Link>
                          </Button>
                          {request.status === "pending" && (
                            <Button variant="outline" size="sm" onClick={() => openRequestModalForEdit(request)}>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Request
                            </Button>
                          )}
                          {request.status === "accepted" && ownerId && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => openMessageModal(ownerId, request.listing_id)}>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Contact Owner
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )})}
                </div>
              </div>
            )}

            {/* Profile Settings Tab */}
            {activeTab === "profile" && (
              <div key="profile" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
                  <Button variant="outline" onClick={() => setEditingProfile(!editingProfile)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    {editingProfile ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={studentProfile?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {studentProfile?.first_name?.[0]}{studentProfile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          {editingProfile && (
                            <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 w-8 h-8">
                              <Camera className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{studentProfile?.first_name} {studentProfile?.last_name}</h3>
                          <p className="text-sm text-muted-foreground">Member since {new Date(studentProfile?.created_at || "").toLocaleDateString()}</p>
                          {studentProfile?.status === 'active' && (
                            <Badge variant="secondary" className="mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={`${studentProfile?.first_name || ""} ${studentProfile?.last_name || ""}`}
                            disabled={!editingProfile}
                            className={editingProfile ? "" : "bg-muted"}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={studentProfile?.email || ""}
                            disabled={!editingProfile}
                            className={editingProfile ? "" : "bg-muted"}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="age">Age</Label>
                            <Input
                              id="age"
                              value={studentProfile?.preferences?.age || ""}
                              disabled={!editingProfile}
                              className={editingProfile ? "" : "bg-muted"}
                            />
                          </div>
                          <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={studentProfile?.preferences?.gender} disabled={!editingProfile}>
                              <SelectTrigger className={editingProfile ? "" : "bg-muted"}>
                                <SelectValue placeholder={studentProfile?.preferences?.gender || "Select"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="university">University</Label>
                          <Select value={studentProfile?.university} disabled={!editingProfile}>
                            <SelectTrigger className={editingProfile ? "" : "bg-muted"}>
                              <SelectValue placeholder={studentProfile?.university || "Select your university"} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="university-tunis">University of Tunis</SelectItem>
                              <SelectItem value="university-sfax">University of Sfax</SelectItem>
                              <SelectItem value="university-sousse">University of Sousse</SelectItem>
                                <SelectItem value="university-monastir">University of Monastir</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="field">Field of Study</Label>
                          <Input
                            id="field"
                            value={studentProfile?.study_level || ""}
                            disabled={!editingProfile}
                            className={editingProfile ? "" : "bg-muted"}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">About Me</Label>
                          <Textarea
                            id="bio"
                            value={studentProfile?.bio || ""}
                            disabled={!editingProfile}
                            className={editingProfile ? "" : "bg-muted"}
                            rows={3}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Housing Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="budget">Budget (TND/month)</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={studentProfile?.preferences?.budget || ""}
                          disabled={!editingProfile}
                          className={editingProfile ? "" : "bg-muted"}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Preferred Location</Label>
                        <Select value={studentProfile?.preferences?.location} disabled={!editingProfile}>
                          <SelectTrigger className={editingProfile ? "" : "bg-muted"}>
                            <SelectValue placeholder={studentProfile?.preferences?.location || "Select city"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tunis">Tunis</SelectItem>
                            <SelectItem value="sfax">Sfax</SelectItem>
                            <SelectItem value="sousse">Sousse</SelectItem>
                            <SelectItem value="monastir">Monastir</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="roommates">Max Roommates</Label>
                        <Select value={String(studentProfile?.preferences?.maxRoommates || "")} disabled={!editingProfile}>
                          <SelectTrigger className={editingProfile ? "" : "bg-muted"}>
                            <SelectValue placeholder={String(studentProfile?.preferences?.maxRoommates || "Select")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Required Amenities</Label>
                        <div className="space-y-2">
                          {[
                            { key: "furnished", label: "Furnished", checked: studentProfile?.preferences?.furnished },
                            { key: "wifi", label: "WiFi", checked: studentProfile?.preferences?.wifi },
                            { key: "parking", label: "Parking", checked: studentProfile?.preferences?.parking },
                          ].map((amenity) => (
                            <div key={amenity.key} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={amenity.key}
                                checked={amenity.checked}
                                disabled={!editingProfile}
                                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                              />
                              <Label htmlFor={amenity.key} className="text-sm">
                                {amenity.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {editingProfile && (
                        <div className="pt-4">
                          <Button className="w-full bg-primary hover:bg-primary/90">Save Changes</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (targetListingId || editingRequest) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out opacity-0 animate-fade-in-modal">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-95 transition-all duration-300 ease-out animate-scale-in-modal">
            <CardHeader>
              <CardTitle>{editingRequest ? "Edit Roommate Request" : "Send Roommate Request"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={editingRequest ? handleEditRequest : handleSendRequest}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="listingTitle">Listing</Label>
                    <Input
                      id="listingTitle"
                      value={editingRequest?.listing_title || "Listing ID: " + targetListingId}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea
                      id="message"
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Write your message here..."
                      rows={5}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowRequestModal(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? (
                      <>Sending...</>
                    ) : editingRequest ? (
                      <>Save Changes</>
                    ) : (
                      <>Send Request</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && messageRecipientId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out opacity-0 animate-fade-in-modal">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-95 transition-all duration-300 ease-out animate-scale-in-modal">
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSendMessage}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="messageContent">Your Message</Label>
                    <Textarea
                      id="messageContent"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Write your message here..."
                      rows={5}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowMessageModal(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? <>Sending...</> : <>Send Message</>}
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
