import React from 'react';
import { Bell, FileText } from 'lucide-react';

const News: React.FC = () => {
  // No example items
  const newsItems: any[] = [];

  return (
    <div className="min-h-full bg-gray-50 dark:bg-black p-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-red-100 rounded-full text-red-600">
           <Bell size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community News</h1>
          <p className="text-sm text-gray-500">Official updates from Admins</p>
        </div>
      </div>

      <div className="space-y-4">
        {newsItems.length > 0 ? (
          newsItems.map(item => (
            <div key={item.id} className="bg-white dark:bg-dark-card rounded-xl shadow-sm overflow-hidden border-l-4 border-primary-500">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">{item.author}</span>
                   <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {item.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <FileText className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No News Yet</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                  Official community announcements and updates will appear here.
              </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;