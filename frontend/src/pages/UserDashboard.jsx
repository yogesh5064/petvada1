import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Calendar, Hotel, Plus, X, 
  Clock, Loader2, ChevronRight, Heart, 
  ShieldCheck, Zap, Activity, Info, Sparkles, TrendingUp
} from 'lucide-react'; 
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]); 
  const [userProfile, setUserProfile] = useState({ healthScore: 0, loyaltyPoints: 0 });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPet, setNewPet] = useState({ name: '', petType: '', breed: '', dob: '' });
  
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${userInfo?.token}` } }), [userInfo?.token]);
  const maxDate = new Date().toISOString().split("T")[0];

  // Dynamic Greeting Logic
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  useEffect(() => {
    if (!userInfo) navigate('/login');
    else if (userInfo.role === 'admin') navigate('/admin');
    else fetchData();
  }, [userInfo]);

  const fetchData = async () => {
    try {
      const [petRes, appRes, profileRes] = await Promise.all([
        axios.get('http://localhost:5000/api/pets/my-pets', config),
        axios.get('http://localhost:5000/api/appointments/my', config),
        axios.get('http://localhost:5000/api/users/profile', config)
      ]);
      setPets(petRes.data);
      setAppointments(appRes.data);
      setUserProfile({
        healthScore: profileRes.data.healthScore || 94,
        loyaltyPoints: profileRes.data.loyaltyPoints || 450
      });
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally { setLoading(false); }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/pets', newPet, config);
      setPets((prev) => [data, ...prev]); 
      setShowModal(false);
      setNewPet({ name: '', petType: '', breed: '', dob: '' });
      toast.success(`${newPet.name} has been registered! 🐾`);
    } catch (err) { toast.error("Registration failed"); }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <Loader2 className="animate-spin text-indigo-600" size={50} strokeWidth={1} />
        <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500 animate-pulse" size={18} />
      </div>
      <p className="mt-6 font-black text-[10px] text-slate-400 uppercase tracking-[0.4em] italic">Syncing Pet Database...</p>
    </div>
  );

  return (
    <div className="bg-[#FBFCFE] min-h-screen w-full lg:pl-28 pb-24 font-sans selection:bg-indigo-100">
      <div className="max-w-[1400px] mx-auto p-4 md:p-12 space-y-12">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10 mt-10 md:mt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 w-fit rounded-full border border-indigo-100 mb-2">
              <Sparkles size={12} className="text-indigo-600" />
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{greeting}</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight italic leading-none">
              Hey, <span className="text-indigo-600 underline decoration-indigo-100 underline-offset-8">{userInfo?.name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 pt-2">
              <ShieldCheck size={14} className="text-emerald-500" /> Vault secured • {pets.length} Active Profiles
            </p>
          </div>
          
          <button onClick={() => setShowModal(true)} className="group w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-[2.2rem] font-black text-[11px] tracking-widest shadow-2xl active:scale-95 flex items-center justify-center gap-4 transition-all hover:bg-indigo-600 hover:-translate-y-1">
            <Plus size={20} strokeWidth={4} className="group-hover:rotate-90 transition-transform" /> NEW REGISTRATION
          </button>
        </header>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <StatCard title="Health Score" value={`${userProfile.healthScore}%`} icon={<Activity className="text-emerald-500" />} trend="Safe" />
          <StatCard title="Total Pets" value={pets.length} icon={<Heart className="text-rose-500" />} trend="Active" />
          <StatCard title="Schedules" value={appointments.length} icon={<Calendar className="text-amber-500" />} trend="Pending" />
          <StatCard title="Reward Points" value={userProfile.loyaltyPoints} icon={<Zap className="text-indigo-500" />} trend="+45 Today" />
        </div>

        {/* --- QUICK SERVICES --- */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <TrendingUp size={18} className="text-indigo-500" />
            <h2 className="text-sm font-black italic uppercase tracking-[0.2em] text-slate-400">Quick Services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
            <PremiumService color="bg-orange-500" icon={<Calendar />} label="Book Vet" onClick={() => navigate('/appointments')} />
            <PremiumService color="bg-emerald-500" icon={<ShoppingBag />} label="Premium Shop" onClick={() => navigate('/shop')} />
            <PremiumService color="bg-blue-600" icon={<Hotel />} label="Pet Resort" onClick={() => navigate('/hostel')} />
          </div>
        </section>

        {/* --- PET COLLECTION --- */}
        <section className="space-y-8">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800">Your Pet Vault</h2>
            <div className="h-[2px] flex-1 bg-slate-100 rounded-full"></div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Scroll to explore</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {pets.map((pet, idx) => (
              <PetProCard 
                key={pet._id} 
                pet={pet} 
                delay={idx * 100}
                // Checking for upcoming appointments
                hasApp={appointments.some(a => a.petName?.toLowerCase() === pet.name.toLowerCase() && a.status === 'Pending')} 
              />
            ))}
          </div>
        </section>
      </div>

      {/* --- MODAL (Logic same, UI Enhanced) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] md:rounded-[4rem] p-10 md:p-14 relative shadow-2xl animate-in slide-in-from-bottom-20 duration-500">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"><X size={20}/></button>
            <form onSubmit={handleAddPet} className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                   <Plus size={32} strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Pet Registration</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Identity Encryption Protocol Active</p>
              </div>
              <input type="text" placeholder="Pet Name" value={newPet.name} onChange={(e) => setNewPet({...newPet, name: e.target.value})} className="w-full p-6 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all shadow-inner" required />
              <div className="grid grid-cols-2 gap-4">
                <select value={newPet.petType} onChange={(e) => setNewPet({...newPet, petType: e.target.value})} className="p-6 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white shadow-inner appearance-none" required>
                  <option value="">Species</option>
                  <option value="Dog">Dog</option><option value="Cat">Cat</option>
                </select>
                <input type="text" placeholder="Breed" value={newPet.breed} onChange={(e) => setNewPet({...newPet, breed: e.target.value})} className="p-6 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white shadow-inner" required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase px-2 tracking-widest">Date of Birth</label>
                <input type="date" max={maxDate} value={newPet.dob} onChange={(e) => setNewPet({...newPet, dob: e.target.value})} className="w-full p-6 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white shadow-inner" required />
              </div>
              <button className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black text-[12px] tracking-[0.3em] uppercase shadow-2xl hover:bg-indigo-600 transition-all transform active:scale-95 mt-4">Initialize Sync</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
    <div className="flex justify-between items-start mb-6">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
        <span className="text-[8px] font-black text-emerald-600 italic uppercase">{trend}</span>
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <h4 className="text-3xl md:text-4xl font-black italic text-slate-900 leading-none mt-2 group-hover:text-indigo-600 transition-colors">{value}</h4>
    </div>
  </div>
);

const PremiumService = ({ color, icon, label, onClick }) => (
  <button onClick={onClick} className="group relative w-full h-36 rounded-[3rem] overflow-hidden shadow-sm active:scale-95 transition-all">
    <div className={`absolute inset-0 ${color} opacity-95 group-hover:scale-110 transition-transform duration-700`}></div>
    <div className="relative z-10 p-10 flex items-center gap-6 text-white h-full">
      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[1.8rem] flex items-center justify-center shadow-lg border border-white/30 group-hover:rotate-12 transition-transform duration-500">
        {React.cloneElement(icon, { size: 30 })}
      </div>
      <h3 className="font-black italic text-2xl uppercase tracking-tighter leading-none">{label}</h3>
    </div>
    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
  </button>
);

const PetProCard = ({ pet, delay, hasApp }) => {
  const navigate = useNavigate();

  const age = useMemo(() => {
    if (!pet.dob) return { y: 0, m: 0 };
    const birth = new Date(pet.dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) { years--; months += 12; }
    return { y: years, m: months };
  }, [pet.dob]);

  return (
    <div style={{ animationDelay: `${delay}ms` }} className="group relative bg-white rounded-[3.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15)] transition-all duration-700 animate-in slide-in-from-bottom-12">
      
      {/* Top Section */}
      <div className="flex justify-between items-start mb-8">
        <div className="relative">
          <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 border border-slate-100/50">
            {pet.petType === 'Dog' ? '🐶' : pet.petType === 'Cat' ? '🐱' : '🐾'}
          </div>
          {hasApp && (
            <div className="absolute -top-1 -left-1 px-3 py-1 bg-rose-500 text-white text-[7px] font-black rounded-full shadow-lg animate-bounce uppercase tracking-widest">Appointment</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
           <span className="bg-slate-900 text-white text-[8px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">{pet.petType}</span>
           <p className="text-[8px] font-bold text-slate-300 italic uppercase">ID: {pet._id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="mb-8">
        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{pet.name}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
          <Info size={12} className="text-indigo-400" /> {pet.breed || "Pure Species"}
        </p>
      </div>

      {/* Progress / Health Peek */}
      <div className="mb-8 space-y-2">
         <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
            <span>Health Status</span>
            <span className="text-emerald-500">Optimal</span>
         </div>
         <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[88%] group-hover:w-[92%] transition-all duration-1000"></div>
         </div>
      </div>

      {/* Age Bar */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100/50 group-hover:bg-white group-hover:shadow-md transition-all">
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Years</p>
          <p className="text-xl font-black text-slate-800 italic">{age.y}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100/50 group-hover:bg-white group-hover:shadow-md transition-all">
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Months</p>
          <p className="text-xl font-black text-slate-800 italic">{age.m}</p>
        </div>
      </div>

      {/* Button */}
      <button 
        onClick={() => navigate(`/pet-profile/${pet._id}`)} 
        className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 hover:bg-indigo-600 shadow-xl active:scale-95"
      >
        Access Vault <ChevronRight size={16} strokeWidth={3} />
      </button>
    </div>
  );
};

export default UserDashboard;