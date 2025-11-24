
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Compass, User, AlertTriangle } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();
  const isChatRoom = location.pathname.startsWith('/chat/');

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text overflow-hidden">
      
      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto no-scrollbar pb-20 ${isChatRoom ? 'pb-0' : ''}`}>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {!isChatRoom && (
        <nav className="fixed bottom-0 w-full bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-2 shadow-lg z-50">
          <div className="flex justify-between items-center max-w-md mx-auto px-4">
            <NavItem to="/" icon={<Home size={22} />} label="Home" />
            <NavItem to="/discover" icon={<Compass size={22} />} label="Discover" />
            <NavItem to="/emergency" icon={<AlertTriangle size={22} />} label="Emergency" />
            <NavItem to="/chats" icon={<MessageCircle size={22} />} label="Chats" />
            <NavItem to="/profile" icon={<User size={22} />} label="Me" />
          </div>
        </nav>
      )}
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[3.5rem] ${
        isActive 
          ? 'text-primary-600 dark:text-primary-400 font-semibold' 
          : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
      }`
    }
  >
    {icon}
    <span className="text-[10px] mt-1">{label}</span>
  </NavLink>
);

export default Layout;
