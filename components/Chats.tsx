import React, { useState, useEffect, useRef } from 'react';
import { User, Chat, Message } from '../types';
import { MockBackend } from '../services/mockBackend';
import { ArrowLeft, Send, Mic, Image as ImageIcon, Smile, MoreVertical, Phone as PhoneIcon } from 'lucide-react';
import clsx from 'clsx'; // Optional, but I can use template literals for simplicity if not installed. I'll use template literals.

// --- Sub-Component: Chat List Item ---
const ChatListItem: React.FC<{ chat: Chat; onClick: () => void }> = ({ chat, onClick }) => (
  <div onClick={onClick} className="flex items-center gap-3 p-4 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer active:scale-[0.99] transform duration-100">
    <div className="relative">
      <img 
        src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random`} 
        alt={chat.name} 
        className="w-12 h-12 rounded-full object-cover"
      />
      {chat.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-card"></div>}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{chat.name}</h3>
        {chat.lastMessage && (
          <span className="text-xs text-gray-400">
            {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        )}
      </div>
      <div className="flex justify-between items-center">
        <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
           {chat.isTyping ? <span className="text-primary-500 italic">Typing...</span> : chat.lastMessage?.content || 'Start a conversation'}
        </p>
        {chat.unreadCount > 0 && (
          <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
            {chat.unreadCount}
          </span>
        )}
      </div>
    </div>
  </div>
);

// --- Sub-Component: Active Chat Room ---
const ChatRoom: React.FC<{ user: User; chat: Chat; onBack: () => void }> = ({ user, chat, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load messages
    MockBackend.getMessages(chat.id).then(setMessages);
  }, [chat.id]);

  useEffect(() => {
    // Scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (type: Message['type'] = 'text', contentArg?: string, duration?: number) => {
    const textToSend = contentArg || input;
    if (!textToSend.trim() && type === 'text') return;

    // Optimistic UI
    const tempId = Math.random().toString();
    const optimisticMsg: Message = {
      id: tempId,
      senderId: user.id,
      content: textToSend,
      type,
      timestamp: Date.now(),
      duration
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInput('');

    // Send to backend
    await MockBackend.sendMessage(chat.id, textToSend, type, duration);
    
    // Simulate Reply
    if (chat.type === 'community' || Math.random() > 0.5) {
      setTimeout(() => {
        const reply: Message = {
            id: Math.random().toString(),
            senderId: 'other',
            content: 'That sounds great!',
            type: 'text',
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, reply]);
      }, 2000);
    }
  };

  const handleMicClick = () => {
      if (!isRecording) {
          setIsRecording(true);
          // Simulate recording for 2 seconds then send
          setTimeout(() => {
              setIsRecording(false);
              handleSend('voice', 'Voice Note', 5); // 5s duration dummy
          }, 2000);
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#f2f2f2] dark:bg-[#0b141a]">
      {/* Header */}
      <div className="bg-white dark:bg-dark-card px-4 py-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 shadow-sm z-10">
        <button onClick={onBack} className="text-gray-600 dark:text-gray-300">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <img 
          src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}`} 
          className="w-9 h-9 rounded-full" 
          alt="Avatar"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{chat.name}</h3>
          {chat.type === 'private' && (
             <span className="text-xs text-gray-500 block">{chat.isOnline ? 'Online' : 'Offline'}</span>
          )}
        </div>
        <PhoneIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm text-sm relative group ${
                  isMe 
                    ? 'bg-primary-500 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-dark-card text-gray-900 dark:text-white rounded-tl-none'
                }`}
              >
                {msg.type === 'text' && <p>{msg.content}</p>}
                
                {msg.type === 'voice' && (
                   <div className="flex items-center gap-2 min-w-[120px]">
                       <div className={`w-0 h-0 border-l-[8px] border-y-[6px] border-y-transparent ${isMe ? 'border-l-white' : 'border-l-gray-600'}`}></div>
                       <div className={`h-1 flex-1 rounded-full ${isMe ? 'bg-primary-300' : 'bg-gray-300'}`}></div>
                       <span className="text-xs opacity-75">{msg.duration}s</span>
                   </div>
                )}

                <span className={`text-[10px] block text-right mt-1 opacity-70`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          );
        })}
        {isRecording && (
             <div className="flex justify-center my-2">
                 <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full animate-pulse">Recording...</span>
             </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-dark-card px-3 py-2 flex items-end gap-2 border-t border-gray-100 dark:border-gray-800">
        <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 rounded-full">
           <ImageIcon className="w-6 h-6" />
        </button>
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center px-4 py-2 min-h-[44px]">
           <input
             type="text"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             placeholder="Message"
             className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white max-h-24"
           />
           <button className="text-gray-400 hover:text-gray-600">
             <Smile className="w-5 h-5" />
           </button>
        </div>
        {input.trim() ? (
          <button onClick={() => handleSend()} className="p-3 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 active:scale-95 transition-transform">
             <Send className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={handleMicClick} className={`p-3 rounded-full shadow-lg transition-all active:scale-95 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary-500 text-white'}`}>
             <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// --- Main Chat Container ---
const Chats: React.FC<{ user: User }> = ({ user }) => {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MockBackend.getChats().then((data) => {
      setChats(data);
      setLoading(false);
    });
  }, []);

  if (activeChat) {
    return <ChatRoom user={user} chat={activeChat} onBack={() => setActiveChat(null)} />;
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-bg">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-dark-bg z-10">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h1>
      </div>
      <div className="flex-1 overflow-y-auto pb-20">
         {loading ? (
             <div className="flex justify-center p-10"><div className="animate-spin h-6 w-6 border-2 border-primary-500 rounded-full border-t-transparent"></div></div>
         ) : chats.length === 0 ? (
             <div className="p-10 text-center text-gray-500">No chats yet. Start a conversation in the community!</div>
         ) : (
             chats.map(chat => (
               <ChatListItem key={chat.id} chat={chat} onClick={() => setActiveChat(chat)} />
             ))
         )}
      </div>
    </div>
  );
};

export default Chats;