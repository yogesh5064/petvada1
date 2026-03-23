import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, CheckCircle, Clock, Package, Pill, X, TrendingUp, 
  AlertTriangle, ShoppingBag, Plus, ArrowUpRight, Activity, Wallet, 
  MousePointerClick, ChevronRight, ArrowRight, History, Check, CreditCard, RotateCw, Trash2, BedDouble, Calculator
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [drawer, setDrawer] = useState({ isOpen: false, title: '', data: [], type: '', targetPath: '' });
  const [dashData, setDashData] = useState({ totalSalesAmount: 0, salesByMonth: [], nearExpiryProducts: [], lowStockProducts: [] });
  
  // ✅ Hostel Modal State
  const [hostelModal, setHostelModal] = useState({ isOpen: false, data: null, days: 1, rate: 500 });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  const getLocalDate = (date) => {
    const d = new Date(date);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  const todayStr = getLocalDate(new Date());
  const yesterdayStr = getLocalDate(new Date(Date.now() - 86400000));
  const tomorrowStr = getLocalDate(new Date(Date.now() + 86400000));

  useEffect(() => { fetchAllData(); }, [selectedMonth]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [appRes, dashRes, orderRes, billRes] = await Promise.all([
        axios.get('https://petvada1.onrender.com/api/admin/appointments', config),
        axios.get('https://petvada1.onrender.com/api/admin/dashboard-data', config),
        axios.get('https://petvada1.onrender.com/api/admin/online-orders', config),
        axios.get('https://petvada1.onrender.com/api/admin/customer-details/all-bills', config)
      ]);
      setAppointments(appRes.data);
      setDashData(dashRes.data);
      setOnlineOrders(orderRes.data);
      setBills(billRes.data || []);
    } catch (err) {
      toast.error("Dashboard sync failed!");
    } finally { setLoading(false); }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`https://petvada1.onrender.com/api/admin/appointments/${id}`, { status: newStatus }, config);
      toast.success(`Updated to ${newStatus}`);
      fetchAllData();
    } catch (err) {
      toast.error("Update failed!");
    }
  };

  const handleAction = (app) => {
    if (app.category?.toLowerCase() === 'hostel') {
      setHostelModal({ isOpen: true, data: app, days: 1, rate: 500 });
    } else {
      navigate('/admin/billing', { state: app });
    }
  };

  // ✅ FIXED: SAVE HOSTEL BILL (URL & DATA MAPPING)
  const saveHostelBill = async () => {
    try {
      const totalAmount = Number(hostelModal.days) * Number(hostelModal.rate);
      
      const billData = {
        customerName: hostelModal.data.petName,
        phone: hostelModal.data.phone,
        category: 'Hostel',
        items: [{ 
          name: `Hostel Stay (${hostelModal.days} Days)`, 
          quantity: Number(hostelModal.days), 
          price: Number(hostelModal.rate),
          total: totalAmount
        }],
        totalAmount: totalAmount,
        paymentMethod: 'Cash',
        status: 'Paid'
      };

      // 🛠️ Changed URL to standard endpoint (404 Fix)
      const response = await axios.post('https://petvada1.onrender.com/api/admin/customer-details/bills', billData, config);
      
      if(response.status === 200 || response.status === 201) {
        // Automatically mark appointment as completed
        await axios.put(`https://petvada1.onrender.com/api/admin/appointments/${hostelModal.data._id}`, { status: 'Completed' }, config);
        
        toast.success("Hostel Bill Saved Successfully!");
        setHostelModal({ ...hostelModal, isOpen: false });
        fetchAllData();
      }
    } catch (err) {
      console.error("Billing Error Details:", err.response?.data);
      toast.error(err.response?.data?.message || "Billing Failed! Route not found.");
    }
  };

  const stats = (() => {
    const filterByMonth = (date) => new Date(date).getMonth() + 1 === Number(selectedMonth);
    const monthBills = bills.filter(b => filterByMonth(b.createdAt));
    const total = monthBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    return { total, billCount: monthBills.length, aov: monthBills.length > 0 ? (total / monthBills.length).toFixed(0) : 0 };
  })();

  const handleOpenDrawer = (title, data, type, path) => {
    setDrawer({ isOpen: true, title, data, type, targetPath: path });
  };

  const ActiveAppItem = ({ app, color }) => {
    const isHostel = app.category?.toLowerCase() === 'hostel';
    return (
      <div className={`p-4 bg-white border ${isHostel ? 'border-orange-100' : 'border-slate-100'} rounded-2xl flex justify-between items-center group hover:border-indigo-200 transition-all shadow-sm`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${
            isHostel ? 'bg-orange-100 text-orange-600' : `bg-${color}-50 text-${color}-600`
          }`}>
            {isHostel ? <BedDouble size={16}/> : (app.time || 'W/I')}
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-800 uppercase italic leading-none mb-1">
              {app.petName} 
              {isHostel && <span className="ml-2 text-[7px] bg-orange-500 text-white px-1 rounded italic">HOSTEL</span>}
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded uppercase ${
                app.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                app.status === 'Approved' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {app.status}
              </span>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{app.category}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {app.status === 'Pending' && (
            <button onClick={() => handleUpdateStatus(app._id, 'Approved')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
              <Check size={12}/>
            </button>
          )}
          
          <button 
            onClick={() => handleAction(app)} 
            className={`p-2 rounded-lg transition-all ${
              isHostel ? 'bg-orange-50 text-orange-600 hover:bg-orange-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600'
            } hover:text-white shadow-sm`}
          >
            {isHostel ? <Calculator size={12}/> : <CreditCard size={12}/>}
          </button>

          {app.status !== 'Cancelled' && (
            <button onClick={() => handleUpdateStatus(app._id, 'Cancelled')} className="p-2 bg-rose-50 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all">
              <X size={12}/>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen w-full pb-20 relative overflow-hidden font-sans">
      
      {/* ✅ HOSTEL QUICK BILL MODAL */}
      {hostelModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-orange-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><BedDouble size={24}/></div>
                <h3 className="font-black text-slate-800 uppercase italic">Hostel Quick Bill</h3>
              </div>
              <button onClick={() => setHostelModal({...hostelModal, isOpen: false})} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Stay Details for</p>
                <p className="font-black text-slate-800 uppercase tracking-tight">{hostelModal.data?.petName} ({hostelModal.data?.phone})</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Total Days</label>
                  <input type="number" min="1" value={hostelModal.days} onChange={(e) => setHostelModal({...hostelModal, days: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-center focus:ring-2 ring-orange-400 outline-none"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Rate per Day</label>
                  <input type="number" value={hostelModal.rate} onChange={(e) => setHostelModal({...hostelModal, rate: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-center focus:ring-2 ring-orange-400 outline-none"/>
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-3xl text-center shadow-lg">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-1 tracking-[0.2em]">Final Amount</p>
                <h4 className="text-5xl font-black text-white italic tracking-tighter">₹{Number(hostelModal.days) * Number(hostelModal.rate)}</h4>
              </div>

              <button onClick={saveHostelBill} className="w-full py-5 bg-orange-500 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-2">
                <CheckCircle size={18}/> Generate Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-[100] w-full md:w-[450px] bg-white shadow-2xl transform transition-transform duration-500 p-8 flex flex-col ${drawer.isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">{drawer.title}</h3>
          <button onClick={() => setDrawer({ ...drawer, isOpen: false })} className="p-3 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
          {drawer.data.map((item, idx) => (
            <div key={idx} className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm">{idx + 1}</div>
                <div>
                  <p className="font-black text-slate-700 uppercase text-xs">{item.name || item.petName || "N/A"}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{item.category || item.status}</p>
                </div>
              </div>
              <p className="font-black text-indigo-600 text-sm">{drawer.type === 'money' ? `₹${item.totalAmount || item.totalPrice}` : item.time || 'View'}</p>
            </div>
          ))}
        </div>
        {drawer.targetPath && (
          <button onClick={() => { navigate(drawer.targetPath); setDrawer({ ...drawer, isOpen: false }); }} className="mt-6 w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3">
            Manage Full Page <ArrowRight size={16}/>
          </button>
        )}
      </div>

      {drawer.isOpen && <div onClick={() => setDrawer({...drawer, isOpen: false})} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]" />}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="text-indigo-600 animate-pulse" size={20} />
          <span className="font-black text-slate-800 uppercase text-xs tracking-tighter">Command Center v2.5</span>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchAllData} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><RotateCw size={16}/></button>
          <button onClick={() => navigate('/admin/billing')} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg">
            <Plus size={14}/> Quick Bill
          </button>
        </div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Gross Revenue</p>
            <h2 className="text-7xl font-black tracking-tighter italic">₹{stats.total.toLocaleString()}</h2>
            <div className="mt-8 flex gap-3">
               <button onClick={() => handleOpenDrawer('Clinic Bills', bills, 'money', '/admin/customer-details')} className="bg-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-white hover:text-slate-900 transition-all">Details</button>
               <button onClick={() => setSelectedMonth(new Date().getMonth() + 1)} className="bg-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase">This Month</button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
          </div>
          <HealthCard title="Avg Bill" value={`₹${stats.aov}`} sub="Per Customer" icon={<Wallet size={20}/>} color="indigo" />
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Inventory</p>
            <div className="space-y-3">
              <div onClick={() => handleOpenDrawer('Low Stock', dashData.lowStockProducts, 'stock', '/admin/inventory')} className="flex justify-between items-center p-3 bg-orange-50 rounded-xl cursor-pointer">
                <span className="text-[10px] font-black text-orange-600 uppercase">Low Stock</span>
                <span className="font-black">{dashData.lowStockProducts?.length || 0}</span>
              </div>
              <div onClick={() => handleOpenDrawer('Near Expiry', dashData.nearExpiryProducts, 'date', '/admin/inventory')} className="flex justify-between items-center p-3 bg-rose-50 rounded-xl cursor-pointer">
                <span className="text-[10px] font-black text-rose-600 uppercase">Expiry</span>
                <span className="font-black">{dashData.nearExpiryProducts?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Yesterday */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-400">
               <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><History size={16}/> Yesterday</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
              {appointments.filter(a => getLocalDate(a.date) === yesterdayStr).map(app => (
                <ActiveAppItem key={app._id} app={app} color="rose" />
              ))}
            </div>
          </div>

          {/* Today */}
          <div className="bg-white rounded-[2.5rem] border-2 border-indigo-100 shadow-xl overflow-hidden flex flex-col h-[500px] lg:scale-105 z-10">
            <div className="p-6 bg-indigo-600 border-b border-indigo-700 flex justify-between items-center text-white">
               <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Clock size={16} className="animate-pulse"/> Today's Queue</span>
               <span className="text-[9px] font-black bg-white/20 px-2 py-1 rounded">{appointments.filter(a => getLocalDate(a.date) === todayStr).length} Active</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-indigo-50/10">
              {appointments.filter(a => getLocalDate(a.date) === todayStr).length > 0 ? (
                appointments.filter(a => getLocalDate(a.date) === todayStr).map(app => (
                  <ActiveAppItem key={app._id} app={app} color="indigo" />
                ))
              ) : (
                <EmptyState msg="No Queue Today" />
              )}
            </div>
          </div>

          {/* Tomorrow */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-400">
               <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Calendar size={16}/> Tomorrow</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
              {appointments.filter(a => getLocalDate(a.date) === tomorrowStr).map(app => (
                <ActiveAppItem key={app._id} app={app} color="emerald" />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <StatusMetric label="Online Orders" count={onlineOrders.filter(o => o.status === 'Processing').length} color="indigo" onClick={() => navigate('/admin/online-orders')} />
           <StatusMetric label="Today's Appts" count={appointments.filter(a => getLocalDate(a.date) === todayStr).length} color="blue" onClick={() => navigate('/admin/appointments')} />
           <StatusMetric label="Completed" count={appointments.filter(a => a.status === 'Completed').length} color="emerald" />
           <StatusMetric label="Total Bills" count={stats.billCount} color="pink" onClick={() => navigate('/admin/customer-details')} />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const HealthCard = ({ title, value, sub, icon, color, onClick }) => (
  <div onClick={onClick} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:border-indigo-200 transition-all">
    <div className={`p-4 bg-${color}-50 text-${color}-600 rounded-2xl`}>{icon}</div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</h3>
      <p className="text-[8px] font-bold text-slate-400 uppercase italic leading-none">{sub}</p>
    </div>
  </div>
);

const StatusMetric = ({ label, count, color, onClick }) => (
  <div onClick={onClick} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 text-center cursor-pointer hover:shadow-lg transition-all">
    <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">{label}</p>
    <h4 className="text-3xl font-black text-slate-800 italic">{count}</h4>
  </div>
);

const EmptyState = ({ msg }) => (
  <div className="h-full flex flex-col items-center justify-center opacity-20 py-10 text-center">
    <AlertTriangle size={20} className="mb-2 mx-auto" />
    <p className="text-[9px] font-black uppercase tracking-widest">{msg}</p>
  </div>
);

export default AdminDashboard;