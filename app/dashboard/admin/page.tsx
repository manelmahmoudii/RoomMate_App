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
  Bell,
  Mail,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  avatar_url: string | null;
  created_at: string;
  status: 'active' | 'suspended';
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
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  student_first_name: string;
  last_name: string;
  listing_title: string;
}

interface Announcement {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  city: string | null;
  price: number | null;
  contact_info: string;
  created_at: string;
  first_name: string;
  last_name: string;
  university: string | null;
  avatar_url: string | null;
  images: string | null;
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
  sender_avatar_url: string | null;
  listing_title: string | null;
  listing_city: string | null;
  announcement_title?: string | null;
}

interface ConversationParticipant {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
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

interface Stats {
  totalUsers: number;
  activeListings: number;
  pendingListings: number;
  newUsersThisMonth: number;
  averageRating: number;
  flaggedContent: number;
  responseRate?: number;
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

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  userType: 'student' | 'advertiser' | 'admin';
  setUserType: (type: 'student' | 'advertiser' | 'admin') => void;
  onAddUser: () => void;
  loading: boolean;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  userType,
  setUserType,
  onAddUser,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg p-6 space-y-4 bg-background shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="new-first-name">First Name</Label>
            <Input
              id="new-first-name"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-last-name">Last Name</Label>
            <Input
              id="new-last-name"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-email">Email</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-password">Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-user-type">User Type</Label>
            <Select value={userType} onValueChange={(value: 'student' | 'advertiser' | 'admin') => setUserType(value)}>
              <SelectTrigger id="new-user-type">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="advertiser">Advertiser</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={onAddUser} disabled={loading || !firstName || !lastName || !email || !password || !userType}>
              {loading ? "Adding..." : "Add User"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); // Declared setMessages
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageRecipientId, setMessageRecipientId] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState<string>("");
  const [messageContextId, setMessageContextId] = useState<string | null>(null);
  const [messageContextType, setMessageContextType] = useState<'listing' | 'announcement' | 'general'>('general');
  const [messageRecipientFirstName, setMessageRecipientFirstName] = useState<string>("");
  const [messageRecipientLastName, setMessageRecipientLastName] = useState<string>("");
  const [messageRecipientAvatarUrl, setMessageRecipientAvatarUrl] = useState<string | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false); // New state for Add User modal
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUserType, setNewUserType] = useState<'student' | 'advertiser' | 'admin'>('student');

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
      if (statusFilter !== "all") params.append("status", statusFilter);

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

  const fetchAllAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/announcements");
      if (response.ok) {
        const data = await response.json();
        setAllAnnouncements(data);
      } else {
        console.error("Failed to fetch all announcements:", response.status);
      }
    } catch (error) {
      console.error("Error fetching all announcements:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdminProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setAdminProfile(data);
      } else {
        console.error("Failed to fetch admin profile:", response.status);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvatarDisplayUrl = (url: string | null | undefined) => url === null || url === undefined ? undefined : url;

  const groupMessagesByConversation = (allMessages: Message[], currentUserId: string, allListings: Listing[], allAnnouncements: Announcement[]): Conversation[] => {
    const conversationsMap = new Map<string, Conversation>();

    allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    allMessages.forEach(message => {
      const otherParticipantId = message.sender_id === currentUserId ? message.recipient_id : message.sender_id;
      const conversationKey = otherParticipantId;

      if (!conversationsMap.has(conversationKey)) {
        const participantFirstName = message.sender_id === currentUserId && adminProfile?.first_name 
          ? adminProfile.first_name 
          : message.sender_first_name || "";
        const participantLastName = message.sender_id === currentUserId && adminProfile?.last_name 
          ? adminProfile.last_name 
          : message.sender_last_name || "";
        const participantAvatarUrl = message.sender_id === currentUserId && adminProfile?.avatar_url 
          ? adminProfile.avatar_url 
          : message.sender_avatar_url || null;

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
      conversation.lastMessage = message; // Always update last message
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

    return Array.from(conversationsMap.values()).sort((a, b) => 
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
  };

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data: Message[] = await response.json();
        setMessages(data);
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
  }, [setMessages]); // Only depends on setMessages

  const handleSendMessage = useCallback(async () => {
    if (!adminProfile?.id || !messageRecipientId || !contactMessage.trim()) {
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
          listingId: messageContextType === 'listing' ? messageContextId : null,
          announcementId: messageContextType === 'announcement' ? messageContextId : null,
        }),
      });

      if (response.ok) {
        toast.success("Message sent successfully!");
        setContactMessage("");
        setMessageRecipientId(null);
        setMessageContextId(null);
        setMessageContextType('general');

        if (adminProfile && selectedConversation) {
          const newMessage: Message = {
            id: `temp-${Date.now()}`,
            sender_id: adminProfile.id,
            recipient_id: messageRecipientId,
            content: contactMessage,
            listing_id: selectedConversation.contextType === 'listing' ? selectedConversation.contextId : null,
            announcement_id: selectedConversation.contextType === 'announcement' ? selectedConversation.contextId : null,
            is_read: true,
            created_at: new Date().toISOString(),
            sender_first_name: adminProfile.first_name || "",
            sender_last_name: adminProfile.last_name || "",
            sender_avatar_url: adminProfile.avatar_url || null,
            listing_title: selectedConversation.contextType === 'listing' ? selectedConversation.contextTitle : null,
            listing_city: selectedConversation.contextType === 'listing' ? selectedConversation.lastMessage.listing_city : null,
            announcement_title: selectedConversation.contextType === 'announcement' ? selectedConversation.contextTitle : null,
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
          fetchMessages();
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
  }, [adminProfile, messageRecipientId, contactMessage, messageContextId, messageContextType, fetchMessages, selectedConversation, conversations]);

  const handleOpenMessageModal = useCallback((recipientId: string, listingId: string | null = null, announcementId: string | null = null, recipientFirstName: string = "", recipientLastName: string = "", recipientAvatarUrl: string | null = null) => {
    setMessageRecipientId(recipientId);
    setMessageContextId(listingId || announcementId || null);
    setMessageContextType(listingId ? 'listing' : (announcementId ? 'announcement' : 'general'));
    setContactMessage("");
    setActiveTab("messages"); 
    setMessageRecipientFirstName(recipientFirstName);
    setMessageRecipientLastName(recipientLastName);
    setMessageRecipientAvatarUrl(recipientAvatarUrl);

    const existingConversation = conversations.find(conv => conv.participant.id === recipientId);

    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else if (adminProfile) {
      const newConversation: Conversation = {
        id: recipientId,
        participant: {
          id: recipientId,
          first_name: recipientFirstName,
          last_name: recipientLastName,
          avatar_url: recipientAvatarUrl,
        },
        lastMessage: { 
          id: `new-temp-${Date.now()}`,
          sender_id: adminProfile.id,
          recipient_id: recipientId,
          content: "",
          listing_id: listingId,
          announcement_id: announcementId,
          is_read: false,
          created_at: new Date().toISOString(),
          sender_first_name: adminProfile.first_name || "",
          sender_last_name: adminProfile.last_name || "",
          sender_avatar_url: adminProfile.avatar_url || null,
          listing_title: listingId ? (listings.find(l => l.id === listingId)?.title || `Listing ${listingId}`) : null,
          listing_city: listingId ? (listings.find(l => l.id === listingId)?.city || null) : null,
          announcement_title: announcementId ? (allAnnouncements.find(a => a.id === announcementId)?.title || `Announcement ${announcementId}`) : null,
        },
        unreadCount: 0,
        messages: [],
        contextType: listingId ? 'listing' : (announcementId ? 'announcement' : 'general'),
        contextTitle: listingId ? (listings.find(l => l.id === listingId)?.title || `Listing ${listingId}`) : (announcementId ? (allAnnouncements.find(a => a.id === announcementId)?.title || `Announcement ${announcementId}`) : null),
        contextId: listingId || announcementId || null,
      };
      setSelectedConversation(newConversation);
      setConversations(prev => [newConversation, ...prev]);
    }
  }, [conversations, adminProfile, listings, allAnnouncements]);

  const handleMessageUser = useCallback((userId: string, userFirstName: string, userLastName: string, userAvatarUrl: string | null | undefined) => {
    // Ensure userAvatarUrl is explicitly string | null before passing to handleOpenMessageModal
    const avatarToPass = userAvatarUrl === undefined ? null : userAvatarUrl;
    handleOpenMessageModal(userId, null, null, userFirstName, userLastName, avatarToPass);
  }, [handleOpenMessageModal]);

  const handleAddUser = useCallback(async () => {
    if (!newFirstName || !newLastName || !newEmail || !newPassword || !newUserType) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: newFirstName,
          last_name: newLastName,
          email: newEmail,
          password: newPassword,
          user_type: newUserType,
        }),
      });

      if (response.ok) {
        toast.success("User added successfully!");
        setIsAddUserModalOpen(false);
        setNewFirstName("");
        setNewLastName("");
        setNewEmail("");
        setNewPassword("");
        setNewUserType('student');
        fetchUsers(); // Refresh the user list
      } else {
        const errorData = await response.json();
        toast.error(`Failed to add user: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("An error occurred while adding the user.");
    } finally {
      setLoading(false);
    }
  }, [newFirstName, newLastName, newEmail, newPassword, newUserType, fetchUsers]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchListings();
    fetchReports();
    fetchAllAnnouncements();
    fetchAdminProfile();
    fetchMessages();
  }, [selectedTimeRange, userTypeFilter, userStatusFilter, selectedListingStatusFilter, selectedReportStatusFilter, fetchStats, fetchUsers, fetchListings, fetchReports, fetchAllAnnouncements, fetchAdminProfile, fetchMessages]);

  useEffect(() => {
    if (adminProfile?.id && messages.length > 0) {
      const grouped = groupMessagesByConversation(messages, adminProfile.id, listings, allAnnouncements);
      setConversations(grouped);
      if (selectedConversation) {
        const updatedSelected = grouped.find(conv => conv.id === selectedConversation.id);
        setSelectedConversation(updatedSelected || null);
      }
    }
  }, [messages, adminProfile?.id, listings, allAnnouncements, selectedConversation]);

  const getListingImageUrl = (images: string | null) => {
    if (!images) return "/placeholder.svg";

    try {
      const imageUrls = JSON.parse(images);
      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        return imageUrls[0];
      }
    } catch (e) {
      // console.error("Error parsing images (may be direct URL):", e);
    }
    return images;
  };

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
      case "rejected":
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

  const getAnnouncementImages = (imagesString: string | null) => {
    if (!imagesString) return [];
    try {
      const images = JSON.parse(imagesString);
      return Array.isArray(images) ? images : [];
    } catch (e) {
      console.error("Error parsing announcement images JSON string:", imagesString, e);
      return [];
    }
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
        toast.success(`User ${action}d successfully.`);
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to ${action} user: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`An error occurred while ${action}ing the user.`);
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
        toast.success(`Listing ${action}d successfully.`);
        fetchListings();
        fetchStats();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to ${action} listing: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing listing:`, error);
      toast.error(`An error occurred while ${action}ing the listing.`);
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
        toast.success(`Report ${action}d successfully.`);
        fetchReports();
        fetchStats();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to ${action} report: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      toast.error(`An error occurred while ${action}ing the report.`);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Announcement deleted successfully.");
        fetchAllAnnouncements();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete announcement: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`Error deleting announcement:`, error);
      toast.error(`An error occurred while deleting the announcement.`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={getAvatarDisplayUrl(adminProfile?.avatar_url)} />
                    <AvatarFallback 
                      style={{ backgroundColor: adminProfile?.email ? stringToColor(adminProfile.email) : '#9ca3af' }} 
                      className="text-white font-semibold"
                    >
                      {`${adminProfile?.first_name?.[0] || ''}${adminProfile?.last_name?.[0] || ''}`}
                    </AvatarFallback>
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
                    variant={activeTab === "announcements" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("announcements")}
                  >
                    <Bell className="w-4 h-4 mr-3" />
                    Announcements Moderation
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

            {/* Announcements Moderation Tab */}
            {activeTab === "announcements" && (
              <div key="announcements" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <h1 className="text-3xl font-bold text-foreground">Announcements Moderation</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading && <p>Loading announcements...</p>}
                  {!loading && allAnnouncements.length > 0 ? (
                    allAnnouncements.map((announcement) => (
                      <Card key={announcement.id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
                        <div className="relative">
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
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No announcements to moderate</h3>
                      <p className="text-muted-foreground mb-4">All announcements are currently in order.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div key="users" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                  <Button onClick={() => setIsAddUserModalOpen(true)}>Add New User</Button>
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
                  {!loading && users.map((user) => {
                    return (
                    <Card key={user.id} className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={getAvatarDisplayUrl(user.avatar_url)} />
                              <AvatarFallback 
                                style={{ backgroundColor: user.email ? stringToColor(user.email) : '#9ca3af' }} 
                                className="text-white font-semibold"
                              >
                                {`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
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
                              {/* Explicitly cast user.avatar_url to string | null to satisfy linter */}
                              <Button variant="outline" size="sm" onClick={() => {
                                const avatar = user.avatar_url as string | null;
                                handleMessageUser(user.id, user.first_name, user.last_name, avatar);
                              }}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message
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
                  )})}
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
                  {!loading && listings.map((listing) => {
                    return (
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
                  )})}
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
                            <p className="text-sm text-muted-foreground">Reported by {report.student_first_name} {report.last_name}</p>
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

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div key="messages" className="space-y-6 transition-opacity duration-300 ease-in-out opacity-0 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Messages</h1>
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
                    {!loading && conversations.map(conversation => {
                      return (
                      <Card key={conversation.id} className="hover:shadow-lg transition-shadow duration-300 ease-in-out cursor-pointer"
                        onClick={() => setSelectedConversation(conversation)}>
                        <CardContent className="p-4 flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={getAvatarDisplayUrl(conversation.participant.avatar_url)} />
                            <AvatarFallback 
                              style={{ backgroundColor: conversation.participant.id ? stringToColor(conversation.participant.id) : '#9ca3af' }} 
                              className="text-white font-semibold"
                            >
                              {`${conversation.participant.first_name?.[0] || ''}${conversation.participant.last_name?.[0] || ''}`}
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
                      )})}
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
                              {`${selectedConversation.participant.first_name?.[0] || ''}${selectedConversation.participant.last_name?.[0] || ''}`}
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
                        {selectedConversation.messages.map((message, index) => {
                          return (
                          <div key={message.id || index} className={`flex gap-3 ${message.sender_id === adminProfile?.id ? 'justify-end' : 'justify-start'}`}>
                            {message.sender_id !== adminProfile?.id && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={getAvatarDisplayUrl(message.sender_avatar_url)} />
                                <AvatarFallback 
                                  style={{ backgroundColor: message.sender_id ? stringToColor(message.sender_id) : '#9ca3af' }} 
                                  className="text-white font-semibold"
                                >
                                  {`${message.sender_first_name?.[0] || ''}${message.sender_last_name?.[0] || ''}`}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`flex flex-col max-w-[70%] p-3 rounded-lg ${message.sender_id === adminProfile?.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                              <p className="text-sm">{message.content}</p>
                              <span className={`text-xs mt-1 ${message.sender_id === adminProfile?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                {new Date(message.created_at).toLocaleString()}
                              </span>
                            </div>
                            {message.sender_id === adminProfile?.id && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={getAvatarDisplayUrl(adminProfile.avatar_url)} />
                                <AvatarFallback 
                                  style={{ backgroundColor: adminProfile.email ? stringToColor(adminProfile.email) : '#9ca3af' }} 
                                  className="text-white font-semibold"
                                >
                                  {`${adminProfile.first_name?.[0] || ''}${adminProfile.last_name?.[0] || ''}`}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          )})}
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
                          <span className="text-sm text-green-600">New This Month</span>
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
                          <span className="text-sm text-yellow-600">Pending Approval</span>
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
                          <span className="text-sm text-red-600">Active Reports</span>
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
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        firstName={newFirstName}
        setFirstName={setNewFirstName}
        lastName={newLastName}
        setLastName={setNewLastName}
        email={newEmail}
        setEmail={setNewEmail}
        password={newPassword}
        setPassword={setNewPassword}
        userType={newUserType}
        setUserType={setNewUserType}
        onAddUser={handleAddUser}
        loading={loading}
      />
    </div>
  )
}
