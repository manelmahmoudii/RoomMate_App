"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import { Loader2, MessageCircle, MapPin, University, BookOpen, Calendar, Mail, Phone, Heart, Plus, CheckCircle, AlertCircle, DollarSign, Users, Home, Wifi, Car } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-hot-toast'; // Import toast

interface UserSession {
  id: string;
  email: string;
  role: string;
}

interface StudentProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  avatar_url: string;
  created_at: string;
  status: 'active' | 'suspended';
  university?: string;
  study_level?: string;
  bio?: string;
  preferences?: { 
    budget?: number;
    gender?: string;
    location?: string;
    maxRoommates?: number;
    furnished?: boolean;
    wifi?: boolean;
    parking?: boolean;
    age?: number;
  };
}

interface Listing {
  id: string;
  title: string;
  status: string;
}

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRecipientId, setMessageRecipientId] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false); // New state for request modal
  const [targetListingId, setTargetListingId] = useState<string | null>(null); // To store which listing the request is for
  const [requestMessage, setRequestMessage] = useState(""); // New state for request message content
  const [advertiserListings, setAdvertiserListings] = useState<Listing[]>([]); // New state for advertiser's listings

  useEffect(() => {
    if (!id) {
      setError("Student ID is missing.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/student/${id}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setStudentProfile(data);
        } else if (response.status === 404) {
          setError("Student profile not found.");
        } else if (response.status === 401) {
          router.push("/auth/login"); // Redirect to login if unauthorized
        } else {
          setError(`Failed to fetch student profile: ${response.statusText}`);
        }
      } catch (err) {
        console.error("Error fetching student profile:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserSession = async (): Promise<UserSession | null> => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUserSession(data);
          return data; // Return the session data
        } else {
          console.error("Failed to fetch user session:", response.status);
          setUserSession(null);
          return null; // Return null on failure
        }
      } catch (err) {
        console.error("Error fetching user session:", err);
        setUserSession(null);
        return null; // Return null on error
      }
    };

    const fetchAdvertiserListings = async (userId: string) => {
      try {
        const response = await fetch(`/api/listings?owner_id=${userId}`); // Assuming this API supports filtering by owner_id
        if (response.ok) {
          const data = await response.json();
          setAdvertiserListings(data.filter((listing: Listing) => listing.status === 'active'));
        } else {
          console.error("Failed to fetch advertiser listings:", response.status);
        }
      } catch (err) {
        console.error("Error fetching advertiser listings:", err);
      }
    };

    fetchProfile();
    fetchUserSession().then(session => {
      // Only fetch advertiser listings if the user is an advertiser
      if (session?.role === 'advertiser' && session?.id) {
        fetchAdvertiserListings(session.id);
      }
    });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading student profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Error</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
        <p className="text-muted-foreground mb-4">The student profile you are looking for does not exist.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const preferences = studentProfile.preferences || {};

  const openMessageModal = (recipientId: string) => {
    setMessageRecipientId(recipientId);
    setShowMessageModal(true);
    setContactMessage("");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSession?.id || !messageRecipientId || !contactMessage.trim()) {
      toast("Authentication required or missing recipient/message.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/messages", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: userSession.id, // Corrected sender_id
          recipientId: messageRecipientId,
          message: contactMessage,
          // No listingId here, as we are sending a general message from profile
        }),
        credentials: 'include',
      });

      if (response.ok) {
        setShowMessageModal(false);
        toast.success("Message sent successfully!");
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send message: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("An unexpected error occurred while sending the message.");
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = (studentId: string, listingId: string | null = null) => {
    // When an advertiser views a student's profile, they might want to send a request for *their own* listing to this student.
    // So, targetListingId would be selected by the advertiser, not derived from the student's profile.
    // For now, we'll set targetListingId to null and the modal will allow selecting a listing.
    setTargetListingId(listingId);
    setRequestMessage("");
    setShowRequestModal(true);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSession?.id || !studentProfile?.id || !targetListingId || !requestMessage.trim()) {
      toast("Authentication required, student/listing not selected, or message missing.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/student/requests", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: targetListingId,
          studentId: studentProfile.id, // The student whose profile we are viewing
          message: requestMessage,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        setShowRequestModal(false);
        toast.success("Roommate request sent successfully!");
        // Optionally, refresh requests on the advertiser dashboard or give feedback
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send request: ${errorData.error || response.statusText}`);
      }
    } catch (err) {
      console.error("Error sending request:", err);
      toast.error("An unexpected error occurred while sending the request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Student Info */}
          <div className="lg:w-80">
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={studentProfile.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{studentProfile.first_name?.[0]}{studentProfile.last_name?.[0]}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-foreground">{studentProfile.first_name} {studentProfile.last_name}</h2>
                <p className="text-muted-foreground text-sm">{studentProfile.user_type}</p>
                {studentProfile.status === 'active' && (
                  <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                  </Badge>
                )}
                <div className="mt-4 space-y-2">
                  <Button className="w-full" onClick={() => openMessageModal(studentProfile.id)}>
                    <MessageCircle className="w-4 h-4 mr-2" /> Contact Student
                  </Button>
                  {userSession?.role === 'advertiser' && studentProfile && (
                    <Button variant="outline" className="w-full" onClick={() => openRequestModal(studentProfile.id)}>
                      <Plus className="w-4 h-4 mr-2" /> Send Roommate Request
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Contact & Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{studentProfile.email}</span>
                </div>
                {studentProfile.university && (
                  <div className="flex items-center text-sm">
                    <University className="w-4 h-4 mr-2" />
                    <span>{studentProfile.university}</span>
                  </div>
                )}
                {studentProfile.study_level && (
                  <div className="flex items-center text-sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>{studentProfile.study_level}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Joined {new Date(studentProfile.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Bio and Preferences */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {studentProfile.bio || "No bio provided yet."}
                </p>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Roommate Preferences</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                {preferences.budget && (
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>Budget: {preferences.budget} TND/month</span>
                  </div>
                )}
                {preferences.gender && (
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Preferred Gender: {preferences.gender}</span>
                  </div>
                )}
                {preferences.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Preferred Location: {preferences.location}</span>
                  </div>
                )}
                {preferences.maxRoommates && (
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Max Roommates: {preferences.maxRoommates}</span>
                  </div>
                )}
                {typeof preferences.furnished === 'boolean' && (
                  <div className="flex items-center text-sm">
                    <Home className="w-4 h-4 mr-2" />
                    <span>Furnished: {preferences.furnished ? 'Yes' : 'No'}</span>
                  </div>
                )}
                {typeof preferences.wifi === 'boolean' && (
                  <div className="flex items-center text-sm">
                    <Wifi className="w-4 h-4 mr-2" />
                    <span>Wi-Fi: {preferences.wifi ? 'Available' : 'Not Available'}</span>
                  </div>
                )}
                {typeof preferences.parking === 'boolean' && (
                  <div className="flex items-center text-sm">
                    <Car className="w-4 h-4 mr-2" />
                    <span>Parking: {preferences.parking ? 'Available' : 'Not Available'}</span>
                  </div>
                )}
                {preferences.age && (
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Age: {preferences.age}</span>
                  </div>
                )}

                {!preferences.budget &&
                !preferences.gender &&
                !preferences.location &&
                !preferences.maxRoommates &&
                typeof preferences.furnished !== 'boolean' &&
                typeof preferences.wifi !== 'boolean' &&
                typeof preferences.parking !== 'boolean' &&
                !preferences.age && (
                  <p>No preferences set yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && messageRecipientId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSendMessage}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="messageContent">Your Message</Label>
                    <Textarea
                      id="messageContent"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Write your message here..."
                      rows={5}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowMessageModal(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading || !contactMessage.trim()}>
                    {loading ? <>Sending...</> : <>Send Message</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && studentProfile && userSession?.role === 'advertiser' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Send Roommate Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSendRequest}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="studentName">Requesting for</Label>
                    <Input
                      id="studentName"
                      value={`${studentProfile.first_name} ${studentProfile.last_name}`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="listingSelect">Select Your Listing</Label>
                    <Select
                      value={targetListingId || ""}
                      onValueChange={(value) => setTargetListingId(value)}
                      required
                    >
                      <SelectTrigger id="listingSelect">
                        <SelectValue placeholder="Select a listing to send request for" />
                      </SelectTrigger>
                      <SelectContent>
                        {advertiserListings.length === 0 ? (
                          <SelectItem value="" disabled>No active listings found.</SelectItem>
                        ) : (
                          advertiserListings.map((listing) => (
                            <SelectItem key={listing.id} value={listing.id}>
                              {listing.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="requestMessage">Your Message</Label>
                    <Textarea
                      id="requestMessage"
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Write your request message here..."
                      rows={5}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowRequestModal(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading || !targetListingId || !requestMessage.trim()}>
                    {loading ? <>Sending Request...</> : <>Send Request</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
