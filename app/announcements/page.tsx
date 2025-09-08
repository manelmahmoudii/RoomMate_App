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

interface Announcement {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  city: string | null
  price: number | null
  contact_info: string
  created_at: string
  first_name: string
  last_name: string
  university: string | null
  avatar_url: string | null
}

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  university: string
  avatar_url: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    category: "general",
    location: "",
    price: "",
    contactInfo: {
      email: "",
      phone: ""
    }
  })

  const categories = [
    { value: "roommate", label: "Roommate Search", icon: Users },
    { value: "study_group", label: "Study Groups", icon: BookOpen },
    { value: "event", label: "Events", icon: Coffee },
    { value: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { value: "other", label: "General", icon: MessageCircle },
  ]

  // Charger les annonces
  useEffect(() => {
    fetchAnnouncements()
    checkUserSession()
  }, [searchTerm, selectedCategory])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/announcements?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data)
      }
    } catch (error) {
      console.error("Error fetching announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserSession = () => {
    // Vérifier si l'utilisateur est connecté
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert("Please log in to create an announcement")
      return
    }

    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          category: newAnnouncement.category,
          location: newAnnouncement.location,
          price: newAnnouncement.price ? parseFloat(newAnnouncement.price) : null,
          contactInfo: newAnnouncement.contactInfo
        })
      })

      if (response.ok) {
        setShowCreateForm(false)
        setNewAnnouncement({
          title: "",
          content: "",
          category: "general",
          location: "",
          price: "",
          contactInfo: { email: "", phone: "" }
        })
        fetchAnnouncements() // Recharger les annonces
      } else {
        alert("Error creating announcement")
      }
    } catch (error) {
      console.error("Error creating announcement:", error)
      alert("Error creating announcement")
    }
  }

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

  const parseContactInfo = (contactInfo: string) => {
    try {
      return JSON.parse(contactInfo)
    } catch {
      return { email: "", phone: "" }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Removed Header component */}
      {/*
      <Header
        // isLoggedIn={!!user} // Header now manages its own login state
        // navLinks={[]} // Header now manages its own navigation links
        // authButtons={true} // Header now manages its own auth buttons
      />
      */}

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
                  placeholder="Email for contact"
                  type="email"
                  value={newAnnouncement.contactInfo.email}
                  onChange={(e) => setNewAnnouncement({ 
                    ...newAnnouncement, 
                    contactInfo: { ...newAnnouncement.contactInfo, email: e.target.value } 
                  })}
                />
                <Input
                  placeholder="Phone (optional)"
                  value={newAnnouncement.contactInfo.phone}
                  onChange={(e) => setNewAnnouncement({ 
                    ...newAnnouncement, 
                    contactInfo: { ...newAnnouncement.contactInfo, phone: e.target.value } 
                  })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateAnnouncement} className="bg-primary hover:bg-primary/90">
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
              const contactInfo = parseContactInfo(announcement.contact_info)
              
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

                    {(announcement.city || announcement.price) && (
                      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                        {announcement.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {announcement.city}
                          </div>
                        )}
                        {announcement.price && <div className="font-medium text-primary">{announcement.price} TND</div>}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={announcement.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {announcement.first_name?.[0]}{announcement.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-xs">
                          <div className="font-medium text-foreground">
                            {announcement.first_name} {announcement.last_name}
                          </div>
                          <div className="text-muted-foreground">{announcement.university}</div>
                        </div>
                      </div>

                      {contactInfo.email && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={`mailto:${contactInfo.email}`}>
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Contact
                          </a>
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