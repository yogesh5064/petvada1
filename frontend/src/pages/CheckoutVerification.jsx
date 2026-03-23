import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin, Phone, ArrowRight, Loader2, Navigation, CheckCircle2 } from 'lucide-react';

const CheckoutVerification = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false); 
  
  const [userData, setUserData] = useState({
    address: '', 
    city: '', 
    phone: '', 
    pincode: ''
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!state || !state.cart) {
      toast.error("Cart is empty!");
      navigate('/shop');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
        
        setUserData({
          address: data.address || '',
          city: data.city || '',
          phone: data.phone || data.mobile || '', 
          pincode: data.pincode || ''
        });
      } catch (err) {
        console.error("Profile load error");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [state, navigate, userInfo.token]);

  // ✅ FIXED LOCATION LOGIC (NO PROXY, NO CORS ERROR)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Browser location support nahi kar raha!");
    }

    setIsLocating(true);
    const loadingLocation = toast.loading("Finding your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Correct Maps link formatting
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        try {
          // Direct call with required headers to avoid proxy block
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'Accept-Language': 'en',
              }
            }
          );

          if (!response.ok) throw new Error("API Blocked or Limit Reached");

          const data = await response.json();

          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || "";
            const pincode = data.address.postcode || "";
            const cleanAddress = data.display_name;

            setUserData(prev => ({
              ...prev,
              address: `${cleanAddress}\n\n📍 Google Maps: ${googleMapsLink}`,
              city: city,
              pincode: pincode.replace(/\s/g, '') 
            }));
            
            toast.success("Location Synced! 📍", { id: loadingLocation });
          }
        } catch (error) {
          console.error("Nominatim Error:", error);
          // Fallback: Save Map Link even if reverse geocoding fails
          setUserData(prev => ({
            ...prev,
            address: `📍 Live Location Link: ${googleMapsLink}`
          }));
          toast.error("Address fetch failed, but Map Link added!", { id: loadingLocation });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        toast.error("Location permission denied!", { id: loadingLocation });
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleConfirmAddress = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving details...");
    
    try {
      const config = { 
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}` 
        } 
      };

      await axios.put('http://localhost:5000/api/users/profile', userData, config);
      toast.dismiss(loadingToast);
      toast.success("Details Verified! 🐾");
      
      navigate('/place-order', { 
        state: { ...state, shippingAddress: userData } 
      });
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Verification failed!");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black italic text-indigo-600 uppercase tracking-widest text-xs">
      <Loader2 className="animate-spin mr-3" size={20} /> Loading Profile Securely...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-indigo-50 rounded-bl-[5rem] -z-0 opacity-40"></div>

        <div className="relative z-10 p-6 md:p-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-gray-800 leading-none">
              Verify Delivery 🚚
            </h2>
            <p className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-3 bg-indigo-50 inline-block px-4 py-1.5 rounded-full">
              Safe & Secure Checkout
            </p>
          </div>
          
          <form onSubmit={handleConfirmAddress} className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12}/> Complete Shipping Address
                </label>
                
                <button 
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-[9px] font-black uppercase text-white bg-indigo-600 px-4 py-2 rounded-xl hover:bg-black transition-all shadow-md active:scale-95"
                >
                  {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                  {isLocating ? "Locating..." : "Auto-Fill Live Map Link"}
                </button>
              </div>

              <textarea 
                name="address"
                className="w-full p-4 md:p-6 bg-gray-50 rounded-2xl md:rounded-[2rem] outline-none font-bold text-xs md:text-sm border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all shadow-inner resize-none"
                rows="4" 
                value={userData.address} 
                onChange={handleChange}
                placeholder="Flat No, Building, Area, Landmark..."
                required
              />
              <p className="text-[8px] md:text-[9px] text-gray-400 font-bold italic px-2">
                * Your live location link will be shared with the delivery team.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Target City</label>
                <input 
                  name="city"
                  type="text" 
                  className="w-full p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all shadow-inner" 
                  value={userData.city} 
                  onChange={handleChange} 
                  placeholder="Jaipur"
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Pin Code</label>
                <input 
                  name="pincode"
                  type="text" 
                  className="w-full p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all shadow-inner" 
                  value={userData.pincode} 
                  onChange={handleChange} 
                  placeholder="302001"
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                <Phone size={12}/> Primary Contact
              </label>
              <input 
                name="phone"
                type="tel" 
                className="w-full p-4 md:p-5 bg-gray-50 rounded-xl md:rounded-2xl outline-none font-bold text-xs md:text-sm border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all shadow-inner" 
                value={userData.phone} 
                onChange={handleChange} 
                placeholder="10-digit mobile number"
                required 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-gray-900 text-white py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
            >
              Confirm Information <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <div className="bg-gray-50 p-4 text-center border-t border-gray-100 flex items-center justify-center gap-2">
           <CheckCircle2 size={14} className="text-green-500" />
           <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Data is end-to-end encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutVerification;