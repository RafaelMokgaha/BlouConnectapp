import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, X, MessageSquare, Trash2, CheckSquare, Square, Edit, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { User } from '../types';

const ChatList: React.FC = () => {
  const { chats, createChat, deleteChat, searchUsers } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchChat, setSearchChat] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState<User[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  
  // Edit/Selection Mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  
  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(async () => {
      if (searchUserQuery.trim()) {
        setIsSearchingUsers(true);
        const results = await searchUsers(searchUserQuery);
        // Filter out self
        setFoundUsers(results.filter(u => u.id !== user?.id));
        setIsSearchingUsers(false);
      } else {
        setFoundUsers([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchUserQuery, searchUsers, user]);

  const handleChatClick = (id: string) => {
    if (isEditMode) {
        toggleChatSelection(id);
    } else {
        navigate(`/chat/${id}`);
    }
  };

  const handleStartChat = async (targetUser: User) => {
      const chatId = await createChat(targetUser);
      setShowNewChatModal(false);
      navigate(`/chat/${chatId}`);
  };

  const toggleChatSelection = (id: string) => {
      if (selectedChatIds.includes(id)) {
          setSelectedChatIds(prev => prev.filter(cid => cid !== id));
      } else {
          setSelectedChatIds(prev => [...prev, id]);
      }
  };

  const confirmDelete = (forEveryone: boolean) => {
      if(!user) return;
      selectedChatIds.forEach(id => deleteChat(id, user.id, forEveryone));
      setIsEditMode(false);
      setSelectedChatIds([]);
      setShowDeleteModal(false);
  };

  const displayChats = chats.filter(c => {
      // Basic search filter for existing chats
      if (!searchChat) return true;
      const participant = c.participants.find(p => p.id !== user?.id);
      return (c.name || participant?.fullName || '').toLowerCase().includes(searchChat.toLowerCase());
  });

  return (
    <div className="min-h-full bg-white dark:bg-dark-bg relative">
      <div className={`sticky top-0 z-20 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 dark:border-gray-800 transition-colors ${isEditMode ? 'bg-gray-100 dark:bg-gray-900' : ''}`}>
        <div className="flex justify-between items-center mb-3">
            {isEditMode ? (
                <div className="flex items-center gap-3 w-full">
                    <button onClick={() => {setIsEditMode(false); setSelectedChatIds([]);}}><X size={24} className="text-gray-600 dark:text-gray-300"/></button>
                    <span className="font-bold text-lg dark:text-white flex-1">{selectedChatIds.length} Selected</span>
                    <button 
                      onClick={() => setShowDeleteModal(true)} 
                      disabled={selectedChatIds.length === 0}
                      className="text-red-500 disabled:opacity-30"
                    >
                        <Trash2 size={24} />
                    </button>
                </div>
            ) : (
                <>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h1>
                    <div className="flex gap-2">
                        <button 
                          onClick={() => setIsEditMode(true)}
                          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        >
                            <Edit size={20} />
                        </button>
                        <button 
                        onClick={() => setShowNewChatModal(true)}
                        className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 shadow-lg"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </>
            )}
        </div>
        
        {!isEditMode && (
            <div className="relative">
                <input 
                type="text" 
                placeholder="Search existing chats..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                value={searchChat}
                onChange={e => setSearchChat(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
        )}
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800 pb-20">
        {displayChats.length > 0 ? (
            displayChats.map(chat => {
            const isCommunity = chat.type === 'community';
            const time = chat.lastMessage ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
            const participant = chat.participants.find(p => p.id !== user?.id);
            const isSelected = selectedChatIds.includes(chat.id);

            return (
                <div 
                key={chat.id} 
                onClick={() => handleChatClick(chat.id)}
                className={`px-4 py-3 flex items-center gap-4 transition-colors cursor-pointer active:bg-gray-100 dark:active:bg-gray-900 ${isSelected && isEditMode ? 'bg-primary-50 dark:bg-primary-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                >
                {isEditMode && (
                    <div className="text-primary-500">
                        {isSelected ? <CheckSquare size={22} className="fill-current"/> : <Square size={22} className="text-gray-400"/>}
                    </div>
                )}

                <div className="relative">
                    <img 
                    src={chat.avatarUrl || (isCommunity ? "https://picsum.photos/seed/comm/200" : participant?.avatarUrl)} 
                    className="w-12 h-12 rounded-lg object-cover bg-gray-200" 
                    alt="avatar"
                    />
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate pr-2">
                        {isCommunity ? chat.name : participant?.fullName}
                    </h3>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate pr-4">
                        {chat.lastMessage?.senderId === user?.id && <span className="text-primary-600 mr-1">You:</span>}
                        {chat.lastMessage?.content || "No messages yet"}
                    </p>
                    {chat.unreadCount > 0 && (
                        <span className="min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                        {chat.unreadCount}
                        </span>
                    )}
                    </div>
                </div>
                </div>
            );
            })
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                 <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <MessageSquare className="text-gray-400" />
                 </div>
                 <h3 className="text-gray-900 dark:text-white font-medium">No chats found</h3>
                 <p className="text-sm text-gray-500 mb-4">
                     {searchChat ? 'Try a different search term.' : 'Tap the + button to start messaging.'}
                 </p>
            </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up">
                  <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Trash2 size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete {selectedChatIds.length} Chat(s)?</h3>
                      <p className="text-sm text-gray-500 mt-2">Choose how you want to delete these conversations.</p>
                  </div>
                  
                  <div className="space-y-3">
                      <Button variant="primary" className="w-full bg-red-600 hover:bg-red-700" onClick={() => confirmDelete(true)}>
                          Delete for Everyone
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => confirmDelete(false)}>
                          Delete for Me
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={() => setShowDeleteModal(false)}>
                          Cancel
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-dark-card w-full max-w-md h-[80vh] rounded-2xl flex flex-col animate-slide-up shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="font-bold text-lg dark:text-white">New Chat</h3>
                      <button onClick={() => setShowNewChatModal(false)}><X size={20} className="text-gray-500"/></button>
                  </div>
                  
                  <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="relative">
                          <input 
                            autoFocus
                            className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                            placeholder="Search name..."
                            value={searchUserQuery}
                            onChange={e => setSearchUserQuery(e.target.value)}
                          />
                          {isSearchingUsers && <Loader2 size={16} className="absolute right-3 top-2.5 animate-spin text-gray-400"/>}
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                      <p className="text-xs text-gray-500 font-semibold px-3 py-2 uppercase">Search Results</p>
                      {foundUsers.map(u => (
                          <div 
                             key={u.id}
                             onClick={() => handleStartChat(u)}
                             className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          >
                              <img src={u.avatarUrl} className="w-10 h-10 rounded-full bg-gray-200 object-cover" alt={u.fullName} />
                              <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white">{u.fullName}</h4>
                                  <p className="text-xs text-gray-500">{u.village}</p>
                              </div>
                              <Button variant="ghost" className="p-2"><MessageSquare size={18}/></Button>
                          </div>
                      ))}
                      {!isSearchingUsers && searchUserQuery && foundUsers.length === 0 && (
                          <div className="p-4 text-center text-sm text-gray-500">
                              No users found matching "{searchUserQuery}"
                          </div>
                      )}
                      {!searchUserQuery && (
                          <div className="p-4 text-center text-sm text-gray-400">
                              Type to search for people in your community.
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ChatList;