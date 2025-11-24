import React, { useEffect, useState } from 'react';
import { Post, User } from '../types';
import { MockBackend } from '../services/mockBackend';
import { Heart, MessageCircle, Share2, MapPin, Plus } from 'lucide-react';

interface FeedProps {
  user: User;
  onPostClick: () => void;
  areaFilter?: string; // If provided, filters by area (Discovery mode)
}

const Feed: React.FC<FeedProps> = ({ user, onPostClick, areaFilter }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    // If areaFilter is set, use it. Otherwise, default to user's village for the Home feed? 
    // Actually home feed usually shows mix or local. Let's default to User's village for Home.
    // The user's prompt says "Discovery Page: Show latest posts from each area". 
    // Home Page usually shows User's Village + General.
    
    // Logic: If areaFilter is present, show that area. If not, show user's village posts first.
    const targetArea = areaFilter || user.village; 
    const data = await MockBackend.getPosts(targetArea);
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaFilter, user.village]); // Refetch if filter changes

  const formatTime = (ms: number) => {
    const seconds = Math.floor((Date.now() - ms) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-4">
      {/* Header for Feed */}
      {!areaFilter && (
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">BlouConnect</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {user.village}
            </p>
          </div>
          <button 
            onClick={onPostClick}
            className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full hover:bg-primary-200 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="px-4 space-y-4 mt-2">
        {posts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No posts in {areaFilter || user.village} yet.</p>
            <button onClick={onPostClick} className="text-primary-500 font-semibold mt-2">Be the first to post!</button>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-dark-card rounded-2xl shadow-sm p-4 animate-fade-in transition-colors duration-300">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName}`} 
                  alt={post.authorName} 
                  className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-700"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{post.authorName}</h3>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                    <span>{formatTime(post.timestamp)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-primary-600 dark:text-primary-400">
                      <MapPin className="w-3 h-3" /> {post.village}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-3">
                {post.content}
              </p>

              {post.mediaUrl && (
                <div className="rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
                  {post.mediaType === 'video' ? (
                     <div className="h-48 w-full flex items-center justify-center bg-gray-800 text-white">
                        <span className="text-xs">Video Placeholder</span>
                     </div>
                  ) : (
                    <img src={post.mediaUrl} alt="Post content" className="w-full h-auto max-h-96 object-cover" />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                <button className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm hover:text-green-500 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;