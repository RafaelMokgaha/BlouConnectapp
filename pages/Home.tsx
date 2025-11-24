
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import AreaSelector from '../components/AreaSelector';
import Button from '../components/ui/Button';
import { MessageSquare, Heart, Share2, Image as ImageIcon, Video, MapPin, Search, Send, X, ArrowLeft, Trophy, Calendar, AlertCircle } from 'lucide-react';
import { APP_LOGO_URL } from '../constants';
import { useParams, useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { posts, addPost, likePost, addComment } = useData();
  const { user } = useAuth();
  const { villageName } = useParams<{ villageName: string }>();
  const navigate = useNavigate();
  
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'local'>('local');

  // File Upload Refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // New Post State
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostArea, setNewPostArea] = useState(user?.village || '');
  const [newPostCategory, setNewPostCategory] = useState<'general' | 'sports' | 'event' | 'funeral'>('general');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined);

  useEffect(() => {
    if (villageName) {
      setNewPostArea(villageName);
      setActiveTab('local');
    } else {
      setNewPostArea(user?.village || '');
    }
  }, [villageName, user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
      setMediaType(type);
      setSelectedFile(file);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !mediaPreview) return;
    if (!newPostArea) return;

    setIsUploading(true);

    const newPost: Partial<Post> = {
      village: newPostArea,
      content: newPostContent,
      mediaType: mediaType,
      category: newPostCategory,
    };

    try {
      await addPost(newPost, selectedFile);
      setIsPosting(false);
      setNewPostContent('');
      setMediaPreview(null);
      setMediaType(undefined);
      setSelectedFile(undefined);
      setNewPostCategory('general');
    } catch (e) {
      console.error("Post failed", e);
    } finally {
      setIsUploading(false);
    }
  };

  // Filtering Logic
  let displayPosts = posts;

  if (villageName) {
    displayPosts = displayPosts.filter(p => p.village === villageName);
  } else {
    if (activeTab === 'local') {
      displayPosts = displayPosts.filter(p => p.village === user?.village);
    }
  }

  if (searchText.trim()) {
    const query = searchText.toLowerCase();
    displayPosts = displayPosts.filter(p => 
      p.content.toLowerCase().includes(query) || 
      p.village.toLowerCase().includes(query) ||
      p.user.fullName.toLowerCase().includes(query)
    );
  }

  return (
    <div className="min-h-full bg-gray-100 dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          {villageName ? (
            <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="text-gray-900 dark:text-white" size={24} />
            </button>
          ) : (
            <img src={APP_LOGO_URL} alt="Logo" className="w-8 h-8" />
          )}
          
          {showSearch ? (
            <div className="flex-1 flex items-center animate-fade-in ml-2">
                <input 
                  autoFocus
                  className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                  placeholder="Search posts, topics..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
                <button onClick={() => {setShowSearch(false); setSearchText('');}} className="ml-2 text-gray-500">
                    <X size={20} />
                </button>
            </div>
          ) : (
            <h1 className="text-xl font-bold text-primary-600 truncate">
               {villageName ? villageName : 'BlouConnect'}
            </h1>
          )}
        </div>
        
        {!showSearch && (
           <div className="flex gap-2">
               <button 
                 onClick={() => setShowSearch(true)}
                 className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
               >
                   <Search size={20} className="text-gray-600 dark:text-gray-300"/>
               </button>
           </div>
        )}
      </header>

      {/* Feed Tabs */}
      {!villageName && !searchText && (
        <div className="flex bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 mb-2">
          <button 
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'local' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
          >
            My Village ({user?.village})
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
          >
            All Areas
          </button>
        </div>
      )}

      {villageName && (
         <div className="bg-primary-600 text-white p-4 mb-2">
            <h2 className="text-xl font-bold">Community Feed</h2>
            <p className="text-sm opacity-80">Updates from {villageName}</p>
         </div>
      )}

      {/* Content */}
      <div className="max-w-xl mx-auto pb-4 space-y-3">
        
        {/* Create Post Trigger */}
        <div className="bg-white dark:bg-dark-card p-4 mx-2 rounded-xl shadow-sm cursor-pointer" onClick={() => setIsPosting(true)}>
            <div className="flex gap-3 items-center">
                <img src={user?.avatarUrl} className="w-10 h-10 rounded-full bg-gray-200 object-cover" alt="avatar" />
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2.5 text-gray-500 text-sm truncate">
                    Post to {villageName || "your village"}...
                </div>
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-4">
                    <button className="flex items-center gap-1 text-xs font-medium text-gray-500"><ImageIcon size={16} className="text-green-500"/> Photo</button>
                    <button className="flex items-center gap-1 text-xs font-medium text-gray-500"><Video size={16} className="text-blue-500"/> Video</button>
                </div>
            </div>
        </div>

        {/* Post Feed */}
        {displayPosts.length > 0 ? (
          displayPosts.map(post => (
            <PostCard key={post.id} post={post} onLike={() => likePost(post.id)} onComment={(text) => addComment(post.id, text)} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
               <MessageSquare className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No posts yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
               {searchText 
                 ? `No results found for "${searchText}"` 
                 : `Be the first to post in ${villageName || 'your community'}!`}
            </p>
            {!searchText && (
               <Button onClick={() => setIsPosting(true)} className="mt-4">Create Post</Button>
            )}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {isPosting && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">New Post</h3>
              <button onClick={() => setIsPosting(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
            
            <form onSubmit={handlePostSubmit} className="p-4 space-y-4">
              {!villageName && (
                <AreaSelector 
                  value={newPostArea} 
                  onChange={setNewPostArea} 
                  label="Location:"
                />
              )}

              {/* Category Selection */}
              <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button"
                        onClick={() => setNewPostCategory('general')}
                        className={`py-2 rounded-lg text-xs border ${newPostCategory === 'general' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200 text-gray-600'}`}
                      >
                          General
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewPostCategory('sports')}
                        className={`py-2 rounded-lg text-xs border ${newPostCategory === 'sports' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-gray-200 text-gray-600'}`}
                      >
                          Sports / Event
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewPostCategory('event')}
                        className={`py-2 rounded-lg text-xs border ${newPostCategory === 'event' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-200 text-gray-600'}`}
                      >
                          General Event
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewPostCategory('funeral')}
                        className={`py-2 rounded-lg text-xs border ${newPostCategory === 'funeral' ? 'bg-gray-100 border-gray-500 text-gray-900 font-bold' : 'border-gray-200 text-gray-600'}`}
                      >
                          Funeral Notice
                      </button>
                  </div>
              </div>
              
              <textarea
                className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                placeholder="Share something..."
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
              />

              {mediaPreview && (
                <div className="relative rounded-lg overflow-hidden bg-black h-48 w-full">
                   <button 
                     type="button" 
                     onClick={() => { setMediaPreview(null); setMediaType(undefined); setSelectedFile(undefined); }}
                     className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                   >
                     <X size={16} />
                   </button>
                   {mediaType === 'image' ? (
                     <img src={mediaPreview} className="w-full h-full object-contain" alt="Preview" />
                   ) : (
                     <video src={mediaPreview} className="w-full h-full object-contain" controls playsInline />
                   )}
                </div>
              )}

              <div className="flex gap-2">
                 <input 
                   type="file" 
                   ref={photoInputRef} 
                   className="hidden" 
                   accept="image/*"
                   onChange={(e) => handleFileSelect(e, 'image')}
                 />
                 <input 
                   type="file" 
                   ref={videoInputRef} 
                   className="hidden" 
                   accept="video/*"
                   onChange={(e) => handleFileSelect(e, 'video')}
                 />
                 
                 <button type="button" onClick={() => photoInputRef.current?.click()} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200">
                    <ImageIcon size={20}/>
                 </button>
                 <button type="button" onClick={() => videoInputRef.current?.click()} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200">
                    <Video size={20}/>
                 </button>
              </div>

              <Button type="submit" className="w-full" isLoading={isUploading} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Post'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PostCard: React.FC<{ post: Post; onLike: () => void; onComment: (t: string) => void }> = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
       try {
         await navigator.share({
           title: 'BlouConnect Post',
           text: post.content,
           url: window.location.href
         });
       } catch (err) {
         console.log('Error sharing:', err);
       }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    await onComment(commentText);
    setCommentText('');
    setSubmittingComment(false);
  };

  const getCategoryBadge = () => {
      switch(post.category) {
          case 'sports': return <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><Trophy size={10} /> Sports</span>;
          case 'event': return <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><Calendar size={10} /> Event</span>;
          case 'funeral': return <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><AlertCircle size={10} /> Funeral Notice</span>;
          default: return null;
      }
  };

  return (
    <div className="bg-white dark:bg-dark-card mx-2 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3">
            <img src={post.user.avatarUrl} alt={post.user.fullName} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{post.user.fullName}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                 <span>{new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 <span>•</span>
                 <span className="flex items-center gap-0.5 text-primary-600 dark:text-primary-400"><MapPin size={10} /> {post.village}</span>
              </div>
            </div>
          </div>
          {getCategoryBadge()}
        </div>
        
        <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {post.content}
        </p>

        {post.mediaUrl && (
          <div className="rounded-lg overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
            {post.mediaType === 'video' ? (
              <video src={post.mediaUrl} controls className="w-full h-auto max-h-96 object-contain" playsInline />
            ) : (
              <img src={post.mediaUrl} alt="Post media" className="w-full h-auto max-h-96 object-cover" />
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
           <button 
             onClick={onLike}
             className="flex items-center gap-1.5 text-gray-500 text-sm hover:text-red-500 transition-colors"
           >
              <Heart size={18} className={post.likes > 0 ? "fill-red-500 text-red-500" : ""} />
              <span>{post.likes}</span>
           </button>
           <button 
             onClick={() => setShowComments(!showComments)}
             className="flex items-center gap-1.5 text-gray-500 text-sm hover:text-primary-500 transition-colors"
           >
              <MessageSquare size={18} />
              <span>{post.comments}</span>
           </button>
           <button 
             onClick={handleShare}
             className="flex items-center gap-1.5 text-gray-500 text-sm hover:text-primary-500 transition-colors"
           >
              <Share2 size={18} />
           </button>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
            <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
               {post.commentsList && post.commentsList.map(comment => (
                 <div key={comment.id} className="flex gap-2">
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg rounded-tl-none text-xs flex-1">
                       <div className="flex justify-between">
                           <span className="font-bold text-gray-900 dark:text-white block">{comment.userName}</span>
                           <span className="text-[10px] text-gray-400">{new Date(comment.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                       </div>
                       <span className="text-gray-700 dark:text-gray-300 mt-1 block">{comment.text}</span>
                    </div>
                 </div>
               ))}
               {(!post.commentsList || post.commentsList.length === 0) && <p className="text-xs text-gray-400">No comments yet.</p>}
            </div>
            <form onSubmit={submitComment} className="flex gap-2">
               <input 
                 className="flex-1 bg-gray-50 dark:bg-gray-800 text-xs px-3 py-2 rounded-full border border-transparent focus:border-primary-500 focus:outline-none dark:text-white"
                 placeholder="Write a comment..."
                 value={commentText}
                 onChange={e => setCommentText(e.target.value)}
                 disabled={submittingComment}
               />
               <button type="submit" className="text-primary-600 disabled:opacity-50" disabled={submittingComment}><Send size={16}/></button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
