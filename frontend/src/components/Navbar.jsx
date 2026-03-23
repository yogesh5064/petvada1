import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Calendar, 
  Hotel, 
  LayoutDashboard, 
  LogOut, 
  Menu,
  X,
  ChevronDown,
  Users,
  UserCircle,
  Package,
  ReceiptText,
  Truck 
} from 'lucide-react'; 
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const rawData = localStorage.getItem('userInfo');
  const userInfo = rawData ? JSON.parse(rawData) : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success("Logout ho gaya! 🐾");
    navigate('/');
    window.location.reload(); 
  };

  const isActive = (path) => location.pathname === path;

  const NavLinks = () => (
    <>
      {userInfo?.role === 'admin' ? (
        <>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3 mb-2 hidden md:block">Admin Menu</p>
          <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/admin') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <LayoutDashboard size={20} /> <span>Admin Panel</span>
          </Link>
          {/* ✅ Naya Hostel Route Admin ke liye */}
          <Link to="/admin/hostel" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/admin/hostel') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <Hotel size={20} /> <span>Resort Desk</span>
          </Link>
          <Link to="/admin/orders" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/admin/orders') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <Truck size={20} /> <span>Orders</span>
          </Link>
          <Link to="/admin/inventory" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/admin/inventory') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <Package size={20} /> <span>Inventory</span>
          </Link>
          <Link to="/admin/billing" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/admin/billing') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <ReceiptText size={20} /> <span>Billing</span>
          </Link>
          <Link to="/admin/customers" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/admin/customers') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <Users size={20} /> <span>Customers</span>
          </Link>
        </>
      ) : (
        <>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3 mb-2 hidden md:block">Patient Menu</p>
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </Link>
          <Link to="/appointments" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/appointments') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <Calendar size={20} /> <span>Visits</span>
          </Link>
          <Link to="/shop" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/shop') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <ShoppingBag size={20} /> <span>Shop</span>
          </Link>
          <Link to="/order-history" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/order-history') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <Truck size={20} /> <span>My Orders</span>
          </Link>
          <Link to="/hostel" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/hostel') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <Hotel size={20} /> <span>Hostel</span>
          </Link>
          <Link to="/my-hostel-stays" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive('/my-hostel-stays') ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <ReceiptText size={20} /> <span>My Stays</span>
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      {/* 📱 Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-md fixed top-0 w-full z-[60]">
        <Link to="/" className="text-xl font-black text-indigo-600 flex items-center">🐾 PetVeda</Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-50 rounded-lg">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 🏠 Sidebar Nav */}
      <nav className={`w-64 bg-white shadow-xl h-screen fixed left-0 top-0 z-50 flex flex-col border-r border-gray-100 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} print:hidden`}>
        <div className="p-6 border-b border-gray-50 hidden md:block">
          <Link to="/" className="text-2xl font-black text-indigo-600 flex items-center tracking-tighter italic">🐾 PetVeda</Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 mt-16 md:mt-4">
          <NavLinks />
        </div>

        <div className="p-4 border-t border-gray-100" ref={dropdownRef}>
          {userInfo ? (
            <div className="relative">
              <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-gray-50 border border-gray-100 p-3 rounded-2xl hover:bg-gray-100 transition">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`w-8 h-8 flex-shrink-0 ${userInfo.role === 'admin' ? 'bg-red-500' : 'bg-indigo-600'} rounded-xl flex items-center justify-center text-white font-black text-xs`}>{userInfo.name[0].toUpperCase()}</div>
                  <span className="font-bold text-gray-800 text-sm truncate uppercase italic tracking-tight">{userInfo.role === 'admin' ? 'Admin' : userInfo.name.split(' ')[0]}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="absolute bottom-full left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl py-3 mb-2 z-50">
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-indigo-50 text-gray-700 font-semibold text-sm">
                    <UserCircle size={16} className="text-indigo-500" /> My Profile
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 font-bold text-sm">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="block text-center bg-indigo-600 text-white w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all">Join Now</Link>
          )}
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[40] md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
    </>
  );
};

export default Navbar;