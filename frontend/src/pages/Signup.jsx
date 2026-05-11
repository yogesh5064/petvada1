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
  ChevronLeft
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
    otp: ''
  });

  // ================= SEND OTP =================
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/users/signup-otp`,
        { email: formData.email }
      );

      toast.success(data.message || "OTP sent to email 📩");
      setStep(2);

    } catch (error) {
      toast.error(error.response?.data?.message || "OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY + SIGNUP =================
  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();

    if (formData.otp.length !== 6) {
      return toast.error("Enter valid 6-digit OTP");
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/users/verify-signup`,
        formData
      );

      if (data?.token) {
        localStorage.setItem('userInfo', JSON.stringify(data));

        axios.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${data.token}`;

        toast.success(`Welcome ${data.name} 🐾`);

        navigate(data.role === 'admin' ? '/admin' : '/');

        window.location.reload();
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">

      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full opacity-50 blur-3xl"></div>

      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            {step === 1 ? (
              <PawPrint className="text-white w-10 h-10" />
            ) : (
              <ShieldCheck className="text-white w-10 h-10" />
            )}
          </div>

          <h2 className="text-3xl font-black text-gray-800">
            {step === 1 ? "Join PetVeda" : "Verify OTP"}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            {step === 1
              ? "Create your account"
              : `OTP sent to ${formData.email}`}
          </p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">

            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-4 bg-gray-50 rounded-xl font-bold"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-4 bg-gray-50 rounded-xl font-bold"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full p-4 bg-gray-50 rounded-xl font-bold"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndSignup} className="space-y-4">

            <input
              type="text"
              maxLength="6"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={(e) =>
                setFormData({ ...formData, otp: e.target.value })
              }
              className="w-full p-5 text-center text-2xl font-black bg-gray-50 rounded-xl tracking-widest"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Verify & Signup"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-gray-500 font-bold"
            >
              ← Back
            </button>
          </form>
        )}

        {/* LOGIN LINK */}
        <div className="mt-6 text-center text-sm">
          Already have account?{" "}
          <Link to="/login" className="text-indigo-600 font-bold">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;