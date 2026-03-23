import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Clock, CheckCircle2, ArrowRight, 
  Bone, Star, Crown, Loader2, Info 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Hostel = () => {
  const [loading, setLoading] = useState(true);
  const [activeStay, setActiveStay] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPets, setSelectedPets] = useState([]); 
  const [formData, setFormData] = useState({
    checkInDate: '', 
    checkOutDate: '',
    checkInTime: '', 
    checkOutTime: '', 
    reason: ''
  });
  const [myPets, setMyPets] = useState([]);

  const packages = [
    { id: 'Basic', name: 'Starter', price: 499, icon: <Bone size={18} />, color: 'bg-orange-500', features: ['Std Room', '2 Meals'] },
    { id: 'Premium', name: 'Deluxe', price: 899, icon: <Star size={18} />, color: 'bg-indigo-600', features: ['AC Suite', '3 Meals'] },
    { id: 'VIP', name: 'Royal', price: 1499, icon: <Crown size={18} />, color: 'bg-yellow-500', features: ['Private Pool', 'SPA'] }
  ];

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, appRes] = await Promise.all([
          axios.get('http://localhost:5000/api/pets/my-pets', config),
          axios.get('http://localhost:5000/api/appointments/my', config)
        ]);
        setMyPets(petsRes.data);
        const current = appRes.data.find(s => s.category?.toLowerCase() === 'hostel' && s.status === 'Checked-In');
        setActiveStay(current);
      } catch (err) { 
        toast.error("Data load fail!"); 
      } finally { 
        setLoading(false); 
      }
    };
    if (userInfo?.token) fetchData();
  }, []);

  const togglePet = (pet) => {
    const isSelected = selectedPets.some(p => p._id === pet._id);
    if (isSelected) {
      setSelectedPets(selectedPets.filter(p => p._id !== pet._id));
    } else {
      setSelectedPets([...selectedPets, pet]);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedPackage || selectedPets.length === 0) return toast.error("Selection missing!");

    const loadingToast = toast.loading("Booking your stay...");

    try {
      // Calculate Days for Price
      const start = new Date(formData.checkInDate);
      const end = new Date(formData.checkOutDate);
      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
      
      const finalPrice = selectedPackage.price * selectedPets.length * diffDays;

      const bookingData = {
        pet: selectedPets[0]._id, // Matches Backend Schema
        owner: userInfo._id,
        petName: selectedPets.map(p => p.name).join(", "),
        petType: selectedPets[0].petType || 'Dog', 
        category: 'Hostel',
        
        // Date/Time Sync
        checkInDate: formData.checkInDate,
        checkInTime: formData.checkInTime,
        checkOutDate: formData.checkOutDate,
        checkOutTime: formData.checkOutTime,
        
        // Price Sync with Schema 'charges'
        charges: finalPrice, 
        totalPrice: finalPrice, // Keeping for generic compatibility
        
        // Notes Sync
        notes: `Pkg: ${selectedPackage.name}. ${formData.reason || ''}`,
        reason: `Pkg: ${selectedPackage.name}. ${formData.reason || ''}`,
        
        date: formData.checkInDate, // For generic list
        time: formData.checkInTime, // For generic list
        visitType: 'Walk-in'
      };

      await axios.post('http://localhost:5000/api/appointments', bookingData, config);
      toast.dismiss(loadingToast);
      toast.success(`Booking Confirmed for ₹${finalPrice}! 🐾`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) { 
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Booking failed!");
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-black italic text-indigo-600 uppercase tracking-widest text-xs gap-3 bg-[#F8FAFC]">
      <Loader2 className="animate-spin" size={24} /> Syncing Resort...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 p-3 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 pt-6 md:pt-12">
        
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2 text-center md:text-left">Luxury Boarding</p>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-gray-800 text-center md:text-left">
              PET <span className="text-indigo-600">RESORT</span>
            </h1>
          </div>
        </div>

        {/* Step 1: Packages */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Step 1: Select Tier</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
            {packages.map((pkg) => (
              <div 
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`min-w-[75%] md:min-w-[280px] snap-center p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative ${
                  selectedPackage?.id === pkg.id 
                  ? 'border-indigo-600 bg-white shadow-xl scale-[1.02]' 
                  : 'border-transparent bg-white shadow-sm hover:border-indigo-100'
                }`}
              >
                <div className={`${pkg.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>{pkg.icon}</div>
                <p className="text-3xl font-black text-gray-900 italic tracking-tighter mb-4">₹{pkg.price}</p>
                <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider mb-4">{pkg.name} Tier</h3>
                <div className="flex flex-wrap gap-2">
                   {pkg.features.map(f => (
                     <span key={f} className="text-[8px] font-black bg-gray-50 px-2 py-1 rounded-lg text-gray-500 border border-gray-100 uppercase">{f}</span>
                   ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all duration-500 ${selectedPackage ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
          <form onSubmit={handleBooking} className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step 2: Select Guests ({selectedPets.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {myPets.map(pet => {
                  const isSelected = selectedPets.some(p => p._id === pet._id);
                  return (
                    <div 
                      key={pet._id}
                      onClick={() => togglePet(pet)}
                      className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer text-center relative ${
                        isSelected ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-transparent bg-white shadow-sm hover:bg-indigo-50/20'
                      }`}
                    >
                      <div className="text-2xl mb-2">🐶</div>
                      <p className={`text-[11px] font-black uppercase truncate ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>{pet.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Step 3: Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-4 border border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Arrival</span>
                  <input type="date" required min={today} value={formData.checkInDate} className="w-full text-xs font-bold p-4 bg-gray-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, checkInDate: e.target.value})} />
                  <input type="time" required value={formData.checkInTime} className="w-full text-xs font-bold p-4 bg-gray-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, checkInTime: e.target.value})} />
                </div>
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-4 border border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Departure</span>
                  <input type="date" required min={formData.checkInDate || today} value={formData.checkOutDate} className="w-full text-xs font-bold p-4 bg-gray-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, checkOutDate: e.target.value})} />
                  <input type="time" required value={formData.checkOutTime} className="w-full text-xs font-bold p-4 bg-gray-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, checkOutTime: e.target.value})} />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-6 md:py-8 rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1">
              Confirm Reservation <ArrowRight size={20} />
              {selectedPackage && selectedPets.length > 0 && (
                <span className="text-[10px] font-bold text-indigo-400 opacity-80 uppercase italic">
                  Total Estimate: ₹{selectedPackage.price * selectedPets.length}
                </span>
              )}
            </button>
          </form>

          <div className="hidden lg:block lg:col-span-4">
             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm sticky top-24 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Summary</h4>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Tier</span>
                  <span className="text-xs font-black italic">{selectedPackage?.name || '---'}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Guests</span>
                  <span className="text-xs font-black italic">{selectedPets.length}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[10px] font-black text-indigo-600 uppercase">Total</span>
                  <span className="text-xl font-black italic text-slate-900">₹{selectedPackage ? (selectedPackage.price * selectedPets.length) : '0'}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hostel;