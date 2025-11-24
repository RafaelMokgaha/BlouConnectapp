import { User, Post, Chat, Message, TrendingTopic } from '../types';
import { VILLAGES, MOCK_USER_AVATARS, APP_NAME } from '../constants';

const STORAGE_KEYS = {
  USER: `${APP_NAME}_USER`,
  POSTS: `${APP_NAME}_POSTS`,
  CHATS: `${APP_NAME}_CHATS`,
  DARK_MODE: `${APP_NAME}_DARK_MODE`
};

// Initial Mock Data Generators
const generateMockPosts = (userVillage: string): Post[] => {
  return [
    {
      id: 'p1',
      authorId: 'u2',
      authorName: 'Thabo Mokoena',
      authorVillage: userVillage,
      authorAvatar: MOCK_USER_AVATARS[0],
      content: `Community meeting at the ${userVillage} hall this Saturday at 10 AM. Please attend!`,
      village: userVillage,
      timestamp: Date.now() - 3600000,
      likes: 12,
      comments: 4
    },
    {
      id: 'p2',
      authorId: 'u3',
      authorName: 'Sarah Nkosi',
      authorVillage: 'Senwabarwana',
      authorAvatar: MOCK_USER_AVATARS[1],
      content: 'Look at the beautiful sunset today!',
      mediaUrl: 'https://picsum.photos/id/1015/600/400',
      mediaType: 'image',
      village: 'Senwabarwana',
      timestamp: Date.now() - 7200000,
      likes: 45,
      comments: 10
    },
    {
      id: 'p3',
      authorId: 'u4',
      authorName: 'David Lee',
      authorVillage: userVillage,
      authorAvatar: MOCK_USER_AVATARS[2],
      content: 'Does anyone know if the clinic is open tomorrow?',
      village: userVillage,
      timestamp: Date.now() - 86400000,
      likes: 2,
      comments: 8
    }
  ];
};

const generateMockChats = (userVillage: string): Chat[] => {
  return [
    {
      id: 'c1',
      type: 'community',
      participants: ['u1', 'u2', 'u3'],
      name: `${userVillage} General`,
      village: userVillage,
      unreadCount: 3,
      lastMessage: {
        id: 'm1',
        senderId: 'u2',
        content: 'See you all there!',
        type: 'text',
        timestamp: Date.now() - 120000
      }
    },
    {
      id: 'c2',
      type: 'private',
      participants: ['u1', 'u3'],
      name: 'Sarah Nkosi',
      avatar: MOCK_USER_AVATARS[1],
      unreadCount: 0,
      isOnline: true,
      lastMessage: {
        id: 'm2',
        senderId: 'u1',
        content: 'Thanks for the info.',
        type: 'text',
        timestamp: Date.now() - 3600000
      }
    }
  ];
};

// API Surface
export const MockBackend = {
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  login: async (phoneNumber: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true; // Always succeeds for demo
  },

  verifyOtp: async (otp: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return otp.length === 4;
  },

  registerUser: async (details: Omit<User, 'id'>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = { ...details, id: 'u1' }; // u1 is always current user
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    
    // Seed initial data if empty
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(generateMockPosts(details.village)));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(generateMockChats(details.village)));
    }
    
    return newUser;
  },

  updateUser: async (user: User): Promise<User> => {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return user;
  },

  getPosts: async (village?: string): Promise<Post[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const allPosts: Post[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    if (village) {
      return allPosts.filter(p => p.village === village).sort((a, b) => b.timestamp - a.timestamp);
    }
    return allPosts.sort((a, b) => b.timestamp - a.timestamp);
  },

  createPost: async (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>): Promise<Post> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newPost: Post = {
      ...post,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      likes: 0,
      comments: 0
    };
    const currentPosts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([newPost, ...currentPosts]));
    return newPost;
  },

  getChats: async (): Promise<Chat[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '[]');
  },

  getMessages: async (chatId: string): Promise<Message[]> => {
    // In a real app, messages would be stored separately. 
    // Here we generate some dummy history if it doesn't exist or return empty
    return [
        { id: 'msg1', senderId: 'u2', content: 'Hello!', type: 'text', timestamp: Date.now() - 1000000 },
        { id: 'msg2', senderId: 'u1', content: 'Hi there, how are you?', type: 'text', timestamp: Date.now() - 900000 },
    ];
  },

  sendMessage: async (chatId: string, content: string, type: Message['type'], duration?: number): Promise<Message> => {
     await new Promise(resolve => setTimeout(resolve, 200));
     const newMsg: Message = {
         id: Math.random().toString(36).substr(2, 9),
         senderId: 'u1',
         content,
         type,
         timestamp: Date.now(),
         duration
     };
     
     // Update chat last message (in a real DB this is a transaction)
     const chats: Chat[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '[]');
     const chatIndex = chats.findIndex(c => c.id === chatId);
     if (chatIndex > -1) {
         chats[chatIndex].lastMessage = newMsg;
         chats[chatIndex].unreadCount = 0;
         // Move to top
         const updatedChat = chats.splice(chatIndex, 1)[0];
         chats.unshift(updatedChat);
         localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
     }

     return newMsg;
  },

  getTrending: async (): Promise<TrendingTopic[]> => {
      // Mock trending algorithm
      return [
          { id: 't1', topic: 'Water Supply', village: 'Senwabarwana', count: 124 },
          { id: 't2', topic: 'Soccer Match', village: 'Bochum', count: 89 },
          { id: 't3', topic: 'School Bus', village: 'Indermark', count: 56 },
          { id: 't4', topic: 'New Road', village: 'Blouberg', count: 42 },
      ];
  }
};