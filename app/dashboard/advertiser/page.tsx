"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'react-hot-toast';
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
  Star,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  BarChart3,
  Upload,
  Mail,
  Bell,
  ArrowLeft,
  Camera,
  MapPin
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  avatar_url: string;
  created_at: string;
  status: 'active' | 'suspended';
  totalReviews?: number;
  rating?: number;
  phone?: string;
  bio?: string;
  account_type?: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  number_of_roommates: number;
  amenities: string;
  images: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  views?: number;
  requests?: number;
}

interface Request {
  id: string;
  student_id: string;
  listing_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  student_first_name: string;
  student_last_name: string;
  student_avatar_url: string;
  listing_title: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  listing_id: string | null;
  announcement_id?: string | null;
  is_read: boolean;
  created_at: string;
  sender_first_name: string;
  sender_last_name: string;
  sender_avatar_url: string;
  listing_title: string | null;
  listing_city: string | null;
  announcement_title?: string | null;
  receiver_first_name: string;
  receiver_last_name: string;
  receiver_avatar_url: string;
}

interface ConversationParticipant {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

interface Conversation {
  id: string;
  participant: ConversationParticipant;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
  contextType: 'listing' | 'announcement' | 'general';
  contextTitle: string | null;
  contextId: string | null;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  city: string | null;
  price: number | null;
  images: string | null;
  created_at: string;
}

interface Analytics {
  totalViews: number;
  totalRequests: number;
  activeListings: number;
  averageRating: number;
  monthlyEarnings: number;
  responseRate: number;
}

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const getAvatarDisplayUrl = (avatarUrl: string | null | undefined) => {
  if (!avatarUrl || avatarUrl === "/placeholder.svg") {
    return undefined;
  }
  return avatarUrl;
};

const getListingImageUrl = (images: string | null) => {
  if (!images) return "/placeholder.svg";

  try {
    const imageUrls = JSON.parse(images);
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      return imageUrls[0];
    }
  } catch (e) {
  }
  return images;
};

const getListingImagesArray = (imagesString: string) => {
  try {
    const images = JSON.parse(imagesString);
    return (Array.isArray(images) && images.length > 0) ? images : [];
  } catch (error) {
    console.error("Error parsing images JSON for editing listing:", imagesString, error);
    return [];
  }
};

export default function AdvertiserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddListing, setShowAddListing] = useState(false);
  const [advertiserProfile, setAdvertiserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showEditListing, setShowEditListing] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [contactMessage, setContactMessage] = useState<string>("");
  const [newListingForm, setNewListingForm] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    number_of_roommates: "1",
    amenities: [],
    images: [],
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [messageRecipientId, setMessageRecipientId] = useState<string | null>(null);
  const [messageListingId, setMessageListingId] = useState<string | null>(null);
  const [messageAnnouncementId, setMessageAnnouncementId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedAccountType, setEditedAccountType] = useState("");
  const [editedAvatarUrl, setEditedAvatarUrl] = useState<string | null>(null);

  const router = useRouter();

  const groupMessagesByConversation = useCallback((allMessages: Message[], currentUserId: string, allListings: Listing[], allAnnouncements: Announcement[]): Conversation[] => {
    if (!currentUserId || allMessages.length === 0) return []; // Return empty array if no messages
    const conversationsMap = new Map<string, Conversation>();

    allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    allMessages.forEach(message => {
      const otherParticipantId = message.sender_id === currentUserId ? message.recipient_id : message.sender_id;
      
      // Conversation key is now based on the other participant's ID AND the context (listing/announcement)
      const contextPrefix = message.listing_id ? `L-${message.listing_id}-` : message.announcement_id ? `A-${message.announcement_id}-` : `G-`;
      const conversationKey = `${contextPrefix}${otherParticipantId}`;

      if (!conversationsMap.has(conversationKey)) {
        const participantFirstName = message.sender_id === currentUserId 
          ? message.receiver_first_name || "" 
          : message.sender_first_name || "";
        const participantLastName = message.sender_id === currentUserId 
          ? message.receiver_last_name || "" 
          : message.sender_last_name || "";
        const participantAvatarUrl = message.sender_id === currentUserId 
          ? message.receiver_avatar_url || "/placeholder.svg" 
          : message.sender_avatar_url || "/placeholder.svg";

        conversationsMap.set(conversationKey, {
          id: conversationKey,
          participant: {
            id: otherParticipantId,
            first_name: participantFirstName,
            last_name: participantLastName,
            avatar_url: participantAvatarUrl,
          },
          lastMessage: message,
          unreadCount: 0,
          messages: [],
          contextType: 'general',
          contextTitle: null,
          contextId: null,
        });
      }

      const conversation = conversationsMap.get(conversationKey)!;
      conversation.messages.push(message);
      conversation.lastMessage = message;
      if (message.recipient_id === currentUserId && !message.is_read) {
        conversation.unreadCount++;
      }

      if (message.listing_id) {
        const listing = allListings.find(l => l.id === message.listing_id);
        conversation.contextType = 'listing';
        conversation.contextId = message.listing_id;
        conversation.contextTitle = listing?.title || message.listing_title || `Listing ${message.listing_id}`;
      } else if (message.announcement_id) {
        const announcement = allAnnouncements.find(a => a.id === message.announcement_id);
        conversation.contextType = 'announcement';
        conversation.contextId = message.announcement_id;
        conversation.contextTitle = announcement?.title || message.announcement_title || `Announcement ${message.announcement_id}`;
      } else {
        conversation.contextType = 'general';
        conversation.contextTitle = null;
        conversation.contextId = null;
      }
    });

    const finalGroupedConversations = Array.from(conversationsMap.values()).sort((a, b) => 
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
    console.log("Final Grouped Conversations (Advertiser Dashboard):", finalGroupedConversations); // Debug log
    return finalGroupedConversations;
  }, [advertiserProfile, allListings, myAnnouncements]);

  const fetchAdvertiserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(router, "/api/profile");
      if (response.ok) {
        const data = await response.json();
        setAdvertiserProfile(data);
        setEditedFirstName(data.first_name || "");
        setEditedLastName(data.last_name || "");
        setEditedPhone(data.phone || "");
        setEditedBio(data.bio || "");
        setEditedAccountType(data.account_type || "");
        setEditedAvatarUrl(data.avatar_url || null);
      } else {
        console.error("Failed to fetch advertiser profile:", response.status);
      }
    } catch (error) {
      console.error("Error fetching advertiser profile:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleProfileUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advertiserProfile?.id) {
      toast.error("Authentication required to update profile.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(router, "/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: editedFirstName,
          last_name: editedLastName,
          phone: editedPhone,
          bio: editedBio,
          account_type: editedAccountType,
          avatar_url: editedAvatarUrl || undefined,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setAdvertiserProfile(updatedData);
        setEditedFirstName(updatedData.first_name || "");
        setEditedLastName(updatedData.last_name || "");
        setEditedPhone(updatedData.phone || "");
        setEditedBio(updatedData.bio || "");
        setEditedAccountType(updatedData.account_type || "");
        setEditedAvatarUrl(updatedData.avatar_url || null);
        toast.success("Profile updated successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update profile.");
        console.error("Failed to update profile:", response.status, errorData.error);
      }
    } catch (error) {
      toast.error("Error updating profile.");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  }, [advertiserProfile?.id, editedFirstName, editedLastName, editedPhone, editedBio, editedAccountType, editedAvatarUrl, router]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/listings");
      if (response.ok) {
        const data = await response.json();
        setListings(data);
        setAllListings(data);
      } else {
        console.error("Failed to fetch listings:", response.status);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/advertiser/requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        console.error("Failed to fetch requests:", response.status);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/advertiser/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error("Failed to fetch analytics:", response.status);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/announcements/my");
      if (response.ok) {
        const data = await response.json();
        setMyAnnouncements(data);
      } else {
        console.error("Failed to fetch my announcements:", response.status);
      }
    } catch (error) {
      console.error("Error fetching my announcements:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!advertiserProfile?.id) return;
    setLoading(true);
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data: Message[] = await response.json();
        console.log("RAW Messages from API (Advertiser Dashboard):", data); // Debug log
        setMessages(data);
        const grouped = groupMessagesByConversation(data, advertiserProfile.id, allListings, myAnnouncements);
        console.log("Grouped Conversations (Advertiser Dashboard):", grouped); // Debug log
        setConversations(grouped);
        if (selectedConversation) {
          const updatedSelected = grouped.find(conv => conv.id === selectedConversation.id);
          setSelectedConversation(updatedSelected || null);
        }
      } else {
        console.error("Failed to fetch messages:", response.status);
        toast.error("Failed to load messages.");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("An error occurred while fetching messages.");
    } finally {
      setLoading(false);
    }
  }, [advertiserProfile?.id, groupMessagesByConversation, allListings, myAnnouncements]);

  // New function to refresh all messages
  const refreshMessages = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setImagePreview(null);
    }
  };

  const handleListingDelete = useCallback(async (listingId: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setListings((prevListings) => prevListings.filter((listing) => listing.id !== listingId));
        toast.success("Listing deleted successfully!");
        fetchListings();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete listing: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("An error occurred while deleting the listing.");
    } finally {
      setLoading(false);
    }
  }, [fetchListings]);

  const handleDeleteAnnouncement = useCallback(async (announcementId: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Announcement deleted successfully!");
        fetchMyAnnouncements();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete announcement.");
        console.error("Failed to delete announcement:", response.status, errorData.error);
      }
    } catch (error) {
      toast.error("Error deleting announcement.");
      console.error("Error deleting announcement:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchMyAnnouncements]);

  const handleListingUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    setLoading(true);
    try {
      const updatedData = {
        title: (document.getElementById("editTitle") as HTMLInputElement).value,
        description: (document.getElementById("editDescription") as HTMLTextAreaElement).value,
        price: parseFloat((document.getElementById("editPrice") as HTMLInputElement).value),
        city: (document.getElementById("editLocation") as HTMLSelectElement).value,
        number_of_roommates: parseInt((document.getElementById("editRoommates") as HTMLSelectElement).value),
      };

      const response = await fetch(`/api/listings/${editingListing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        toast.success("Listing updated successfully!");
        setShowEditListing(false);
        setEditingListing(null);
        fetchListings();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update listing: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("An error occurred while updating the listing.");
    } finally {
      setLoading(false);
    }
  }, [editingListing, fetchListings]);

  const handleAddListing = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = null;
    if (selectedImageFile) {
      const formData = new FormData();
      formData.append("file", selectedImageFile);

      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.imageUrl;
        } else {
          const errorData = await uploadResponse.json();
          toast.error(`Failed to upload image: ${errorData.message || uploadResponse.statusText}`);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("An error occurred while uploading the image.");
        setLoading(false);
        return;
      }
    }

    try {
      const price = parseFloat(newListingForm.price);
      if (isNaN(price) || price <= 0) {
        toast.error("Price must be a positive number.");
        setLoading(false);
        return;
      }

      const numberOfRoommates = parseInt(newListingForm.number_of_roommates);
      if (isNaN(numberOfRoommates) || numberOfRoommates <= 0) {
        toast.error("Number of roommates must be a positive integer.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newListingForm.title,
          description: newListingForm.description,
          price: price,
          city: newListingForm.city,
          number_of_roommates: numberOfRoommates,
          amenities: newListingForm.amenities, 
          images: imageUrl ? [imageUrl] : [],
        }),
      });

      if (response.ok) {
        toast.success("Listing added successfully! Awaiting admin approval.");
        setShowAddListing(false);
        setNewListingForm({
          title: "",
          description: "",
          price: "",
          city: "",
          number_of_roommates: "1",
          amenities: [],
          images: [],
        });
        setSelectedImageFile(null);
        setImagePreview(null);
        fetchListings();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to add listing: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error adding listing:", error);
      toast.error("An error occurred while adding the listing.");
    } finally {
      setLoading(false);
    }
  }, [newListingForm, selectedImageFile, fetchListings]);

  const handleAcceptRequest = useCallback(async (requestId: string) => {
    if (!window.confirm("Are you sure you want to accept this request?")) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/advertiser/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });

      if (response.ok) {
        toast.success("Request accepted successfully!");
        fetchRequests();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to accept request: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("An error occurred while accepting the request.");
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  const handleDeclineRequest = useCallback(async (requestId: string) => {
    if (!window.confirm("Are you sure you want to decline this request?")) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/advertiser/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (response.ok) {
        toast.success("Request declined successfully!");
        fetchRequests();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to decline request: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error declining request:", error);
      toast.error("An error occurred while declining the request.");
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  const handleSendMessage = useCallback(async () => {
    if (!advertiserProfile?.id || !messageRecipientId || !contactMessage.trim()) {
      toast.error("Authentication required or missing recipient/message.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: messageRecipientId,
          message: contactMessage.trim(),
          listingId: messageListingId,
          announcementId: messageAnnouncementId,
        }),
      });

      if (response.ok) {
        toast.success("Message sent successfully!");
        setContactMessage("");
        refreshMessages(); // Refresh all messages to ensure UI is up-to-date with DB
        setMessageRecipientId(null);
        setMessageListingId(null);
        setMessageAnnouncementId(null);
        if (advertiserProfile && selectedConversation) {
          const newMessage: Message = {
            id: `temp-${Date.now()}`,
            sender_id: advertiserProfile.id,
            recipient_id: messageRecipientId,
            content: contactMessage,
            listing_id: messageListingId,
            announcement_id: messageAnnouncementId,
            is_read: true,
            created_at: new Date().toISOString(),
            sender_first_name: advertiserProfile.first_name || "",
            sender_last_name: advertiserProfile.last_name || "",
            sender_avatar_url: advertiserProfile.avatar_url || "/placeholder.svg",
            listing_title: messageListingId ? (allListings.find(l => l.id === messageListingId)?.title || `Listing ${messageListingId}`) : null,
            listing_city: messageListingId ? (allListings.find(l => l.id === messageListingId)?.city || null) : null,
            announcement_title: messageAnnouncementId ? (myAnnouncements.find(a => a.id === messageAnnouncementId)?.title || `Announcement ${messageAnnouncementId}`) : null,
            receiver_first_name: selectedConversation.participant.first_name || "",
            receiver_last_name: selectedConversation.participant.last_name || "",
            receiver_avatar_url: selectedConversation.participant.avatar_url || "/placeholder.svg",
          };

          setConversations(prevConversations => {
            const updatedConversations = prevConversations.map(conv => {
              if (conv.id === selectedConversation.id) {
                return {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  lastMessage: newMessage,
                };
              }
              return conv;
            });
            const conversationToMove = updatedConversations.find(conv => conv.id === selectedConversation.id);
            if (conversationToMove) {
              return [conversationToMove, ...updatedConversations.filter(conv => conv.id !== selectedConversation.id)];
            }
            return updatedConversations;
          });
          setSelectedConversation(prev => prev ? { ...prev, messages: [...prev.messages, newMessage], lastMessage: newMessage } : null);
        } else {
          refreshMessages(); // Re-fetch messages if no conversation is selected
        }
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send message: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred while sending the message.");
    } finally {
      setLoading(false);
    }
  }, [advertiserProfile, selectedConversation, contactMessage, messageRecipientId, messageListingId, messageAnnouncementId, allListings, myAnnouncements, refreshMessages]);

  const handleOpenMessageModal = useCallback((recipientId: string, listingId: string | null = null, announcementId: string | null = null, recipientFirstName: string = "", recipientLastName: string = "", recipientAvatarUrl: string = "/placeholder.svg") => {
    setContactMessage("");
    setActiveTab("messages");

    // Create a robust conversation key to find existing conversations
    const contextPrefix = listingId ? `L-${listingId}-` : announcementId ? `A-${announcementId}-` : `G-`;
    const potentialConversationKey = `${contextPrefix}${recipientId}`;

    const existingConversation = conversations.find(conv => conv.id === potentialConversationKey);

    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else if (advertiserProfile) {
      const newConversation: Conversation = {
        id: potentialConversationKey, // Use the robust key for the new conversation's ID
        participant: {
          id: recipientId,
          first_name: recipientFirstName,
          last_name: recipientLastName,
          avatar_url: recipientAvatarUrl,
        },
        lastMessage: {
          id: `new-temp-${Date.now()}`,
          sender_id: advertiserProfile.id,
          recipient_id: recipientId,
          content: "",
          listing_id: listingId,
          announcement_id: announcementId,
          is_read: false,
          created_at: new Date().toISOString(),
          sender_first_name: advertiserProfile.first_name || "",
          sender_last_name: advertiserProfile.last_name || "",
          sender_avatar_url: advertiserProfile.avatar_url || "/placeholder.svg",
          listing_title: listingId ? (allListings.find(l => l.id === listingId)?.title || `Listing ${listingId}`) : null,
          listing_city: listingId ? (allListings.find(l => l.id === listingId)?.city || null) : null,
          announcement_title: announcementId ? (myAnnouncements.find(a => a.id === announcementId)?.title || `Announcement ${announcementId}`) : null,
          receiver_first_name: recipientFirstName,
          receiver_last_name: recipientLastName,
          receiver_avatar_url: recipientAvatarUrl,
        },
        unreadCount: 0,
        messages: [],
        contextType: listingId ? 'listing' : (announcementId ? 'announcement' : 'general'),
        contextTitle: listingId ? (allListings.find(l => l.id === listingId)?.title || `Listing ${listingId}`) : (announcementId ? (myAnnouncements.find(a => a.id === announcementId)?.title || `Announcement ${announcementId}`) : null),
        contextId: listingId || announcementId || null,
      };
      setSelectedConversation(newConversation);
      setConversations(prev => [newConversation, ...prev]);
    }
  }, [conversations, advertiserProfile, allListings, myAnnouncements]);

  const handleMessageStudent = useCallback(async (studentId: string, listingId: string, studentFirstName: string, studentLastName: string, studentAvatarUrl: string) => {
    handleOpenMessageModal(studentId, listingId, null, studentFirstName, studentLastName, studentAvatarUrl);
  }, [handleOpenMessageModal]);

  const handleEditListing = useCallback((listing: Listing) => {
    setEditingListing(listing);
    setShowEditListing(true);
  }, []);

  useEffect(() => {
    fetchAdvertiserProfile();
    fetchListings();
    fetchRequests();
    fetchAnalytics();
    fetchMyAnnouncements();
  }, [fetchAdvertiserProfile, fetchListings, fetchRequests, fetchAnalytics, fetchMyAnnouncements]);

  useEffect(() => {
    if (advertiserProfile?.id) {
      fetchMessages();
    }
  }, [advertiserProfile?.id, fetchMessages]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={getAvatarDisplayUrl(editedAvatarUrl)} />
                    <AvatarFallback 
                      style={{ backgroundColor: advertiserProfile?.email ? stringToColor(advertiserProfile.email) : '#9ca3af' }} 
                      className="text-white font-semibold"
                    >
                      {editedFirstName?.[0]}{editedLastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-foreground">{editedFirstName} {editedLastName}</h2>
                    <p className="text-sm text-muted-foreground">{advertiserProfile?.user_type}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{advertiserProfile?.rating || 0}</span>
                      <span className="text-xs text-muted-foreground">({advertiserProfile?.totalReviews || 0})</span>
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
                    variant={activeTab === "messages" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab("messages");
                      setSelectedConversation(null);
                    }}
                  >
                    <Mail className="w-4 h-4 mr-3" />
                    Messages
                  </Button>
                  <Button
                    variant={activeTab === "my-announcements" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("my-announcements")}
                  >
                    <Bell className="w-4 h-4 mr-3" />
                    My Announcements
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

          <div className="flex-1">
            {activeTab === "overview" && (
              <div key="overview" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowAddListing(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Listing
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Listings</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.activeListings || 0}</p>
                        </div>
                        <Home className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Views</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.totalViews || 0}</p>
                        </div>
                        <Eye className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
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

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Average Rating</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.averageRating || 0}</p>
                        </div>
                        <Star className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.monthlyEarnings || 0} TND</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Response Rate</p>
                          <p className="text-2xl font-bold text-foreground">{analytics?.responseRate || 0}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading && <p>Loading recent activity...</p>}
                      {!loading && requests.slice(0, 3).map((request, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <MessageCircle className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-foreground">New request from {request.student_first_name} {request.student_last_name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      {!loading && myAnnouncements.slice(0, 3).map((announcement, index) => (
                        <div key={`announcement-${index}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <Bell className="w-5 h-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-foreground">Posted announcement: {announcement.title}</p>
                            <p className="text-xs text-muted-foreground">{new Date(announcement.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      {!loading && requests.length === 0 && myAnnouncements.length === 0 && (
                        <p className="text-muted-foreground">No recent activity.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "my-announcements" && (
              <div key="my-announcements" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">My Announcements</h1>
                  <Button className="bg-primary hover:bg-primary/90" asChild>
                    <Link href="/announcements">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Announcement
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loading && <p>Loading your announcements...</p>}
                  {!loading && myAnnouncements.length > 0 ? (
                    myAnnouncements.map((announcement) => {
                      return (
                        <Card key={announcement.id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-2">{announcement.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{announcement.content}</p>
                            <Badge variant="secondary" className="mb-3">{announcement.category}</Badge>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Posted: {new Date(announcement.created_at).toLocaleDateString()}</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                className="hover:scale-105 transition-transform duration-200"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No announcements posted yet</h3>
                      <p className="text-muted-foreground mb-4">Create an announcement to share with the community!</p>
                      <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href="/announcements"><Plus className="w-4 h-4 mr-2" /> Post Announcement</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "listings" && (
              <div key="listings" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowAddListing(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Listing
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {listings.map((listing) => {
                    return (
                      <Card key={listing.id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
                        <div className="relative">
                          <img
                            src={getListingImageUrl(listing.images)}
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
                            <span className="text-sm">{listing.city}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-2 bg-muted/30 rounded">
                              <p className="text-lg font-bold text-foreground">{listing.views || 0}</p>
                              <p className="text-xs text-muted-foreground">Views</p>
                            </div>
                            <div className="text-center p-2 bg-muted/30 rounded">
                              <p className="text-lg font-bold text-foreground">{listing.requests || 0}</p>
                              <p className="text-xs text-muted-foreground">Requests</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <span className="text-lg font-bold text-primary">{listing.price} TND/month</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">4.5</span>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mb-3">Posted {new Date(listing.created_at).toLocaleDateString()}</p>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handleEditListing(listing)}>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 bg-transparent" onClick={() => handleListingDelete(listing.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "requests" && (
              <div key="requests" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Student Requests</h1>
                  <Badge variant="secondary">{requests.length} total requests</Badge>
                </div>

                <div className="space-y-4">
                  {loading && <p>Loading requests...</p>}
                  {!loading && requests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={getAvatarDisplayUrl(request.student_avatar_url || undefined)} />
                            <AvatarFallback 
                              style={{ backgroundColor: request.student_id ? stringToColor(request.student_id) : '#9ca3af' }} 
                              className="text-white font-semibold"
                            >
                              {request.student_first_name?.[0]}{request.student_last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground">{request.student_first_name} {request.student_last_name}</h3>
                              </div>
                              <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                                {getStatusIcon(request.status)}
                                {request.status}
                              </Badge>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm font-medium text-foreground mb-1">For: {request.listing_title}</p>
                              <p className="text-xs text-muted-foreground">Sent {new Date(request.created_at).toLocaleDateString()}</p>
                            </div>

                            <div className="bg-muted/30 rounded-lg p-4 mb-4">
                              <p className="text-sm text-muted-foreground italic">
                                "{request.message.substring(0, 150)}..."
                              </p>
                            </div>

                            <div className="flex gap-2">
                              {request.status === "pending" && (
                                <>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAcceptRequest(request.id)}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Accept
                                  </Button>
                                  <Button size="sm" className="text-red-600 bg-transparent" onClick={() => handleDeclineRequest(request.id)}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Decline
                                  </Button>
                                </>
                              )}
                              <Button variant="outline" size="sm" onClick={() => handleMessageStudent(request.student_id, request.listing_id, request.student_first_name, request.student_last_name, request.student_avatar_url)}>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message
                              </Button>
                              <Link href={`/student/${request.student_id}`}>
                                <Button variant="outline" size="sm">
                                  View Profile
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "messages" && (
              <div key="messages" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">My Messages</h1>
                  {selectedConversation ? (
                    <Button variant="ghost" onClick={() => setSelectedConversation(null)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Conversations
                    </Button>
                  ) : (
                    <Badge variant="secondary">{conversations.length} conversations</Badge>
                  )}
                </div>

                {!selectedConversation ? (
                  <div className="space-y-4">
                    {loading && <p>Loading conversations...</p>}
                    {!loading && conversations.length === 0 && <p className="text-muted-foreground">No conversations found.</p>}
                    {!loading && conversations.map(conversation => (
                      <Card key={conversation.id} className="hover:shadow-lg transition-shadow duration-300 ease-in-out cursor-pointer"
                        onClick={() => {
                          setSelectedConversation(conversation);
                          // Set recipient and context IDs for message input
                          // These are used by handleSendMessage when replying within a selected conversation
                          // The conversation.participant.id is the 'other' person in the conversation
                          setMessageRecipientId(conversation.participant.id);
                          setMessageListingId(conversation.contextType === 'listing' ? conversation.contextId : null);
                          setMessageAnnouncementId(conversation.contextType === 'announcement' ? conversation.contextId : null);
                        }}>
                        <CardContent className="p-4 flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={getAvatarDisplayUrl(conversation.participant.avatar_url || undefined)} />
                            <AvatarFallback 
                              style={{ backgroundColor: conversation.participant.id ? stringToColor(conversation.participant.id) : '#9ca3af' }} 
                              className="text-white font-semibold"
                            >
                              {conversation.participant.first_name?.[0]}{conversation.participant.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-foreground">{conversation.participant.first_name} {conversation.participant.last_name}</h3>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-primary text-primary-foreground">{conversation.unreadCount} New</Badge>
                              )}
                            </div>
                            {conversation.contextTitle && (
                              <p className="text-xs text-muted-foreground mb-1">Regarding: <span className="font-medium">{conversation.contextTitle}</span></p>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-1">{conversation.lastMessage.content}</p>
                            <span className="text-xs text-muted-foreground mt-1 block text-right">{new Date(conversation.lastMessage.created_at).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={getAvatarDisplayUrl(selectedConversation.participant.avatar_url || undefined)} />
                            <AvatarFallback 
                              style={{ backgroundColor: selectedConversation.participant.id ? stringToColor(selectedConversation.participant.id) : '#9ca3af' }} 
                              className="text-white font-semibold"
                            >
                              {selectedConversation.participant.first_name?.[0]}{selectedConversation.participant.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{selectedConversation.participant.first_name} {selectedConversation.participant.last_name}</span>
                          {selectedConversation.contextTitle && (
                            <Badge variant="secondary" className="ml-2">
                              {selectedConversation.contextType === 'listing' ? (<Home className="w-3 h-3 mr-1" />) : (<Bell className="w-3 h-3 mr-1" />)}
                              {selectedConversation.contextTitle}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar p-4">
                        {selectedConversation.messages.map((message, index) => (
                          <div key={message.id || index} className={`flex gap-3 ${message.sender_id === advertiserProfile?.id ? 'justify-end' : 'justify-start'}`}>
                            {message.sender_id !== advertiserProfile?.id && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={getAvatarDisplayUrl(message.sender_avatar_url || undefined)} />
                                <AvatarFallback 
                                  style={{ backgroundColor: message.sender_id ? stringToColor(message.sender_id) : '#9ca3af' }} 
                                  className="text-white font-semibold"
                                >
                                  {message.sender_first_name?.[0]}{message.sender_last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`flex flex-col max-w-[70%] p-3 rounded-lg ${message.sender_id === advertiserProfile?.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                              <p className="text-sm">{message.content}</p>
                              <span className={`text-xs mt-1 ${message.sender_id === advertiserProfile?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                {new Date(message.created_at).toLocaleString()}
                              </span>
                            </div>
                            {message.sender_id === advertiserProfile?.id && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={getAvatarDisplayUrl(advertiserProfile.avatar_url || undefined)} />
                                <AvatarFallback 
                                  style={{ backgroundColor: advertiserProfile.email ? stringToColor(advertiserProfile.email) : '#9ca3af' }} 
                                  className="text-white font-semibold"
                                >
                                  {advertiserProfile.first_name?.[0]}{advertiserProfile.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <Textarea
                          placeholder="Type your message..."
                          rows={3}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="mb-3 resize-none"
                        />
                        <div className="flex justify-end">
                          <Button onClick={handleSendMessage} disabled={loading || !contactMessage.trim()}>
                            {loading ? "Sending..." : "Send Message"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div key="analytics" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
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
                                {listing.views || 0} views • {listing.requests || 0} requests
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
                          <span className="font-medium">{analytics?.totalViews || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Requests</span>
                          <span className="font-medium">{analytics?.totalRequests || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Response Rate</span>
                          <span className="font-medium">{analytics?.responseRate || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Average Rating</span>
                          <span className="font-medium">{analytics?.averageRating || 0}/5</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div key="profile" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
                  <Button variant="outline" onClick={() => setEditingProfile(!editingProfile)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    {editingProfile ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={getAvatarDisplayUrl(editedAvatarUrl)} />
                            <AvatarFallback 
                              style={{ backgroundColor: advertiserProfile?.email ? stringToColor(advertiserProfile.email) : '#9ca3af' }} 
                              className="text-white font-semibold"
                            >
                              {editedFirstName?.[0]}{editedLastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          {editingProfile && (
                            <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 w-8 h-8">
                              <Camera className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div>
                          <h2 className="font-semibold text-foreground">{editedFirstName} {editedLastName}</h2>
                          <p className="text-sm text-muted-foreground">
                            Member since {advertiserProfile?.created_at ? new Date(advertiserProfile.created_at).toLocaleDateString() : "N/A"}
                          </p>
                          {advertiserProfile?.status === 'active' && (
                            <Badge variant="secondary" className="mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            value={editedFirstName}
                            onChange={(e) => setEditedFirstName(e.target.value)}
                            disabled={!editingProfile}
                            className={editingProfile ? "" : "bg-muted"}
                          />
                        </div>
                        <div>
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            value={editedLastName}
                            onChange={(e) => setEditedLastName(e.target.value)}
                            disabled={!editingProfile}
                            className={editingProfile ? "" : "bg-muted"}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" value={advertiserProfile?.email || ""} disabled className="bg-muted" />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                            disabled={!editingProfile}
                            className={editingProfile ? "" : "bg-muted"}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            placeholder="Tell potential roommates about yourself..."
                            value={editedBio}
                            onChange={(e) => setEditedBio(e.target.value)}
                            rows={4}
                            disabled={!editingProfile}
                            className={editingProfile ? "" : "bg-muted"}
                          />
                        </div>
                       
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>About Me</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell potential roommates about yourself..."
                          value={editedBio}
                          onChange={(e) => setEditedBio(e.target.value)}
                          rows={4}
                          disabled={!editingProfile}
                          className={editingProfile ? "" : "bg-muted"}
                        />
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
                                disabled={!editingProfile} // Disable preferences when not editing
                              />
                              <Label htmlFor={`pref-${index}`} className="text-sm">
                                {pref}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {editingProfile && (
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Save Changes</Button>
                      )}
                    </CardContent>
                  </Card>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out opacity-0 animate-fade-in-modal">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 transition-all duration-300 ease-out animate-scale-in-modal">
            <CardHeader>
              <CardTitle>Add New Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddListing}>
                <div>
                  <Label htmlFor="title">Listing Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Modern Apartment in Tunis Center"
                    value={newListingForm.title}
                    onChange={(e) => setNewListingForm({ ...newListingForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Monthly Rent (TND)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="350"
                      value={newListingForm.price}
                      onChange={(e) => setNewListingForm({ ...newListingForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="roommates">Number of Roommates</Label>
                    <Select
                      value={newListingForm.number_of_roommates}
                      onValueChange={(value) =>
                        setNewListingForm({ ...newListingForm, number_of_roommates: value })
                      }
                      required
                    >
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
                  <Select
                    value={newListingForm.city}
                    onValueChange={(value) => setNewListingForm({ ...newListingForm, city: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tunis">Tunis</SelectItem>
                      <SelectItem value="sfax">Sfax</SelectItem>
                      <SelectItem value="sousse">Sousse</SelectItem>
                      <SelectItem value="monastir">Monastir</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your room/apartment, amenities, rules, etc."
                    rows={4}
                    value={newListingForm.description}
                    onChange={(e) => setNewListingForm({ ...newListingForm, description: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Photos</Label>
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => document.getElementById("imageUpload")?.click()}
                  >
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    {imagePreview ? (
                      <img src={imagePreview} alt="Image Preview" className="max-h-40 mx-auto mb-2 object-contain" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {imagePreview ? "Click to change photo" : "Click to upload photos or drag and drop"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddListing(false)} type="button">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? "Creating..." : "Create Listing"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {showEditListing && editingListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out opacity-0 animate-fade-in-modal">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 transition-all duration-300 ease-out animate-scale-in-modal">
            <CardHeader>
              <CardTitle>Edit Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleListingUpdate}>
                <div>
                  <Label htmlFor="editTitle">Listing Title</Label>
                  <Input
                    id="editTitle"
                    placeholder="e.g., Modern Apartment in Tunis Center"
                    defaultValue={editingListing.title}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editPrice">Monthly Rent (TND)</Label>
                    <Input
                      id="editPrice"
                      type="number"
                      placeholder="350"
                      defaultValue={editingListing.price}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editRoommates">Number of Roommates</Label>
                    <Select
                      defaultValue={String(editingListing.number_of_roommates)}
                      onValueChange={(value) => {
                        if (editingListing) {
                          setEditingListing({ ...editingListing, number_of_roommates: parseInt(value) });
                        }
                      }}
                    >
                      <SelectTrigger id="editRoommates">
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
                  <Label htmlFor="editLocation">Location</Label>
                  <Select
                    defaultValue={editingListing.city}
                    onValueChange={(value) => {
                      if (editingListing) {
                        setEditingListing({ ...editingListing, city: value });
                      }
                    }}
                  >
                    <SelectTrigger id="editLocation">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tunis">Tunis</SelectItem>
                      <SelectItem value="sfax">Sfax</SelectItem>
                      <SelectItem value="sousse">Sousse</SelectItem>
                      <SelectItem value="monastir">Monastir</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    placeholder="Describe your room/apartment, amenities, rules, etc."
                    rows={4}
                    defaultValue={editingListing.description}
                  />
                </div>

                <div>
                  <Label>Photos</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {editingListing.images && getListingImagesArray(editingListing.images).map((image: string, index: number) => (
                      <img key={index} src={image} alt="Listing Image" className="w-24 h-24 object-cover rounded" />
                    ))}
                  </div>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload new photos or drag and drop</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowEditListing(false)} type="button">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
