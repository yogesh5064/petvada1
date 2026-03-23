import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Calendar, Clock, Trash2, Navigation, Home, Footprints, 
  AlertCircle, ChevronRight, X, MapPin, Sparkles, Activity
} from 'lucide-react';

const Appointment = ({ initialCategory }) => {
  const [loading, setLoading] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);
  const [registeredPets, setRegisteredPets] = useState([]);
  const [visitType, setVisitType] = useState('Walk-in');
  
  const [formData, setFormData] = useState({
    petName: '', petType: '', breed: '', category: initialCategory || '', 
    date: '', time: '', reason: '', houseFlat: '', landmark: '',
    detectedAddress: '', location: { lat: null, lng: null }
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
  const today = new Date().toISOString().split('T')[0];
  const categories = ["Treatment", "Grooming", "Vaccination", "Hostel"];

  const fetchInitialData = async () => {
    try {
      const [petsRes, appRes] = await Promise.all([
        axios.get('https://petvada1.onrender.com/api/pets/my-pets', config),
        axios.get('https://petvada1.onrender.com/api/appointments/my', config)
      ]);
      setRegisteredPets(petsRes.data);
      setMyAppointments(appRes.data);
    } catch (err) { toast.error("Data load fail!"); }
  };
cvds
  useEffect(() => { 
    if (userInfo?.token) fetchInitialData(); 
    if(initialCategory) setFormData(prev => ({ ...prev, category: initialCategory }));
  }, [initialCategory]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!formData.petType) return toast.error("Please select a pet correctly!");
    setLoading(true);
    try {
      const fullAddressString = visitType === 'Home Visit' 
        ? `${formData.houseFlat}, ${formData.landmark}, ${formData.detectedAddress}`
        : 'Clinic Visit';
      const finalData = { ...formData, address: fullAddressString, visitType };
      await axios.post('https://petvada1.onrender.com/api/appointments', finalData, config);
      toast.success(`${formData.category} Booking Done! 🐾`);
      setFormData({ 
        petName: '', petType: '', breed: '', category: initialCategory || '', date: '', time: '', reason: '',
        houseFlat: '', landmark: '', detectedAddress: '', location: { lat: null, lng: null } 
      });
      fetchInitialData();
    } catch (err) { toast.error("Booking fail!"); } finally { setLoading(false); }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, location: { lat: latitude, lng: longitude } }));
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        if (data.display_name) setFormData(prev => ({ ...prev, detectedAddress: data.display_name }));
        toast.success("Location detected! 📍");
        setLoading(false);
      }, () => { setLoading(false); toast.error("Access denied!"); });
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-14 ${!initialCategory ? 'mt-12 md:mt-6 mb-24' : ''}`}>
      
      {/* 🏥 Form Section (60% width on Desktop) */}
      <div className="lg:col-span-7 bg-white p-6 md:p-14 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 h-fit relative overflow-hidden group">
        {/* Decorative Circle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] -z-0 opacity-40 group-hover:w-40 group-hover:h-40 transition-all duration-700"></div>

        <div className="relative z-10">
          <header className="mb-10 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
               <Sparkles size={16} className="text-indigo-500" />
               <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Priority Booking</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
              {initialCategory ? `Schedule ${initialCategory}` : 'New Reservation'}
            </h2>
          </header>
          
          {!initialCategory && (
            <div className="flex gap-3 mb-10 bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
              <button type="button" onClick={() => setVisitType('Walk-in')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[11px] uppercase transition-all tracking-widest ${visitType === 'Walk-in' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-100'}`}>
                <Footprints size={16}/> Walk-in
              </button>
              <button type="button" onClick={() => setVisitType('Home Visit')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[11px] uppercase transition-all tracking-widest ${visitType === 'Home Visit' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-100'}`}>
                <Home size={16}/> Home Visit
              </button>
            </div>
          )}

          <form onSubmit={handleBooking} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Select Patient</label>
                <select 
                  value={formData.petName} 
                  onChange={(e) => {
                    const pet = registeredPets.find(p => p.name === e.target.value);
                    if(pet) setFormData({ ...formData, petName: pet.name, petType: pet.petType, breed: pet.breed });
                  }} 
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all shadow-inner" 
                  required
                >
                  <option value="">-- Select Registered Pet --</option>
                  {registeredPets.map(pet => <option key={pet._id} value={pet.name}>{pet.name} ({pet.petType})</option>)}
                </select>
                {registeredPets.length === 0 && <p className="text-[8px] font-bold text-rose-500 ml-2 uppercase">* No pets registered yet</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Appointment Date</label>
                <input type="date" min={today} value={formData.date} onChange={(e)=>setFormData({...formData, date: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white shadow-inner" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Preferred Time</label>
                <input type="time" value={formData.time} onChange={(e)=>setFormData({...formData, time: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white shadow-inner" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Medical Service</label>
                <select 
                  value={formData.category} 
                  disabled={!!initialCategory}
                  onChange={(e)=>setFormData({...formData, category: e.target.value})} 
                  className={`w-full p-5 rounded-2xl font-black text-sm outline-none border-2 border-transparent shadow-inner ${initialCategory ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 focus:border-indigo-500 focus:bg-white'}`} 
                  required
                >
                  <option value="">-- Choose Service --</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            {visitType === 'Home Visit' && !initialCategory && (
              <div className="space-y-4 p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center gap-2 mb-2">
                   <MapPin size={14} className="text-indigo-600" />
                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Location Logistics</span>
                </div>
                <button type="button" onClick={handleGetCurrentLocation} className="w-full py-4 bg-white text-indigo-600 rounded-xl border-2 border-dashed border-indigo-200 flex items-center justify-center gap-3 text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm">
                   {loading ? "Syncing Satellites..." : "Use Precise Location"}
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="House/Flat No." className="w-full p-5 bg-white rounded-xl font-bold text-sm outline-none focus:border-indigo-500 border-2 border-transparent shadow-sm" value={formData.houseFlat} onChange={(e) => setFormData({...formData, houseFlat: e.target.value})} required />
                  <input type="text" placeholder="Area Landmark" className="w-full p-5 bg-white rounded-xl font-bold text-sm outline-none focus:border-indigo-500 border-2 border-transparent shadow-sm" value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} required />
                </div>
                {formData.detectedAddress && (
                  <p className="text-[9px] font-bold text-slate-400 italic px-2">Detected: {formData.detectedAddress.substring(0, 60)}...</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Medical Notes / Symptoms</label>
              <textarea 
                  placeholder="Describe pet condition or special requirements..."
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white shadow-inner min-h-[120px]"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </div>

            <button disabled={loading || registeredPets.length === 0} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3">
              {loading ? <Clock className="animate-spin" size={18} /> : `Confirm ${formData.category || 'Visit'}`}
            </button>
          </form>
        </div>
      </div>

      {/* 🕒 History Section (40% width on Desktop) */}
      {!initialCategory && (
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-slate-900 italic uppercase flex items-center gap-3 tracking-tighter">
                <Activity className="text-indigo-600" size={28}/> History Vault
              </h2>
              <div className="px-3 py-1 bg-slate-100 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest">
                {myAppointments.length} Records
              </div>
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-hide pb-20 custom-scrollbar">
              {myAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 opacity-60">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                     <Calendar className="text-slate-300" size={32} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-10">Your clinical journey starts here</p>
                </div>
              ) : (
                myAppointments.map((app, idx) => (
                  <div 
                    key={app._id} 
                    className="bg-white p-5 md:p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:border-indigo-100 transition-all duration-500 animate-in slide-in-from-right-10"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl italic group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-500 shadow-lg">
                        {app.petName[0]}
                      </div>
                      <div>
                        <h4 className="text-sm md:text-base font-black text-slate-900 uppercase italic leading-none">{app.petName}</h4>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{app.category}</span>
                           <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                           <span className="text-[9px] font-bold text-slate-300 uppercase italic">Ref: {app._id.slice(-4).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest inline-block shadow-sm ${
                        app.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>
                        {app.status}
                      </div>
                      <p className="text-[10px] font-black text-slate-800 mt-3 flex items-center justify-end gap-1">
                        <Calendar size={10} className="text-indigo-400" />
                        {new Date(app.date).toLocaleDateString('en-GB', {day:'2-digit', month:'short'})}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
      )}
    </div>
  );
};

export default Appointment;