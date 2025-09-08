"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, MapPin, Users, Star, Heart, Filter, SlidersHorizontal, Grid3X3, List, ArrowUpDown } from "lucide-react"
import Link from "next/link"

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(true)
  const [priceRange, setPriceRange] = useState([200, 800])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedRoommates, setSelectedRoommates] = useState("any")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    fetchListings();
  }, [searchTerm, selectedCity, selectedRoommates, priceRange, verifiedOnly, sortBy]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCity !== "all") params.append("city", selectedCity);
      if (selectedRoommates !== "any") params.append("max_roommates", selectedRoommates);
      params.append("min_price", priceRange[0].toString());
      params.append("max_price", priceRange[1].toString());
      if (verifiedOnly) params.append("verified", "true");
      params.append("sort_by", sortBy);

      const response = await fetch(`/api/listings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      } else {
        console.error("Failed to fetch listings");
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const ListingCard = ({ listing, isListView = false }: { listing: any; isListView?: boolean }) => (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 border-border overflow-hidden hover-lift ${isListView ? "flex" : ""}`}
    >
      <div className={`relative ${isListView ? "w-80 flex-shrink-0" : ""}`}>
        <img
          src={listing.images?.[0] || "/placeholder.svg?height=200&width=300&query=modern apartment room"}
          alt={listing.title}
          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
            isListView ? "w-full h-full" : "w-full h-48"
          }`}
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 bg-background/80 hover:bg-background"
          
        >
          <Heart className="w-4 h-4" />
        </Button>
        <Badge className="absolute bottom-3 left-3 bg-primary text-primary-foreground">{listing.price} TND/month</Badge>
        {listing.profiles?.user_type === "verified" && (
          <Badge className="absolute top-3 left-3 bg-green-500 text-white text-xs">Verified</Badge>
        )}
      </div>

      <CardContent className={`p-6 ${isListView ? "flex-1" : ""}`}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">4.8</span>
            <span className="text-xs text-muted-foreground">(24)</span>
          </div>
        </div>

        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {listing.location}, {listing.city}
          </span>
        </div>

        <div className="flex items-center text-muted-foreground mb-4">
          <Users className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {listing.max_roommates} max roommates • {listing.room_type}
          </span>
        </div>

        {isListView && <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{listing.description}</p>}

        <div className="flex flex-wrap gap-2 mb-4">
          {listing.amenities?.slice(0, isListView ? 6 : 4).map((amenity: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
        </div>

        <div className={`${isListView ? "flex items-center justify-between" : ""}`}>
          <div className={`text-xs text-muted-foreground ${isListView ? "" : "mb-4"}`}>
            Listed by {listing.profiles?.full_name}
          </div>
          <Button className={`bg-primary hover:bg-primary/90 smooth-transition ${isListView ? "" : "w-full"}`} asChild>
            <Link href={`/listings/${listing.id}`}>{isListView ? "View Details" : "View Details"}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                    <SlidersHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Location */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Location</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        <SelectItem value="tunis">Tunis</SelectItem>
                        <SelectItem value="sfax">Sfax</SelectItem>
                        <SelectItem value="sousse">Sousse</SelectItem>
                        <SelectItem value="monastir">Monastir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">
                      Price Range: {priceRange[0]} - {priceRange[1]} TND
                    </Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000}
                      min={100}
                      step={50}
                      className="w-full"
                    />
                  </div>

                  {/* Number of Roommates */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Roommates</Label>
                    <Select value={selectedRoommates} onValueChange={setSelectedRoommates}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any number</SelectItem>
                        <SelectItem value="1">1 roommate</SelectItem>
                        <SelectItem value="2">2 roommates</SelectItem>
                        <SelectItem value="3">3 roommates</SelectItem>
                        <SelectItem value="4+">4+ roommates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gender Preference */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Gender Preference</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="No preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">No preference</SelectItem>
                        <SelectItem value="male">Male only</SelectItem>
                        <SelectItem value="female">Female only</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Amenities</Label>
                    <div className="space-y-2">
                      {["WiFi", "Furnished", "Parking", "AC", "Kitchen", "Laundry", "Study Room", "Balcony"].map(
                        (amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox id={amenity} />
                            <Label htmlFor={amenity} className="text-sm text-muted-foreground">
                              {amenity}
                            </Label>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Verified Only */}
                  <div className="flex items-center space-x-2">
                    <Checkbox id="verified" checked={verifiedOnly} onCheckedChange={(checked) => setVerifiedOnly(!!checked)} />
                    <Label htmlFor="verified" className="text-sm text-muted-foreground">
                      Verified listings only
                    </Label>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={fetchListings}>Apply Filters</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search by location, university, or keywords..."
                    className="pl-10 h-12 border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Available Rooms</h1>
                  <p className="text-muted-foreground">
                    {loading ? "Loading..." : `${listings.length} listings found`}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex border border-border rounded-lg">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Listings Grid/List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading listings...</p>
              </div>
            ) : listings.length > 0 ? (
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"}
              >
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} isListView={viewMode === "list"} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No listings found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
