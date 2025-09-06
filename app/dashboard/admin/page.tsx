"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Home,
  Shield,
  BarChart3,
  Settings,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Star,
  Trash2,
  Flag,
  UserCheck,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d")

  // Mock admin data
  const admin = {
    name: "Admin User",
    email: "admin@roommateTN.com",
    avatar: "/placeholder.svg?key=admin",
    role: "Super Admin",
  }

  // Mock platform statistics
  const stats = {
    totalUsers: 1247,
    activeListings: 89,
    pendingListings: 12,
    totalRevenue: 15420,
    newUsersThisMonth: 156,
    averageRating: 4.6,
    responseRate: 94,
    flaggedContent: 3,
  }

  // Mock users data
  const users = [
    {
      id: 1,
      name: "Ahmed Ben Ali",
      email: "ahmed.benali@university.tn",
      avatar: "/student-woman.png",
      type: "Student",
      status: "active",
      joinDate: "2024-01-15",
      listings: 0,
      reports: 0,
      verified: true,
    },
    {
      id: 2,
      name: "Amira Ben Salem",
      email: "amira.bensalem@email.com",
      avatar: "/tunisian-woman-profile.jpg",
      type: "Advertiser",
      status: "active",
      joinDate: "2024-02-20",
      listings: 3,
      reports: 0,
      verified: true,
    },
    {
      id: 3,
      name: "Mohamed Trabelsi",
      email: "mohamed.trabelsi@email.com",
      avatar: "/placeholder.svg?key=mohamed2",
      type: "Student",
      status: "suspended",
      joinDate: "2024-03-10",
      listings: 0,
      reports: 2,
      verified: false,
    },
  ]

  // Mock pending listings
  const pendingListings = [
    {
      id: 1,
      title: "Modern Apartment in Tunis Center",
      owner: "Amira Ben Salem",
      location: "Tunis, Bab Bhar",
      price: 350,
      image: "/modern-student-apartment-tunis.jpg",
      submittedDate: "2 days ago",
      status: "pending",
      flagged: false,
    },
    {
      id: 2,
      title: "Student Room Near Campus",
      owner: "Sarah Mejri",
      location: "Sfax, University District",
      price: 280,
      image: "/placeholder.svg?key=pending1",
      submittedDate: "1 day ago",
      status: "pending",
      flagged: true,
    },
  ]

  // Mock reports
  const reports = [
    {
      id: 1,
      type: "inappropriate_content",
      reportedItem: "Listing: Beach House in Sousse",
      reportedBy: "Ahmed Ben Ali",
      reason: "Misleading photos and description",
      date: "1 day ago",
      status: "pending",
      severity: "medium",
    },
    {
      id: 2,
      type: "user_behavior",
      reportedItem: "User: Mohamed Trabelsi",
      reportedBy: "Fatma Khelifi",
      reason: "Inappropriate messages and harassment",
      date: "3 days ago",
      status: "resolved",
      severity: "high",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">RoomMate TN Admin</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Super Admin</Badge>
              <Avatar className="w-8 h-8">
                <AvatarImage src={admin.avatar || "/placeholder.svg"} />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={admin.avatar || "/placeholder.svg"} />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-foreground">{admin.name}</h2>
                    <p className="text-sm text-muted-foreground">{admin.role}</p>
                    <p className="text-xs text-muted-foreground">{admin.email}</p>
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
                    variant={activeTab === "users" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("users")}
                  >
                    <Users className="w-4 h-4 mr-3" />
                    User Management
                  </Button>
                  <Button
                    variant={activeTab === "listings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("listings")}
                  >
                    <Home className="w-4 h-4 mr-3" />
                    Listing Moderation
                  </Button>
                  <Button
                    variant={activeTab === "reports" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("reports")}
                  >
                    <Flag className="w-4 h-4 mr-3" />
                    Reports & Flags
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
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    System Settings
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
                  <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Users</p>
                          <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                          <p className="text-xs text-green-600">+{stats.newUsersThisMonth} this month</p>
                        </div>
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Listings</p>
                          <p className="text-2xl font-bold text-foreground">{stats.activeListings}</p>
                          <p className="text-xs text-yellow-600">{stats.pendingListings} pending</p>
                        </div>
                        <Home className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Platform Rating</p>
                          <p className="text-2xl font-bold text-foreground">{stats.averageRating}</p>
                          <p className="text-xs text-green-600">{stats.responseRate}% response rate</p>
                        </div>
                        <Star className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Flagged Content</p>
                          <p className="text-2xl font-bold text-foreground">{stats.flaggedContent}</p>
                          <p className="text-xs text-red-600">Requires attention</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent User Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <UserCheck className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-sm text-foreground">New user registered: Ahmed Ben Ali</p>
                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <Home className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-foreground">New listing submitted for review</p>
                            <p className="text-xs text-muted-foreground">4 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <Flag className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="text-sm text-foreground">Content reported by user</p>
                            <p className="text-xs text-muted-foreground">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div>
                            <p className="text-sm font-medium text-foreground">Listings awaiting approval</p>
                            <p className="text-xs text-muted-foreground">{stats.pendingListings} items</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <div>
                            <p className="text-sm font-medium text-foreground">Flagged content</p>
                            <p className="text-xs text-muted-foreground">{stats.flaggedContent} reports</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div>
                            <p className="text-sm font-medium text-foreground">User verifications</p>
                            <p className="text-xs text-muted-foreground">8 pending</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Search users..." className="pl-10 w-64" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{user.name}</h3>
                                {user.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <Badge variant="secondary">{user.type}</Badge>
                                <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                                <span className="text-xs text-muted-foreground">Joined {user.joinDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <p className="text-muted-foreground">
                                {user.listings} listings • {user.reports} reports
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              {user.status === "active" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 bg-transparent"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 bg-transparent"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                                <Trash2 className="w-4 h-4" />
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

            {/* Listings Tab */}
            {activeTab === "listings" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Listing Moderation</h1>
                  <Badge variant="secondary">{pendingListings.length} pending approval</Badge>
                </div>

                <div className="space-y-4">
                  {pendingListings.map((listing) => (
                    <Card key={listing.id} className={listing.flagged ? "border-red-200" : ""}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <img
                            src={listing.image || "/placeholder.svg"}
                            alt={listing.title}
                            className="w-32 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground">{listing.title}</h3>
                                <p className="text-sm text-muted-foreground">by {listing.owner}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">{listing.location}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">{listing.price} TND/month</p>
                                <p className="text-xs text-muted-foreground">Submitted {listing.submittedDate}</p>
                                {listing.flagged && (
                                  <Badge className="bg-red-100 text-red-800 mt-1">
                                    <Flag className="w-3 h-3 mr-1" />
                                    Flagged
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 bg-transparent"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contact Owner
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

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Reports & Flags</h1>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reports</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{report.reportedItem}</h3>
                            <p className="text-sm text-muted-foreground">Reported by {report.reportedBy}</p>
                            <p className="text-xs text-muted-foreground">{report.date}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getSeverityColor(report.severity)}>{report.severity}</Badge>
                            <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                          </div>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4 mb-4">
                          <p className="text-sm text-muted-foreground">
                            <strong>Reason:</strong> {report.reason}
                          </p>
                        </div>

                        {report.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Investigate
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 bg-transparent">
                              <Ban className="w-4 h-4 mr-2" />
                              Take Action
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">Platform Analytics</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Users</span>
                          <span className="font-medium">{stats.totalUsers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">New This Month</span>
                          <span className="font-medium text-green-600">+{stats.newUsersThisMonth}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Students</span>
                          <span className="font-medium">892</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Advertisers</span>
                          <span className="font-medium">355</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Listing Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Active Listings</span>
                          <span className="font-medium">{stats.activeListings}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Pending Approval</span>
                          <span className="font-medium text-yellow-600">{stats.pendingListings}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Average Price</span>
                          <span className="font-medium">325 TND</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Most Popular City</span>
                          <span className="font-medium">Tunis</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Average Rating</span>
                          <span className="font-medium">{stats.averageRating}/5</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Response Rate</span>
                          <span className="font-medium">{stats.responseRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Active Reports</span>
                          <span className="font-medium text-red-600">{stats.flaggedContent}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">User Satisfaction</span>
                          <span className="font-medium text-green-600">92%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Cities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { city: "Tunis", listings: 45, percentage: 51 },
                          { city: "Sfax", listings: 23, percentage: 26 },
                          { city: "Sousse", listings: 12, percentage: 13 },
                          { city: "Monastir", listings: 9, percentage: 10 },
                        ].map((city, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-foreground">{city.city}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{city.listings}</span>
                              <div className="w-16 h-2 bg-muted rounded-full">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${city.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">System Settings</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input id="siteName" value="RoomMate TN" />
                      </div>
                      <div>
                        <Label htmlFor="adminEmail">Admin Email</Label>
                        <Input id="adminEmail" value="admin@roommateTN.com" />
                      </div>
                      <div>
                        <Label htmlFor="maxListings">Max Listings per User</Label>
                        <Input id="maxListings" type="number" value="5" />
                      </div>
                      <div>
                        <Label htmlFor="autoApproval">Auto-approve listings</Label>
                        <Select defaultValue="manual">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Automatic</SelectItem>
                            <SelectItem value="manual">Manual Review</SelectItem>
                            <SelectItem value="verified">Verified Users Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Moderation Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label>Content Moderation</Label>
                        <div className="space-y-2">
                          {[
                            "Auto-flag inappropriate content",
                            "Require photo verification",
                            "Enable user reporting",
                            "Send moderation alerts",
                          ].map((setting, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`mod-${index}`}
                                defaultChecked={index < 3}
                                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                              />
                              <Label htmlFor={`mod-${index}`} className="text-sm">
                                {setting}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="reportThreshold">Auto-suspend threshold</Label>
                        <Select defaultValue="3">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 report</SelectItem>
                            <SelectItem value="3">3 reports</SelectItem>
                            <SelectItem value="5">5 reports</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Email Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {[
                          "New user registrations",
                          "New listing submissions",
                          "User reports and flags",
                          "System errors and alerts",
                          "Weekly analytics reports",
                        ].map((notification, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`notif-${index}`}
                              defaultChecked={index < 4}
                              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                            />
                            <Label htmlFor={`notif-${index}`} className="text-sm">
                              {notification}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Backup & Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Database Backup</Label>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            Create Backup
                          </Button>
                          <Button variant="outline" size="sm">
                            Schedule Backup
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>System Maintenance</Label>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            Clear Cache
                          </Button>
                          <Button variant="outline" size="sm">
                            Update System
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Export Data</Label>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            Export Users
                          </Button>
                          <Button variant="outline" size="sm">
                            Export Listings
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="pt-6">
                  <Button className="bg-primary hover:bg-primary/90">Save All Settings</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
