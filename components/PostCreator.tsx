import React, { useState } from 'react';
import { User, Post } from '../types';
import { VILLAGES } from '../constants';
import { MockBackend } from '../services/mockBackend';
import { X, Image as ImageIcon, Video, MapPin, Loader2 } from 'lucide-react';

interface PostCreatorProps {
  user: User;
  onClose: () => void;
  onPostCreated: () => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ user, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [village, setVillage] = useState(user.village);
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);

    await MockBackend.createPost({
      authorId: user.id,
      authorName: user.fullName,
      authorVillage: user.village,
      authorAvatar: user.profilePicture,
      content,
      village,
      mediaUrl: media || undefined,
      mediaType: media ? 'image' : undefined,
    });

    setLoading(false);
    onPostCreated();
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simulate upload
    if (e.target.files && e.target.files[0]) {
      // Create local object URL for preview
      const url = URL.createObjectURL(e.target.files[0]);
      setMedia(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-dark-bg flex flex-col animate-slide-up">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-semibold text-gray-900 dark:text-white">Create Post</h2>
        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="bg-primary-500 text-white px-4 py-1.5 rounded-full text-sm font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex gap-3">
          <img 
             src={user.profilePicture} 
             className="w-10 h-10 rounded-full border border-gray-200" 
             alt="User"
          />
          <div className="flex-1">
             <div className="mb-2">
               <span className="text-gray-900 dark:text-white font-medium">{user.fullName}</span>
             </div>
             {/* Area Selector - REQUIRED by prompt */}
             <div className="inline-flex items-center gap-1 border border-primary-200 dark:border-primary-900 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full text-xs text-primary-700 dark:text-primary-400 mb-4 cursor-pointer relative group">
                <MapPin className="w-3 h-3" />
                <span className="font-medium">Posting in:</span>
                <select
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="bg-transparent border-none outline-none font-semibold appearance-none pr-4 cursor-pointer"
                >
                  {VILLAGES.map(v => (
                    <option key={v} value={v} className="text-gray-900">{v}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-2 h-2 text-primary-700" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
             </div>

             <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="What's happening in your village?"
               className="w-full bg-transparent text-gray-900 dark:text-white text-lg placeholder-gray-400 border-none focus:ring-0 resize-none min-h-[150px]"
             />

             {media && (
               <div className="relative mt-2 rounded-xl overflow-hidden group">
                 <img src={media} alt="Preview" className="w-full max-h-60 object-cover" />
                 <button 
                   onClick={() => setMedia(null)}
                   className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4">
        <label className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full cursor-pointer transition-colors">
           <ImageIcon className="w-6 h-6" />
           <input type="file" accept="image/*" className="hidden" onChange={handleMediaUpload} />
        </label>
        <button className="p-2 text-gray-400 hover:text-primary-500 rounded-full transition-colors">
           <Video className="w-6 h-6" />
        </button>
        <div className="flex-1"></div>
        <div className="text-xs text-gray-400">{content.length}/280</div>
      </div>
    </div>
  );
};

export default PostCreator;