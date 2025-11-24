
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, Image as ImageIcon, Mic, MoreVertical, Paperclip, StopCircle, Play, Pause, Trash2, User as UserIcon, Ban, Palette, X, CheckSquare, Square } from 'lucide-react';
import Button from '../components/ui/Button';

const ChatRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { chats, getMessages, sendMessage, setActiveChat, deleteMessages, clearChat, setChatWallpaper } = useData();
  const { user } = useAuth();
  
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // UI States
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  
  // Deletion States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'selected' | 'clearAll'>('selected');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const chat = chats.find(c => c.id === id);
  const messages = id && user ? getMessages(id, user.id) : [];

  const isCommunity = chat?.type === 'community';
  const participant = !isCommunity ? chat?.participants.find(p => p.id !== user?.id) : null;
  
  const formatLastSeen = (timestamp: number) => {
      const diff = Date.now() - timestamp;
      if (diff < 60000) return 'Online'; 
      if (diff < 3600000) return `Last seen ${Math.floor(diff/60000)}m ago`;
      return `Last seen ${new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  useEffect(() => {
    setActiveChat(id || null);
    return () => setActiveChat(null);
  }, [id, setActiveChat]);

  useEffect(() => {
    if (!isSelectionMode) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSelectionMode]);

  if (!chat) return <div className="p-4">Chat not found</div>;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(chat.id, inputText, 'text');
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Optimistic Preview can be added here, but for now we upload directly
      const type = file.type.startsWith('video') ? 'video' : 'image';
      sendMessage(chat.id, 'Media File', type, file); 
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options: MediaRecorderOptions | undefined = undefined;
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
           audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type });
        // Send blob to context to handle upload
        sendMessage(chat.id, 'Audio Note', 'audio', audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
      }
    }
  };

  const toggleSelectionMode = () => {
      setIsSelectionMode(!isSelectionMode);
      setSelectedMessageIds([]);
      setShowMenu(false);
  };

  const toggleMessageSelection = (msgId: string) => {
      if (selectedMessageIds.includes(msgId)) {
          setSelectedMessageIds(prev => prev.filter(id => id !== msgId));
      } else {
          setSelectedMessageIds(prev => [...prev, msgId]);
      }
  };

  const handleDeleteTrigger = () => {
      if (selectedMessageIds.length === 0) return;
      setDeleteMode('selected');
      setShowDeleteConfirm(true);
  };

  const handleDeleteChatTrigger = () => {
      setDeleteMode('clearAll');
      setShowDeleteConfirm(true);
      setShowMenu(false);
  };

  const confirmDelete = (forEveryone: boolean) => {
      if (!user) return;
      
      if (deleteMode === 'selected') {
          deleteMessages(chat.id, selectedMessageIds, forEveryone, user.id);
          setIsSelectionMode(false);
          setSelectedMessageIds([]);
      } else {
          clearChat(chat.id, user.id, forEveryone);
      }
      setShowDeleteConfirm(false);
  };

  const handleWallpaperChange = (color: string) => {
      setChatWallpaper(chat.id, color);
      setShowWallpaperModal(false);
  };

  const chatName = isCommunity ? chat.name : participant?.fullName;
  const chatImage = isCommunity ? chat.avatarUrl : participant?.avatarUrl;
  const subtitle = isCommunity 
    ? `${chat.village} • Community` 
    : (participant?.isOnline ? 'Online' : formatLastSeen(participant?.lastSeen || 0));

  const bgStyle = chat.wallpaper?.startsWith('#') 
    ? { backgroundColor: chat.wallpaper } 
    : chat.wallpaper 
        ? { backgroundImage: `url(${chat.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
        : { backgroundColor: '#E5E5E5' }; 

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const canDeleteForEveryone = deleteMode === 'selected' 
     ? selectedMessageIds.every(id => {
          const m = messages.find(msg => msg.id === id);
          return m && m.senderId === user?.id && !m.deletedForEveryone;
       })
     : true;

  return (
    <div className="flex flex-col h-full relative dark:bg-black">
      {/* Header */}
      <header className={`px-4 py-3 flex items-center gap-3 shadow-sm z-20 border-b border-gray-100 dark:border-gray-800 transition-colors ${isSelectionMode ? 'bg-primary-600 text-white' : 'bg-white/95 dark:bg-dark-card/95 backdrop-blur-sm'}`}>
        {isSelectionMode ? (
            <>
                <button onClick={toggleSelectionMode}><X size={24} /></button>
                <div className="flex-1 font-bold text-lg">{selectedMessageIds.length} Selected</div>
                <button onClick={handleDeleteTrigger} disabled={selectedMessageIds.length === 0} className="disabled:opacity-50">
                    <Trash2 size={24} />
                </button>
            </>
        ) : (
            <>
                <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300 active:scale-95 transition-transform">
                <ArrowLeft size={24} />
                </button>
                <div className="flex-1 cursor-pointer" onClick={() => !isCommunity && setShowProfileModal(true)}>
                <div className="flex items-center gap-2">
                    <img src={chatImage} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" alt="avi" />
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-2 text-base">
                            {chatName}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {!isCommunity && participant?.village ? `${participant.village} • ` : ''}{subtitle}
                        </p>
                    </div>
                </div>
                </div>
                <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <MoreVertical className="text-gray-600 dark:text-gray-300" size={20} />
                    </button>
                    
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in origin-top-right">
                            {!isCommunity && (
                                <button onClick={() => {setShowProfileModal(true); setShowMenu(false)}} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 dark:text-white transition-colors">
                                    <UserIcon size={18} className="text-gray-500"/> View Profile
                                </button>
                            )}
                            <button onClick={() => {setShowWallpaperModal(true); setShowMenu(false)}} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 dark:text-white transition-colors">
                                <Palette size={18} className="text-gray-500"/> Wallpaper
                            </button>
                            <button onClick={toggleSelectionMode} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 dark:text-white transition-colors">
                                <CheckSquare size={18} className="text-gray-500"/> Select Messages
                            </button>
                            <button onClick={handleDeleteChatTrigger} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 dark:text-white transition-colors">
                                <Trash2 size={18} className="text-gray-500"/> Delete Chat
                            </button>
                        </div>
                    )}
                </div>
            </>
        )}
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 relative transition-all duration-300" style={bgStyle}>
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?.id;
          const showAvatar = isCommunity && !isMe && (index === 0 || messages[index-1].senderId !== msg.senderId);
          const isSelected = selectedMessageIds.includes(msg.id);
          
          return (
            <div 
                key={msg.id} 
                className={`flex w-full ${isSelectionMode ? 'mb-4' : ''} ${isMe ? 'justify-end' : 'justify-start'}`}
                onClick={() => isSelectionMode && toggleMessageSelection(msg.id)}
            >
              <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {isSelectionMode && (
                    <div className="pb-2">
                        {isSelected ? (
                            <div className="bg-primary-500 text-white rounded-full p-0.5"><CheckSquare size={20} /></div>
                        ) : (
                            <div className="text-gray-400"><Square size={20} /></div>
                        )}
                    </div>
                )}

                {isCommunity && !isMe && (
                   <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0 overflow-hidden self-end mb-1">
                      {showAvatar ? <img src={`https://picsum.photos/seed/${msg.senderId}/100`} alt="u" /> : <div className="w-full h-full" />}
                   </div>
                )}
                
                <div 
                  className={`px-3 py-2 rounded-2xl shadow-sm text-[15px] leading-snug relative group transition-all
                    ${isMe 
                      ? 'bg-[#128C7E] dark:bg-primary-700 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 rounded-tl-none'
                    }
                    ${msg.deletedForEveryone ? 'italic opacity-70 bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400' : ''}
                    ${isSelectionMode && isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                  `}
                >
                  {msg.deletedForEveryone ? (
                      <span className="flex items-center gap-1"><Ban size={12}/> This message was deleted</span>
                  ) : (
                      <>
                        {msg.type === 'text' && msg.content}
                        
                        {msg.type === 'image' && (
                            <div className="rounded-lg overflow-hidden -m-1 mb-1">
                            <img src={msg.content} className="max-w-full max-h-80 object-cover" alt="sent" />
                            </div>
                        )}
                        
                        {msg.type === 'video' && (
                            <div className="rounded-lg overflow-hidden -m-1 mb-1 bg-black">
                                <video src={msg.content} controls playsInline className="max-w-full max-h-80" />
                            </div>
                        )}
                        
                        {msg.type === 'audio' && (
                            <AudioMessage src={msg.content} isMe={isMe} />
                        )}
                      </>
                  )}

                  <div className={`text-[10px] text-right mt-1 opacity-70 flex justify-end gap-1 items-center`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isSelectionMode && (
        <div className="fixed bottom-0 w-full bg-white dark:bg-black/90 backdrop-blur-md px-2 py-2 flex items-end gap-2 border-t border-gray-200 dark:border-gray-800 z-30">
            <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
            accept="image/*,video/*"
            />
            
            <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors mb-0.5"
            >
            <Paperclip size={22} />
            </button>

            <form onSubmit={handleSend} className="flex-1 flex items-end gap-2 mb-1">
            {isRecording ? (
                <div className="flex-1 flex items-center gap-3 bg-white dark:bg-dark-card px-4 py-3 rounded-xl border border-red-200 shadow-sm animate-pulse">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"/>
                    <span className="text-red-500 font-mono font-medium">{formatTime(recordingDuration)}</span>
                    <span className="text-gray-400 text-sm flex-1 text-center">Recording...</span>
                </div>
            ) : (
                <input 
                    className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl px-4 py-3 max-h-32 focus:ring-1 focus:ring-primary-500 dark:text-white shadow-inner"
                    placeholder="Message..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                />
            )}
            
            {inputText ? (
                <button type="submit" className="p-3 bg-[#128C7E] text-white rounded-full shadow-lg hover:scale-105 transition-transform">
                    <Send size={20} className="ml-0.5" />
                </button>
            ) : (
                <button 
                    type="button" 
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className={`p-3 rounded-full transition-all shadow-lg ${isRecording ? 'bg-red-500 text-white scale-110' : 'bg-[#128C7E] text-white hover:opacity-90'}`}
                >
                    {isRecording ? <StopCircle size={22} /> : <Mic size={22} />}
                </button>
            )}
            </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-fade-in">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {deleteMode === 'clearAll' ? 'Delete Chat?' : `Delete ${selectedMessageIds.length} messages?`}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                      {deleteMode === 'clearAll' 
                        ? "This will delete this conversation." 
                        : "Messages deleted for everyone will be replaced with a placeholder."}
                  </p>
                  
                  <div className="space-y-3">
                      {canDeleteForEveryone && (
                          <Button variant="primary" className="w-full bg-red-600 hover:bg-red-700" onClick={() => confirmDelete(true)}>
                              Delete for Everyone
                          </Button>
                      )}
                      <Button variant="outline" className="w-full" onClick={() => confirmDelete(false)}>
                          Delete for Me
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={() => setShowDeleteConfirm(false)}>
                          Cancel
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && participant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white dark:bg-dark-card w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl">
                  <div className="relative h-32 bg-gradient-to-r from-[#128C7E] to-[#075E54]">
                      <button onClick={() => setShowProfileModal(false)} className="absolute top-2 right-2 bg-black/30 p-1 rounded-full text-white hover:bg-black/50">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="px-4 pb-6 relative">
                      <div className="-mt-12 mb-3 flex justify-center">
                          <img src={participant.avatarUrl} className="w-24 h-24 rounded-full border-4 border-white dark:border-dark-card bg-gray-200 shadow-md object-cover" alt="profile"/>
                      </div>
                      <div className="text-center mb-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{participant.fullName}</h3>
                          <p className="text-gray-500">{participant.village}</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Wallpaper Modal */}
      {showWallpaperModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-2xl p-5 shadow-2xl animate-slide-up">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Chat Wallpaper</h3>
                      <button onClick={() => setShowWallpaperModal(false)}><X size={20} className="text-gray-500"/></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Choose from device</label>
                          <input 
                            type="file" 
                            ref={wallpaperInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setChatWallpaper(chat.id, URL.createObjectURL(file));
                                    setShowWallpaperModal(false);
                                }
                            }}
                          />
                          <Button 
                            variant="secondary" 
                            className="w-full flex items-center justify-center gap-2"
                            onClick={() => wallpaperInputRef.current?.click()}
                          >
                             <ImageIcon size={18} /> Upload Photo
                          </Button>
                      </div>
                      <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Solid Colors</label>
                          <div className="grid grid-cols-4 gap-3">
                              {['#E5E5E5', '#dcfce7', '#ffecd2', '#fcb69f', '#a1c4fd', '#d4fc79', '#fccb90', '#e0c3fc'].map(color => (
                                  <button 
                                    key={color} 
                                    onClick={() => handleWallpaperChange(color)}
                                    className="w-full aspect-square rounded-xl shadow-sm border border-black/5 hover:scale-105 transition-transform"
                                    style={{backgroundColor: color}}
                                  />
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const AudioMessage: React.FC<{isMe: boolean, src: string}> = ({ isMe, src }) => {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if(!audioRef.current) return;
        if(playing) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setPlaying(!playing);
    };

    return (
        <div className="flex items-center gap-3 min-w-[200px] py-1">
            <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} />
            <button onClick={togglePlay} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${isMe ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white'}`}>
                {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5"/>}
            </button>
            <div className="flex-1 flex flex-col justify-center">
                <div className={`h-1.5 rounded-full overflow-hidden ${isMe ? 'bg-black/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <div className={`h-full w-2/3 ${isMe ? 'bg-white' : 'bg-[#128C7E]'} ${playing ? 'animate-pulse' : ''}`}></div>
                </div>
            </div>
            <Mic size={16} className={`opacity-50 ${isMe ? 'text-white' : 'text-gray-500'}`} />
        </div>
    );
};

export default ChatRoom;
