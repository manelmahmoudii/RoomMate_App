import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Users, Star, Heart, ArrowRight, CheckCircle, Shield, Clock } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"

export default async function HomePage() {
   const cookieStore = cookies();
  const isLoggedIn = cookieStore.has("token");
   
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-[url('/vibrant-tunisian-students-studying-together-in-mod.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 px-6 py-3 text-base font-semibold animate-scale-in bg-primary/20 text-primary border border-primary/30">
              <img src="/tn.png" alt="Tunisia Flag" className="w-5 h-5  mr-2"/>
            Made for Tunisian Students
            </Badge>


            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance animate-slide-up">
              Find Your Perfect
              <span className="text-primary block">Roommate in Tunisia</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty animate-fade-in">
              Connect with fellow students, discover amazing shared spaces, and create unforgettable memories in
              Tunisia's vibrant student communities.
            </p>

            {/* Search Bar */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg max-w-2xl mx-auto mb-8 animate-scale-in hover-lift">
              <form action="/search" method="GET" className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    name="city"
                    placeholder="City (Tunis, Sfax, Sousse...)"
                    className="pl-10 h-12 border-0 bg-background smooth-transition focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex-1 relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    name="max_price"
                    type="number"
                    placeholder="Budget (TND)"
                    className="pl-10 h-12 border-0 bg-background smooth-transition focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 px-8 bg-primary hover:bg-primary/90 smooth-transition hover-lift"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </form>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 smooth-transition hover-lift" asChild>
                <Link href="/search">
                  Find Roommates
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 bg-transparent smooth-transition hover-lift" asChild>
                <Link href="/auth/signup">Post Your Room</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Featured Roommate Opportunities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing shared spaces and connect with like-minded students across Tunisia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            { 
             
                [
                  {
                    id: 1,
                    image: "/modern-student-apartment-tunis.jpg",
                    title: "Modern Apartment in Tunis Center",
                    location: "Tunis, Bab Bhar",
                    price: "350",
                    roommates: 2,
                    rating: 4.8,
                    features: ["WiFi", "Furnished", "Near Metro"],
                  },
                  {
                    id: 2,
                    image: "/cozy-student-room-sfax.jpg",
                    title: "Cozy Room Near University",
                    location: "Sfax, University District",
                    price: "280",
                    roommates: 3,
                    rating: 4.9,
                    features: ["Study Room", "Kitchen", "Parking"],
                  },
                  {
                    id: 3,
                    image: "/shared-apartment-sousse-beach.jpg",
                    title: "Beach-Side Shared Space",
                    location: "Sousse, Kantaoui",
                    price: "420",
                    roommates: 2,
                    rating: 4.7,
                    features: ["Sea View", "Balcony", "Pool Access"],
                  },
                ].map((listing, index) => (
                  <Card
                    key={listing.id}
                    className="group hover:shadow-xl smooth-transition border-border overflow-hidden hover-lift animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative">
                      <img
                        src={listing.image || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-full h-48 object-cover group-hover:scale-105 smooth-transition"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-3 right-3 bg-background/80 hover:bg-background smooth-transition"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Badge className="absolute bottom-3 left-3 bg-primary text-primary-foreground">
                        {listing.price} TND/month
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-foreground text-lg group-hover:text-primary smooth-transition">
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{listing.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{listing.location}</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="w-4 h-4 mr-1" />
                          <span className="text-sm">{listing.roommates} roommates</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {listing.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <Button className="w-full bg-primary hover:bg-primary/90 smooth-transition hover-lift" asChild>
                        <Link href={`/listings/${listing.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
          </div>

          <div className="text-center animate-fade-in">
            <Button variant="outline" size="lg" className="px-8 bg-transparent smooth-transition hover-lift" asChild>
              <Link href="/search">
                View All Listings
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-muted/30" id="benefits">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Why Choose RoomMate TN?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The most trusted platform for student housing in Tunisia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified Profiles",
                description:
                  "All users are verified students with university credentials for your safety and peace of mind.",
              },
              {
                icon: CheckCircle,
                title: "Quality Guaranteed",
                description: "Every listing is reviewed and approved by our team to ensure quality and authenticity.",
              },
              {
                icon: Clock,
                title: "Quick Matching",
                description: "Find your perfect roommate in minutes with our smart matching algorithm.",
              },
            ].map((benefit, index) => (
              <Card
                key={index}
                className="text-center p-8 border-border hover:shadow-lg smooth-transition hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-primary to-secondary animate-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6 animate-slide-up">
            Ready to Find Your Perfect Roommate?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-fade-in">
            Join thousands of students who have found their ideal living situation through RoomMate TN
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
            <Button size="lg" variant="secondary" className="px-8 smooth-transition hover-lift" asChild>
              <Link href="/auth/signup">Get Started Now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent smooth-transition hover-lift"
              asChild
            >
              <Link href="#benefits">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 animate-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">RoomMate TN</span>
              </div>
              <p className="text-muted-foreground">
                Connecting Tunisian students with their perfect roommates and shared spaces.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">For Students</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/search" className="hover:text-foreground transition-colors">
                    Find Roommates
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Browse Listings
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Safety Tips
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">For Advertisers</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/dashboard/advertiser" className="hover:text-foreground transition-colors">
                    Post Room
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Manage Listings
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 RoomMate TN. Made with ❤️ for Tunisian students.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
