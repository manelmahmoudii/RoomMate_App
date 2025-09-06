"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Plus,
  Search,
  MapPin,
  MessageCircle,
  BookOpen,
  ShoppingBag,
  Coffee,
  Filter,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    category: "general",
    location: "",
    price: "",
    contact_info: "",
  })


  const categories = [
    { value: "roommate_search", label: "Roommate Search", icon: Users },
    { value: "study_group", label: "Study Groups", icon: BookOpen },
    { value: "events", label: "Events", icon: Coffee },
    { value: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { value: "general", label: "General", icon: MessageCircle },
  ]



  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || announcement.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category)
    return cat ? cat.icon : MessageCircle
  }

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.value === category)
    return cat ? cat.label : "General"
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Student Announcements</h1>
            <p className="text-muted-foreground">Connect with fellow students, find study groups, and more</p>
          </div>

          {user && (
            <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Create Form */}
        {showCreateForm && user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Announcement title..."
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />

              <Select
                value={newAnnouncement.category}
                onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Write your announcement..."
                rows={4}
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  placeholder="Location (optional)"
                  value={newAnnouncement.location}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, location: e.target.value })}
                />
                <Input
                  placeholder="Price (optional)"
                  type="number"
                  value={newAnnouncement.price}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, price: e.target.value })}
                />
                <Input
                  placeholder="Contact info (optional)"
                  value={newAnnouncement.contact_info}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, contact_info: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button  className="bg-primary hover:bg-primary/90">
                  Post Announcement
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Announcements Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading announcements...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement) => {
              const CategoryIcon = getCategoryIcon(announcement.category)
              return (
                <Card key={announcement.id} className="hover-lift cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CategoryIcon className="w-3 h-3" />
                        {getCategoryLabel(announcement.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{announcement.title}</h3>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{announcement.content}</p>

                    {(announcement.location || announcement.price) && (
                      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                        {announcement.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {announcement.location}
                          </div>
                        )}
                        {announcement.price && <div className="font-medium text-primary">{announcement.price} TND</div>}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={announcement.profiles?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {announcement.profiles?.full_name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-xs">
                          <div className="font-medium text-foreground">{announcement.profiles?.full_name}</div>
                          <div className="text-muted-foreground">{announcement.profiles?.university}</div>
                        </div>
                      </div>

                      {announcement.contact_info && (
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Contact
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {filteredAnnouncements.length === 0 && !loading && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No announcements found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Be the first to create an announcement!"}
            </p>
            {user && !showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
