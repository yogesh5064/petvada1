import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MapPin, ExternalLink, CalendarDays, Loader2, Truck, CheckCircle, Receipt, X, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Processing');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('https://petvada1.onrender.com/api/admin/online-orders', config);
      if (data && Array.isArray(data)) setOrders(data);
    } catch (err) {
      toast.error("Orders load nahi ho paye!");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const msg = newStatus === 'Delivered' 
      ? "Delivered mark karne se stock minus ho jayega. Continue?" 
      : `Update status to ${newStatus}?`;
    
    if (!window.confirm(msg)) return;

    const loadingToast = toast.loading(`Updating to ${newStatus}...`);
    try {
      await axios.put(`https://petvada1.onrender.com/api/orders/${id}/status`, { status: newStatus }, config);
      toast.dismiss(loadingToast);
      toast.success(newStatus === 'Delivered' ? "Order Billed & Delivered! 🧾" : `Order ${newStatus}!`);
      fetchOrders();
    } catch (err) { 
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Update failed"); 
    }
  };

  // ✅ THE ULTIMATE PRINT LOGIC (No more Blank Pages)
  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice').innerHTML;
    
    // Create a hidden iframe
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
          <title>Invoice - PetVeda</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; background: white; }
            #printable-invoice { width: 100%; max-width: 800px; margin: auto; }
            @media print {
              body { padding: 0; }
              #printable-invoice { border: none; }
            }
          </style>
        </head>
        <body>
          <div id="printable-invoice">
            ${printContent}
          </div>
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

  const getMapLink = (addressString) => {
    if (!addressString) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = addressString.match(urlRegex);
    return matches ? matches[0] : null;
  };

  const filteredOrders = orders.filter(o => 
    (o.status || 'Processing').toLowerCase() === activeTab.toLowerCase()
  );

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center font-black text-indigo-600">
      <Loader2 className="animate-spin mb-2" size={40} />
      <p className="tracking-widest text-[10px] uppercase italic">Syncing PetVeda Orders...</p>
    </div>
  );

  return (
    <div className="space-y-6 p-2 md:p-6 animate-in fade-in duration-500">
      
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black italic uppercase text-gray-800">Order Desk & Billing 🧾</h2>
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest italic">Inventory updates only on delivery</p>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar snap-x">
          {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap snap-center ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white'}`}
            >
              {tab} ({orders.filter(o => (o.status || 'Processing').toLowerCase() === tab.toLowerCase()).length})
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
             <CalendarDays className="mx-auto text-gray-200 mb-4" size={48} />
             <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">No {activeTab} Orders</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const mapLink = getMapLink(order.shippingAddress?.address);
            const cleanAddress = order.shippingAddress?.address?.replace(/(https?:\/\/[^\s]+)/g, '').trim();

            return (
              <div key={order._id} className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between gap-6 hover:shadow-xl transition-all relative overflow-hidden">
                
                {order.status === 'Delivered' && (
                   <div className="absolute top-0 right-0 p-4 bg-green-50 text-green-600 rounded-bl-[2rem]">
                      <CheckCircle size={16} />
                   </div>
                )}

                <div className="flex-1 space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Package size={20}/></span>
                    <div>
                      <p className="font-black text-base uppercase text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                        {order.ownerName} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={10}/> Destination</p>
                    <p className="text-xs font-bold text-gray-600 truncate">{cleanAddress}, {order.shippingAddress?.city}</p>
                  </div>
                </div>

                <div className="bg-indigo-50/30 p-5 rounded-3xl w-full lg:w-64 border border-indigo-50 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Cart Summary</p>
                    {order.orderItems?.map((item, i) => (
                      <div key={i} className="flex justify-between text-[10px] font-bold text-gray-700">
                        <span>{item.name}</span>
                        <span>x{item.qty}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setSelectedOrder(order)} className="mt-4 flex items-center justify-center gap-2 text-[9px] font-black uppercase text-indigo-600 bg-white p-2.5 rounded-xl border border-indigo-100 hover:shadow-md transition-all">
                    <Receipt size={12}/> View Bill
                  </button>
                </div>

                <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-6 pt-6 lg:pt-0 border-t lg:border-none border-gray-50">
                  <div className="text-left lg:text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Bill</p>
                    <p className="text-3xl font-black italic text-gray-900 tracking-tighter">₹{order.totalPrice}</p>
                  </div>

                  <div className="flex gap-2">
                    {activeTab === 'Processing' && (
                      <button onClick={() => updateStatus(order._id, 'Shipped')} className="px-5 py-3.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-2">
                        Ship <Truck size={14} />
                      </button>
                    )}
                    {activeTab === 'Shipped' && (
                      <button onClick={() => updateStatus(order._id, 'Delivered')} className="px-5 py-3.5 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-green-700 transition-all flex items-center gap-2">
                        Mark Delivered <CheckCircle size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- INVOICE MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">
            
            <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 z-10">
              <X size={20} />
            </button>

            <div className="max-h-[80vh] overflow-y-auto">
              <div id="printable-invoice" className="p-10 bg-white">
                <div className="text-center mb-8 border-b-2 border-indigo-600 pb-6">
                  <h1 className="text-4xl font-black italic text-indigo-600 uppercase tracking-tighter">PetVeda</h1>
                  <p className="text-[10px] font-black text-gray-400 tracking-[0.4em] uppercase mt-1">Premium Pet Care Systems</p>
                </div>

                <div className="flex justify-between items-start mb-8 text-[11px] font-black uppercase">
                  <div className="space-y-1">
                    <p className="text-indigo-500">Billed To:</p>
                    <p className="text-gray-900 text-sm">{selectedOrder.ownerName}</p>
                    <p className="text-gray-400 font-bold tracking-normal lowercase">{selectedOrder.shippingAddress?.phone}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-indigo-500">Invoice Info:</p>
                    <p className="text-gray-900">#{selectedOrder._id.slice(-6).toUpperCase()}</p>
                    <p className="text-gray-400">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <table className="w-full mb-8">
                  <thead className="bg-gray-50 text-[9px] font-black uppercase text-gray-400">
                    <tr>
                      <th className="py-3 px-4 text-left">Description</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedOrder.orderItems.map((item, idx) => (
                      <tr key={idx} className="text-xs font-bold text-gray-700">
                        <td className="py-4 px-4">{item.name}</td>
                        <td className="py-4 px-4 text-center">{item.qty}</td>
                        <td className="py-4 px-4 text-right">₹{item.price * item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-center bg-indigo-50 p-6 rounded-2xl">
                   <span className="text-xs font-black uppercase text-indigo-600">Grand Total</span>
                   <span className="text-2xl font-black text-indigo-900">₹{selectedOrder.totalPrice}</span>
                </div>

                <div className="mt-8 text-center border-t border-dashed pt-6">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Inventory Status: {selectedOrder.status === 'Delivered' ? 'Deducted ✅' : 'Pending ⏳'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex gap-3">
               <button onClick={handlePrint} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all">
                  <Printer size={16}/> Print Bill / Save PDF
               </button>
               <button onClick={() => setSelectedOrder(null)} className="flex-1 bg-white text-gray-500 py-4 rounded-2xl font-black uppercase text-[10px] border border-gray-200 hover:bg-red-50 hover:text-red-500 transition-all">
                  Close Preview
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;