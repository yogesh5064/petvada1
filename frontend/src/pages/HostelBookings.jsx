import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Hotel, Calendar, Clock, CheckCircle2, Timer, 
  ArrowLeft, Loader2, ChevronRight, MapPin, 
  AlertCircle, History, Package, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const HostelBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  useEffect(() => {
    const fetchStays = async () => {
      try {
        const { data } = await axios.get('https://petvada1.onrender.com/api/appointments/my', config);
        
        // Filter fix: Matches your data (category: "Hostel")
        const hostelStays = data.filter(app => 
          app.category?.toLowerCase() === 'hostel'
        );
        
        setBookings(hostelStays.reverse()); 
      } catch (err) {
        toast.error("Records load nahi hue!");
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.token) fetchStays();
    else setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'checked-in': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'completed': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-[#F8FAFC]">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      <p className="font-black italic text-gray-400 uppercase tracking-[0.3em] text-[10px]">Syncing Resort Passport...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <div className="max-w-5xl mx-auto p-4 md:p-8 pt-12">
        
        {/* --- Top Navigation --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                 <History size={20} className="text-indigo-600" />
               </div>
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Boarding Logs</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">
              STAY <span className="text-indigo-600">HISTORY</span>
            </h1>
          </div>
          
          <button onClick={() => navigate('/hostel')} className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-600 bg-white px-8 py-5 rounded-[2rem] border border-gray-100 shadow-sm hover:-translate-y-1 transition-all">
            <ArrowLeft size={16} /> New Reservation
          </button>
        </div>

        {/* --- Bookings List --- */}
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {bookings.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
              <Timer size={32} className="mx-auto text-gray-300 mb-4" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic text-center">No resort records found</p>
            </div>
          ) : (
            bookings.map((stay) => (
              <div key={stay._id} className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 group relative overflow-hidden p-6 md:p-10">
                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  
                  {/* Left: Pet Avatar */}
                  <div className="flex items-center md:items-start gap-6">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2rem] flex items-center justify-center text-2xl md:text-4xl font-black text-white italic shadow-lg">
                      {stay.petName?.[0] || 'P'}
                    </div>
                    <div>
                      <h3 className="text-xl md:text-3xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight">{stay.petName}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase border border-indigo-100">#{stay._id.slice(-6)}</span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-tighter ${getStatusColor(stay.status)}`}>{stay.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Timeline */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:px-8 py-6 md:py-0 border-y md:border-y-0 md:border-x border-gray-50">
                    <div className="space-y-2">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
                      <div className="flex items-center gap-2">
                         <p className="text-[10px] font-black text-gray-800 uppercase italic">{new Date(stay.checkInDate || stay.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                         <ArrowRight size={12} className="text-gray-300" />
                         <p className="text-[10px] font-black text-gray-800 uppercase italic">{stay.checkOutDate ? new Date(stay.checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '---'}</p>
                      </div>
                      <p className="text-[9px] font-bold text-indigo-500 flex items-center gap-1">
                        <Clock size={10} /> {stay.checkInTime || stay.time}
                      </p>
                    </div>

                    <div className="space-y-1 md:pl-4">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Package Details</p>
                      <p className="text-xs font-black text-gray-800 uppercase italic leading-relaxed">
                        {stay.notes || stay.reason || 'Standard Stay'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Price Display (Matches Backend 'charges') */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center min-w-[130px]">
                    <div className="text-left md:text-right">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Stay Total</p>
                      <p className="text-xl md:text-3xl font-black text-indigo-600 italic tracking-tighter">
                        ₹{Number(stay.charges || stay.totalPrice || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-4">
                  <MapPin size={12} className="text-indigo-400" />
                  <p className="text-[9px] font-bold text-gray-500 uppercase italic">Paws Resort HQ • Verified Entry</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HostelBookings;