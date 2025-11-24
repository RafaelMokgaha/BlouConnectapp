export enum ViewState {
  SPLASH = 'SPLASH',
  AUTH = 'AUTH',
  HOME = 'HOME',
  DISCOVERY = 'DISCOVERY',
  CHAT_LIST = 'CHAT_LIST',
  CHAT_ROOM = 'CHAT_ROOM',
  PROFILE = 'PROFILE',
  CREATE_POST = 'CREATE_POST',
  EDIT_PROFILE = 'EDIT_PROFILE'
}

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  village: string;
  profilePicture?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorVillage: string;
  authorAvatar?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  village: string;
  timestamp: number;
  likes: number;
  comments: number;
}

export interface Message {
  id: string;
  senderId: string;
  content: string; // text content or url for media
  type: 'text' | 'image' | 'video' | 'voice';
  timestamp: number;
  duration?: number; // for voice notes
}

export interface Chat {
  id: string;
  type: 'private' | 'community';
  participants: string[]; // User IDs
  name: string; // User name or Group name
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  village?: string; // For community chats
  isOnline?: boolean;
  isTyping?: boolean;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  village: string;
  count: number;
}