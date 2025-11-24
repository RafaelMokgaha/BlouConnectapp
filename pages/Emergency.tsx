
import React from 'react';
import { Phone, Shield, Truck, Flame, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';

const Emergency: React.FC = () => {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-black p-4 pb-24">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-3 bg-red-600 rounded-full text-white shadow-lg shadow-red-500/30">
           <AlertTriangle size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Emergency</h1>
          <p className="text-sm text-gray-500">Quick access to help services</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          onClick={() => handleCall('10111')}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all p-5 rounded-2xl shadow-lg text-white flex flex-col items-center justify-center gap-2"
        >
          <Shield size={32} />
          <span className="font-bold text-lg">Police</span>
          <span className="text-xs opacity-80">10111</span>
        </button>

        <button 
          onClick={() => handleCall('10177')}
          className="bg-green-600 hover:bg-green-700 active:scale-95 transition-all p-5 rounded-2xl shadow-lg text-white flex flex-col items-center justify-center gap-2"
        >
          <Truck size={32} />
          <span className="font-bold text-lg">Ambulance</span>
          <span className="text-xs opacity-80">10177</span>
        </button>

        <button 
          onClick={() => handleCall('10177')}
          className="bg-orange-600 hover:bg-orange-700 active:scale-95 transition-all p-5 rounded-2xl shadow-lg text-white flex flex-col items-center justify-center gap-2"
        >
          <Flame size={32} />
          <span className="font-bold text-lg">Fire</span>
          <span className="text-xs opacity-80">10177</span>
        </button>

        <button 
          onClick={() => handleCall('112')}
          className="bg-red-600 hover:bg-red-700 active:scale-95 transition-all p-5 rounded-2xl shadow-lg text-white flex flex-col items-center justify-center gap-2"
        >
          <Phone size={32} />
          <span className="font-bold text-lg">Any Mobile</span>
          <span className="text-xs opacity-80">112</span>
        </button>
      </div>

      <div className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Local Contacts</h3>
        <p className="text-sm text-gray-500 mb-4">Add your village headman or local clinic numbers here.</p>
        <Button variant="outline" className="w-full text-sm">
          + Add Contact
        </Button>
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl text-sm flex items-start gap-3">
        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
        <p>
          Only use these numbers in case of a real emergency. 
          Misuse of emergency services is a criminal offense.
        </p>
      </div>
    </div>
  );
};

export default Emergency;
