import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lock, ShieldCheck, KeyRound } from 'lucide-react';

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({ old: '', new: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/users/password', passwords);
      toast.success("Password badal gaya! 🔐");
      setPasswords({ old: '', new: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error!");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-2">
      <div className="w-full max-w-md bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-indigo-50 border border-gray-100 animate-in fade-in zoom-in duration-300">
        
        {/* 🔒 Icon & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-inner">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tighter uppercase italic leading-none">
            Suraksha Settings
          </h2>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">
            Secure your petveda account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Old Password Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">
              <KeyRound size={12}/> Current Password
            </label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-sm" 
              value={passwords.old} 
              onChange={(e) => setPasswords({...passwords, old: e.target.value})} 
            />
          </div>

          {/* New Password Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">
              <ShieldCheck size={12}/> New Password
            </label>
            <input 
              type="password" 
              required 
              placeholder="Enter new password"
              className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-sm" 
              value={passwords.new} 
              onChange={(e) => setPasswords({...passwords, new: e.target.value})} 
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white p-5 rounded-[1.5rem] font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-black transition-all active:scale-95 mt-4"
          >
            Update Secure Password
          </button>
        </form>

        <p className="text-center mt-8 text-[9px] text-gray-300 font-bold uppercase tracking-widest">
          Make sure to use a strong password
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;