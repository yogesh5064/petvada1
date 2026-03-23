import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, RotateCcw, Clock, ArrowRight, Loader2, ChevronRight, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/users/my-orders', config);
        setOrders(data);
      } catch (err) {
        toast.error("History load nahi ho payi!");
      } finally {
        setLoading(false);
      }
    };
    if (userInfo?.token) fetchOrders();
  }, []);

  const handleRepeatOrder = (orderItems) => {
    try {
      const itemsToPush = orderItems.map(item => ({
        _id: item.product,
        name: item.name,
        sellingPrice: Number(item.price),
        image: item.image,
        qty: Number(item.qty),
        stock: 100 
      }));

      let existingCart = [];
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        try { existingCart = JSON.parse(savedCart); } catch (e) { existingCart = []; }
      }

      itemsToPush.forEach(newItem => {
        const index = existingCart.findIndex(x => x._id === newItem._id);
        if (index > -1) existingCart[index].qty += newItem.qty;
        else existingCart.push(newItem);
      });

      localStorage.setItem('cartItems', JSON.stringify(existingCart));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success("Added to cart! 🛒", {
        icon: '🐾',
        style: { borderRadius: '15px', background: '#333', color: '#fff' }
      });

      setTimeout(() => { window.location.href = '/cart'; }, 1000);
      
    } catch (error) {
      toast.error("Repeat order fail ho gaya!");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4 px-6 text-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="font-black italic text-gray-400 uppercase tracking-widest text-[10px]">Retrieving Shopping Passport... 📦</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-3 md:p-8 mt-16 md:mt-10 mb-24">
      
      {/* 📱 Responsive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 md:mb-16">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-indigo-100 flex-shrink-0">
            <Clock size={28} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-gray-800 italic uppercase tracking-tighter leading-none">Order History</h1>
            <p className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-2">Track your pet's essentials</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/shop')} 
          className="w-full md:w-auto flex items-center justify-center gap-2 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-6 py-4 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border border-indigo-100"
        >
          Explore Shop <ArrowRight size={14} />
        </button>
      </div>

      {/* Orders List: Vertical Responsive Cards */}
      <div className="space-y-6 md:space-y-8">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] md:rounded-[3.5rem] border-2 border-dashed border-gray-100 px-6">
            <Package size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest italic">Aapne abhi tak koi order nahi kiya hai</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
              
              {/* 🏷️ Status Badge: Always on top-right */}
              <div className={`absolute top-0 right-0 px-5 py-2 md:px-6 md:py-2.5 rounded-bl-[1.5rem] md:rounded-bl-3xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] z-10 shadow-sm ${
                order.status === 'Delivered' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
              }`}>
                {order.status || 'Processing'}
              </div>

              {/* Order Metadata Area */}
              <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 border-b border-gray-50 pb-6 pr-16 md:pr-0">
                  <div className="space-y-1">
                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Order ID</p>
                    <p className="text-xs md:text-sm font-black text-gray-800 uppercase italic bg-gray-50 px-3 py-1 rounded-lg w-fit">#{order._id.slice(-8)}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Purchase Date</p>
                    <p className="text-[10px] md:text-xs font-bold text-gray-600 uppercase mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Items Grid: Single Column on all screens but better spacing */}
                <div className="space-y-3 mb-8">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50/50 rounded-2xl md:rounded-3xl border border-transparent hover:border-gray-100 hover:bg-white transition-all group/item">
                      <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                          <img 
                            src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} 
                            alt="" 
                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" 
                          />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] md:text-sm font-black text-gray-800 uppercase italic truncate max-w-[120px] md:max-w-sm leading-tight">{item.name}</p>
                          <p className="text-[8px] md:text-[9px] font-bold text-indigo-500 uppercase tracking-tighter mt-1.5 flex items-center gap-1.5">
                            <ShoppingBag size={10} /> Qty: {item.qty} × ₹{item.price}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm font-black text-gray-900 italic ml-2">₹{item.price * item.qty}</p>
                    </div>
                  ))}
                </div>

                {/* Footer Section: Totals & Re-order */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-50 gap-6">
                  <div className="text-center md:text-left w-full md:w-auto">
                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Total Amount Paid</p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                       <span className="text-indigo-600 font-black text-lg md:text-xl italic leading-none">₹</span>
                       <p className="text-3xl md:text-4xl font-black text-indigo-600 italic tracking-tighter leading-none">{order.totalPrice}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleRepeatOrder(order.orderItems)}
                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-indigo-100 group"
                  >
                    <RotateCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500" /> Re-Order All Items
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistory;