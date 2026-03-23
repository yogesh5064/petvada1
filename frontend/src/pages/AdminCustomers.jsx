import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User, Dog, Receipt, CalendarDays, Phone, MapPin, ChevronRight, X, ShoppingBag, ArrowLeft, Globe, Clock, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [history, setHistory] = useState({ pets: [], bills: [], onlineOrders: [], visits: [] });
  const [dateRange, setDateRange] = useState({ month: new Date().getMonth() + 1, year: 2026 });
  const [viewAll, setViewAll] = useState(false); 
  const [selectedItem, setSelectedItem] = useState(null); 
  const [recordType, setRecordType] = useState('store'); 

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('https://petvada1.onrender.com/api/users', config);
      setAllUsers(data);
    } catch (err) { toast.error("User list load nahi hui!"); }
  };

  const viewDetails = async (userId) => {
    try {
      const { data } = await axios.get(`https://petvada1.onrender.com/api/admin/customer-details/${userId}`, config);
      setSelectedUser(data.customer);
      setHistory({ 
        pets: data.pets || [], 
        bills: data.bills || [], 
        onlineOrders: data.onlineOrders || [],
        visits: data.visits || [] 
      });
      setViewAll(false); 
      setRecordType('store'); 
    } catch (err) { toast.error("Details fetch fail!"); }
  };

  // ✅ ULTIMATE PRINT LOGIC: No more Blank Pages
  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice').innerHTML;
    let iframe = document.getElementById('print-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>PetVeda Invoice</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; background: white; }
            #printable-invoice { width: 100%; max-width: 800px; margin: auto; }
          </style>
        </head>
        <body>
          <div id="printable-invoice">${printContent}</div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.focus();
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  const getRecordsByTab = () => {
    if (recordType === 'store') return history.bills;
    if (recordType === 'online') return history.onlineOrders;
    return history.visits;
  };

  const filteredRecords = viewAll 
    ? getRecordsByTab() 
    : getRecordsByTab().filter(item => {
        const itemDate = new Date(item.createdAt || item.date);
        return itemDate.getMonth() + 1 === Number(dateRange.month) && itemDate.getFullYear() === Number(dateRange.year);
      });

  // ✅ DYNAMIC BILLING UI LOGIC
  const renderBillingUI = (item) => {
    const type = item.category?.toLowerCase() || recordType;

    if (type === 'treatment' || type === 'vaccination') {
      return (
        <div className="border-l-4 border-red-500 pl-4 bg-red-50 p-4 rounded-xl space-y-2">
          <p className="text-[10px] font-black text-red-600 uppercase">🏥 Medical Record</p>
          <p className="text-xs font-bold">Notes: {item.adminNote || 'General Consultation'}</p>
        </div>
      );
    }
    if (type === 'hostel' || type === 'resort') {
      return (
        <div className="border-l-4 border-indigo-500 pl-4 bg-indigo-50 p-4 rounded-xl space-y-2">
          <p className="text-[10px] font-black text-indigo-600 uppercase">🏨 Hostel Stay</p>
          <p className="text-xs font-bold italic">Check-in: {item.checkInDate || item.date}</p>
        </div>
      );
    }
    return (
      <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded-xl">
        <p className="text-[10px] font-black text-green-600 uppercase">🛍️ Retail Bill</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* 👥 Left: Customer List */}
      <div className={`${selectedUser ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 bg-white rounded-[2rem] shadow-sm border p-5 flex-col h-[85vh]`}>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input type="text" placeholder="Search customer..." className="w-full pl-11 p-3.5 bg-gray-50 rounded-2xl outline-none font-bold text-sm" onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {allUsers.filter(u => u.name?.toLowerCase().includes(search.toLowerCase())).map(u => (
            <div key={u._id} onClick={() => viewDetails(u._id)} className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between group ${selectedUser?._id === u._id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border hover:bg-indigo-50/30'}`}>
              <div><p className="font-black text-xs uppercase truncate">{u.name}</p></div>
              <ChevronRight size={14} />
            </div>
          ))}
        </div>
      </div>

      {/* 📄 Right: Detailed View */}
      <div className={`${!selectedUser ? 'hidden lg:block' : 'block'} flex-1 space-y-6`}>
        {selectedUser ? (
          <>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
              <div className="space-y-4">
                <h3 className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">Personal Identity</h3>
                <p className="text-sm font-black text-gray-800">{selectedUser.name}</p>
                <p className="text-xs font-bold text-gray-500 flex items-center gap-2"><MapPin size={14}/> {selectedUser.address || 'N/A'}</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-orange-500 font-black text-[10px] uppercase tracking-widest">Pet Family</h3>
                <div className="flex flex-wrap gap-2">
                  {history.pets.map(pet => (
                    <div key={pet._id} className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-2xl text-[10px] font-black text-orange-700">{pet.name} ({pet.breed})</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border">
              <div className="flex justify-between items-center mb-8 bg-gray-100 p-1.5 rounded-2xl w-fit">
                <button onClick={() => setRecordType('store')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${recordType === 'store' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}>Bills</button>
                <button onClick={() => setRecordType('online')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${recordType === 'online' ? 'bg-white shadow text-orange-600' : 'text-gray-400'}`}>Online</button>
                <button onClick={() => setRecordType('visits')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${recordType === 'visits' ? 'bg-white shadow text-green-600' : 'text-gray-400'}`}>Visits</button>
              </div>

              <div className="overflow-x-auto rounded-[2rem] border">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr className="text-[9px] text-gray-400 uppercase font-black tracking-widest">
                      <th className="p-5">Reference</th>
                      <th className="p-5">Date</th>
                      <th className="p-5 text-right">Amount / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRecords.map((item, idx) => (
                      <tr key={idx} onClick={() => recordType !== 'visits' && setSelectedItem(item)} className="hover:bg-gray-50/50 cursor-pointer text-xs font-bold">
                        <td className="p-5 uppercase text-indigo-600">#{item.invoiceNo || item._id.slice(-6)}</td>
                        <td className="p-5 text-gray-500">{new Date(item.createdAt || item.date).toLocaleDateString()}</td>
                        <td className="p-5 text-right font-black">
                          {recordType === 'visits' ? <span className="text-[10px] bg-green-50 text-green-600 px-3 py-1 rounded-full">{item.status}</span> : `₹${item.totalAmount || item.totalPrice}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[400px] bg-white border rounded-[3rem] flex flex-col items-center justify-center text-gray-300 italic font-black text-[10px] uppercase tracking-widest">Select profile to view analytics</div>
        )}
      </div>

      {/* 🧾 Bill Modal & Printable Area */}
      {selectedItem && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in">
            <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 text-gray-400"><X /></button>
            
            <div id="printable-invoice" className="p-10 bg-white">
              <div className="text-center mb-8 border-b-2 border-indigo-600 pb-6">
                <h1 className="text-3xl font-black italic text-indigo-600 uppercase">PetVeda</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">Premium Pet Care Systems</p>
              </div>

              {renderBillingUI(selectedItem)}

              <table className="w-full my-8 text-xs font-bold">
                <thead className="bg-gray-50 text-[9px] text-gray-400 uppercase"><tr className="text-left"><th className="p-3">Description</th><th className="p-3 text-center">Qty</th><th className="p-3 text-right">Total</th></tr></thead>
                <tbody className="divide-y divide-gray-100 font-bold text-gray-700">
                  {(selectedItem.items || selectedItem.orderItems || []).map((p, i) => (
                    <tr key={i}><td className="p-3">{p.name}</td><td className="p-3 text-center">x{p.qty}</td><td className="p-3 text-right">₹{p.price * p.qty}</td></tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center bg-indigo-50 p-6 rounded-2xl">
                <span className="text-xs font-black uppercase text-indigo-600">Total Bill Amount</span>
                <span className="text-2xl font-black italic text-indigo-900">₹{(selectedItem.totalAmount || selectedItem.totalPrice)}</span>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex gap-3">
              <button onClick={handlePrint} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2"><Printer size={16}/> Print Invoice</button>
              <button onClick={() => setSelectedItem(null)} className="flex-1 bg-white text-gray-500 py-4 rounded-2xl font-black uppercase text-[10px] border">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;