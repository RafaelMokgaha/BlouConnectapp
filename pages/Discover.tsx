
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VILLAGE_LIST } from '../constants';
import { Search, MapPin, TrendingUp, Users, Trophy, Calendar, AlertCircle, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import Button from '../components/ui/Button';
import { Post } from '../types';

const Discover: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'villages' | 'sports' | 'events' | 'funerals'>('villages');
  const { posts } = useData();
  const navigate = useNavigate();

  const filteredVillages = VILLAGE_LIST.filter(v => 
    v.toLowerCase().includes(search.toLowerCase())
  );

  const trendingVillages = VILLAGE_LIST.filter(village => {
     return posts.some(p => p.village === village && p.likes >= 5); // lowered threshold for demo
  });

  const sportsPosts = posts.filter(p => p.category === 'sports');
  const eventPosts = posts.filter(p => p.category === 'event');
  const funeralPosts = posts.filter(p => p.category === 'funeral');

  const goToCommunity = (name: string) => {
    navigate(`/community/${encodeURIComponent(name)}`);
  };

  const renderPostList = (posts: Post[], emptyMsg: string, icon: React.ReactNode) => {
      if(posts.length === 0) {
          return (
            <div className="text-center py-12 bg-white dark:bg-dark-card rounded-xl">
                <div className="mx-auto text-gray-300 mb-3 flex justify-center">{icon}</div>
                <p className="text-gray-500">{emptyMsg}</p>
            </div>
          );
      }
      return (
          <div className="space-y-4">
              {posts.map(post => (
                 <div key={post.id} className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm">
                     <div className="flex justify-between items-start">
                         <div>
                             <h4 className="font-bold text-gray-900 dark:text-white">{post.user.fullName}</h4>
                             <p className="text-xs text-gray-500 mb-2">{post.village} • {new Date(post.timestamp).toLocaleDateString()}</p>
                         </div>
                         <div className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                             {post.category?.toUpperCase()}
                         </div>
                     </div>
                     <p className="text-sm text-gray-800 dark:text-gray-200">{post.content}</p>
                 </div>
              ))}
          </div>
      );
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-black p-4 space-y-4 pb-20">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder={`Search ${activeTab}...`}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-card border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-x-auto no-scrollbar">
         <button onClick={() => setActiveTab('villages')} className={`flex-1 py-2 px-3 whitespace-nowrap rounded-lg text-sm font-medium ${activeTab === 'villages' ? 'bg-white dark:bg-dark-card shadow text-primary-600' : 'text-gray-500'}`}>Villages</button>
         <button onClick={() => setActiveTab('sports')} className={`flex-1 py-2 px-3 whitespace-nowrap rounded-lg text-sm font-medium ${activeTab === 'sports' ? 'bg-white dark:bg-dark-card shadow text-orange-600' : 'text-gray-500'}`}>Sports</button>
         <button onClick={() => setActiveTab('events')} className={`flex-1 py-2 px-3 whitespace-nowrap rounded-lg text-sm font-medium ${activeTab === 'events' ? 'bg-white dark:bg-dark-card shadow text-purple-600' : 'text-gray-500'}`}>Events</button>
         <button onClick={() => setActiveTab('funerals')} className={`flex-1 py-2 px-3 whitespace-nowrap rounded-lg text-sm font-medium ${activeTab === 'funerals' ? 'bg-white dark:bg-dark-card shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}>Funerals</button>
      </div>

      {activeTab === 'villages' ? (
        <>
          {trendingVillages.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white">
                <TrendingUp size={20} className="text-primary-500" />
                <h2 className="font-bold text-lg">Trending Areas</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 {trendingVillages.map(villageName => (
                   <div key={villageName} onClick={() => goToCommunity(villageName)} className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-4 text-white shadow-lg relative overflow-hidden cursor-pointer active:scale-95 transition-transform">
                     <div className="relative z-10"><h3 className="font-bold truncate">{villageName}</h3></div>
                     <MapPin className="absolute bottom-[-10px] right-[-10px] text-white/20 w-16 h-16" />
                   </div>
                 ))}
              </div>
            </section>
          )}
          <section>
            <h2 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">All Villages</h2>
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm divide-y divide-gray-100 dark:divide-gray-800 max-h-[50vh] overflow-y-auto">
              {filteredVillages.map(village => (
                <div key={village} onClick={() => goToCommunity(village)} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-gray-400"/>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{village}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
         <section className="space-y-4">
            <div className="flex justify-between items-center">
               <h2 className="font-bold text-lg text-gray-900 dark:text-white capitalize">{activeTab} Feed</h2>
               <Button onClick={() => navigate('/')} variant="primary" className="py-2 px-3 text-xs"><Plus size={14} className="mr-1"/> Post</Button>
            </div>
            {activeTab === 'sports' && renderPostList(sportsPosts, "No sports updates.", <Trophy size={40}/>)}
            {activeTab === 'events' && renderPostList(eventPosts, "No upcoming events.", <Calendar size={40}/>)}
            {activeTab === 'funerals' && renderPostList(funeralPosts, "No funeral notices.", <AlertCircle size={40}/>)}
         </section>
      )}
    </div>
  );
};

export default Discover;
