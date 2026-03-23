import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Trash2, Printer, Smartphone, User as UserIcon, 
  IndianRupee, Plus, ShoppingCart, Package, HeartPulse
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminBilling = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [invoiceNo, setInvoiceNo] = useState('SYNCING...');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [entry, setEntry] = useState({
    productId: '', name: '', batch: '', expiry: '', rate: 0, qty: 1
  });

  const [customer, setCustomer] = useState({ name: '', mobile: '', id: '' });
  const qtyRef = useRef(null);

  const API_BASE = "https://petvada1.onrender.com/api";
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  // Initial Data Sync
  useEffect(() => { 
    const loadData = async () => {
      try {
        const [resP, resC, resInv] = await Promise.all([
          axios.get(`${API_BASE}/products`, config),
          axios.get(`${API_BASE}/users`, config),
          axios.get(`${API_BASE}/admin/latest-invoice`, config)
        ]);
        setProducts(resP.data || []);
        setCustomers(resC.data || []);
        const nextNum = (resInv.data.count || 0) + 1;
        setInvoiceNo(`INV-${String(nextNum).padStart(3, '0')}`);
      } catch (err) {
        toast.error("Database connection failed!");
      }
    };
    loadData();
  }, []);

  // Customer Search Logic
  const handleNameChange = (val) => {
    setCustomer({ ...customer, name: val, id: '' });
    if (val.length > 1) {
      const matches = customers.filter(c => 
        c.name?.toLowerCase().includes(val.toLowerCase()) || c.mobile?.includes(val)
      );
      setFilteredUsers(matches);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  // Product Selection Sync with Database Fields
  const handleProductSelect = (id) => {
    const p = products.find(prod => prod._id === id);
    if (!p) return;
    
    // Check Stock from DB
    const availableStock = p.stock || p.quantity || 0;
    if (availableStock <= 0) {
      toast.error("Out of Stock!");
      return;
    }

    setEntry({
      productId: p._id,
      name: p.name,
      batch: p.batchNumber || p.currentBatch || 'N/A',
      expiry: p.expiryDate || 'N/A',
      rate: p.sellingPrice || p.price || 0,
      qty: 1
    });
    setTimeout(() => qtyRef.current?.focus(), 100);
  };

  const addToCart = () => {
    if (!entry.productId) return toast.error("Select Product!");
    const p = products.find(prod => prod._id === entry.productId);
    
    // Blocking Logic for Stock
    const availableStock = p.stock || p.quantity || 0;
    if (Number(entry.qty) > availableStock) {
      return toast.error(`Sirf ${availableStock} units stock mein hain!`);
    }

    const amount = (Number(entry.rate) * Number(entry.qty)).toFixed(2);
    setCart([{ ...entry, amount, _id: Date.now() }, ...cart]);
    setEntry({ productId: '', name: '', batch: '', expiry: '', rate: 0, qty: 1 });
  };

  const cartTotal = cart.reduce((a, b) => a + Number(b.amount), 0).toFixed(2);

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-2 md:p-6 font-sans">
      <div className="max-w-[1300px] mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
        
        {/* Header Section */}
        <div className="bg-[#0F172A] p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <HeartPulse className="text-blue-500" size={28}/>
            <h1 className="text-xl font-black tracking-tight uppercase">SHARMAS <span className="text-blue-400">PET CARE</span></h1>
          </div>
          <div className="bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-700 text-center">
            <p className="text-[9px] text-slate-400 font-bold uppercase">Invoice</p>
            <p className="text-md font-mono font-bold text-blue-400">{invoiceNo}</p>
          </div>
        </div>

        {/* Customer Search Section */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 border-b relative">
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block ml-1">Pet Owner Name</label>
            <div className="relative">
              <input 
                type="text" value={customer.name} 
                className="w-full p-3 pl-10 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-semibold uppercase"
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Search owner name..."
              />
              <UserIcon className="absolute left-3 top-3.5 text-slate-400" size={18}/>
            </div>
            {showDropdown && filteredUsers.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white shadow-xl rounded-xl border border-slate-200 overflow-hidden">
                {filteredUsers.map(u => (
                  <div key={u._id} onClick={() => { setCustomer({name: u.name, mobile: u.mobile, id: u._id}); setShowDropdown(false); }} className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex justify-between">
                    <span className="font-bold text-sm uppercase">{u.name}</span>
                    <span className="text-slate-400 text-xs">{u.mobile}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block ml-1">Mobile</label>
            <div className="relative">
              <input 
                type="text" value={customer.mobile} maxLength="10"
                className="w-full p-3 pl-10 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                onChange={(e) => setCustomer({...customer, mobile: e.target.value})}
                placeholder="10-digit mobile..."
              />
              <Smartphone className="absolute left-3 top-3.5 text-slate-400" size={18}/>
            </div>
          </div>
        </div>

        {/* Professional Grid Entry */}
        <div className="p-5 bg-white border-b">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            
            {/* Description - 40% Width */}
            <div className="lg:w-[40%] w-full">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block ml-1">Service / Medication</label>
              <select 
                value={entry.productId} 
                onChange={(e) => handleProductSelect(e.target.value)} 
                className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold bg-slate-50 text-sm h-[48px]"
              >
                <option value="">-- CHOOSE ITEM --</option>
                {products.map(p => {
                  const stockCount = p.stock || p.quantity || 0;
                  return (
                    <option key={p._id} value={p._id} disabled={stockCount <= 0}>
                      {p.name.toUpperCase()} {stockCount <= 0 ? "(OUT OF STOCK)" : `(Stock: ${stockCount})`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Batch, Rate, Qty - Flex Row */}
            <div className="lg:flex-1 w-full grid grid-cols-3 gap-3">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block text-center">Batch</label>
                  <div className="bg-slate-100 p-3 rounded-xl text-center border border-slate-200 text-xs font-black text-slate-500 h-[48px] flex items-center justify-center">
                    {entry.batch || '---'}
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block text-center">Rate (₹)</label>
                  <input 
                    type="number" value={entry.rate} 
                    className="w-full p-3 rounded-xl border border-slate-200 text-center font-bold text-blue-600 focus:border-blue-500 outline-none h-[48px]" 
                    onChange={(e) => setEntry({...entry, rate: e.target.value})} 
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block text-center">Qty</label>
                  <input 
                    ref={qtyRef} type="number" value={entry.qty} 
                    className="w-full p-3 rounded-xl border border-slate-200 text-center font-bold focus:border-blue-500 outline-none h-[48px]" 
                    onChange={(e) => setEntry({ ...entry, qty: e.target.value })} 
                    onKeyDown={(e) => e.key === 'Enter' && addToCart()}
                  />
               </div>
            </div>

            <button 
              onClick={addToCart} 
              className="bg-blue-600 text-white p-3 px-8 rounded-xl hover:bg-slate-900 transition-all shadow-lg h-[48px] flex items-center gap-2 font-bold uppercase text-xs"
            >
              <Plus size={18}/> Add
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-4 min-h-[300px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className="text-slate-400 font-bold uppercase text-[10px]">
                <th className="p-4 text-left">Item Description</th>
                <th className="p-4 text-center">Batch</th>
                <th className="p-4 text-center">Rate</th>
                <th className="p-4 text-center">Qty</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cart.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center opacity-20 font-black uppercase text-xs tracking-widest">Cart is empty</td>
                </tr>
              ) : (
                cart.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 font-semibold transition-colors">
                    <td className="p-4 text-slate-800 uppercase text-xs">{item.name}</td>
                    <td className="p-4 text-center text-[10px] font-black text-slate-400">{item.batch}</td>
                    <td className="p-4 text-center text-slate-500 italic">₹{item.rate}</td>
                    <td className="p-4 text-center"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black">x{item.qty}</span></td>
                    <td className="p-4 text-right font-bold text-slate-900">₹{item.amount}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => setCart(cart.filter(c => c._id !== item._id))} className="text-rose-400 hover:text-rose-600 p-2">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total & Action */}
        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
              <IndianRupee className="text-blue-400" size={32}/>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Grand Total</p>
              <p className="text-4xl font-black text-white italic leading-none">₹{cartTotal}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/admin/invoice', { state: { cart, customer, invoiceNo, totalAmount: cartTotal } })}
            className="w-full md:w-auto bg-blue-500 px-12 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            <Printer size={18}/> Finalize & Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBilling;