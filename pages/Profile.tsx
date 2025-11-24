
import React, { useState, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import { Moon, Sun, LogOut, ChevronRight, HelpCircle, Camera, Eye, Heart, BarChart2, Info, FileText, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { APP_LOGO_URL } from '../constants';

const Profile: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { posts, changelogs, sendSupportMessage, uploadFile } = useData();
  const { mode, toggle } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'about'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showVision, setShowVision] = useState(false);
  
  // Support Message State
  const [supportText, setSupportText] = useState('');
  const [supportSent, setSupportSent] = useState(false);
  const [sendingSupport, setSendingSupport] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    village: user?.village || ''
  });

  const userPosts = useMemo(() => posts.filter(p => p.userId === user?.id), [posts, user?.id]);
  const totalLikes = userPosts.reduce((acc, curr) => acc + curr.likes, 0);
  const totalViews = userPosts.reduce((acc, curr) => acc + (curr.views || 0), 0);
  
  const recentViewers: any[] = []; 

  if (!user) return null;

  const handleSave = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
      const file = e.target.files?.[0];
      if (file) {
          setUploadingImage(true);
          const path = `profiles/${user.id}/${type}_${Date.now()}.jpg`;
          const url = await uploadFile(file); // uses helper from data context which handles bucket
          
          if (url) {
              if (type === 'avatar') updateProfile({ avatarUrl: url });
              else updateProfile({ bannerUrl: url });
          }
          setUploadingImage(false);
      }
  };

  const submitSupport = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!supportText.trim()) return;
      setSendingSupport(true);
      await sendSupportMessage(supportText);
      setSendingSupport(false);
      setSupportSent(true);
      setSupportText('');
      setTimeout(() => setSupportSent(false), 3000);
  };

  // --- SUB PAGES ---

  if (showViewers) {
      return (
          <div className="min-h-full bg-gray-50 dark:bg-black p-4">
              <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setShowViewers(false)}><ArrowLeft className="text-gray-900 dark:text-white"/></button>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Viewers</h2>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4 text-sm text-blue-700 dark:text-blue-300">
                  <p>Viewers are visible for 24 hours only.</p>
              </div>
              <div className="space-y-3">
                  {recentViewers.length > 0 ? recentViewers.map((u) => (
                      <div key={u.id} className="flex items-center gap-3 bg-white dark:bg-dark-card p-3 rounded-xl shadow-sm">
                          <img src={u.avatarUrl} className="w-12 h-12 rounded-full bg-gray-200 object-cover" alt={u.fullName}/>
                          <div className="flex-1">
                              <span className="font-bold text-gray-900 dark:text-white block">{u.fullName}</span>
                              <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">{u.village}</span>
                                  <span className="text-[10px] text-gray-400">
                                      {new Date(u.viewedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                              </div>
                          </div>
                      </div>
                  )) : (
                      <p className="text-center text-gray-500 mt-10">No recent viewers.</p>
                  )}
              </div>
          </div>
      );
  }

  if (showHelp) {
      return (
          <div className="min-h-full bg-gray-50 dark:bg-black p-4">
               <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setShowHelp(false)}><ArrowLeft className="text-gray-900 dark:text-white"/></button>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Help & Support</h2>
              </div>
              <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm">
                  <h3 className="font-bold mb-2 dark:text-white">Contact Admin</h3>
                  <p className="text-sm text-gray-500 mb-4">Send us a message directly.</p>
                  {supportSent ? (
                      <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center gap-2">
                          <CheckCircle size={20}/>
                          <span>Message sent!</span>
                      </div>
                  ) : (
                      <form onSubmit={submitSupport}>
                          <textarea 
                             className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none min-h-[120px] dark:text-white"
                             placeholder="Describe your issue..."
                             value={supportText}
                             onChange={e => setSupportText(e.target.value)}
                          />
                          <Button type="submit" className="w-full mt-3" isLoading={sendingSupport}>
                              <Send size={16} className="mr-2"/> Send Message
                          </Button>
                      </form>
                  )}
              </div>
          </div>
      );
  }

  if (showChangelog) {
      return (
          <div className="min-h-full bg-gray-50 dark:bg-black p-4">
               <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setShowChangelog(false)}><ArrowLeft className="text-gray-900 dark:text-white"/></button>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Changelog</h2>
              </div>
              <div className="space-y-4">
                  {changelogs.map(log => (
                      <div key={log.id} className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                              <span className="font-bold text-primary-600 text-lg">v{log.version}</span>
                              <span className="text-xs text-gray-400">{log.date}</span>
                          </div>
                          <ul className="space-y-2">
                              {log.changes.map((change, i) => (
                                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                      <span className="text-primary-500 mt-1">•</span> {change}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  if (showVision) {
      return (
          <div className="min-h-full bg-gray-50 dark:bg-black p-4 flex flex-col items-center text-center">
              <div className="flex w-full items-center gap-3 mb-6">
                  <button onClick={() => setShowVision(false)}><ArrowLeft className="text-gray-900 dark:text-white"/></button>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">App Vision</h2>
              </div>
              <img src={APP_LOGO_URL} className="w-24 h-24 mb-6 animate-pulse" alt="logo"/>
              <h1 className="text-3xl font-bold text-primary-600 mb-4">BlouConnect</h1>
              <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm text-left max-w-sm">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      <strong>Our Vision:</strong> To connect every village in Blouberg through a unified digital platform.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      We empower communities to share news, celebrate culture, and stay safe together.
                  </p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-black pb-8">
      <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />

      <div className="relative h-40 bg-gray-300 dark:bg-gray-800 group">
          {user.bannerUrl ? (
              <img src={user.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">Tap to add banner</div>
          )}
          <button onClick={() => bannerInputRef.current?.click()} className="absolute top-4 right-4 bg-black/30 p-2 rounded-full text-white backdrop-blur-sm">
             <Camera size={18} />
          </button>
      </div>

      <div className="px-4 mb-4 relative">
         <div className="flex justify-between items-end -mt-12 mb-3">
             <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                 <img src={user.avatarUrl} alt="Profile" className="w-24 h-24 rounded-2xl border-4 border-white dark:border-black object-cover bg-gray-200 shadow-md" />
                 {uploadingImage && <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
                 <div className="absolute bottom-0 right-0 bg-primary-500 text-white p-1.5 rounded-full border-2 border-white dark:border-black">
                    <Camera size={12} />
                 </div>
             </div>
             <Button variant="outline" className="h-9 text-xs py-0" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
             </Button>
         </div>

         {isEditing ? (
             <div className="space-y-3 mb-4 animate-slide-up">
                 <input className="w-full p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 dark:text-white" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} placeholder="Full Name" />
                 <textarea className="w-full p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 dark:text-white" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} placeholder="Bio..." rows={2} />
                 <Button onClick={handleSave} className="w-full py-2">Save Changes</Button>
             </div>
         ) : (
             <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.fullName}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{user.village} • {user.phoneNumber}</p>
                {user.bio && <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">{user.bio}</p>}
             </div>
         )}

         {/* Stats */}
         <div className="grid grid-cols-4 gap-2 mb-6 bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm">
             <div className="flex flex-col items-center">
                 <span className="font-bold text-lg dark:text-white">{user.following || 0}</span>
                 <span className="text-[10px] text-gray-500 uppercase">Following</span>
             </div>
             <div className="flex flex-col items-center">
                 <span className="font-bold text-lg dark:text-white">{user.followers || 0}</span>
                 <span className="text-[10px] text-gray-500 uppercase">Followers</span>
             </div>
             <div className="flex flex-col items-center">
                 <span className="font-bold text-lg dark:text-white">{totalLikes}</span>
                 <span className="text-[10px] text-gray-500 uppercase">Likes</span>
             </div>
             <div className="flex flex-col items-center">
                 <span className="font-bold text-lg dark:text-white">{totalViews}</span>
                 <span className="text-[10px] text-gray-500 uppercase">Views</span>
             </div>
         </div>
         
         <div onClick={() => setShowViewers(true)} className="flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-500 p-4 rounded-xl text-white mb-6 cursor-pointer shadow-md active:scale-95 transition-transform">
             <div className="flex items-center gap-3">
                 <Eye size={20} />
                 <div>
                     <p className="font-bold text-sm">Who viewed your profile</p>
                     <p className="text-xs opacity-80">{recentViewers.length} people recently</p>
                 </div>
             </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 mb-4">
          <div className="flex gap-6">
              <button onClick={() => setActiveTab('posts')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'posts' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>My Posts</button>
              <button onClick={() => setActiveTab('about')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'about' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>Settings</button>
          </div>
      </div>

      <div className="px-4">
          {activeTab === 'posts' && (
              <div className="space-y-4">
                  {userPosts.map(post => (
                      <div key={post.id} className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                          <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{post.content}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Heart size={14}/> {post.likes}</span>
                              <span className="flex items-center gap-1"><BarChart2 size={14}/> {post.views || 0}</span>
                              <span className="ml-auto">{new Date(post.timestamp).toLocaleDateString()}</span>
                          </div>
                      </div>
                  ))}
                  {userPosts.length === 0 && <p className="text-center text-gray-400 py-4">No posts yet.</p>}
              </div>
          )}

          {activeTab === 'about' && (
              <div className="bg-white dark:bg-dark-card rounded-xl overflow-hidden shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={toggle}>
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${mode === 'dark' ? 'bg-purple-900 text-purple-300' : 'bg-yellow-100 text-yellow-600'}`}>
                              {mode === 'dark' ? <Moon size={18}/> : <Sun size={18}/>}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
                      </div>
                  </div>
                  
                  <div onClick={() => setShowHelp(true)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><HelpCircle size={18}/></div>
                          <span className="font-medium text-gray-900 dark:text-white">Help & Support</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400"/>
                  </div>

                  <div onClick={() => setShowVision(true)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                          <div className="bg-green-100 text-green-600 p-2 rounded-lg"><Info size={18}/></div>
                          <span className="font-medium text-gray-900 dark:text-white">App Vision</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400"/>
                  </div>

                  <div onClick={() => setShowChangelog(true)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                          <div className="bg-orange-100 text-orange-600 p-2 rounded-lg"><FileText size={18}/></div>
                          <span className="font-medium text-gray-900 dark:text-white">Changelog</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400"/>
                  </div>
                  
                  <div className="p-4">
                      <Button variant="secondary" className="w-full text-red-500" onClick={logout}>
                          <LogOut size={18} className="mr-2" /> Log Out
                      </Button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default Profile;
