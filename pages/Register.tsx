import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AreaSelector from '../components/AreaSelector';
import Button from '../components/ui/Button';
import { Camera } from 'lucide-react';
import { AVATAR_PLACEHOLDERS } from '../constants';

const Register: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    village: '',
    phoneNumber: '',
    password: '',
    avatarUrl: AVATAR_PLACEHOLDERS[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        await signup(formData);
        navigate('/');
    } catch (err: any) {
        setError(err.message || "Registration failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-6 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Profile</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Join your community.</p>
        </div>

        <div className="flex justify-center">
           <div className="relative group cursor-pointer" onClick={() => setFormData({...formData, avatarUrl: AVATAR_PLACEHOLDERS[Math.floor(Math.random() * AVATAR_PLACEHOLDERS.length)]})}>
             <img 
               src={formData.avatarUrl} 
               alt="Profile" 
               className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-dark-card shadow-lg"
             />
             <div className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full ring-2 ring-white dark:ring-dark-card">
               <Camera size={16} />
             </div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-primary-500"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-primary-500"
              value={formData.dateOfBirth}
              onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
            />
          </div>

          <div>
             <AreaSelector 
               value={formData.village} 
               onChange={(val) => setFormData({...formData, village: val})} 
               label="Village"
             />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              placeholder="072 123 4567"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-primary-500"
              value={formData.phoneNumber}
              onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-primary-500"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full mt-4" isLoading={loading}>
            Create Account
          </Button>
          
          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account? <span className="text-primary-600 cursor-pointer" onClick={() => navigate('/login')}>Log In</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;