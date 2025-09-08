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
} from "lucide-react"
import Link from "next/link"
// Removed: import Header from "../../header/page"

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [editingProfile, setEditingProfile] = useState(false)

  // Mock user data
  const user = {
    name: "Ahmed Ben Ali",
    email: "ahmed.benali@university.tn",
    avatar: "/student-woman.png",
    university: "University of Tunis",
    field: "Computer Science",
    budget: 350,
    gender: "Male",
    age: 22,
    bio: "Computer Science student looking for a quiet, study-friendly environment. I enjoy reading, coding, and occasional social activities.",
    preferences: {
      location: "Tunis",
      maxRoommates: 3,
      furnished: true,
      wifi: true,
      parking: false,
    },
    joinedDate: "September 2024",
    verified: true,
  }

  const savedListings = [
    {
      id: 1,
      title: "Modern Apartment in Tunis Center",
      location: "Tunis, Bab Bhar",
      price: 350,
      image: "/modern-student-apartment-tunis.jpg",
      rating: 4.8,
      savedDate: "2 days ago",
      status: "available",
    },
    {
      id: 2,
      title: "Cozy Room Near University",
      location: "Sfax, University District",
      price: 280,
      image: "/cozy-student-room-sfax.jpg",
      rating: 4.9,
      savedDate: "1 week ago",
      status: "available",
    },
    {
      id: 3,
      title: "Beach-Side Shared Space",
      location: "Sousse, Kantaoui",
      price: 420,
      image: "/shared-apartment-sousse-beach.jpg",
      rating: 4.7,
      savedDate: "3 days ago",
      status: "pending",
    },
  ]

  const sentRequests = [
    {
      id: 1,
      listingTitle: "Modern Apartment in Tunis Center",
      owner: "Amira Ben Salem",
      sentDate: "3 days ago",
      status: "pending",
      message: "Hi! I'm very interested in your room listing. I'm a quiet Computer Science student...",
    },
    {
      id: 2,
      listingTitle: "Student House in Monastir",
      owner: "Mohamed Trabelsi",
      sentDate: "1 week ago",
      status: "accepted",
      message: "Hello! I would love to join your student house. I'm responsible and clean...",
    },
    {
      id: 3,
      listingTitle: "Central Sfax Apartment",
      owner: "Youssef Hamdi",
      sentDate: "2 weeks ago",
      status: "declined",
      message: "Hi there! I'm looking for accommodation near the university...",
    },
  ]

  const recentActivity = [
    { type: "saved", item: "Modern Apartment in Tunis Center", time: "2 hours ago" },
    { type: "request", item: "Sent request to Amira Ben Salem", time: "3 days ago" },
    { type: "profile", item: "Updated profile preferences", time: "1 week ago" },
    { type: "search", item: "Searched for rooms in Tunis", time: "1 week ago" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "declined":
        return "bg-red-100 text-red-800"
      case "available":
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
      case "declined":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Removed Header component */}
      {/*
      <Header
        title="RoomMate TN Student"
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
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {user.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{user.name}</h2>
                    <p className="text-sm text-muted-foreground">{user.field}</p>
                    <p className="text-xs text-muted-foreground">{user.university}</p>
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
              <div className="space-y-6">
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
                  <Card>
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

                  <Card>
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

                  <Card>
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
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            {activity.type === "saved" && <Heart className="w-4 h-4 text-primary" />}
                            {activity.type === "request" && <MessageCircle className="w-4 h-4 text-primary" />}
                            {activity.type === "profile" && <Settings className="w-4 h-4 text-primary" />}
                            {activity.type === "search" && <Search className="w-4 h-4 text-primary" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{activity.item}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
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
              <div className="space-y-6">
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
                  {savedListings.map((listing) => (
                    <Card key={listing.id} className="group hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={listing.image || "/placeholder.svg"}
                          alt={listing.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </Button>
                        <Badge className={`absolute top-3 left-3 ${getStatusColor(listing.status)}`}>
                          {listing.status}
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2">{listing.title}</h3>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{listing.location}</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-primary">{listing.price} TND/month</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{listing.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Saved {listing.savedDate}</p>
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
                            <Link href={`/listings/${listing.id}`}>View Details</Link>
                          </Button>
                          <Button variant="outline" size="icon">
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
                  <h1 className="text-3xl font-bold text-foreground">My Requests</h1>
                  <Badge variant="secondary">{sentRequests.length} total requests</Badge>
                </div>

                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">{request.listingTitle}</h3>
                            <p className="text-sm text-muted-foreground">To: {request.owner}</p>
                            <p className="text-xs text-muted-foreground">Sent {request.sentDate}</p>
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
                          <Button variant="outline" size="sm">
                            View Listing
                          </Button>
                          {request.status === "pending" && (
                            <Button variant="outline" size="sm">
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Request
                            </Button>
                          )}
                          {request.status === "accepted" && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Contact Owner
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Settings Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
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
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {editingProfile && (
                            <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 w-8 h-8">
                              <Camera className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">Member since {user.joinedDate}</p>
                          {user.verified && (
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
                            value={user.name}
                            disabled={!editingProfile}
                            className={editingProfile ? "" : "bg-muted"}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={user.email}
                            disabled={!editingProfile}
                            className={editingProfile ? "" : "bg-muted"}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="age">Age</Label>
                            <Input
                              id="age"
                              value={user.age}
                              disabled={!editingProfile}
                              className={editingProfile ? "" : "bg-muted"}
                            />
                          </div>
                          <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select disabled={!editingProfile}>
                              <SelectTrigger className={editingProfile ? "" : "bg-muted"}>
                                <SelectValue placeholder={user.gender} />
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
                          <Select disabled={!editingProfile}>
                            <SelectTrigger className={editingProfile ? "" : "bg-muted"}>
                              <SelectValue placeholder={user.university} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="university-tunis">University of Tunis</SelectItem>
                                <SelectItem value="university-sfax">University of Sfax</SelectItem>
                                <SelectItem value="university-sousse">University of Sousse</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="field">Field of Study</Label>
                          <Input
                            id="field"
                            value={user.field}
                            disabled={!editingProfile}
                            className={editingProfile ? "" : "bg-muted"}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">About Me</Label>
                          <Textarea
                            id="bio"
                            value={user.bio}
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
                          value={user.budget}
                          disabled={!editingProfile}
                          className={editingProfile ? "" : "bg-muted"}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Preferred Location</Label>
                        <Select disabled={!editingProfile}>
                          <SelectTrigger className={editingProfile ? "" : "bg-muted"}>
                            <SelectValue placeholder={user.preferences.location} />
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
                        <Select disabled={!editingProfile}>
                          <SelectTrigger className={editingProfile ? "" : "bg-muted"}>
                            <SelectValue placeholder={user.preferences.maxRoommates.toString()} />
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
                            { key: "furnished", label: "Furnished" },
                            { key: "wifi", label: "WiFi" },
                            { key: "parking", label: "Parking" },
                          ].map((amenity) => (
                            <div key={amenity.key} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={amenity.key}
                                checked={user.preferences[amenity.key as keyof typeof user.preferences] as boolean}
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
    </div>
  )
}
