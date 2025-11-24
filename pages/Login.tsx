import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { APP_LOGO_URL } from '../constants';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        await login(phoneNumber, password);
        navigate('/');
    } catch (err: any) {
        setError(err.message || "Login failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-dark-bg transition-colors">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img src={APP_LOGO_URL} alt="BlouConnect" className="w-20 h-20 mx-auto" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Sign in to your account.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              placeholder="072 123 4567"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-primary-500"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-primary-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full mt-4" isLoading={loading}>
            Log In
          </Button>
          
          <p className="text-center text-sm text-gray-400 mt-4">
            Don't have an account? <span className="text-primary-600 cursor-pointer" onClick={() => navigate('/register')}>Sign Up</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;