import React, { useState, useEffect } from 'react';
import { VILLAGES } from '../constants';
import { TrendingTopic, Post, User } from '../types';
import { MockBackend } from '../services/mockBackend';
import { Search, MapPin, TrendingUp, ChevronRight } from 'lucide-react';
import Feed from './Feed';

interface DiscoveryProps {
  user: User;
  onPostClick: () => void;
}

const Discovery: React.FC<DiscoveryProps> = ({ user, onPostClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);

  useEffect(() => {
    MockBackend.getTrending().then(setTrending);
  }, []);

  const filteredVillages = VILLAGES.filter(v => 
    v.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedVillage) {
     return (
       <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
          <div className="sticky top-0 z-20 bg-white dark:bg-dark-card px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
             <button onClick={() => setSelectedVillage(null)} className="text-gray-600 dark:text-gray-300">
               <ChevronRight className="w-6 h-6 rotate-180" />
             </button>
             <h2 className="font-bold text-lg text-gray-900 dark:text-white">{selectedVillage}</h2>
          </div>
          <Feed user={user} onPostClick={onPostClick} areaFilter={selectedVillage} />
       </div>
     );
  }

  return (
    <div className="pb-20 bg-gray-50 dark:bg-dark-bg min-h-screen">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-dark-card px-4 py-3 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Discovery</h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search villages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border-none text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Trending Section */}
      {!searchTerm && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white font-semibold">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            <h2>Trending Now</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {trending.map(t => (
              <div key={t.id} className="min-w-[150px] bg-white dark:bg-dark-card p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{t.topic}</span>
                <span className="text-xs text-primary-500 mb-1">{t.village}</span>
                <span className="text-xs text-gray-400">{t.count} posts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Village List */}
      <div className="px-4">
        <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide">
          {searchTerm ? 'Search Results' : 'All Areas'}
        </h2>
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm overflow-hidden">
          {filteredVillages.map((v, i) => (
            <button
              key={v}
              onClick={() => setSelectedVillage(v)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${i !== filteredVillages.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
            >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <MapPin className="w-4 h-4" />
                 </div>
                 <span className="text-gray-900 dark:text-white font-medium">{v}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          ))}
          {filteredVillages.length === 0 && (
            <div className="p-4 text-center text-gray-500">No villages found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discovery;