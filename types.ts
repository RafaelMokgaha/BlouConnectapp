
export interface ProfileViewer {
  userId: string;
  timestamp: number;
}

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  village: string;
  avatarUrl: string;
  bannerUrl?: string; 
  bio?: string; 
  followers?: number; 
  following?: number; 
  isOnline: boolean;
  lastSeen: number;
  blockedUsers: string[]; // IDs of blocked users
  profileViewers: ProfileViewer[]; // List of users who viewed profile with timestamp
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  user: User; 
  village: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  category?: 'general' | 'sports' | 'event' | 'funeral'; 
  likes: number;
  views: number;
  comments: number;
  commentsList?: Comment[];
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string;
  content: string; 
  type: 'text' | 'image' | 'video' | 'audio';
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  deletedForEveryone?: boolean;
  deletedFor?: string[]; // IDs of users who deleted this message for themselves
}

export interface Chat {
  id: string;
  type: 'private' | 'community';
  participants: User[]; 
  village?: string; 
  lastMessage?: Message;
  name?: string; 
  avatarUrl?: string;
  unreadCount: number;
  wallpaper?: string; // Hex color or image URL
  deletedFor?: string[]; // IDs of users who deleted this chat
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'message';
  content: string;
  read: boolean;
  timestamp: number;
}

export interface ThemeState {
  mode: 'light' | 'dark';
  toggle: () => void;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  hasAccount: boolean;
}

export interface ChangelogItem {
  id: string;
  version: string;
  date: string;
  changes: string[];
}
