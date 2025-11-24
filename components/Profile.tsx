import React, { useState } from 'react';
import { User, ViewState } from '../types';
import { MockBackend } from '../services/mockBackend';
import { Moon, Sun, LogOut, Camera, Edit2, MapPin, Phone } from 'lucide-react';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, toggleTheme, isDarkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.fullName);
  const [village, setVillage] = useState(user.village);

  const handleSave = async () => {
      const updatedUser = { ...user, fullName: name, village };
      await MockBackend.updateUser(updatedUser);
      setIsEditing(false);
      // Force reload or state update would be better, but for mock we trust parent re-renders or local state
      window.location.reload(); 
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-24">
       {/* Header Image / Background */}
       <div className="h-40 bg-gradient-to-r from-primary-500 to-green-600 relative">
          <div className="absolute -bottom-10 left-6">
              <div className="relative">
                <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-dark-bg shadow-lg object-cover" 
                />
                <button className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full border-2 border-white dark:border-dark-bg">
                    <Camera className="w-3 h-3" />
                </button>
              </div>
          </div>
       </div>

       <div className="pt-12 px-6">
           <div className="flex justify-between items-start mb-6">
               <div>
                   {isEditing ? (
                       <input 
                         value={name} 
                         onChange={e => setName(e.target.value)}
                         className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b border-primary-500 focus:outline-none"
                       />
                   ) : (
                       <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.fullName}</h1>
                   )}
                   <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                       <Phone className="w-3 h-3" /> {user.phoneNumber}
                   </p>
                   <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                       <MapPin className="w-3 h-3" /> {isEditing ? (
                           <select value={village} onChange={e => setVillage(e.target.value)} className="bg-transparent text-sm">
                               {/* Simplified for demo, assume import or passed */}
                               <option value={user.village}>{user.village}</option>
                           </select>
                       ) : user.village}
                   </p>
               </div>
               <button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${isEditing ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'}`}
               >
                   {isEditing ? 'Save' : 'Edit'}
               </button>
           </div>

           {/* Settings Section */}
           <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm overflow-hidden">
               <button onClick={toggleTheme} className="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                   <div className="flex items-center gap-3">
                       {isDarkMode ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                       <span className="text-gray-900 dark:text-white font-medium">Dark Mode</span>
                   </div>
                   <div className={`w-11 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary-500' : 'bg-gray-200'}`}>
                       <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transform transition-transform ${isDarkMode ? 'left-6' : 'left-1'}`}></div>
                   </div>
               </button>
               
               <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                   <div className="flex items-center gap-3 text-red-500">
                       <LogOut className="w-5 h-5" />
                       <span className="font-medium">Sign Out</span>
                   </div>
               </button>
           </div>

           <div className="mt-6 text-center text-xs text-gray-400">
               BlouConnect v1.0.0
           </div>
       </div>
    </div>
  );
};

export default Profile;