"use client"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"

export default function AdvertiserDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddListing, setShowAddListing] = useState(false)

  // Mock advertiser data
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

  const analytics = {
    totalViews: 268,
    totalRequests: 15,
    activeListings: 2,
    averageRating: 4.7,
    monthlyEarnings: 640,
    responseRate: 95,
  }

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
                      <span className="text-sm font-medium">{advertiser.rating}</span>
                      <span className="text-xs text-muted-foreground">({advertiser.totalReviews})</span>
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
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowAddListing(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Listing
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Listings</p>
                          <p className="text-2xl font-bold text-foreground">{analytics.activeListings}</p>
                        </div>
                        <Home className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Views</p>
                          <p className="text-2xl font-bold text-foreground">{analytics.totalViews}</p>
                        </div>
                        <Eye className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
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

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Average Rating</p>
                          <p className="text-2xl font-bold text-foreground">{analytics.averageRating}</p>
                        </div>
                        <Star className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                          <p className="text-2xl font-bold text-foreground">{analytics.monthlyEarnings} TND</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Response Rate</p>
                          <p className="text-2xl font-bold text-foreground">{analytics.responseRate}%</p>
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
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-foreground">New request from Ahmed Ben Ali</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Eye className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-foreground">Your listing got 12 new views</p>
                          <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm text-foreground">Listing approved and published</p>
                          <p className="text-xs text-muted-foreground">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Listings Tab */}
            {activeTab === "listings" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowAddListing(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Listing
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {listings.map((listing) => (
                    <Card key={listing.id} className="group hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={listing.image || "/placeholder.svg"}
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
                          <span className="text-sm">{listing.location}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <p className="text-lg font-bold text-foreground">{listing.views}</p>
                            <p className="text-xs text-muted-foreground">Views</p>
                          </div>
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <p className="text-lg font-bold text-foreground">{listing.requests}</p>
                            <p className="text-xs text-muted-foreground">Requests</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-primary">{listing.price} TND/month</span>
                          {listing.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{listing.rating}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mb-3">Posted {listing.posted}</p>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
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
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Student Requests</h1>
                  <Badge variant="secondary">{requests.length} total requests</Badge>
                </div>

                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={request.studentAvatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {request.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground">{request.studentName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {request.field} at {request.university}
                                </p>
                                <p className="text-xs text-muted-foreground">Budget: {request.budget} TND/month</p>
                              </div>
                              <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                                {getStatusIcon(request.status)}
                                {request.status}
                              </Badge>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm font-medium text-foreground mb-1">For: {request.listingTitle}</p>
                              <p className="text-xs text-muted-foreground">Sent {request.sentDate}</p>
                            </div>

                            <div className="bg-muted/30 rounded-lg p-4 mb-4">
                              <p className="text-sm text-muted-foreground italic">
                                "{request.message.substring(0, 150)}..."
                              </p>
                            </div>

                            <div className="flex gap-2">
                              {request.status === "pending" && (
                                <>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Accept
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Decline
                                  </Button>
                                </>
                              )}
                              <Button variant="outline" size="sm">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message
                              </Button>
                              <Button variant="outline" size="sm">
                                View Profile
                              </Button>
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
              <div className="space-y-6">
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
                                {listing.views} views • {listing.requests} requests
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
                          <span className="font-medium">{analytics.totalViews}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Requests</span>
                          <span className="font-medium">{analytics.totalRequests}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Response Rate</span>
                          <span className="font-medium">{analytics.responseRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Average Rating</span>
                          <span className="font-medium">{analytics.averageRating}/5</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Profile Settings Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 mb-6">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={advertiser.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {advertiser.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{advertiser.name}</h3>
                          <p className="text-sm text-muted-foreground">Member since {advertiser.joinedDate}</p>
                          {advertiser.verified && (
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
                          <Input id="name" value={advertiser.name} />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" value={advertiser.email} />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" value={advertiser.phone} />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" value={advertiser.location} />
                        </div>
                        <div>
                          <Label htmlFor="accountType">Account Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder={advertiser.accountType} />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Listing Title</Label>
                <Input id="title" placeholder="e.g., Modern Apartment in Tunis Center" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Monthly Rent (TND)</Label>
                  <Input id="price" type="number" placeholder="350" />
                </div>
                <div>
                  <Label htmlFor="roommates">Number of Roommates</Label>
                  <Select>
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
                <Input id="location" placeholder="e.g., Tunis, Bab Bhar" />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your room/apartment, amenities, rules, etc."
                  rows={4}
                />
              </div>

              <div>
                <Label>Photos</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload photos or drag and drop</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddListing(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90">Create Listing</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
