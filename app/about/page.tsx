import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Heart, Star, CheckCircle, Clock, MapPin, Award, Target, Zap } from "lucide-react"
import Link from "next/link"
import Header from "../header/page"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('/vibrant-tunisian-students-studying-together-in-mod.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 px-6 py-3 text-base font-medium animate-scale-in bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 smooth-transition">
              <span className="text-2xl mr-3">🇹🇳</span>
              Made for Tunisian Students
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance animate-slide-up">
              About
              <span className="text-primary block">RoomMate TN</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty animate-fade-in">
              Revolutionizing student housing in Tunisia by connecting students with their perfect roommates and
              creating vibrant communities across the country.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We believe that finding the right roommate shouldn't be a stressful experience. RoomMate TN was created
                to solve the housing challenges faced by students across Tunisia, from Tunis to Sfax, Sousse to
                Monastir.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Our platform connects verified students with quality housing options, creating safe and supportive
                communities that enhance the university experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 smooth-transition hover-lift" asChild>
                  <Link href="/auth/signup">Join Our Community</Link>
                </Button>
                <Button variant="outline" size="lg" className="smooth-transition hover-lift bg-transparent" asChild>
                  <Link href="/search">Browse Listings</Link>
                </Button>
              </div>
            </div>
            <div className="animate-scale-in">
              <img
                src="/vibrant-tunisian-students-studying-together-in-mod.jpg"
                alt="Tunisian students studying together"
                className="rounded-2xl shadow-2xl hover-lift"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Our Impact</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trusted by thousands of students across Tunisia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "5,000+", label: "Active Students", icon: Users },
              { number: "2,500+", label: "Successful Matches", icon: Heart },
              { number: "15+", label: "Cities Covered", icon: MapPin },
              { number: "4.9/5", label: "User Rating", icon: Star },
            ].map((stat, index) => (
              <Card
                key={index}
                className="text-center p-8 border-border hover:shadow-lg smooth-transition hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Why Students Choose Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for the Tunisian student experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified Profiles",
                description: "All users are verified with university credentials for maximum safety and trust.",
              },
              {
                icon: CheckCircle,
                title: "Quality Listings",
                description: "Every property is reviewed and approved by our team to ensure quality standards.",
              },
              {
                icon: Zap,
                title: "Smart Matching",
                description: "Our algorithm matches you with compatible roommates based on lifestyle preferences.",
              },
              {
                icon: Clock,
                title: "Quick Response",
                description: "Connect with potential roommates instantly through our messaging system.",
              },
              {
                icon: Award,
                title: "Local Expertise",
                description: "Deep understanding of Tunisian student housing needs and local regulations.",
              },
              {
                icon: Target,
                title: "Perfect Fit",
                description: "Advanced filters help you find exactly what you're looking for in your budget.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 border-border hover:shadow-lg smooth-transition hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Our Story</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              RoomMate TN was founded by a group of Tunisian university students who experienced firsthand the
              challenges of finding quality student housing. Frustrated by outdated methods and unsafe options, we
              decided to create a modern, secure platform that puts students first.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-border animate-scale-in">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Built by Students, for Students</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  "We understand the unique challenges of student life in Tunisia - from budget constraints to safety
                  concerns. That's why we've built a platform that addresses these real needs with innovative
                  solutions."
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <div className="font-semibold text-foreground">The RoomMate TN Team</div>
                    <div className="text-sm text-muted-foreground">Founders & Student Advocates</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-primary to-secondary animate-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6 animate-slide-up">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-fade-in">
            Become part of Tunisia's largest student housing community and find your perfect roommate today.
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
              <Link href="/search">Browse Listings</Link>
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
                  <Link href="/announcements" className="hover:text-foreground transition-colors">
                    Student Announcements
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
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 RoomMate TN. Made with ❤️ for Tunisian students.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
