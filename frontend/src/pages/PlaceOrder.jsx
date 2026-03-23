import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShoppingBag, MapPin, CreditCard, CheckCircle, Package, ArrowLeft } from 'lucide-react';

const PlaceOrder = () => {
  const { state } = useLocation(); 
  const navigate = useNavigate();

  // Redirect if state is missing
  if (!state || !state.cart) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-10 text-center">
        <Package size={48} className="text-gray-200 mb-4" />
        <p className="font-black uppercase italic tracking-widest text-gray-400 text-xs">
          Cart data missing... redirecting to shop 🐾
        </p>
      </div>
    );
  }

  const { cart, total, shippingAddress } = state;

  const handlePlaceOrder = async () => {
    const loadingToast = toast.loading("Processing your order...");
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      if (!userInfo || !userInfo.token) {
        toast.dismiss(loadingToast);
        toast.error("User session expired. Please login again.");
        return navigate('/login');
      }

      // ✅ FIX: Backend Expects specific mapping
      const orderData = {
        ownerName: userInfo.name, // Controller uses this for email
        orderItems: cart.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.sellingPrice, // Backend uses 'price' for order model
          sellingPrice: item.sellingPrice, // For extra safety
          product: item._id // Product ID for stock update
        })),
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          pincode: shippingAddress.pincode,
          phone: shippingAddress.phone
        },
        totalPrice: total,
        paymentMethod: 'COD'
      };

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      // API Call
      await axios.post('http://localhost:5000/api/orders', orderData, config);

      toast.dismiss(loadingToast);
      toast.success("Order Placed Successfully! 🐾", {
        style: { borderRadius: '20px', background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
      });

      localStorage.removeItem('cartItems'); 
      navigate('/order-history'); 
    } catch (err) {
      toast.dismiss(loadingToast);
      const errorMsg = err.response?.data?.message || "Order placing failed";
      toast.error(errorMsg);
      console.error("Order Error Trace:", err.response?.data);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-8 mt-16 md:mt-10 mb-24 animate-in fade-in duration-500">
      
      {/* ⬅️ Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-black text-gray-400 mb-6 hover:text-indigo-600 transition-all uppercase text-[10px] bg-white px-4 py-2 rounded-full shadow-sm border w-fit active:scale-95">
        <ArrowLeft size={14} /> Edit Address
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        
        {/* 📦 Left Side: Summary */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full opacity-40"></div>
            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3 text-gray-800">
              <MapPin className="text-indigo-600" size={24} /> Shipping Summary
            </h2>
            <div className="bg-gray-50/50 p-5 md:p-7 rounded-[1.8rem] border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[11px] md:text-sm font-black text-gray-800 uppercase italic leading-tight">
                  {shippingAddress.address}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {shippingAddress.city} - {shippingAddress.pincode}
                </p>
              </div>
              <div className="flex items-center gap-2 text-indigo-600 bg-white w-fit px-4 py-2 rounded-xl shadow-sm border border-indigo-50 h-fit">
                <CreditCard size={14} /> 
                <span className="text-[10px] font-black uppercase">📞 {shippingAddress.phone}</span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3 text-gray-800">
              <ShoppingBag className="text-indigo-600" size={24} /> Order Basket
            </h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center gap-4 md:gap-6 border-b border-gray-50 pb-4 last:border-0 group">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 shadow-inner">
                    <img src={`http://localhost:5000${item.image}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-black text-xs md:text-sm uppercase italic text-gray-800 truncate">{item.name}</p>
                    <p className="text-[9px] md:text-[10px] font-bold text-indigo-400 tracking-widest uppercase mt-1">
                      Quantity: <span className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-600 ml-1">{item.qty}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm md:text-base italic text-gray-900 leading-none">₹{item.qty * item.sellingPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 💰 Right Side: Price Details */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-indigo-100 border-2 border-indigo-50 lg:sticky lg:top-24">
            <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter mb-6 text-gray-800 border-b border-gray-50 pb-4">Checkout</h3>
            <div className="space-y-4 pb-6 border-b border-dashed border-gray-100 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-gray-600">₹{total}</span></div>
              <div className="flex justify-between text-green-500"><span>Shipping</span><span>FREE</span></div>
            </div>
            <div className="flex justify-between items-center py-8">
              <span className="font-black uppercase text-[9px] tracking-[0.3em] text-gray-400">Net Total</span>
              <div className="flex items-center gap-1">
                 <span className="text-indigo-600 font-black italic text-lg md:text-xl">₹</span>
                 <span className="text-3xl md:text-4xl font-black italic text-gray-900 tracking-tighter">{total}</span>
              </div>
            </div>
            <button onClick={handlePlaceOrder} className="w-full bg-gray-900 text-white py-5 rounded-[1.8rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-3">
              Confirm Order <CheckCircle size={20} />
            </button>
            <p className="text-[8px] font-bold text-center mt-6 text-gray-300 uppercase tracking-[0.2em] italic">Safe COD Delivery • 24/7 Support</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlaceOrder;