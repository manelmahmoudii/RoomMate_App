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
import { toast } from 'react-hot-toast'; // Import toast
import {
  Users,
  Heart,
  MessageCircle,
  Settings,
  Search,
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
  Plus,
  Mail, // Import Mail icon
  ArrowLeft, // Import ArrowLeft icon
  Home,
  MapPin, // Import Home icon
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

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
    maxRoommates?: number;
    furnished?: boolean;
    wifi?: boolean;
    parking?: boolean;
    age?: number;
  };
}

interface SavedListing {
  favorite_id: string;
  listing_id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  images: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  number_of_roommates: number; // Added for student view
  amenities: string; // Added for student view (JSON string)
}

interface SentRequest {
  request_id: string;
  listing_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  listing_title: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_id: string; // Added owner_id
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

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  listing_id: string | null;
  announcement_id?: string | null; // Added announcement_id
  is_read: boolean;
  created_at: string;
  sender_first_name: string;
  sender_last_name: string;
  sender_avatar_url: string;
  listing_title: string | null;
  listing_city: string | null;
  announcement_title?: string | null; // New: Title of the associated announcement
  receiver_first_name: string; // Added
  receiver_last_name: string; // Added
  receiver_avatar_url: string; // Added
}

interface ConversationParticipant {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

interface Conversation {
  id: string; // Unique ID for the conversation (e.g., recipientId-listingId-announcementId)
  participant: ConversationParticipant;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
  contextType: 'listing' | 'announcement' | 'general';
  contextTitle: string | null;
  contextId: string | null;
}

// Helper function to generate a consistent color from a string
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
    return undefined; // Return undefined so AvatarImage doesn't render, allowing AvatarFallback to show
  }
  return avatarUrl;
};

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProfile, setEditingProfile] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<SentRequest | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [targetListingId, setTargetListingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageRecipientId, setMessageRecipientId] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState<string>("");
  const [messageListingId, setMessageListingId] = useState<string | null>(null);
  const [messageAnnouncementId, setMessageAnnouncementId] = useState<string | null>(null);
  const [messageRecipientFirstName, setMessageRecipientFirstName] = useState<string>("");
  const [messageRecipientLastName, setMessageRecipientLastName] = useState<string>("");
  const [messageRecipientAvatarUrl, setMessageRecipientAvatarUrl] = useState<string>("/placeholder.svg");
  const [allListings, setAllListings] = useState<SavedListing[]>([]);
  const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([]);
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedUniversity, setEditedUniversity] = useState("");
  const [editedStudyLevel, setEditedStudyLevel] = useState("");
  const [editedPreferences, setEditedPreferences] = useState<StudentProfile["preferences"]>({});
  const [editedAvatarUrl, setEditedAvatarUrl] = useState<string | null>(null);

  const router = useRouter();

  const groupMessagesByConversation = useCallback((allMessages: Message[], currentUserId?: string | null): Conversation[] => {
    if (!currentUserId || allMessages.length === 0) return []; // Return empty array if no messages

    const conversationsMap = new Map<string, Conversation>();

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
          unreadCount: message.is_read ? 0 : 1,
          messages: [message],
          // For a general conversation, contextType and contextTitle can be initially null or general
          contextType: 'general',
          contextTitle: null,
          contextId: null,
        });
      } else {
        const conversation = conversationsMap.get(conversationKey)!;
        conversation.messages.push(message);
        // Always update the last message to the most recent one
        if (new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
          conversation.lastMessage = message;
        }
        if (!message.is_read && message.recipient_id === currentUserId) {
          conversation.unreadCount++;
        }
      }
    });

    // Sort messages within each conversation by created_at
    conversationsMap.forEach(conv => {
      conv.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      // After sorting, update the conversation's context based on its *latest* message
      const latestMessage = conv.messages[conv.messages.length - 1];
      if (latestMessage.listing_id) {
        conv.contextType = 'listing';
        conv.contextId = latestMessage.listing_id;
        conv.contextTitle = latestMessage.listing_title || `Listing ${latestMessage.listing_id}`;
      } else if (latestMessage.announcement_id) {
        conv.contextType = 'announcement';
        conv.contextId = latestMessage.announcement_id;
        conv.contextTitle = latestMessage.announcement_title || `Announcement ${latestMessage.announcement_id}`;
      } else {
        conv.contextType = 'general';
        conv.contextTitle = null;
        conv.contextId = null;
      }
    });

    // Sort conversations by last message date
    return Array.from(conversationsMap.values()).sort((a, b) => 
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
  }, [studentProfile, allListings, myAnnouncements]); // Depend on studentProfile, allListings, and myAnnouncements

  const fetchStudentProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(router, "/api/profile");
      if (response.ok) {
        const data = await response.json();
        console.log("Student Profile Data:", data); // Log profile data
        setStudentProfile(data);
        setEditedFirstName(data.first_name || "");
        setEditedLastName(data.last_name || "");
        setEditedPhone(data.phone || "");
        setEditedBio(data.bio || "");
        setEditedUniversity(data.university || "");
        setEditedStudyLevel(data.study_level || "");
        setEditedPreferences(data.preferences || {});
        setEditedAvatarUrl(data.avatar_url || null);
      } else {
        console.error("Failed to fetch student profile:", response.status);
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchSavedListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/student/favorites");
      if (response.ok) {
        const data = await response.json();
        console.log("Student Saved Listings Data:", data); // Log saved listings data
        setSavedListings(data);
      } else {
        console.error("Failed to fetch saved listings:", response.status);
      }
    } catch (error) {
      console.error("Error fetching saved listings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSentRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/student/requests");
      if (response.ok) {
        const data = await response.json();
        console.log("Student Sent Requests Data:", data); // Log sent requests data
        setSentRequests(data);
      } else {
        console.error("Failed to fetch sent requests:", response.status);
      }
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/listings"); // Public endpoint to get all listings
      if (response.ok) {
        const data = await response.json();
        console.log("All Listings Data (for recommendations):", data); // Log all listings data
        // Filter out active listings and limit to a few for recommendations
        setAllListings(data.filter((l: any) => l.status === 'active').slice(0, 4)); 
      } else {
        console.error("Failed to fetch all listings:", response.status);
      }
    } catch (error) {
      console.error("Error fetching all listings:", error);
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
        console.log("Student Announcements Data:", data); // Log announcements data
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
    setLoading(true);
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data: Message[] = await response.json();
        console.log("RAW Messages from API (Student Dashboard):", data); // Debug log
        setMessages(data); // Store all messages in a single state
        // Group messages into conversations here
        const grouped = groupMessagesByConversation(data, studentProfile?.id);
        console.log("Grouped Conversations (Student Dashboard):", grouped); // Debug log
        setConversations(grouped);

        // If the currently selected conversation no longer exists in the grouped list, deselect it
        if (selectedConversation && !grouped.some(conv => conv.id === selectedConversation.id)) {
          setSelectedConversation(null);
        }
      } else {
        console.error("Failed to fetch messages:", response.status);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [studentProfile?.id, groupMessagesByConversation]); // Depend on studentProfile.id and groupMessagesByConversation

  // New function to refresh all messages
  const refreshMessages = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDeleteAnnouncement = useCallback(async (announcementId: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Announcement deleted successfully!");
        fetchMyAnnouncements(); // Refresh the list
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

  const handleToggleFavorite = useCallback(async (listingId: string) => {
    try {
      const response = await fetch("/api/student/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (response.ok) {
        const { message, favorited } = await response.json();
        toast.success(message);
        if (favorited) {
          // If favorited, add the listing to savedListings (optimistic update)
          const listingToAdd = allListings.find(l => l.listing_id === listingId);
          if (listingToAdd) {
            setSavedListings(prev => [...prev, { ...listingToAdd, favorite_id: "temp-fav-id" }]); // Add a temporary favorite_id
          }
        } else {
          // If unfavorited, remove the listing from savedListings (optimistic update)
          setSavedListings(prev => prev.filter(sl => sl.listing_id !== listingId));
        }
      } else {
        console.error("Failed to toggle favorite:", response.status);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }, [allListings]);

  const handleSendRequest = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetListingId || !requestMessage) return;

    setLoading(true);
    try {
      const response = await fetch("/api/student/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: targetListingId, message: requestMessage }),
      });
      if (response.ok) {
        toast.success("Request sent successfully!");
        setShowRequestModal(false);
        setRequestMessage("");
        setTargetListingId(null);
        fetchSentRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send request.");
        console.error("Failed to send request:", response.status, errorData.error);
      }
    } catch (error) {
      toast.error("Error sending request.");
      console.error("Error sending request:", error);
    } finally {
      setLoading(false);
    }
  }, [targetListingId, requestMessage, fetchSentRequests]);

  const handleEditRequest = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest || !requestMessage) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/student/requests/${editingRequest.request_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: requestMessage }),
      });
      if (response.ok) {
        toast.success("Request updated successfully!");
        setShowRequestModal(false);
        setRequestMessage("");
        setEditingRequest(null);
        fetchSentRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update request.");
        console.error("Failed to update request:", response.status, errorData.error);
      }
    } catch (error) {
      toast.error("Error updating request.");
      console.error("Error updating request:", error);
    } finally {
      setLoading(false);
    }
  }, [editingRequest, requestMessage, fetchSentRequests]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentProfile?.id || !messageRecipientId || !contactMessage.trim()) {
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
          message: contactMessage,
          listingId: messageListingId,
          announcementId: messageAnnouncementId || (selectedConversation?.contextType === 'announcement' ? selectedConversation.contextId : null),
        }),
      });
      if (response.ok) {
        toast.success("Message sent successfully!");
        setContactMessage("");
        refreshMessages(); // Refresh all messages to ensure UI is up-to-date with DB
        // No need to reset recipient/context IDs here; they remain for the selected conversation
        // setMessageRecipientId(null);
        // setMessageListingId(null);
        // setMessageAnnouncementId(null);
        
        // Optimistically update the UI with the new message
        if (studentProfile && selectedConversation) {
          const newMessage: Message = {
            id: `temp-${Date.now()}`, // Temporary ID for optimistic update
            sender_id: studentProfile.id,
            recipient_id: messageRecipientId,
            content: contactMessage,
            listing_id: messageListingId,
            announcement_id: selectedConversation.contextType === 'announcement' ? selectedConversation.contextId : null,
            is_read: true, // Sent messages are considered read by sender
            created_at: new Date().toISOString(),
            sender_first_name: studentProfile.first_name || "",
            sender_last_name: studentProfile.last_name || "",
            sender_avatar_url: studentProfile.avatar_url || "/placeholder.svg",
            listing_title: selectedConversation.contextType === 'listing' ? selectedConversation.contextTitle : null,
            listing_city: null, // We don't have this easily on frontend
            announcement_title: selectedConversation.contextType === 'announcement' ? selectedConversation.contextTitle : null,
            receiver_first_name: messageRecipientFirstName,
            receiver_last_name: messageRecipientLastName,
            receiver_avatar_url: messageRecipientAvatarUrl,
          };

          // Update the main messages state with the new message
          setMessages(prevMessages => [...prevMessages, newMessage]);

          // Update the conversations state to reflect the new message and move conversation to top
          setConversations(prevConversations => {
            const updatedConversations = prevConversations.map(conv => {
              if (conv.id === selectedConversation.id) {
                return {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  lastMessage: newMessage, // Update last message to the new one
                  unreadCount: 0, // Clear unread count for this conversation as we just sent a message
                };
              }
              return conv;
            });
            const conversationToMove = updatedConversations.find(conv => conv.id === selectedConversation.id);
            if (conversationToMove) {
              // Move the updated conversation to the beginning of the array
              return [conversationToMove, ...updatedConversations.filter(conv => conv.id !== selectedConversation.id)];
            }
            return updatedConversations;
          });
          // Update selected conversation as well for immediate display
          setSelectedConversation(prevSelected => prevSelected ? 
            { 
              ...prevSelected, 
              messages: [...prevSelected.messages, newMessage], 
              lastMessage: newMessage 
            } : null);
        } else {
          // If for some reason selectedConversation is not available, re-fetch all messages
          refreshMessages(); // Call refreshMessages here
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send message.");
        console.error("Failed to send message:", response.status, errorData.error);
      }
    } catch (error) {
      toast.error("Error sending message.");
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchMessages, selectedConversation, studentProfile, messageAnnouncementId, messageRecipientId, contactMessage, messageListingId, conversations, messageRecipientFirstName, messageRecipientLastName, messageRecipientAvatarUrl, refreshMessages]); // Added conversations to dependencies for setConversations

  const openRequestModalForNew = (listingId: string) => {
    setEditingRequest(null);
    setRequestMessage("");
    setTargetListingId(listingId);
    setShowRequestModal(true);
  };

  const openRequestModalForEdit = (request: SentRequest) => {
    setEditingRequest(request);
    setRequestMessage(request.message);
    setTargetListingId(request.listing_id);
    setShowRequestModal(true);
  };

  const openMessageModal = useCallback(
    (
      recipientId: string,
      listingId: string | null = null,
      announcementId: string | null = null,
      recipientFirstName: string = "",
      recipientLastName: string = "",
      recipientAvatarUrl: string = "/placeholder.svg"
    ) => {
      setMessageRecipientId(recipientId);
      setMessageListingId(listingId);
      setMessageAnnouncementId(announcementId);
      setContactMessage("");
      setActiveTab("messages");
      setMessageRecipientFirstName(recipientFirstName);
      setMessageRecipientLastName(recipientLastName);
      setMessageRecipientAvatarUrl(recipientAvatarUrl);

      // If opening from a specific listing/announcement context, pre-select the conversation
      if (listingId) {
        const existingConversation = conversations.find(conv => 
          conv.contextType === 'listing' && conv.contextId === listingId && conv.participant.id === recipientId
        );
        if (existingConversation) {
          setSelectedConversation(existingConversation);
        } else if (studentProfile) {
          const listing = allListings.find(l => l.listing_id === listingId);
          const newConversationId = `L-${listingId}-${recipientId}`;
          setSelectedConversation({
            id: newConversationId, 
            participant: {
              id: recipientId,
              first_name: recipientFirstName || "",
              last_name: recipientLastName || "",
              avatar_url: recipientAvatarUrl || "/placeholder.svg", // Assuming listing might have owner_avatar_url
            },
            lastMessage: { id: '', sender_id: studentProfile.id, recipient_id: recipientId, content: '', is_read: false, created_at: '', sender_first_name: studentProfile.first_name || "", sender_last_name: studentProfile.last_name || "", sender_avatar_url: studentProfile.avatar_url || "/placeholder.svg", listing_title: listing?.title || `Listing ${listingId}`, listing_city: listing?.city || null, listing_id: listingId, announcement_id: null, receiver_first_name: recipientFirstName, receiver_last_name: recipientLastName, receiver_avatar_url: recipientAvatarUrl },
            unreadCount: 0,
            messages: [],
            contextType: 'listing',
            contextTitle: listing?.title || `Listing ${listingId}`,
            contextId: listingId,
          });
        }
      } else if (announcementId) {
        const existingConversation = conversations.find(conv => 
          conv.contextType === 'announcement' && conv.contextId === announcementId && conv.participant.id === recipientId
        );
        if (existingConversation) {
          setSelectedConversation(existingConversation);
        } else if (studentProfile) {
          const announcement = myAnnouncements.find(a => a.id === announcementId);
          const newConversationId = `A-${announcementId}-${recipientId}`;
          setSelectedConversation({
            id: newConversationId, 
            participant: {
              id: recipientId,
              first_name: recipientFirstName || "",
              last_name: recipientLastName || "",
              avatar_url: recipientAvatarUrl || "/placeholder.svg",
            },
            lastMessage: { id: '', sender_id: studentProfile.id, recipient_id: recipientId, content: '', is_read: false, created_at: '', sender_first_name: studentProfile.first_name || "", sender_last_name: studentProfile.last_name || "", sender_avatar_url: studentProfile.avatar_url || "/placeholder.svg", listing_title: null, listing_city: null, listing_id: null, announcement_id: announcementId, announcement_title: announcement?.title, receiver_first_name: recipientFirstName, receiver_last_name: recipientLastName, receiver_avatar_url: recipientAvatarUrl },
            unreadCount: 0,
            messages: [],
            contextType: 'announcement',
            contextTitle: announcement?.title || `Announcement ${announcementId}`,
            contextId: announcementId,
          });
        }
      } else if (studentProfile) {
        // General message without specific listing/announcement context
        const existingConversation = conversations.find(conv => 
          conv.contextType === 'general' && conv.participant.id === recipientId
        );
        if (existingConversation) {
          setSelectedConversation(existingConversation);
        } else {
          const newConversationId = `G-${recipientId}`;
          setSelectedConversation({
            id: newConversationId, 
            participant: {
              id: recipientId,
              first_name: recipientFirstName,
              last_name: recipientLastName,
              avatar_url: recipientAvatarUrl,
            },
            lastMessage: { id: '', sender_id: studentProfile.id, recipient_id: recipientId, content: '', is_read: false, created_at: '', sender_first_name: studentProfile.first_name || "", sender_last_name: studentProfile.last_name || "", sender_avatar_url: studentProfile.avatar_url || "/placeholder.svg", listing_title: null, listing_city: null, listing_id: null, announcement_id: null, receiver_first_name: recipientFirstName, receiver_last_name: recipientLastName, receiver_avatar_url: recipientAvatarUrl },
            unreadCount: 0,
            messages: [],
            contextType: 'general',
            contextTitle: null,
            contextId: null,
          });
        }
      }
    }, [conversations, studentProfile, allListings, myAnnouncements]); // Cleaned up dependencies

  useEffect(() => {
    fetchStudentProfile();
    fetchSavedListings();
    fetchSentRequests();
    fetchAllListings(); // Fetch all listings on mount
    fetchMyAnnouncements(); // Fetch my announcements on mount
  }, [fetchStudentProfile, fetchSavedListings, fetchSentRequests, fetchAllListings, fetchMyAnnouncements]); // Removed fetchMessages from initial useEffect to avoid infinite loop with conversations

  // Fetch messages when studentProfile is available
  useEffect(() => {
    if (studentProfile?.id) {
      fetchMessages();
    }
  }, [studentProfile?.id]); // Removed fetchMessages from dependencies

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "active":
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
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "active":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getListingImageUrl = (images: string | null) => {
    if (!images) return "/placeholder.svg";

    try {
      // Attempt to parse as JSON array
      const imageUrls = JSON.parse(images);
      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        return imageUrls[0];
      }
    } catch (e) {
      // If parsing fails, it's likely a direct URL string, so use it as is
      // console.error("Error parsing images (may be direct URL):", e);
    }
    
    // If not a valid JSON array, treat it as a direct image URL
    return images; 
  };

  const getParsedAmenities = (amenitiesInput: string | string[] | null) => {
    if (!amenitiesInput) return [];

    // If it's already an array, return it directly
    if (Array.isArray(amenitiesInput)) {
      return amenitiesInput;
    }

    // Convert to string defensively before any string operations
    const amenitiesString = String(amenitiesInput);

    try {
      const amenities = JSON.parse(amenitiesString);
      return Array.isArray(amenities) ? amenities : [];
    } catch (e) {
      console.error("Error parsing amenities JSON string:", amenitiesString, e);
      return [];
    }
  };

  const handleProfileUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentProfile?.id) {
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
          university: editedUniversity,
          study_level: editedStudyLevel,
          preferences: editedPreferences,
          avatar_url: editedAvatarUrl || undefined, // Only send if it's not null/undefined
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setStudentProfile(updatedData);
        setEditedFirstName(updatedData.first_name || "");
        setEditedLastName(updatedData.last_name || "");
        setEditedPhone(updatedData.phone || "");
        setEditedBio(updatedData.bio || "");
        setEditedUniversity(updatedData.university || "");
        setEditedStudyLevel(updatedData.study_level || "");
        setEditedPreferences(updatedData.preferences || {});
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
  }, [studentProfile?.id, editedFirstName, editedLastName, editedPhone, editedBio, editedUniversity, editedStudyLevel, editedPreferences, editedAvatarUrl, router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={getAvatarDisplayUrl(editedAvatarUrl)} />
                      <AvatarFallback 
                        style={{ backgroundColor: studentProfile?.email ? stringToColor(studentProfile.email) : '#9ca3af' }} 
                        className="text-white font-semibold"
                      >
                        {editedFirstName?.[0]}{editedLastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {studentProfile?.status === 'active' && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{editedFirstName} {editedLastName}</h2>
                    <p className="text-sm text-muted-foreground">{editedStudyLevel || studentProfile?.user_type}</p>
                    <p className="text-xs text-muted-foreground">{editedUniversity}</p>
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
                    variant={activeTab === "my-announcements" ? "default" : "ghost"} // New tab for My Announcements
                    className="w-full justify-start"
                    onClick={() => setActiveTab("my-announcements")}
                  >
                    <Bell className="w-4 h-4 mr-3" />
                    My Announcements
                  </Button>
                  <Button
                    variant={activeTab === "messages" ? "default" : "ghost"} // New tab for Messages
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab("messages");
                      setSelectedConversation(null); // Deselect conversation when navigating to messages tab
                    }}
                  >
                    <Mail className="w-4 h-4 mr-3" />
                    Messages
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
              <div key="overview" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
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
                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
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

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
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

                  <Card className="group hover:shadow-lg transition-shadow duration-300 ease-in-out">
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
                        <Input placeholder="Max Budget (TND)" type="number" className="flex-1" />
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
                      {loading && <p>Loading recent activity...</p>}
                      {!loading && sentRequests.slice(0, 3).map((request, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-sm text-foreground">Sent request for {request.listing_title} to {request.owner_first_name} {request.owner_last_name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      {!loading && myAnnouncements.slice(0, 3).map((announcement, index) => (
                        <div key={`announcement-${index}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <Bell className="w-5 h-5 text-purple-500" /> {/* Using Bell icon for announcements */}
                          <div>
                            <p className="text-sm text-foreground">Posted announcement: {announcement.title}</p>
                            <p className="text-xs text-muted-foreground">{new Date(announcement.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      {!loading && sentRequests.length === 0 && myAnnouncements.length === 0 && (
                        <p className="text-muted-foreground">No recent activity.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Saved Listings Tab */}
            {activeTab === "saved" && (
              <div key="saved" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
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
                  {loading && <p>Loading saved listings...</p>}
                  {!loading && savedListings.length > 0 ? (savedListings.map((listing) => {
                    console.log("Saved Listing images string for student dashboard:", listing.images);
                    console.log("Saved Listing amenities string for student dashboard:", listing.amenities);
                    return (
                    <Card key={listing.listing_id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
                      <div className="relative">
                        <img
                          src={getListingImageUrl(listing.images)}
                          alt={listing.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                          onClick={() => handleToggleFavorite(listing.listing_id)}
                        >
                          <Heart className={`w-4 h-4 ${savedListings.some(sl => sl.listing_id === listing.listing_id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                        </Button>
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
                        <div className="flex items-center text-muted-foreground mb-2">
                          <Users className="w-4 h-4 mr-1" />
                          <span className="text-sm">{listing.number_of_roommates} Roommate(s)</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {getParsedAmenities(listing.amenities).map((amenity: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-primary">{listing.price} TND/month</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">4.5</span>{/* Placeholder for rating */}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Added to favorites</p>
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
                            <Link href={`/listings/${listing.listing_id}`}>View Details</Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openRequestModalForNew(listing.listing_id)}>
                            <Plus className="w-4 h-4 mr-2" /> Send Request
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    );
                  })) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-lg text-muted-foreground mb-4">No saved listings found.</p>
                      <p className="text-md text-muted-foreground mb-8">Explore available rooms and add them to your favorites!</p>
                      <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href="/search">Find Rooms Now</Link>
                      </Button>

                    
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* My Announcements Tab */}
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
                      const images = getListingImageUrl(announcement.images || "[]"); // Reusing getListingImageUrl for consistency
                      return (
                        <Card key={announcement.id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
                          <div className="relative">
                            {/* Removed: Image display for announcements */}
                          </div>
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

            {/* Requests Tab */}
            {activeTab === "requests" && (
              <div key="requests" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">My Requests</h1>
                  <Badge variant="secondary">{sentRequests.length} total requests</Badge>
                </div>

                <div className="space-y-4">
                  {loading && <p>Loading requests...</p>}
                  {!loading && sentRequests.map((request) => {
                    const ownerId = studentProfile?.id; // Assuming studentProfile is available and has an ID
                    return (
                    <Card key={request.request_id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">{request.listing_title}</h3>
                            <p className="text-sm text-muted-foreground">To: {request.owner_first_name} {request.owner_last_name}</p>
                            <p className="text-xs text-muted-foreground">Sent {new Date(request.created_at).toLocaleDateString()}</p>
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
                          <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
                            <Link href={`/listings/${request.listing_id}`}>View Listing</Link>
                          </Button>
                          {request.status === "pending" && (
                            <Button variant="outline" size="sm" onClick={() => openRequestModalForEdit(request)}>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Request
                            </Button>
                          )}
                          {request.status === "accepted" && ownerId && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => openMessageModal(
                              ownerId,
                              request.listing_id,
                              null, // announcementId
                              request.owner_first_name,
                              request.owner_last_name,
                              "/placeholder.svg" // Placeholder for owner_avatar_url as it's not in SentRequest
                            )}>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Contact Owner
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )})}
                </div>
              </div>
            )}

            {/* Profile Settings Tab */}
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
                  {/* Personal Information */}
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
                              style={{ backgroundColor: studentProfile?.email ? stringToColor(studentProfile.email) : '#9ca3af' }} 
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
                          <h3 className="font-semibold text-foreground">{editedFirstName} {editedLastName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Member since {studentProfile?.created_at ? new Date(studentProfile.created_at).toLocaleDateString() : "N/A"}
                          </p>
                          {studentProfile?.status === 'active' && (
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
                          <Input
                            id="email"
                            value={studentProfile?.email || ""}
                            disabled={true} // Email should not be editable
                            className="bg-muted"
                          />
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
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="age">Age</Label>
                            <Input
                              id="age"
                              type="number"
                              value={editedPreferences?.age || ""}
                              onChange={(e) => setEditedPreferences({ ...editedPreferences, age: Number(e.target.value) })}
                              disabled={!editingProfile}
                              className={editingProfile ? "" : "bg-muted"}
                            />
                          </div>
                          <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                              value={editedPreferences?.gender}
                              onValueChange={(value) => setEditedPreferences({ ...editedPreferences, gender: value })}
                              disabled={!editingProfile}
                            >
                              <SelectTrigger className={editingProfile ? "" : "bg-muted"}>
                                <SelectValue placeholder="Select" />
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
                          <Select
                            value={editedUniversity}
                            onValueChange={setEditedUniversity}
                            disabled={!editingProfile}
                          >
                            <SelectTrigger className={editingProfile ? "" : "bg-muted"}>
                              <SelectValue placeholder="Select your university" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="University of Tunis">University of Tunis</SelectItem>
                              <SelectItem value="University of Sfax">University of Sfax</SelectItem>
                              <SelectItem value="University of Sousse">University of Sousse</SelectItem>
                              <SelectItem value="University of Monastir">University of Monastir</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="study_level">Study Level</Label>
                          <Input
                            id="study_level"
                            value={editedStudyLevel}
                            onChange={(e) => setEditedStudyLevel(e.target.value)}
                            disabled={!editingProfile}
                            className={editingProfile ? "" : "bg-muted"}
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio">About Me</Label>
                          <Textarea
                            id="bio"
                            value={editedBio}
                            onChange={(e) => setEditedBio(e.target.value)}
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
                          value={editedPreferences?.budget || ""}
                          onChange={(e) => setEditedPreferences({ ...editedPreferences, budget: Number(e.target.value) })}
                          disabled={!editingProfile}
                          className={editingProfile ? "" : "bg-muted"}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxRoommates">Max Roommates</Label>
                        <Select
                          value={String(editedPreferences?.maxRoommates || "")}
                          onValueChange={(value) => setEditedPreferences({ ...editedPreferences, maxRoommates: Number(value) })}
                          disabled={!editingProfile}
                        >
                          <SelectTrigger className={editingProfile ? "" : "bg-muted"}>
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

                      <div className="space-y-3">
                        <Label>Required Amenities</Label>
                        <div className="space-y-2">
                          {[
                            { key: "furnished", label: "Furnished", checked: editedPreferences?.furnished, onToggle: (checked: boolean) => setEditedPreferences({ ...editedPreferences, furnished: checked }) },
                            { key: "wifi", label: "WiFi", checked: editedPreferences?.wifi, onToggle: (checked: boolean) => setEditedPreferences({ ...editedPreferences, wifi: checked }) },
                            { key: "parking", label: "Parking", checked: editedPreferences?.parking, onToggle: (checked: boolean) => setEditedPreferences({ ...editedPreferences, parking: checked }) },
                          ].map((amenity) => (
                            <div key={amenity.key} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={amenity.key}
                                checked={amenity.checked}
                                onChange={(e) => amenity.onToggle(e.target.checked)}
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
                          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>Save Changes</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </form>
              </div>
            )}

            {/* Messages Tab (New) */}
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
                  // Conversation List View
                  <div className="space-y-4">
                    {loading && <p>Loading conversations...</p>}
                    {!loading && conversations.length === 0 && <p className="text-muted-foreground">No conversations found.</p>}
                    {!loading && conversations.map(conversation => (
                      <Card key={conversation.id} className="hover:shadow-lg transition-shadow duration-300 ease-in-out cursor-pointer"
                        onClick={() => {
                          setSelectedConversation(conversation);
                          setMessageRecipientId(conversation.participant.id);
                          // Set context for sending messages
                          setMessageListingId(conversation.contextType === 'listing' ? conversation.contextId : null);
                          setMessageAnnouncementId(conversation.contextType === 'announcement' ? conversation.contextId : null);
                          setMessageRecipientFirstName(conversation.participant.first_name);
                          setMessageRecipientLastName(conversation.participant.last_name);
                          setMessageRecipientAvatarUrl(conversation.participant.avatar_url);
                        }}>
                        <CardContent className="p-4 flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={getAvatarDisplayUrl(conversation.participant.avatar_url)} />
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
                  // Selected Conversation Detail View
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={getAvatarDisplayUrl(selectedConversation.participant.avatar_url)} />
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
                          <div key={message.id || index} className={`flex gap-3 ${message.sender_id === studentProfile?.id ? 'justify-end' : 'justify-start'}`}>
                            {message.sender_id !== studentProfile?.id && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={getAvatarDisplayUrl(message.sender_avatar_url)} />
                                <AvatarFallback 
                                  style={{ backgroundColor: message.sender_id ? stringToColor(message.sender_id) : '#9ca3af' }} 
                                  className="text-white font-semibold"
                                >
                                  {message.sender_first_name?.[0]}{message.sender_last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`flex flex-col max-w-[70%] p-3 rounded-lg ${message.sender_id === studentProfile?.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                              <p className="text-sm">{message.content}</p>
                              <span className={`text-xs mt-1 ${message.sender_id === studentProfile?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                {new Date(message.created_at).toLocaleString()}
                              </span>
                            </div>
                            {message.sender_id === studentProfile?.id && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={getAvatarDisplayUrl(studentProfile.avatar_url)} />
                                <AvatarFallback 
                                  style={{ backgroundColor: studentProfile.email ? stringToColor(studentProfile.email) : '#9ca3af' }} 
                                  className="text-white font-semibold"
                                >
                                  {studentProfile.first_name?.[0]}{studentProfile.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Message Input for selected conversation */}
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
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (targetListingId || editingRequest) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out opacity-0 animate-fade-in-modal">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-95 transition-all duration-300 ease-out animate-scale-in-modal">
            <CardHeader>
              <CardTitle>{editingRequest ? "Edit Roommate Request" : "Send Roommate Request"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={editingRequest ? handleEditRequest : handleSendRequest}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="listingTitle">Listing</Label>
                    <Input
                      id="listingTitle"
                      value={editingRequest?.listing_title || "Listing ID: " + targetListingId}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea
                      id="message"
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
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
                    onClick={() => setShowRequestModal(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? (
                      <>Sending...</>
                    ) : editingRequest ? (
                      <>Save Changes</>
                    ) : (
                      <>Send Request</>
                    )}
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
