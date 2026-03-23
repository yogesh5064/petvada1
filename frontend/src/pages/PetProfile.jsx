import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, ShieldCheck, Clock, Stethoscope, 
  Calendar, Pill, Loader2, Activity, Heart,
  ChevronRight, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const PetProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`http://localhost:5000/api/pets/${id}`, config);
        setPet(data);
      } catch (err) {
        toast.error("Pet details nahi mil payi!");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPetDetails();
  }, [id, navigate]);

  // LOGIC UNCHANGED - Exactly as you provided
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age > 0 ? `${age} Years` : 'Newborn';
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} strokeWidth={3} />
      <p className="uppercase tracking-[0.3em] font-black text-[10px] text-slate-400">Loading Vault... 🐾</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFCFE] pb-24 selection:bg-indigo-100">
      <div className="max-w-5xl mx-auto p-4 md:p-8 pt-10 md:pt-16">
        
        {/* ⬅️ Top Bar */}
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 font-black text-slate-900 hover:text-indigo-600 transition-all uppercase text-[10px] bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 active:scale-95 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Profile Verified</span>
          </div>
        </div>

        {/* 💳 Identity Card */}
        <div className="relative bg-slate-900 rounded-[3rem] p-8 md:p-14 text-white shadow-2xl shadow-indigo-100 mb-12 overflow-hidden group">
          {/* Background Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-8 md:gap-12">
            {/* Avatar */}
            <div className="relative">
              <div className="w-36 h-36 md:w-52 md:h-52 bg-white/10 backdrop-blur-xl rounded-[3rem] md:rounded-[4rem] flex items-center justify-center text-7xl md:text-8xl shadow-2xl border border-white/20">
                {pet.petType === 'Dog' ? '🐶' : pet.petType === 'Cat' ? '🐱' : '🐰'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-3 rounded-2xl shadow-lg border-4 border-slate-900">
                <ShieldCheck size={20} />
              </div>
            </div>
            
            <div className="text-center lg:text-left flex-grow">
              <div className="inline-block px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-indigo-300 text-[9px] font-black uppercase tracking-widest mb-4">
                Pet Passport
              </div>
              <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-6">{pet.name}</h1>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5">{pet.petType}</span>
                <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5">{pet.breed}</span>
                <span className="px-5 py-2 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-900/20">{calculateAge(pet.dob)} OLD</span>
              </div>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-white/10 relative z-10">
             <div className="flex items-center gap-4 group/item">
                <div className="p-3 bg-white/5 rounded-xl group-hover/item:bg-indigo-600 transition-colors"><ShieldCheck size={18} className="text-indigo-400 group-hover/item:text-white" /></div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vault ID</p>
                  <p className="text-xs md:text-sm font-black tracking-widest">#PV-{pet._id.slice(-6).toUpperCase()}</p>
                </div>
             </div>
             <div className="flex items-center gap-4 group/item">
                <div className="p-3 bg-white/5 rounded-xl group-hover/item:bg-orange-500 transition-colors"><Calendar size={18} className="text-orange-400 group-hover/item:text-white" /></div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Registration</p>
                  <p className="text-xs md:text-sm font-black uppercase">{new Date(pet.dob).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'})}</p>
                </div>
             </div>
          </div>
        </div>

        {/* 🩺 Timeline Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
             <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100"><Stethoscope size={24} /></div>
             <h2 className="text-2xl md:text-4xl font-black text-slate-900 italic tracking-tighter uppercase">Medical History</h2>
             <div className="h-[2px] flex-1 bg-slate-100 rounded-full"></div>
          </div>

          {pet.history && pet.history.length > 0 ? (
            pet.history.map((visit, idx) => (
              <div key={visit._id} className="group bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 font-black shadow-inner group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic leading-none">{visit.category}</h3>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Activity size={12} className="text-indigo-400" /> {new Date(visit.date).toDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${
                      visit.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {visit.status}
                    </span>
                  </div>

                  <div className="mb-8 px-2 border-l-4 border-indigo-50 py-1 ml-2">
                     <p className="text-sm md:text-lg font-bold text-slate-600 italic leading-relaxed">
                       " {visit.reason || `Scheduled check-up for ${visit.category}`} "
                     </p>
                  </div>

                  {/* 💊 Prescription Section */}
                  {visit.prescription || visit.adminNote ? (
                    <div className="bg-slate-50 rounded-[2rem] p-6 md:p-8 border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors duration-500">
                      <div className="flex items-center gap-2 text-indigo-600 mb-6">
                        <Award size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Vet's Assessment & Plan</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Medical Notes</span>
                          <p className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight leading-snug">
                            {visit.prescription?.medicine || visit.adminNote || "Observation only"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Clinical Advice</span>
                          <p className="text-[11px] md:text-xs font-bold text-slate-500 italic leading-relaxed">
                            {visit.prescription?.instructions || "Monitor vitals and maintain current dietary plan."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-[2rem]">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] italic text-center">Awaiting detailed lab reports</p>
                    </div>
                  )}
                </div>
                {/* Subtle Hover Decoration */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
              </div>
            ))
          ) : (
            <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
               <Heart className="mx-auto text-slate-100 mb-4 animate-pulse" size={48} />
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">No records found for {pet.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetProfile;