import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Loader2, PawPrint, ShieldCheck, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/send-otp', { 
        email: formData.email 
      });
      toast.success(data.message || "OTP sent! Check your email. 📩");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    if (formData.otp.length !== 6) return toast.error("Please enter a 6-digit OTP");
    
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/verify-signup', formData);

      if (data && data.token) {
        // ✅ STEP 1: Storage update (Data save kar rahe hain)
        localStorage.setItem('userInfo', JSON.stringify(data));
        
        // ✅ STEP 2: Auth Header refresh
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        toast.success(`Welcome to PetVeda, ${data.name}! 🐾`);
        
        // ✅ STEP 3: Page Reload & Navigate (App.jsx ko signal bhejne ke liye)
        if (data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
        
        // Taaki App.jsx ki state turant refresh ho jaye
        window.location.reload(); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP or Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Design remains as it is */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 blur-3xl"></div>
      
      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl -rotate-3 transition-transform hover:rotate-0">
            {step === 1 ? <PawPrint className="text-white w-10 h-10" /> : <ShieldCheck className="text-white w-10 h-10" />}
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic leading-none">
            {step === 1 ? <>Join <span className="text-indigo-600">PetVeda</span></> : "Verify Email"}
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">
            {step === 1 ? "Start your premium pet care journey" : `Check OTP sent to ${formData.email}`}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2"><User size={12}/> Full Name</label>
              <input type="text" placeholder="Yogesh Kumawat" className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2"><Mail size={12}/> Email Address</label>
              <input type="email" placeholder="example@mail.com" className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm" 
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2"><Lock size={12}/> Secure Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm" 
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required disabled={loading} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 mt-4">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Continue to Verify <ShieldCheck size={18} /></>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyAndSignup} className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase text-center block tracking-[0.3em]">6-Digit Code</label>
              <input type="text" maxLength="6" placeholder="0 0 0 0 0 0" className="w-full bg-gray-50 p-5 rounded-2xl border-2 border-transparent focus:border-indigo-600 text-center text-3xl font-black tracking-[0.4em] outline-none"
                value={formData.otp} onChange={(e) => setFormData({...formData, otp: e.target.value})} required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-5 bg-green-600 text-white rounded-[1.8rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify & Signup</>}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full flex items-center justify-center gap-2 text-gray-400 font-black uppercase text-[9px] tracking-widest hover:text-indigo-600 transition-colors">
              <ChevronLeft size={14} /> Back to Edit Info
            </button>
          </form>
        )}

        <div className="mt-10 text-center border-t border-gray-50 pt-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
            Already a member? <Link to="/login" className="text-indigo-600 ml-2 font-black hover:underline">Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;