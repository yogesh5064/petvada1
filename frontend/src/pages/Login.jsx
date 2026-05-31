import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2, PawPrint } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://petvada1.onrender.com').replace(/\/$/, '');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/users/login`,
        { email: email.trim().toLowerCase(), password },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        }
      );

      if (data?.token) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        toast.success('Welcome back!');
        navigate(data.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err) {
      const errorMsg = err.code === 'ECONNABORTED'
        ? 'Login is taking too long. Please try again.'
        : err.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fb] p-4 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-44 bg-indigo-600" />

      <div className="w-full max-w-md bg-white p-7 md:p-10 rounded-2xl shadow-xl border border-gray-100 relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <PawPrint className="text-white w-9 h-9" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">
            Welcome <span className="text-indigo-600">Back</span>
          </h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">
            Access your PetVeda dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Mail size={12} /> Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-gray-50 p-4 rounded-xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Lock size={12} /> Password
            </label>
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-50 p-4 rounded-xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 ${
              loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-gray-950'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing in
              </>
            ) : (
              <>
                Secure Login
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-xs font-bold text-gray-500">
            Don't have an account?
            <Link to="/signup" className="text-indigo-600 ml-2 font-black hover:underline underline-offset-4">
              Create New
            </Link>
          </p>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest pt-4 border-t border-gray-50">
            2026 PetVeda Systems
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
