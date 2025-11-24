import React, { useState, useEffect } from 'react';
import { ViewState, User } from './types';
import { MockBackend } from './services/mockBackend';
import { Home, Compass, MessageSquare, User as UserIcon } from 'lucide-react';
import Auth from './components/Auth';
import Feed from './components/Feed';
import Chats from './components/Chats';
import Discovery from './components/Discovery';
import Profile from './components/Profile';
import PostCreator from './components/PostCreator';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.SPLASH);
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPostCreatorOpen, setIsPostCreatorOpen] = useState(false);

  // Initialize
  useEffect(() => {
    // Check Dark Mode
    const savedTheme = localStorage.getItem('BlouConnect_DARK_MODE');
    if (savedTheme === 'true' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Check Auth
    const storedUser = MockBackend.getUser();
    setTimeout(() => {
      if (storedUser) {
        setUser(storedUser);
        setView(ViewState.HOME);
      } else {
        setView(ViewState.AUTH);
      }
    }, 1500); // Fake Splash Screen duration
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('BlouConnect_DARK_MODE', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('BlouConnect_DARK_MODE', 'false');
    }
  };

  const handleLogin = (u: User) => {
    setUser(u);
    setView(ViewState.HOME);
  };

  const handleLogout = () => {
    localStorage.removeItem('BlouConnect_USER');
    setUser(null);
    setView(ViewState.AUTH);
  };

  // Bottom Navigation Component
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 flex justify-between items-center z-40 shadow-lg">
      <button 
        onClick={() => setView(ViewState.HOME)}
        className={`flex flex-col items-center gap-1 p-2 ${view === ViewState.HOME ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`}
      >
        <Home className={`w-6 h-6 ${view === ViewState.HOME ? 'fill-current' : ''}`} />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button 
        onClick={() => setView(ViewState.DISCOVERY)}
        className={`flex flex-col items-center gap-1 p-2 ${view === ViewState.DISCOVERY ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`}
      >
        <Compass className={`w-6 h-6 ${view === ViewState.DISCOVERY ? 'fill-current' : ''}`} />
        <span className="text-[10px] font-medium">Explore</span>
      </button>

      <button 
        onClick={() => setView(ViewState.CHAT_LIST)}
        className={`flex flex-col items-center gap-1 p-2 ${view === ViewState.CHAT_LIST ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`}
      >
        <MessageSquare className={`w-6 h-6 ${view === ViewState.CHAT_LIST ? 'fill-current' : ''}`} />
        <span className="text-[10px] font-medium">Chat</span>
      </button>

      <button 
        onClick={() => setView(ViewState.PROFILE)}
        className={`flex flex-col items-center gap-1 p-2 ${view === ViewState.PROFILE ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`}
      >
        <UserIcon className={`w-6 h-6 ${view === ViewState.PROFILE ? 'fill-current' : ''}`} />
        <span className="text-[10px] font-medium">Me</span>
      </button>
    </div>
  );

  // Splash Screen
  if (view === ViewState.SPLASH) {
    return (
      <div className="min-h-screen bg-primary-500 flex flex-col items-center justify-center animate-pulse">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
          <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-wide">BlouConnect</h1>
      </div>
    );
  }

  // Auth Screen
  if (view === ViewState.AUTH) {
    return <Auth onLogin={handleLogin} />;
  }

  // Main App Logic
  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-screen transition-colors duration-300">
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-white dark:bg-dark-bg overflow-hidden">
        
        {view === ViewState.HOME && user && (
          <Feed user={user} onPostClick={() => setIsPostCreatorOpen(true)} />
        )}
        
        {view === ViewState.DISCOVERY && user && (
          <Discovery user={user} onPostClick={() => setIsPostCreatorOpen(true)} />
        )}
        
        {view === ViewState.CHAT_LIST && user && (
          <Chats user={user} />
        )}
        
        {view === ViewState.PROFILE && user && (
          <Profile user={user} onLogout={handleLogout} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        )}

        <BottomNav />

        {isPostCreatorOpen && user && (
          <PostCreator 
            user={user} 
            onClose={() => setIsPostCreatorOpen(false)} 
            onPostCreated={() => setIsPostCreatorOpen(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default App;