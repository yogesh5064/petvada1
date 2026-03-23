import React, { useState, useEffect, useCallback } from 'react';
import { Hotel, Dog, Clock, Loader2, Calendar, Phone, ArrowLeft, Receipt, MailCheck, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminHostel = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ allStays: [], livePets: [] });
  const [loading, setLoading] = useState(true);
  
  // ✅ Billing & Modal States
  const [showBill, setShowBill] = useState(null); 
  const [isBilling, setIsBilling] = useState(false);

  // 🚀 Fetch Data logic
  const fetchStays = useCallback(async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) return toast.error("Session expired!");

      const config = { 
        headers: { Authorization: `Bearer ${userInfo.token}`, 'Cache-Control': 'no-cache' } 
      };

      const response = await axios.get('http://localhost:5000/api/admin/hostel-stays-from-appointments', config);
      
      if (response.data) {
        setData({
          allStays: response.data.allStays || [],
          livePets: response.data.livePets || []
        });
      }
    } catch (err) {
      toast.error("Hostel records fetch fail ho gaye!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStays(); }, [fetchStays]);

  // ✅ Step 1: Calculate Bill (Backend call)
  const handleCheckoutInitiate = async (id) => {
    setIsBilling(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const res = await axios.get(`http://localhost:5000/api/admin/hostel/generate-bill/${id}`, config);
      setShowBill({ ...res.data, appointmentId: id });
    } catch (err) {
      toast.error("Billing calculation error!");
    } finally {
      setIsBilling(false);
    }
  };

  // ✅ Step 2: Finalize Checkout (Updates Status & Triggers Backend Email)
  const finalizeCheckout = async () => {
    const loadingToast = toast.loading("Finalizing Stay & Sending Invoice Email... 📧");
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // Status 'Completed' bhejte hi controller email trigger kar dega
      await axios.put(`http://localhost:5000/api/admin/appointment/${showBill.appointmentId}`, { 
        status: 'Completed'
      }, config);
      
      toast.dismiss(loadingToast);
      toast.success("Checkout Successful! Invoice sent to email. 🧾");
      setShowBill(null);
      fetchStays(); 
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Checkout process fail ho gaya");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const loadingToast = toast.loading(`Updating to ${newStatus}...`);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`http://localhost:5000/api/admin/appointment/${id}`, { status: newStatus }, config);
      toast.dismiss(loadingToast);
      toast.success(`Updated to ${newStatus} 🏨`);
      fetchStays();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Update failed");
    }
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center font-black text-indigo-600 italic uppercase">
      <Loader2 className="animate-spin mb-2" size={40} /> Syncing Resort Desk...
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-12 animate-in fade-in duration-500 relative">
      
      {/* 🧾 BILLING MODAL (Professional Invoice) */}
      {showBill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-indigo-600 p-8 text-white text-center relative">
               <Receipt size={40} className="mx-auto mb-2 opacity-30"/>
               <h2 className="text-2xl font-black uppercase italic tracking-tighter">Final Invoice</h2>
               <p className="text-[10px] font-bold opacity-70 tracking-[0.3em] uppercase">No: {showBill.billing.invoiceNo}</p>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="bg-indigo-50/50 p-4 rounded-2xl flex items-center gap-3">
                  <MailCheck className="text-indigo-600" size={20}/>
                  <p className="text-[9px] font-black uppercase text-indigo-600 leading-tight">Invoice will be automatically shared with <br/>{showBill.customer.phone} via Email</p>
               </div>

               <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-indigo-500 uppercase mb-3">Resort Stay Summary</p>
                  <div className="space-y-2 text-xs font-bold text-gray-700 uppercase italic">
                     <p className="flex justify-between"><span>Pet Guest:</span> <span>{showBill.customer.pet}</span></p>
                     <p className="flex justify-between"><span>Stay Duration:</span> <span>{showBill.stay.duration}</span></p>
                     <p className="flex justify-between border-t border-dashed pt-2 mt-2"><span>Rate:</span> <span>₹{showBill.stay.rate}/Day</span></p>
                  </div>
               </div>

               <div className="space-y-2 px-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500 italic">
                    <span>Subtotal:</span><span>₹{showBill.billing.subTotal}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 italic">
                    <span>GST (18%):</span><span>₹{showBill.billing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-indigo-900 uppercase italic pt-3 border-t-2 border-dashed border-indigo-100">
                    <span>Total Pay:</span><span>₹{showBill.billing.grandTotal.toFixed(2)}</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-2">
                  <button onClick={() => setShowBill(null)} className="py-4 rounded-2xl text-[10px] font-black uppercase border-2 text-gray-400 hover:bg-gray-50 transition-all">Cancel</button>
                  <button onClick={finalizeCheckout} className="py-4 rounded-2xl text-[10px] font-black uppercase bg-indigo-600 text-white shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2">
                    Finalize & Email 🚀
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-indigo-600 transition-all mb-4">
             <ArrowLeft size={14}/> Dashboard
          </button>
          <h1 className="text-3xl font-black italic uppercase text-indigo-900 leading-none flex items-center gap-3">
             Resort Desk <Hotel size={28} className="text-indigo-600"/>
          </h1>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2 italic">Premium Boarding Management</p>
        </div>
        <div className="bg-indigo-600 px-8 py-5 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 flex items-center gap-8">
          <div className="text-center"><p className="text-[8px] font-black uppercase opacity-60 mb-1">Live Boarding</p><p className="text-3xl font-black leading-none">{data.livePets.length}</p></div>
          <div className="w-[1px] h-8 bg-white/20"></div>
          <div className="text-center"><p className="text-[8px] font-black uppercase opacity-60 mb-1">Approvals</p><p className="text-3xl font-black leading-none text-orange-300">{data.allStays.filter(s => s.status === 'Approved').length}</p></div>
        </div>
      </header>

      {/* SECTION 1: LIVE GUESTS */}
      <section>
        <div className="flex items-center gap-3 mb-6">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <h2 className="text-xl font-black uppercase italic text-gray-800 tracking-tight">Active Guests</h2>
        </div>
        
        {data.livePets.length === 0 ? (
          <div className="bg-white p-20 rounded-[4rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center opacity-40">
             <Dog size={48} className="mb-4 text-gray-300"/>
             <p className="text-[10px] font-black uppercase tracking-widest italic">No Pets Boarding Right Now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.livePets.map(pet => (
              <div key={pet._id} className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm relative group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                  <div className="absolute top-6 right-8 flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <ShieldCheck size={12} className="text-green-600"/>
                    <span className="text-[9px] font-black text-green-600 uppercase">Live</span>
                  </div>

                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-16 h-16 bg-indigo-50 rounded-[1.8rem] flex items-center justify-center text-3xl font-black text-indigo-600 italic">
                        {pet.petName?.[0]}
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-gray-800 italic uppercase leading-none">{pet.petName}</h3>
                        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Owner: {pet.owner?.name}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                       <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Check-In</p>
                       <p className="text-[11px] font-black text-gray-700 italic">{new Date(pet.checkInDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                       <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Planned Out</p>
                       <p className="text-[11px] font-black text-red-500 italic">{pet.checkOutDate || 'Not Fixed'}</p>
                    </div>
                  </div>

                  <button 
                    disabled={isBilling}
                    onClick={() => handleCheckoutInitiate(pet._id)} 
                    className="w-full py-5 bg-gray-900 text-white rounded-[1.8rem] text-[10px] font-black uppercase shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    {isBilling ? <Loader2 className="animate-spin" size={16}/> : <>Generate Bill & Checkout <Receipt size={16}/></>}
                  </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: HISTORY & REQUESTS */}
      <section>
        <h2 className="text-xl font-black uppercase italic text-gray-800 mb-8 px-1">Desk Log & Requests</h2>
        <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">
                <th className="p-8">Guest / Parent</th>
                <th className="p-8">Stay Schedule</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold italic uppercase">
              {data.allStays.map(stay => (
                <tr key={stay._id} className="group hover:bg-indigo-50/10 transition-all text-xs text-gray-600">
                  <td className="p-8">
                    <p className="font-black text-gray-800 leading-none mb-1 text-sm">{stay.petName}</p>
                    <p className="text-[9px] text-gray-400 tracking-tighter italic lowercase">{stay.owner?.email}</p>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-2">
                       <Calendar size={14} className="text-gray-300"/>
                       <span>{new Date(stay.checkInDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase border ${
                      stay.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                      stay.status === 'Approved' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      stay.status === 'Checked-In' ? 'bg-green-50 text-green-600 border-green-100' : 
                      stay.status === 'Completed' ? 'bg-gray-50 text-gray-400 border-gray-200 opacity-50' : ''
                    }`}>
                      {stay.status}
                    </span>
                  </td>
                  <td className="p-8 text-right space-x-2">
                    {stay.status === 'Pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(stay._id, 'Approved')} className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase hover:bg-black transition-all">Approve</button>
                        <button onClick={() => handleStatusUpdate(stay._id, 'Cancelled')} className="bg-red-50 text-red-500 px-5 py-3 rounded-2xl text-[9px] font-black border border-red-100 hover:bg-red-500 hover:text-white transition-all">Reject</button>
                      </>
                    )}
                    {stay.status === 'Approved' && (
                      <button onClick={() => handleStatusUpdate(stay._id, 'Checked-In')} className="bg-green-600 text-white px-6 py-3.5 rounded-2xl text-[9px] font-black uppercase hover:bg-black shadow-lg transition-all">Mark Check-In 🏨</button>
                    )}
                    {stay.status === 'Completed' && <span className="text-[8px] text-gray-300 font-black">Record Archived</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminHostel;