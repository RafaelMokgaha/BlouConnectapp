
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Post, Chat, Message, Comment, Contact, ChangelogItem } from '../types';
import { MOCK_POSTS, MOCK_CHATS, MOCK_USERS, MOCK_MESSAGES, mockChangelogs } from '../services/mockData';
import { uploadFile } from '../services/storage';

interface DataContextType {
  posts: Post[];
  chats: Chat[];
  contacts: Contact[];
  changelogs: ChangelogItem[];
  activeChatId: string | null;
  messages: Record<string, Message[]>; 
  addPost: (post: Partial<Post>, file?: File) => Promise<void>;
  likePost: (postId: string) => void;
  addComment: (postId: string, text: string) => Promise<void>;
  setActiveChat: (chatId: string | null) => void;
  sendMessage: (chatId: string, content: string, type: 'text' | 'image' | 'video' | 'audio', file?: File | Blob) => Promise<void>;
  getMessages: (chatId: string, currentUserId: string) => Message[];
  createChat: (participant: User) => Promise<string>; 
  findUserByPhone: (phone: string) => Promise<User | null>;
  searchUsers: (query: string) => Promise<User[]>;
  getContactUser: (contactId: string) => User | null;
  deleteMessages: (chatId: string, messageIds: string[], forEveryone: boolean, currentUserId: string) => void;
  deleteChat: (chatId: string, currentUserId: string, forEveryone?: boolean) => void;
  clearChat: (chatId: string, currentUserId: string, forEveryone: boolean) => void;
  setChatWallpaper: (chatId: string, wallpaper: string) => void;
  sendSupportMessage: (text: string) => Promise<void>;
  refreshData: () => void;
  uploadFile: (file: File | Blob) => Promise<string | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode; currentUser: User | null }> = ({ children, currentUser }) => {
  // Initialize state from LocalStorage if available, otherwise use (empty) Mock Data
  const [posts, setPosts] = useState<Post[]>(() => {
      const saved = localStorage.getItem('blou_posts');
      return saved ? JSON.parse(saved) : MOCK_POSTS;
  });

  const [chats, setChats] = useState<Chat[]>(() => {
      const saved = localStorage.getItem('blou_chats');
      return saved ? JSON.parse(saved) : MOCK_CHATS;
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
      const saved = localStorage.getItem('blou_messages');
      return saved ? JSON.parse(saved) : MOCK_MESSAGES;
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [changelogs] = useState<ChangelogItem[]>(mockChangelogs);

  // Persistence Effects
  useEffect(() => {
      localStorage.setItem('blou_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
      localStorage.setItem('blou_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
      localStorage.setItem('blou_messages', JSON.stringify(messages));
  }, [messages]);


  // --- HELPERS ---
  const getAllUsers = (): User[] => {
      const registryStr = localStorage.getItem('blou_users_registry');
      const localUsers: User[] = registryStr ? JSON.parse(registryStr) : [];
      // Combine MOCK_USERS (if any exist in future) with Local Registry
      // Use Map to deduplicate by ID just in case
      const userMap = new Map<string, User>();
      [...MOCK_USERS, ...localUsers].forEach(u => userMap.set(u.id, u));
      return Array.from(userMap.values());
  };


  // --- ACTIONS ---

  const addPost = async (postData: Partial<Post>, file?: File) => {
    if (!currentUser) return;
    
    let mediaUrl = postData.mediaUrl;

    if (file) {
      const uploadedUrl = await uploadFile(file, 'media', `posts/${currentUser.id}/${Date.now()}`);
      if (uploadedUrl) mediaUrl = uploadedUrl;
    }

    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      village: postData.village || currentUser.village,
      content: postData.content || '',
      mediaUrl: mediaUrl,
      mediaType: postData.mediaType,
      category: postData.category,
      likes: 0,
      views: 0,
      comments: 0,
      commentsList: [],
      timestamp: Date.now()
    };

    setPosts(prev => [newPost, ...prev]);
  };

  const likePost = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const addComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      text: text,
      timestamp: Date.now()
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments + 1,
          commentsList: [...(p.commentsList || []), newComment]
        };
      }
      return p;
    }));
  };

  const sendMessage = async (chatId: string, content: string, type: 'text' | 'image' | 'video' | 'audio', file?: File | Blob) => {
    if (!currentUser) return;
    
    let finalContent = content;

    if (file && type !== 'text') {
       const uploadedUrl = await uploadFile(file, 'media');
       if (uploadedUrl) finalContent = uploadedUrl;
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      content: finalContent,
      type: type,
      timestamp: Date.now(),
      status: 'sent'
    };
    
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage]
    }));

    // Update chat list last message and move to top
    setChats(prev => {
        const updated = prev.map(c => {
            if (c.id === chatId) {
                return { ...c, lastMessage: newMessage };
            }
            return c;
        });
        return updated.sort((a,b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
    });
  };

  const getMessages = (chatId: string, currentUserId: string) => {
    return messages[chatId] || [];
  };

  const createChat = async (participant: User) => {
      if (!currentUser) return "";
      
      const existing = chats.find(c => c.type === 'private' && c.participants.some(p => p.id === participant.id));
      if (existing) return existing.id;

      const newChat: Chat = {
        id: `chat_${Date.now()}`,
        type: 'private',
        participants: [currentUser, participant],
        unreadCount: 0
      };

      setChats(prev => [newChat, ...prev]);
      return newChat.id;
  };

  const findUserByPhone = async (phone: string): Promise<User | null> => {
     const allUsers = getAllUsers();
     return allUsers.find(u => u.phoneNumber === phone) || null;
  };

  const searchUsers = async (query: string): Promise<User[]> => {
    if (!query) return [];
    const allUsers = getAllUsers();
    // Simple dedupe and filter
    return allUsers.filter(u => 
        u.id !== currentUser?.id && 
        u.fullName.toLowerCase().includes(query.toLowerCase())
    );
  };

  const deleteMessages = async (chatId: string, messageIds: string[], forEveryone: boolean, currentUserId: string) => {
      setMessages(prev => {
        const chatMsgs = prev[chatId] || [];
        const updatedMsgs = chatMsgs.map(m => {
          if (messageIds.includes(m.id)) {
             if (forEveryone) {
               return { ...m, deletedForEveryone: true };
             } else {
               // In a real app we'd filter it out for the user specifically, 
               // here we'll just mock it by filtering it out of the view state temporarily/permanently for this session
               return null; 
             }
          }
          return m;
        }).filter(Boolean) as Message[]; // Remove nulls
        
        return { ...prev, [chatId]: updatedMsgs };
      });
  };

  const deleteChat = (chatId: string, currentUserId: string, forEveryone: boolean = false) => {
      setChats(prev => prev.filter(c => c.id !== chatId));
  };

  const clearChat = (chatId: string, currentUserId: string, forEveryone: boolean) => {
      setMessages(prev => ({ ...prev, [chatId]: [] }));
  };

  const setChatWallpaper = (chatId: string, wallpaper: string) => {
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, wallpaper } : c));
  };

  // Helper Wrappers
  const helperUploadFile = async (file: File | Blob) => {
      return await uploadFile(file, 'media');
  }

  const getContactUser = (contactId: string) => null;
  const sendSupportMessage = async (text: string) => {
    console.log("Support message sent:", text);
    await new Promise(r => setTimeout(r, 1000));
  };
  const refreshData = () => { };

  return (
    <DataContext.Provider value={{ 
      posts, chats, contacts, activeChatId, changelogs, messages,
      addPost, likePost, addComment,
      setActiveChat: setActiveChatId, sendMessage, getMessages, createChat, findUserByPhone, searchUsers, getContactUser,
      deleteMessages, deleteChat, clearChat, setChatWallpaper, sendSupportMessage, refreshData, uploadFile: helperUploadFile
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
