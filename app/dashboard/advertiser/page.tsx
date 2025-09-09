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
  Home,
  MessageCircle,
  Settings,
  Plus,
  Eye,
  Edit3,
  Trash2,
  TrendingUp,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  BarChart3,
  Upload,
  Mail
} from "lucide-react"
import Link from "next/link"

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  avatar_url: string;
  created_at: string;
  status: 'active' | 'suspended';
  totalReviews?: number; // Added totalReviews
  rating?: number; // Added rating
  phone?: string;
  location?: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  number_of_roommates: number;
  amenities: string;
  images: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  views?: number; // Added views
  requests?: number; // Added requests
}

interface Request {
  id: string;
  student_id: string;
  listing_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  student_first_name: string;
  student_last_name: string;
  student_avatar_url: string;
  listing_title: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_first_name: string;
  sender_last_name: string;
  sender_avatar_url: string;
  receiver_first_name: string;
  receiver_last_name: string;
  receiver_avatar_url: string;
  listing_title?: string;
  listing_city?: string;
}

interface Analytics {
  totalViews: number;
  totalRequests: number;
  activeListings: number;
  averageRating: number; // Assuming this is calculated or fetched
  monthlyEarnings: number;
  responseRate: number;
}

export default function AdvertiserDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddListing, setShowAddListing] = useState(false)
  const [advertiserProfile, setAdvertiserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); // New state for messages
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showEditListing, setShowEditListing] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false); // New state for message modal
  const [messageRecipientId, setMessageRecipientId] = useState<string | null>(null); // New state for message recipient
  const [messageListingId, setMessageListingId] = useState<string | null>(null); // New state for message listing
  const [contactMessage, setContactMessage] = useState<string>(""); // New state for message content
  const [newListingForm, setNewListingForm] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    number_of_roommates: "1",
    amenities: [],
    images: [],
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const getListingImageUrl = (imagesString: string) => {
    try {
      const images = JSON.parse(imagesString);
      return (Array.isArray(images) && images.length > 0) ? images[0] : "/placeholder.svg";
    } catch (error) {
      console.error("Error parsing images JSON for listing:", imagesString, error);
      return "/placeholder.svg";
    }
  };

  const getListingImagesArray = (imagesString: string) => {
    try {
      const images = JSON.parse(imagesString);
      return (Array.isArray(images) && images.length > 0) ? images : [];
    } catch (error) {
      console.error("Error parsing images JSON for editing listing:", imagesString, error);
      return [];
    }
  };

  // Mock advertiser data - will be replaced by fetched data
  const advertiser = {
    name: "Amira Ben Salem",
    email: "amira.bensalem@email.com",
    avatar: "/tunisian-woman-profile.jpg",
    phone: "+216 XX XXX XXX",
    accountType: "Student (Room Owner)",
    location: "Tunis",
    joinedDate: "March 2022",
    verified: true,
    rating: 4.9,
    totalReviews: 47,
  }

  // Removed: Mock listings data
  /*
  const listings = [
    {
      id: 1,
      title: "Modern Apartment in Tunis Center",
      location: "Tunis, Bab Bhar",
      price: 350,
      image: "/modern-student-apartment-tunis.jpg",
      status: "active",
      views: 156,
      requests: 8,
      posted: "2 weeks ago",
      roommates: 2,
      rating: 4.8,
    },
    {
      id: 2,
      title: "Cozy Student Room",
      location: "Tunis, Manouba",
      price: 290,
      image: "/modern-room-tunis-university.jpg",
      status: "active",
      views: 89,
      requests: 5,
      posted: "1 month ago",
      roommates: 3,
      rating: 4.6,
    },
    {
      id: 3,
      title: "Shared Apartment Near Campus",
      location: "Tunis, El Manar",
      price: 320,
      image: "/placeholder.svg?key=campus",
      status: "pending",
      views: 23,
      requests: 2,
      posted: "3 days ago",
      roommates: 2,
      rating: 0,
    },
  ]
  */

  // Removed: Mock requests data
  /*
  const requests = [
    {
      id: 1,
      studentName: "Ahmed Ben Ali",
      studentAvatar: "/student-woman.png",
      listingTitle: "Modern Apartment in Tunis Center",
      university: "University of Tunis",
      field: "Computer Science",
      message:
        "Hi! I'm very interested in your room listing. I'm a quiet Computer Science student looking for a study-friendly environment...",
      sentDate: "2 days ago",
      status: "pending",
      budget: 350,
    },
    {
      id: 2,
      studentName: "Sarah Mejri",
      studentAvatar: "/placeholder.svg?key=sarah",
      listingTitle: "Cozy Student Room",
      university: "ESPRIT",
      field: "Engineering",
      message:
        "Hello! I would love to join your student house. I'm responsible, clean, and looking for a long-term arrangement...",
      sentDate: "1 day ago",
      status: "pending",
      budget: 300,
    },
    {
      id: 3,
      studentName: "Mohamed Trabelsi",
      studentAvatar: "/placeholder.svg?key=mohamed",
      listingTitle: "Modern Apartment in Tunis Center",
      university: "University of Sfax",
      field: "Medicine",
      message: "Hi there! I'm a medical student looking for accommodation. I'm very organized and respectful...",
      sentDate: "5 days ago",
      status: "accepted",
      budget: 350,
    },
  ]
  */

  // Removed: Mock analytics data
  /*
  const analytics = {
    totalViews: 268,
    totalRequests: 15,
    activeListings: 2,
    averageRating: 4.7,
    monthlyEarnings: 640,
    responseRate: 95,
  }
  */

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "accepted":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const fetchAdvertiserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setAdvertiserProfile(data);
      } else {
        console.error("Failed to fetch advertiser profile:", response.status);
      }
    } catch (error) {
      console.error("Error fetching advertiser profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/listings"); // Assuming this fetches listings for the current user
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      } else {
        console.error("Failed to fetch listings:", response.status);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/advertiser/requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        console.error("Failed to fetch requests:", response.status);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/advertiser/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error("Failed to fetch analytics:", response.status);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error("Failed to fetch messages:", response.status);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setImagePreview(null);
    }
  };

  const handleListingDelete = useCallback(async (listingId: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setListings((prevListings) => prevListings.filter((listing) => listing.id !== listingId));
        alert("Listing deleted successfully!");
        fetchListings(); // Refresh listings after deletion
      } else {
        const errorData = await response.json();
        alert(`Failed to delete listing: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("An error occurred while deleting the listing.");
    } finally {
      setLoading(false);
    }
  }, [fetchListings]);

  const handleListingUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    setLoading(true);
    try {
      const updatedData = {
        title: (document.getElementById("editTitle") as HTMLInputElement).value,
        description: (document.getElementById("editDescription") as HTMLTextAreaElement).value,
        price: parseFloat((document.getElementById("editPrice") as HTMLInputElement).value),
        city: (document.getElementById("editLocation") as HTMLSelectElement).value,
        number_of_roommates: parseInt((document.getElementById("editRoommates") as HTMLSelectElement).value),
        // amenities and images would need more complex handling (e.g., file uploads, multi-select)
        // For now, we'll assume they are not being updated via this simple form
      };

      const response = await fetch(`/api/listings/${editingListing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert("Listing updated successfully!");
        setShowEditListing(false);
        setEditingListing(null);
        fetchListings(); // Refresh listings after update
      } else {
        const errorData = await response.json();
        alert(`Failed to update listing: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("An error occurred while updating the listing.");
    } finally {
      setLoading(false);
    }
  }, [editingListing, fetchListings]);

  const handleAddListing = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = null;
    if (selectedImageFile) {
      const formData = new FormData();
      formData.append("file", selectedImageFile);

      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.imageUrl;
        } else {
          const errorData = await uploadResponse.json();
          alert(`Failed to upload image: ${errorData.message || uploadResponse.statusText}`);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("An error occurred while uploading the image.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newListingForm.title,
          description: newListingForm.description,
          price: parseFloat(newListingForm.price),
          city: newListingForm.city,
          number_of_roommates: parseInt(newListingForm.number_of_roommates),
          amenities: newListingForm.amenities, 
          images: imageUrl ? [imageUrl] : [], // Pass the uploaded image URL
        }),
      });

      if (response.ok) {
        alert("Listing added successfully! Awaiting admin approval.");
        setShowAddListing(false);
        setNewListingForm({
          title: "",
          description: "",
          price: "",
          city: "",
          number_of_roommates: "1",
          amenities: [],
          images: [],
        });
        setSelectedImageFile(null);
        setImagePreview(null);
        fetchListings(); // Refresh listings after adding new one
      } else {
        const errorData = await response.json();
        alert(`Failed to add listing: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error adding listing:", error);
      alert("An error occurred while adding the listing.");
    } finally {
      setLoading(false);
    }
  }, [newListingForm, selectedImageFile, fetchListings]);

  const handleAcceptRequest = useCallback(async (requestId: string) => {
    if (!window.confirm("Are you sure you want to accept this request?")) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/advertiser/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });

      if (response.ok) {
        alert("Request accepted successfully!");
        fetchRequests(); // Refresh requests
      } else {
        const errorData = await response.json();
        alert(`Failed to accept request: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("An error occurred while accepting the request.");
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  const handleDeclineRequest = useCallback(async (requestId: string) => {
    if (!window.confirm("Are you sure you want to decline this request?")) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/advertiser/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (response.ok) {
        alert("Request declined successfully!");
        fetchRequests(); // Refresh requests
      } else {
        const errorData = await response.json();
        alert(`Failed to decline request: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error declining request:", error);
      alert("An error occurred while declining the request.");
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  const handleOpenMessageModal = useCallback((recipientId: string, listingId?: string) => {
    setMessageRecipientId(recipientId);
    setMessageListingId(listingId || null);
    setContactMessage(""); // Clear previous message
    setShowSendMessageModal(true);
    setActiveTab("messages"); // Automatically switch to messages tab
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!messageRecipientId || !contactMessage.trim()) {
      alert("Please enter a message and select a recipient.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: messageRecipientId,
          message: contactMessage.trim(),
          listingId: messageListingId,
        }),
      });

      if (response.ok) {
        alert("Message sent successfully!");
        setContactMessage("");
        setShowSendMessageModal(false);
        fetchMessages(); // Refresh messages after sending
      } else {
        const errorData = await response.json();
        alert(`Failed to send message: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message.");
    } finally {
      setLoading(false);
    }
  }, [messageRecipientId, contactMessage, messageListingId, fetchMessages]);

  const handleMessageStudent = useCallback(async (studentId: string, listingId: string) => {
    handleOpenMessageModal(studentId, listingId); // Use the new modal flow
  }, [handleOpenMessageModal]);

  const handleEditListing = useCallback((listing: Listing) => {
    setEditingListing(listing);
    setShowEditListing(true);
  }, []);

  useEffect(() => {
    fetchAdvertiserProfile();
    fetchListings();
    fetchRequests();
    fetchAnalytics();
    fetchMessages(); // Fetch messages on component mount
  }, [fetchAdvertiserProfile, fetchListings, fetchRequests, fetchAnalytics, fetchMessages]);

  return (
    <div className="min-h-screen bg-background">
      {/* Removed Header component */}
      {/*
      <Header
        title="RoomMate TN Advertiser"
        // navLinks={[]} // Header now manages its own navigation links
        // authButtons={false} // Header now manages its own auth buttons
      />
      */}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={advertiserProfile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {advertiserProfile?.first_name?.[0]}{advertiserProfile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {/* Assuming verification status is part of the profile data */}
                    {advertiserProfile?.status === 'active' && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{advertiserProfile?.first_name} {advertiserProfile?.last_name}</h2>
                    <p className="text-sm text-muted-foreground">{advertiserProfile?.user_type}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {/* Assuming rating will come from analytics or a separate profile endpoint */}
                      <span className="text-sm font-medium">{advertiserProfile?.rating || 0}</span>
                      <span className="text-xs text-muted-foreground">({advertiserProfile?.totalReviews || 0})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("overview")}
                  >
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === "listings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("listings")}
                  >
                    <Home className="w-4 h-4 mr-3" />
                    My Listings
                  </Button>
                  <Button
                    variant={activeTab === "requests" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("requests")}
                  >
                    <MessageCircle className="w-4 h-4 mr-3" />
                    Requests
                  </Button>
                  <Button
                    variant={activeTab === "messages" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("messages")}
                  >
                    <Mail className="w-4 h-4 mr-3" />
                    Messages
                  </Button>
                  <Button
                    variant={activeTab === "analytics" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("analytics")}
                  >
                    <TrendingUp className="w-4 h-4 mr-3" />
                    Analytics
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
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowAddListing(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Listing
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Listings</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.activeListings || 0}</p>
                        </div>
                        <Home className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Views</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.totalViews || 0}</p>
                        </div>
                        <Eye className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Pending Requests</p>
                          <p className="text-2xl font-bold text-foreground">
                            {requests.filter((r) => r.status === "pending").length}
                          </p>
                        </div>
                        <MessageCircle className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Average Rating</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.averageRating || 0}</p>
                        </div>
                        <Star className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.monthlyEarnings || 0} TND</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Response Rate</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.responseRate || 0}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading && <p>Loading recent activity...</p>}
                      {!loading && requests.slice(0, 3).map((request, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-sm text-foreground">New request from {request.student_first_name} {request.student_last_name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Listings Tab */}
            {activeTab === "listings" && (
              <div key="listings" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowAddListing(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Listing
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {listings.map((listing) => (
                    <Card key={listing.id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
                      <div className="relative">
                        <img
                          src={getListingImageUrl(listing.images)} // Assuming images is an array
                          alt={listing.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
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

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <p className="text-lg font-bold text-foreground">{listing.views || 0}</p>
                            <p className="text-xs text-muted-foreground">Views</p>
                          </div>
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <p className="text-lg font-bold text-foreground">{listing.requests || 0}</p>
                            <p className="text-xs text-muted-foreground">Requests</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-primary">{listing.price} TND/month</span>
                          {/* Assuming rating will come from analytics or a separate profile endpoint */}
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">4.5</span>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground mb-3">Posted {new Date(listing.created_at).toLocaleDateString()}</p>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handleEditListing(listing)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 bg-transparent" onClick={() => handleListingDelete(listing.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === "requests" && (
              <div key="requests" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Student Requests</h1>
                  <Badge variant="secondary">{requests.length} total requests</Badge>
                </div>

                <div className="space-y-4">
                  {loading && <p>Loading requests...</p>}
                  {!loading && requests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={request.student_avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {request.student_first_name?.[0]}{request.student_last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground">{request.student_first_name} {request.student_last_name}</h3>
                                {/* <p className="text-sm text-muted-foreground">
                                  {request.field} at {request.university}
                                </p> */}
                                {/* <p className="text-xs text-muted-foreground">Budget: {request.budget} TND/month</p> */}
                              </div>
                              <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                                {getStatusIcon(request.status)}
                                {request.status}
                              </Badge>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm font-medium text-foreground mb-1">For: {request.listing_title}</p>
                              <p className="text-xs text-muted-foreground">Sent {new Date(request.created_at).toLocaleDateString()}</p>
                            </div>

                            <div className="bg-muted/30 rounded-lg p-4 mb-4">
                              <p className="text-sm text-muted-foreground italic">
                                "{request.message.substring(0, 150)}..."
                              </p>
                            </div>

                            <div className="flex gap-2">
                              {request.status === "pending" && (
                                <>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAcceptRequest(request.id)}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Accept
                                  </Button>
                                  <Button size="sm" className="text-red-600 bg-transparent" onClick={() => handleDeclineRequest(request.id)}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Decline
                                  </Button>
                                </>
                              )}
                              <Button variant="outline" size="sm" onClick={() => handleMessageStudent(request.student_id, request.listing_id)}>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message
                              </Button>
                              <Link href={`/student/${request.student_id}`}>
                              <Button variant="outline" size="sm">
                                View Profile
                              </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Tab (updated) */}
            {activeTab === "messages" && (
              <div key="messages" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">My Messages</h1>
                  <Badge variant="secondary">{messages.length} total messages</Badge>
                </div>

                {/* Message Composer / Reply Section */}
                {messageRecipientId && ( // Show composer if a recipient is selected
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>New Message / Reply</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="messageContent">Message to {messages.find(m => m.sender_id === messageRecipientId || m.receiver_id === messageRecipientId)?.sender_first_name || "User"}:</Label>
                        <Textarea
                          id="messageContent"
                          placeholder="Type your message here..."
                          rows={4}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowSendMessageModal(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSendMessage} disabled={loading || !contactMessage.trim()}>
                          {loading ? "Sending..." : "Send Message"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {loading && <p>Loading messages...</p>}
                  {!loading && messages.length === 0 && <p className="text-muted-foreground">No messages found.</p>}
                  {!loading && messages.map((message) => (
                    <Card key={message.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={message.sender_avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {message.sender_first_name?.[0]}{message.sender_last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-foreground">{message.sender_first_name} {message.sender_last_name}</h3>
                              <span className="text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString()}</span>
                            </div>
                            {message.listing_title && (
                              <p className="text-sm text-muted-foreground mb-2">Regarding: <Link href={`/listings/${message.listing_id}`} className="text-primary hover:underline">{message.listing_title} ({message.listing_city})</Link></p>
                            )}
                            <p className="text-sm text-foreground mb-4">{message.content}</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleOpenMessageModal(message.sender_id, message.listing_id)}>
                                Reply
                              </Button>
                              {!message.is_read && (
                                <Button size="sm" variant="secondary">
                                  Mark as Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div key="analytics" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <h1 className="text-3xl font-bold text-foreground">Analytics & Performance</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Listing Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {listings.map((listing) => (
                          <div key={listing.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                            <div>
                              <p className="font-medium text-foreground text-sm">{listing.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {listing.views || 0} views • {listing.requests || 0} requests
                              </p>
                            </div>
                            <Badge className={getStatusColor(listing.status)}>{listing.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Views</span>
                          <span className="font-medium">{analytics?.totalViews || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Requests</span>
                          <span className="font-medium">{analytics?.totalRequests || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Response Rate</span>
                          <span className="font-medium">{analytics?.responseRate || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Average Rating</span>
                          <span className="font-medium">{analytics?.averageRating || 0}/5</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Profile Settings Tab */}
            {activeTab === "profile" && (
              <div key="profile" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 mb-6">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={advertiserProfile?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {advertiserProfile?.first_name?.[0]}{advertiserProfile?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{advertiserProfile?.first_name} {advertiserProfile?.last_name}</h3>
                          <p className="text-sm text-muted-foreground">Member since {new Date(advertiserProfile?.created_at || "").toLocaleDateString()}</p>
                          {advertiserProfile?.status === 'active' && (
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
                          <Input id="name" value={`${advertiserProfile?.first_name || ""} ${advertiserProfile?.last_name || ""}`} readOnly />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" value={advertiserProfile?.email || ""} readOnly />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" value={advertiserProfile?.phone || ""} />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" value={advertiserProfile?.location || ""} />
                        </div>
                        <div>
                          <Label htmlFor="accountType">Account Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder={advertiserProfile?.user_type || ""} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student-owner">Student (Room Owner)</SelectItem>
                              <SelectItem value="property-owner">Property Owner</SelectItem>
                              <SelectItem value="agency">Real Estate Agency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" placeholder="Tell potential roommates about yourself..." rows={4} />
                      </div>

                      <div className="space-y-3">
                        <Label>Notification Preferences</Label>
                        <div className="space-y-2">
                          {[
                            "Email notifications for new requests",
                            "SMS notifications for urgent messages",
                            "Weekly performance reports",
                            "Marketing emails",
                          ].map((pref, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`pref-${index}`}
                                defaultChecked={index < 2}
                                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                              />
                              <Label htmlFor={`pref-${index}`} className="text-sm">
                                {pref}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full bg-primary hover:bg-primary/90">Save Changes</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Listing Modal */}
      {showAddListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out opacity-0 animate-fade-in-modal">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 transition-all duration-300 ease-out animate-scale-in-modal">
            <CardHeader>
              <CardTitle>Add New Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddListing}>
              <div>
                <Label htmlFor="title">Listing Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Modern Apartment in Tunis Center"
                    value={newListingForm.title}
                    onChange={(e) => setNewListingForm({ ...newListingForm, title: e.target.value })}
                    required
                  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Monthly Rent (TND)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="350"
                      value={newListingForm.price}
                      onChange={(e) => setNewListingForm({ ...newListingForm, price: e.target.value })}
                      required
                    />
                </div>
                <div>
                  <Label htmlFor="roommates">Number of Roommates</Label>
                    <Select
                      value={newListingForm.number_of_roommates}
                      onValueChange={(value) =>
                        setNewListingForm({ ...newListingForm, number_of_roommates: value })
                      }
                      required
                    >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                  <Select
                    value={newListingForm.city}
                    onValueChange={(value) => setNewListingForm({ ...newListingForm, city: value })}
                    required
                  >
                    <SelectTrigger>
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

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your room/apartment, amenities, rules, etc."
                  rows={4}
                    value={newListingForm.description}
                    onChange={(e) => setNewListingForm({ ...newListingForm, description: e.target.value })}
                    required
                />
              </div>

              <div>
                <Label>Photos</Label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => document.getElementById("imageUpload")?.click()}
                >
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Image Preview" className="max-h-40 mx-auto mb-2 object-contain" />
                  ) : (
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {imagePreview ? "Click to change photo" : "Click to upload photos or drag and drop"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddListing(false)} type="button">
                  Cancel
                </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? "Creating..." : "Create Listing"}
                  </Button>
              </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Listing Modal */}
      {showEditListing && editingListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out opacity-0 animate-fade-in-modal">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 transition-all duration-300 ease-out animate-scale-in-modal">
            <CardHeader>
              <CardTitle>Edit Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleListingUpdate}>
                <div>
                  <Label htmlFor="editTitle">Listing Title</Label>
                  <Input
                    id="editTitle"
                    placeholder="e.g., Modern Apartment in Tunis Center"
                    defaultValue={editingListing.title}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editPrice">Monthly Rent (TND)</Label>
                    <Input
                      id="editPrice"
                      type="number"
                      placeholder="350"
                      defaultValue={editingListing.price}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editRoommates">Number of Roommates</Label>
                    <Select
                      defaultValue={String(editingListing.number_of_roommates)}
                      onValueChange={(value) => {
                        if (editingListing) {
                          setEditingListing({ ...editingListing, number_of_roommates: parseInt(value) });
                        }
                      }}
                    >
                      <SelectTrigger id="editRoommates">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="editLocation">Location</Label>
                  <Select
                    defaultValue={editingListing.city}
                    onValueChange={(value) => {
                      if (editingListing) {
                        setEditingListing({ ...editingListing, city: value });
                      }
                    }}
                  >
                    <SelectTrigger id="editLocation">
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

                <div>
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    placeholder="Describe your room/apartment, amenities, rules, etc."
                    rows={4}
                    defaultValue={editingListing.description}
                  />
                </div>

                <div>
                  <Label>Photos</Label>
                  {/* Display existing images and allow new uploads */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {editingListing.images && getListingImagesArray(editingListing.images).map((image: string, index: number) => (
                      <img key={index} src={image} alt="Listing Image" className="w-24 h-24 object-cover rounded" />
                    ))}
                  </div>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload new photos or drag and drop</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowEditListing(false)} type="button">
                  Cancel
                </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
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
