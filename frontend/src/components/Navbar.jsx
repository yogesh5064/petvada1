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
  const [mobileOpen, setMobileOpen] = useState(false);

  const dropdownRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
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
      ? "bg-indigo-600 text-white shadow-md"
      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600";

  const Item = ({ to, icon, label }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${active(to)}`}
    >
      {icon} <span>{label}</span>
    </Link>
  );

  const MenuSection = () => (
    <>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mt-2">
        {userInfo?.role === 'admin' ? "Admin Panel" : "Dashboard"}
      </p>

      {userInfo?.role === 'admin' ? (
        <>
          <Item to="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <Item to="/admin/hostel" icon={<Hotel size={18} />} label="Hostel" />
          <Item to="/admin/orders" icon={<Truck size={18} />} label="Orders" />
          <Item to="/admin/inventory" icon={<Package size={18} />} label="Inventory" />
          <Item to="/admin/billing" icon={<ReceiptText size={18} />} label="Billing" />
          <Item to="/admin/customers" icon={<Users size={18} />} label="Customers" />
        </>
      ) : (
        <>
          <Item to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <Item to="/appointments" icon={<Calendar size={18} />} label="Appointments" />
          <Item to="/shop" icon={<ShoppingBag size={18} />} label="Shop" />
          <Item to="/order-history" icon={<Truck size={18} />} label="Orders" />
          <Item to="/hostel" icon={<Hotel size={18} />} label="Hostel" />
          <Item to="/my-hostel-stays" icon={<ReceiptText size={18} />} label="My Stays" />
        </>
      )}
    </>
  );

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-white shadow-sm flex justify-between items-center px-4 py-3">
        <Link to="/" className="font-black text-indigo-600 text-lg">
          🐾 PetVeda
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-gray-100"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-lg z-40 flex flex-col transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* LOGO */}
        <div className="p-6 border-b hidden md:block">
          <Link className="text-2xl font-black text-indigo-600 italic">
            🐾 PetVeda
          </Link>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 mt-16 md:mt-4">
          <MenuSection />
        </div>

        {/* USER SECTION */}
        <div className="p-4 border-t" ref={dropdownRef}>
          {userInfo ? (
            <div className="relative">

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center bg-gray-50 p-3 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                    {userInfo.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="font-bold text-sm truncate">
                    {userInfo.name?.split(' ')[0]}
                  </span>
                </div>

                <ChevronDown size={16} className={`${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="absolute bottom-full mb-2 w-full bg-white shadow-xl border rounded-xl py-2">

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 text-sm"
                  >
                    <UserCircle size={16} /> Profile
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-semibold"
                  >
                    <LogOut size={16} /> Logout
                  </button>

                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="block text-center bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest"
            >
              Login
            </Link>
          )}
        </div>
      </aside>

      {/* BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;