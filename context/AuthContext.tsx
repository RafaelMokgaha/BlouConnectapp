
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signup: (details: any) => Promise<void>;
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (details: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on start
  useEffect(() => {
    const savedUser = localStorage.getItem('blou_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const saveUserToRegistry = (userData: User) => {
      const existingStr = localStorage.getItem('blou_users_registry');
      const users: User[] = existingStr ? JSON.parse(existingStr) : [];
      
      const index = users.findIndex(u => u.id === userData.id);
      if (index >= 0) {
        users[index] = userData;
      } else {
        users.push(userData);
      }
      localStorage.setItem('blou_users_registry', JSON.stringify(users));
  };

  const saveUserSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem('blou_user', JSON.stringify(userData));
    saveUserToRegistry(userData);
  };

  const signup = async (details: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newUser: User = {
      id: `user_${Date.now()}`,
      fullName: details.fullName,
      phoneNumber: details.phoneNumber,
      village: details.village,
      dateOfBirth: details.dateOfBirth,
      avatarUrl: details.avatarUrl || "https://picsum.photos/200",
      isOnline: true,
      lastSeen: Date.now(),
      bio: "Hey there! I am using BlouConnect.",
      blockedUsers: [],
      profileViewers: [],
      followers: 0,
      following: 0
    };

    saveUserSession(newUser);
  };

  const login = async (phoneNumber: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check Mock Data First (empty now)
    let existingUser = MOCK_USERS.find(u => u.phoneNumber === phoneNumber);
    
    // Check Local Registry
    if (!existingUser) {
        const registryStr = localStorage.getItem('blou_users_registry');
        if (registryStr) {
            const registry: User[] = JSON.parse(registryStr);
            existingUser = registry.find(u => u.phoneNumber === phoneNumber);
        }
    }

    if (existingUser) {
      saveUserSession(existingUser);
    } else {
       // Allow "login" for any number in this disconnected demo acting as a dynamic signup
       const tempUser: User = {
         id: `user_${Date.now()}`,
         fullName: "User " + phoneNumber.slice(-4),
         phoneNumber: phoneNumber,
         village: "Blouberg",
         dateOfBirth: "2000-01-01",
         avatarUrl: `https://picsum.photos/seed/${phoneNumber}/200`,
         isOnline: true,
         lastSeen: Date.now(),
         blockedUsers: [],
         profileViewers: [],
         bio: "New Account"
       };
       saveUserSession(tempUser);
    }
  };

  const updateProfile = (details: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...details };
    saveUserSession(updated);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('blou_user');
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-primary-600">
         <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
         <p className="font-medium animate-pulse">Loading BlouConnect...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
