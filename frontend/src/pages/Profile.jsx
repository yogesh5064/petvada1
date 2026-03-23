import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Camera, Loader2, Trophy, Plus, MapPin, Trash2, Home, 
  Briefcase, X, Navigation, Lock, User, LogOut, Bell, 
  ShieldCheck, CheckCircle2, Eye, EyeOff 
} from 'lucide-react';

const Profile = () => {
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userInfo')));
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  const [showAddrModal, setShowAddrModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);

  const [name, setName] = useState(userData?.name || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [image, setImage] = useState(null);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  
  const [newAddr, setNewAddr] = useState({ label: 'Home', fullAddress: '', city: '', pincode: '', phone: '' });

  const config = { headers: { Authorization: `Bearer ${userData?.token}` } };

  useEffect(() => { if (userData) fetchAddresses(); }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get('https://petvada1.onrender.com/api/users/profile', config);
      setAddresses(data.addresses || []);
    } catch (err) { console.error("Fetch fail"); }
  };

  // --- PHONE VALIDATION LOGIC ---
  const handlePhoneChange = (val, callback) => {
    const onlyNums = val.replace(/\D/g, ''); // Numbers ke alawa sab saaf
    if (onlyNums.length <= 10) {
      callback(onlyNums);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) return toast.error("Phone number 10 digits ka hona chahiye!");
    setLoading(true);
    try {
      const { data } = await axios.put('https://petvada1.onrender.com/api/users/profile', { name, phone }, config);
      const updatedUser = { ...userData, name: data.name, phone: data.phone };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      toast.success("Profile Updated! ✅");
    } catch (err) { toast.error("Fail!"); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords match nahi ho rahe! ❌");
    }
    setLoading(true);
    try {
      await axios.put('https://petvada1.onrender.com/api/users/change-password', { 
        oldPassword: passwords.oldPassword, 
        newPassword: passwords.newPassword 
      }, config);
      toast.success("Security Updated! 🔐");
      setShowPassModal(false);
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error("Password change failed!"); }
    finally { setLoading(false); }
  };

  const detectLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
      const data = await res.json();
      setNewAddr({ ...newAddr, fullAddress: data.display_name, city: data.address.city || "", pincode: data.address.postcode || "" });
      setLocLoading(false);
      toast.success("Location detected! 📍");
    }, () => { setLocLoading(false); toast.error("GPS failed!"); });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (newAddr.phone.length !== 10) return toast.error("Delivery number 10 digits ka chahiye!");
    setLoading(true);
    try {
      const { data } = await axios.post('https://petvada1.onrender.com/api/users/add-address', newAddr, config);
      setAddresses(data);
      setShowAddrModal(false);
      setNewAddr({ label: 'Home', fullAddress: '', city: '', pincode: '', phone: '' }); 
      toast.success("Address Added!");
    } catch (err) { toast.error("Failed!"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    const { data } = await axios.delete(`https://petvada1.onrender.com/api/users/address/${id}`, config);
    setAddresses(data);
    toast.success("Deleted!");
  };

  const handleDefault = async (id) => {
    const { data } = await axios.put(`https://petvada1.onrender.com/api/users/address/default/${id}`, {}, config);
    setAddresses(data);
    toast.success("Default set!");
  };

  return (
    <div className="min-h-screen bg-[#F9FBFC] flex flex-col lg:flex-row font-sans text-slate-900">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-full lg:w-24 bg-white border-b lg:border-r border-slate-100 flex flex-col items-center p-6 lg:p-8 lg:sticky lg:top-0 lg:h-screen z-50">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 mb-8 lg:mb-12">
          <Trophy size={24} />
        </div>

        <nav className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
          {[
            { id: 'profile', icon: User },
            { id: 'address', icon: MapPin },
            { id: 'security', icon: Lock },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => item.id === 'security' ? setShowPassModal(true) : setActiveTab(item.id)}
              className={`flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-2xl transition-all ${
                activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              <item.icon size={22} />
            </button>
          ))}
        </nav>

        <button className="hidden lg:flex items-center justify-center w-14 h-14 text-red-400 hover:bg-red-50 rounded-2xl mt-auto">
          <LogOut size={22} />
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 lg:p-16 max-w-6xl mx-auto w-full overflow-y-auto">
        <header className="hidden lg:flex justify-between items-center mb-16">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Manage <span className="text-indigo-600">{activeTab}</span></h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-full border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img src={userData?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className="w-full h-full object-cover" alt="pfp" />
                </div>
                <span className="text-xs font-bold">{userData?.name}</span>
            </div>
            <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm relative"><Bell size={24}/></button>
          </div>
        </header>

        <div className="bg-white rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-14 shadow-sm border border-slate-50 relative">
          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
               <h3 className="text-xl font-black uppercase italic tracking-widest mb-10">Personal Details</h3>
               <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-2xl">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <input className="w-full p-5 bg-slate-50/50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 transition-all shadow-inner" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
                    
                    {/* PROFILE PHONE WITH VALIDATION */}
                    <input 
                      type="tel"
                      className="w-full p-5 bg-slate-50/50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 transition-all shadow-inner" 
                      value={phone} 
                      onChange={(e) => handlePhoneChange(e.target.value, setPhone)} 
                      placeholder="10 Digit Phone" 
                    />
                 </div>
                 <button type="submit" disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-indigo-600 transition-all">
                   {loading ? <Loader2 className="animate-spin mx-auto"/> : "Confirm Changes"}
                 </button>
               </form>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black uppercase italic tracking-widest">Shipping Vault</h3>
                  <button onClick={() => setShowAddrModal(true)} className="p-4 bg-black text-white rounded-2xl hover:bg-indigo-600 shadow-lg"><Plus size={24}/></button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {addresses.map((addr) => (
                   <div key={addr._id} className={`p-8 rounded-[2.5rem] border-2 transition-all relative group ${addr.isDefault ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-2xl'}`}>
                     <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl ${addr.isDefault ? 'bg-indigo-600 text-white' : 'bg-white shadow-sm text-indigo-600'}`}>
                          {addr.label === 'Home' ? <Home size={22}/> : <Briefcase size={22}/>}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleDefault(addr._id)} className="p-2 text-slate-300 hover:text-indigo-600"><CheckCircle2 size={20}/></button>
                           <button onClick={() => handleDelete(addr._id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={20}/></button>
                        </div>
                     </div>
                     <p className="font-bold text-slate-700 text-sm leading-relaxed mt-2 line-clamp-2">{addr.fullAddress}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase mt-4 pt-4 border-t border-slate-100/50">{addr.city} • {addr.pincode} <br/> <span className="text-indigo-600 tracking-widest">{addr.phone}</span></p>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </main>

      {/* --- PASSWORD MODAL --- */}
      {showPassModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black italic uppercase">Security 🔐</h2>
                <button onClick={() => setShowPassModal(false)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={28}/></button>
             </div>
             
             <form onSubmit={handleChangePassword} className="space-y-4">
                <input type="password" placeholder="Current Password" required className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none" value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} />
                
                <div className="relative">
                  <input type={showNewPass ? "text" : "password"} placeholder="New Password" required className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm border-2 border-indigo-50 outline-none focus:border-indigo-400" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                    {showNewPass ? <EyeOff size={20}/> : <Eye size={20}/>}
                  </button>
                </div>

                <div className="relative">
                  <input type={showConfPass ? "text" : "password"} placeholder="Confirm Password" required className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm border-2 border-indigo-50 outline-none focus:border-indigo-400" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} />
                  <button type="button" onClick={() => setShowConfPass(!showConfPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                    {showConfPass ? <EyeOff size={20}/> : <Eye size={20}/>}
                  </button>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-black text-white p-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl mt-4">Update Security</button>
             </form>
          </div>
        </div>
      )}

      {/* --- UPDATED ADDRESS MODAL WITH PHONE VALIDATION --- */}
      {showAddrModal && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-black italic uppercase">Add Address 📍</h2>
               <button onClick={() => setShowAddrModal(false)} className="text-slate-300"><X size={28}/></button>
            </div>
            <button type="button" onClick={detectLocation} disabled={locLoading} className="w-full mb-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all">
               {locLoading ? <Loader2 className="animate-spin" size={16}/> : <Navigation size={16} />} Use GPS
            </button>
            <form onSubmit={handleAddAddress} className="space-y-4">
               <div className="flex gap-2">
                  {['Home', 'Office', 'Other'].map(l => (
                    <button key={l} type="button" onClick={() => setNewAddr({...newAddr, label: l})} className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase ${newAddr.label === l ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>{l}</button>
                  ))}
               </div>
               <textarea placeholder="Full Address" required className="w-full p-5 bg-slate-50 rounded-3xl font-bold text-sm outline-none h-24 border-2 border-transparent focus:border-indigo-100" value={newAddr.fullAddress} onChange={e => setNewAddr({...newAddr, fullAddress: e.target.value})} />
               <div className="grid grid-cols-2 gap-4">
                  <input placeholder="City" required className="p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} />
                  <input placeholder="Pincode" required className="p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100" value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value})} />
               </div>
               
               {/* ADDRESS PHONE WITH NUMBERS-ONLY & 10 DIGIT LOGIC */}
               <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Receiver's Phone Number (10 Digits)</label>
                  <input 
                    type="tel"
                    placeholder="Contact Number for Delivery" 
                    required 
                    className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100" 
                    value={newAddr.phone} 
                    onChange={(e) => handlePhoneChange(e.target.value, (val) => setNewAddr({...newAddr, phone: val}))} 
                  />
               </div>

               <button type="submit" disabled={loading} className="w-full bg-black text-white p-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest mt-4 hover:bg-indigo-600 transition-all shadow-xl">
                 {loading ? <Loader2 className="animate-spin mx-auto"/> : "Save Complete Address"}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;