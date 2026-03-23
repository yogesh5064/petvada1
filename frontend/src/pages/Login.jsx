import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2, PawPrint } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Fix: Agar user pehle se logged in hai, toh use login page mat dikhao
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      user.role === 'admin' ? navigate('/admin') : navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/users/login', 
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const data = response.data;

      if (data && data.token) {
        // 1. Storage update
        localStorage.setItem('userInfo', JSON.stringify(data));
        
        // 2. Auth Header set
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        toast.success("Welcome Back! 🐾");

        // 3. ✅ Final Redirection Logic
        if (data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }

        // Optional: Agar App.jsx state refresh nahi ho rahi, toh reload use karein:
        // window.location.reload(); 
        
      } else {
        toast.error("Invalid Response from server!");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed! Please check credentials.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-50 rounded-full translate-x-1/3 translate-y-1/3 opacity-50 blur-3xl"></div>

      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-gray-100 relative z-10 animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200 rotate-3 group">
            <PawPrint className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic leading-none">
            Welcome <span className="text-indigo-600">Back</span>
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">
            Access your petveda dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest flex items-center gap-2">
              <Mail size={12}/> Email Address
            </label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest flex items-center gap-2">
              <Lock size={12}/> Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-5 rounded-[1.8rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 ${
              loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-black'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Secure Login <LogIn size={18} /></>}
          </button>
        </form>

        <div className="mt-10 text-center space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
            Don't have an account? 
            <Link to="/signup" className="text-indigo-600 ml-2 font-black hover:underline underline-offset-4">Create New</Link>
          </p>
          <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.3em] pt-4 border-t border-gray-50">© 2026 PetVeda Systems</p>
        </div>
      </div>
    </div>
  );
};

export default Login;