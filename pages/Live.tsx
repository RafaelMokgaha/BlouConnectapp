
import React, { useState } from 'react';
import { Radio, VideoOff, Activity } from 'lucide-react';
import Button from '../components/ui/Button';

const Live: React.FC = () => {
  const [isLive, setIsLive] = useState(false);
  const [description, setDescription] = useState('');

  const toggleLive = () => {
      if (!description.trim() && !isLive) {
          alert("Please write a description for your live stream.");
          return;
      }
      setIsLive(!isLive);
  };

  return (
    <div className="min-h-full bg-gray-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {isLive && (
          <div className="absolute inset-0 z-0 bg-black">
              <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded font-bold text-xs flex items-center gap-1">
                  <Activity size={12} className="animate-pulse"/> LIVE
              </div>
              <div className="absolute bottom-20 left-4 z-10">
                  <h3 className="font-bold text-lg">{description}</h3>
                  <p className="text-sm opacity-80">You are broadcasting...</p>
              </div>
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <p className="text-gray-500 animate-pulse">Camera Stream Placeholder</p>
              </div>
          </div>
      )}

      <div className="z-10 w-full max-w-sm flex flex-col items-center">
          {!isLive && (
              <>
                <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                        <Radio size={28} className="text-white" />
                    </div>
                </div>
                
                <h1 className="text-3xl font-bold mb-2">BlouConnect Live</h1>
                <p className="text-gray-400 text-center mb-8">
                    Stream local events, matches, and community gatherings in real-time.
                </p>

                <div className="bg-gray-800 p-6 rounded-2xl w-full text-center">
                    <input 
                        className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-400"
                        placeholder="Write a description about your stream..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={toggleLive}
                    >
                        Go Live
                    </Button>
                </div>
              </>
          )}

          {isLive && (
              <div className="fixed bottom-6 right-4 z-20">
                   <Button onClick={toggleLive} className="bg-red-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg border-4 border-white/20">
                       <VideoOff size={24} />
                   </Button>
              </div>
          )}
      </div>
    </div>
  );
};

export default Live;
