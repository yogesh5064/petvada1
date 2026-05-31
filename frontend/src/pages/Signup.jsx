import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Loader2,
  PawPrint,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://petvada1.onrender.com').replace(/\/$/, '');

const Signup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  });

  const updateForm = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/users/signup-otp`,
        { email: formData.email.trim().toLowerCase() },
        { timeout: 15000 }
      );

      toast.success(data.message || 'OTP sent to email');
      setStep(2);
    } catch (error) {
      const message = error.code === 'ECONNABORTED'
        ? 'Email service is taking too long. Please try again.'
        : error.response?.data?.message || 'OTP send failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();

    if (formData.otp.length !== 6) {
      return toast.error('Enter valid 6-digit OTP');
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/users/verify-signup`,
        {
          ...formData,
          email: formData.email.trim().toLowerCase(),
        },
        { timeout: 15000 }
      );

      if (data?.token) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        toast.success(`Welcome ${data.name}`);
        navigate(data.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      const message = error.code === 'ECONNABORTED'
        ? 'Signup is taking too long. Please try again.'
        : error.response?.data?.message || 'Signup failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fb] p-4 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-44 bg-indigo-600" />

      <div className="w-full max-w-md bg-white p-7 md:p-10 rounded-2xl shadow-xl border border-gray-100 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            {step === 1 ? (
              <PawPrint className="text-white w-9 h-9" />
            ) : (
              <ShieldCheck className="text-white w-9 h-9" />
            )}
          </div>

          <h2 className="text-3xl font-black text-gray-900 leading-tight">
            {step === 1 ? 'Join PetVeda' : 'Verify OTP'}
          </h2>

          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-3">
            {step === 1 ? 'Create your account' : `Code sent to ${formData.email}`}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <label className="block">
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                <User size={12} /> Full Name
              </span>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => updateForm('name', e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold"
                required
                disabled={loading}
              />
            </label>

            <label className="block">
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Mail size={12} /> Email
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold"
                required
                disabled={loading}
              />
            </label>

            <label className="block">
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Lock size={12} /> Password
              </span>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => updateForm('password', e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold"
                required
                disabled={loading}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:bg-gray-200 disabled:text-gray-400"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Sending
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyAndSignup} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={(e) => updateForm('otp', e.target.value.replace(/\D/g, ''))}
              className="w-full p-5 text-center text-2xl font-black bg-gray-50 rounded-xl tracking-widest border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all outline-none"
              required
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:bg-gray-200 disabled:text-gray-400"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Verifying
                </>
              ) : (
                'Verify & Signup'
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-gray-500 font-bold flex items-center justify-center gap-1"
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm font-bold text-gray-500">
          Already have an account?
          <Link to="/login" className="text-indigo-600 ml-2 font-black hover:underline underline-offset-4">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
