import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag, Calendar, Hotel, LayoutDashboard, LogOut,
  Menu, X, ChevronDown, Users, UserCircle, Package, ReceiptText, Truck
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const logout = () => {
    localStorage.removeItem('userInfo');
    toast.success("Logged out 🐾");
    navigate('/');
    window.location.reload();
  };

  const active = (path) =>
    location.pathname === path
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600";

  const Item = ({ to, icon, label }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${active(to)}`}
    >
      {React.cloneElement(icon, { size: 18 })} 
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      {/* MOBILE TOP BAR - Only visible on small screens */}
      <div className="md:hidden fixed top-0 w-full z-[60] bg-white border-b flex justify-between items-center px-4 py-3">
        <Link to="/" className="font-black text-indigo-600 text-xl italic">🐾 PetVeda</Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl bg-slate-100 text-slate-700">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-white border-r z-50 flex flex-col transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        
        {/* LOGO AREA */}
        <div className="p-7 hidden md:block">
          <Link to="/" className="text-2xl font-black text-indigo-600 italic tracking-tighter">🐾 PetVeda</Link>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 mt-14 md:mt-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">
            {userInfo?.role === 'admin' ? "Admin Console" : "Main Menu"}
          </p>
          
          {userInfo?.role === 'admin' ? (
            <>
              <Item to="/admin" icon={<LayoutDashboard />} label="Dashboard" />
              <Item to="/admin/hostel" icon={<Hotel />} label="Hostel" />
              <Item to="/admin/orders" icon={<Truck />} label="Orders" />
              <Item to="/admin/inventory" icon={<Package />} label="Inventory" />
              <Item to="/admin/billing" icon={<ReceiptText />} label="Billing" />
              <Item to="/admin/customers" icon={<Users />} label="Customers" />
            </>
          ) : (
            <>
              <Item to="/" icon={<LayoutDashboard />} label="Dashboard" />
              <Item to="/appointments" icon={<Calendar />} label="Appointments" />
              <Item to="/shop" icon={<ShoppingBag />} label="Shop" />
              <Item to="/order-history" icon={<Truck />} label="Orders" />
              <Item to="/hostel" icon={<Hotel />} label="Hostel" />
              <Item to="/my-hostel-stays" icon={<ReceiptText />} label="My Stays" />
            </>
          )}
        </div>

        {/* USER PROFILE BOX */}
        <div className="p-4 border-t bg-slate-50/50" ref={dropdownRef}>
          {userInfo ? (
            <div className="relative">
              <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-2xl shadow-sm hover:border-indigo-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-indigo-200 shadow-lg">
                    {userInfo.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-800 leading-none">{userInfo.name?.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase">Pet Parent</p>
                  </div>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="absolute bottom-full mb-3 w-full bg-white shadow-2xl border border-slate-100 rounded-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-600 text-sm font-bold">
                    <UserCircle size={18} /> Profile
                  </Link>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 text-sm font-bold border-t">
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="block text-center bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">
              Login Account
            </Link>
          )}
        </div>
      </aside>

      {/* MOBILE BACKDROP */}
      {mobileOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm md:hidden z-40" onClick={() => setMobileOpen(false)} />}
    </>
  );
};

export default Navbar;