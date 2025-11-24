import React, { useState } from 'react';
import { VILLAGES } from '../constants';
import { User } from '../types';
import { MockBackend } from '../services/mockBackend';
import { Phone, User as UserIcon, MapPin, Calendar, ArrowRight, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'PROFILE'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Profile State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [village, setVillage] = useState(VILLAGES[0]);

  const handleSendOtp = async () => {
    if (phone.length < 10) return alert("Please enter a valid phone number");
    setLoading(true);
    await MockBackend.login(phone);
    setLoading(false);
    setStep('OTP');
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    const isValid = await MockBackend.verifyOtp(otp);
    setLoading(false);
    
    if (isValid) {
      const existingUser = MockBackend.getUser();
      if (existingUser && existingUser.phoneNumber === phone) {
        onLogin(existingUser);
      } else {
        setStep('PROFILE');
      }
    } else {
      alert("Invalid Code (Try 1234)");
    }
  };

  const handleCompleteProfile = async () => {
    if (!fullName || !dob || !village) return alert("Please fill all fields");
    setLoading(true);
    const newUser = await MockBackend.registerUser({
      fullName,
      phoneNumber: phone,
      dateOfBirth: dob,
      village,
      profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=22c55e&color=fff`
    });
    setLoading(false);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col justify-center px-6 transition-colors duration-300">
      <div className="max-w-md mx-auto w-full">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">BlouConnect</h1>
          <p className="text-gray-500 dark:text-gray-400">Your Village. Your Community.</p>
        </div>

        <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-xl transition-colors duration-300">
          {step === 'PHONE' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Sign In</h2>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-all transform active:scale-95 flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Continue'}
              </button>
            </div>
          )}

          {step === 'OTP' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Verify Phone</h2>
              <p className="text-sm text-gray-500">Enter the code sent to {phone}</p>
              <input
                type="text"
                placeholder="0000"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center text-3xl tracking-widest py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white transition-all"
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-all transform active:scale-95 flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify'}
              </button>
            </div>
          )}

          {step === 'PROFILE' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Create Profile</h2>
              
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <select
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white appearance-none"
                >
                  {VILLAGES.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              <button
                onClick={handleCompleteProfile}
                disabled={loading}
                className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-all transform active:scale-95 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                  <>Start Connecting <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;