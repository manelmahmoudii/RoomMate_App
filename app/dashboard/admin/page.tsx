"use client"

import { useState, useEffect, useCallback } from "react"
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
// Removed: import Header from "../../header/page"

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  avatar_url: string;
  created_at: string;
  status: 'active' | 'suspended'; // Add status to User interface
}

interface Listing {
  id: string;
  title: string;
  owner_id: string;
  first_name: string;
  last_name: string;
  city: string;
  price: number;
  images: string;
  status: string;
  created_at: string;
}

interface Report {
  id: string;
  listing_id: string;
  student_id: string;
  message: string;
  status: 'pending' | 'resolved' | 'rejected'; // Add status to Report interface
  created_at: string;
  student_first_name: string;
  student_last_name: string;
  listing_title: string;
}

interface Stats {
  totalUsers: number;
  activeListings: number;
  pendingListings: number;
  newUsersThisMonth: number;
  averageRating: number;
  flaggedContent: number;
  responseRate?: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d")
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [selectedListingStatusFilter, setSelectedListingStatusFilter] = useState("all");
  const [selectedReportStatusFilter, setSelectedReportStatusFilter] = useState("all");
  const [adminProfile, setAdminProfile] = useState<User | null>(null);

  // Mock admin data - this part can remain mostly static unless you want to fetch admin profile.
  const admin = {
    name: "Admin User",
    email: "admin@roommateTN.com",
    avatar: "/placeholder.svg?key=admin",
    role: "Super Admin",
  }

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (typeFilter = userTypeFilter, statusFilter = userStatusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter); // Not yet implemented in API

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [userTypeFilter, userStatusFilter]);

  const fetchListings = useCallback(async (statusFilter = selectedListingStatusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/admin/listings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedListingStatusFilter]);

  const fetchReports = useCallback(async (statusFilter = selectedReportStatusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/admin/reports?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedReportStatusFilter]);

  const fetchAdminProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setAdminProfile(data.user);
      } else {
        console.error("Failed to fetch admin profile:", response.status);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchListings();
    fetchReports();
    fetchAdminProfile();
  }, [selectedTimeRange, userTypeFilter, userStatusFilter, selectedListingStatusFilter, selectedReportStatusFilter, fetchStats, fetchUsers, fetchListings, fetchReports, fetchAdminProfile]); // Refetch when filters change

  // Mock platform statistics
  // const stats = {
  //   totalUsers: 1247,
  //   activeListings: 89,
  //   pendingListings: 12,
  //   totalRevenue: 15420,
  //   newUsersThisMonth: 156,
  //   averageRating: 4.6,
  //   responseRate: 94,
  //   flaggedContent: 3,
  // }

  // Mock users data
  // const users = [
  //   {
  //     id: 1,
  //     name: "Ahmed Ben Ali",
  //     email: "ahmed.benali@university.tn",
  //     avatar: "/student-woman.png",
  //     type: "Student",
  //     status: "active",
  //     joinDate: "2024-01-15",
  //     listings: 0,
  //     reports: 0,
  //     verified: true,
  //   },
  //   {
  //     id: 2,
  //     name: "Amira Ben Salem",
  //     email: "amira.bensalem@email.com",
  //     avatar: "/tunisian-woman-profile.jpg",
  //     type: "Advertiser",
  //     status: "active",
  //     joinDate: "2024-02-20",
  //     listings: 3,
  //     reports: 0,
  //     verified: true,
  //   },
  //   {
  //     id: 3,
  //     name: "Mohamed Trabelsi",
  //     email: "mohamed.trabelsi@email.com",
  //     avatar: "/placeholder.svg?key=mohamed2",
  //     type: "Student",
  //     status: "suspended",
  //     joinDate: "2024-03-10",
  //     listings: 0,
  //     reports: 2,
  //     verified: false,
  //   },
  // ]

  // Mock pending listings
  // const pendingListings = [
  //   {
  //     id: 1,
  //     title: "Modern Apartment in Tunis Center",
  //     owner: "Amira Ben Salem",
  //     location: "Tunis, Bab Bhar",
  //     price: 350,
  //     image: "/modern-student-apartment-tunis.jpg",
  //     submittedDate: "2 days ago",
  //     status: "pending",
  //     flagged: false,
  //   },
  //   {
  //     id: 2,
  //     title: "Student Room Near Campus",
  //     owner: "Sarah Mejri",
  //     location: "Sfax, University District",
  //     price: 280,
  //     image: "/placeholder.svg?key=pending1",
  //     submittedDate: "1 day ago",
  //     status: "pending",
  //     flagged: true,
  //   },
  // ]

  // Mock reports
  // const reports = [
  //   {
  //     id: 1,
  //     type: "inappropriate_content",
  //     reportedItem: "Listing: Beach House in Sousse",
  //     reportedBy: "Ahmed Ben Ali",
  //     reason: "Misleading photos and description",
  //     date: "1 day ago",
  //     status: "pending",
  //     severity: "medium",
  //   },
  //   {
  //     id: 2,
  //     type: "user_behavior",
  //     reportedItem: "User: Mohamed Trabelsi",
  //     reportedBy: "Fatma Khelifi",
  //     reason: "Inappropriate messages and harassment",
  //     date: "3 days ago",
  //     status: "resolved",
  //     severity: "high",
  //   },
  // ]

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
      case "rejected": // For listings
        return "bg-red-100 text-red-800"
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

  const getListingImageUrl = (imagesString: string) => {
    // If it's already a direct URL, return it.
    if (typeof imagesString === 'string' && imagesString.startsWith('/')) {
      return imagesString;
    }

    try {
      // Attempt to parse as JSON array
      const images = JSON.parse(imagesString);
      if (Array.isArray(images) && images.length > 0) {
        return images[0];
      }
    } catch (error) {
      console.error("Error parsing images JSON or invalid image string for listing:", imagesString, error);
    }
    return "/placeholder.svg"; // Fallback image
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    if (action === 'delete') {
      if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    }
    try {
      const method = action === 'delete' ? 'DELETE' : 'PUT';
      const body = action === 'delete' ? null : JSON.stringify({ action });
      const headers = { 'Content-Type': 'application/json' };

      const response = await fetch(`/api/admin/users/${userId}`, {
        method,
        headers: method === 'PUT' ? headers : undefined,
        body,
      });

      if (response.ok) {
        alert(`User ${action}d successfully.`);
        fetchUsers(); // Refresh the user list
      } else {
        const errorData = await response.json();
        alert(`Failed to ${action} user: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`An error occurred while ${action}ing the user.`);
    }
  };

  const handleListingAction = async (listingId: string, action: 'approve' | 'reject' | 'delete') => {
    if (action === 'delete') {
      if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
    }
    try {
      const method = action === 'delete' ? 'DELETE' : 'PUT';
      const body = action === 'delete' ? null : JSON.stringify({ action });
      const headers = { 'Content-Type': 'application/json' };

      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method,
        headers: method === 'PUT' ? headers : undefined,
        body,
      });

      if (response.ok) {
        alert(`Listing ${action}d successfully.`);
        fetchListings(); // Refresh the listing list
        fetchStats(); // Update stats as well
      } else {
        const errorData = await response.json();
        alert(`Failed to ${action} listing: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing listing:`, error);
      alert(`An error occurred while ${action}ing the listing.`);
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolve' | 'take_action' | 'delete') => {
    if (action === 'delete') {
      if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) return;
    }
    try {
      const method = action === 'delete' ? 'DELETE' : 'PUT';
      const body = action === 'delete' ? null : JSON.stringify({ action });
      const headers = { 'Content-Type': 'application/json' };

      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method,
        headers: method === 'PUT' ? headers : undefined,
        body,
      });

      if (response.ok) {
        alert(`Report ${action}d successfully.`);
        fetchReports(); // Refresh the reports list
        fetchStats(); // Update stats as well
      } else {
        const errorData = await response.json();
        alert(`Failed to ${action} report: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      alert(`An error occurred while ${action}ing the report.`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Removed Header component */}
      {/*
      <Header
        title="RoomMate TN Admin"
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
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={adminProfile?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-foreground">{adminProfile?.first_name} {adminProfile?.last_name}</h2>
                    <p className="text-sm text-muted-foreground">{adminProfile?.user_type}</p>
                    <p className="text-xs text-muted-foreground">{adminProfile?.email}</p>
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
              <div key="overview" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
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
                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Users</p>
                          <p className="text-2xl font-bold text-foreground">{stats?.totalUsers}</p>
                          <p className="text-xs text-green-600">+{stats?.newUsersThisMonth} this month</p>
                        </div>
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Listings</p>
                          <p className="text-2xl font-bold text-foreground">{stats?.activeListings}</p>
                          <p className="text-xs text-yellow-600">{stats?.pendingListings} pending</p>
                        </div>
                        <Home className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Platform Rating</p>
                          <p className="text-2xl font-bold text-foreground">{stats?.averageRating}</p>
                          <p className="text-xs text-green-600">{stats?.responseRate}% response rate</p>
                        </div>
                        <Star className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Flagged Content</p>
                          <p className="text-2xl font-bold text-foreground">{stats?.flaggedContent}</p>
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
                        {/* Example: Display some recent user activity here, maybe from reports or new users */}
                        {loading && <p>Loading recent activity...</p>}
                        {!loading && users.slice(0, 3).map((user, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <UserCheck className="w-5 h-5 text-green-500" />
                          <div>
                              <p className="text-sm text-foreground">New {user.user_type} registered: {user.first_name} {user.last_name}</p>
                              <p className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        ))}
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
                            <p className="text-xs text-muted-foreground">{stats?.pendingListings} items</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setActiveTab("listings")}>
                            Review
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <div>
                            <p className="text-sm font-medium text-foreground">Flagged content</p>
                            <p className="text-xs text-muted-foreground">{stats?.flaggedContent} reports</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setActiveTab("reports")}>
                            Review
                          </Button>
                        </div>
                        {/* Placeholder for user verifications, if applicable */}
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div>
                            <p className="text-sm font-medium text-foreground">User verifications</p>
                            <p className="text-xs text-muted-foreground">0 pending</p>
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
              <div key="users" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Search users..." className="pl-10 w-64" />
                    </div>
                    <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                      <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="advertiser">Advertiser</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  {loading && <p>Loading users...</p>}
                  {!loading && users.map((user) => (
                    <Card key={user.id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{user.first_name} {user.last_name}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <Badge variant="secondary">{user.user_type}</Badge>
                                <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                                <span className="text-xs text-muted-foreground">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
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
                                  onClick={() => handleUserAction(user.id, 'suspend')}
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 bg-transparent"
                                  onClick={() => handleUserAction(user.id, 'activate')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="text-red-600 bg-transparent" onClick={() => handleUserAction(user.id, 'delete')}>
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
              <div key="listings" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Listing Moderation</h1>
                  <Select value={selectedListingStatusFilter} onValueChange={setSelectedListingStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {loading && <p>Loading listings...</p>}
                  {!loading && listings.map((listing) => (
                    <Card key={listing.id} className={`group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out ${listing.status === 'pending' ? "border-yellow-200" : ""}`}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <img
                            src={getListingImageUrl(listing.images)}
                            alt={listing.title}
                            className="w-32 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground">{listing.title}</h3>
                                <p className="text-sm text-muted-foreground">by {listing.first_name} {listing.last_name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">{listing.city}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">{listing.price} TND/month</p>
                                <p className="text-xs text-muted-foreground">Submitted {new Date(listing.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              {listing.status === 'pending' && (
                                <>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleListingAction(listing.id, 'approve')}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 bg-transparent"
                                    onClick={() => handleListingAction(listing.id, 'reject')}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                                </>                                
                              )}
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleListingAction(listing.id, 'delete')}>
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

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div key="reports" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Reports & Flags</h1>
                  <div className="flex items-center gap-2">
                    <Select value={selectedReportStatusFilter} onValueChange={setSelectedReportStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reports</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  {loading && <p>Loading reports...</p>}
                  {!loading && reports.map((report) => (
                    <Card key={report.id} className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{report.listing_title || "N/A"}</h3>
                            <p className="text-sm text-muted-foreground">Reported by {report.student_first_name} {report.student_last_name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                          </div>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4 mb-4">
                          <p className="text-sm text-muted-foreground">
                            <strong>Reason:</strong> {report.message}
                          </p>
                        </div>

                        {report.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleReportAction(report.id, 'resolve')}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleReportAction(report.id, 'take_action')}>
                              <Ban className="w-4 h-4 mr-2" />
                              Take Action
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 bg-transparent" onClick={() => handleReportAction(report.id, 'delete')}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {report.status !== "pending" && (
                          <Button variant="outline" size="sm" onClick={() => handleReportAction(report.id, 'delete')}>
                            <Trash2 className="w-4 h-4" />
                            Delete Report
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div key="analytics" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <h1 className="text-3xl font-bold text-foreground">Platform Analytics</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Users</span>
                          <span className="font-medium">{stats?.totalUsers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">New This Month</span>
                          <span className="font-medium text-green-600">+{stats?.newUsersThisMonth}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardHeader>
                      <CardTitle>Listing Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Active Listings</span>
                          <span className="font-medium">{stats?.activeListings}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Pending Approval</span>
                          <span className="font-medium text-yellow-600">{stats?.pendingListings}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Average Price</span>
                          <span className="font-medium">N/A</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Most Popular City</span>
                          <span className="font-medium">N/A</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardHeader>
                      <CardTitle>Platform Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Average Rating</span>
                          <span className="font-medium">{stats?.averageRating}/5</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Response Rate</span>
                          <span className="font-medium">N/A</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Active Reports</span>
                          <span className="font-medium text-red-600">{stats?.flaggedContent}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">User Satisfaction</span>
                          <span className="font-medium">N/A</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardHeader>
                      <CardTitle>Top Cities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Placeholder for top cities, if available from stats API */}
                        <p className="text-muted-foreground">Data not available</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div key="settings" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <h1 className="text-3xl font-bold text-foreground">System Settings</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
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

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
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

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
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

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
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
