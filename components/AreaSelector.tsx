import React from 'react';
import { VILLAGE_LIST } from '../constants';
import { MapPin } from 'lucide-react';

interface AreaSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

const AreaSelector: React.FC<AreaSelectorProps> = ({ value, onChange, label, error }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none text-gray-900 dark:text-white"
        >
          <option value="" disabled>Select your village</option>
          {VILLAGE_LIST.map((village) => (
            <option key={village} value={village}>
              {village}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default AreaSelector;