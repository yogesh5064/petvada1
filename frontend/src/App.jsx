import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

// Page & Component Imports
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import AdminHistory from './pages/AdminHistory';
import AdminInventory from './pages/AdminInventory'; 
import AdminBilling from './pages/AdminBilling';      
import AdminCustomers from './pages/AdminCustomers';
import AdminOrders from './pages/AdminOrders'; 
import AdminHostel from './pages/AdminHostel'; // ✅ Naya Import
import InvoicePage from './pages/InvoicePage'; 
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile'; 
import ChangePassword from './pages/ChangePassword'; 
import Shop from './pages/Shop'; 
import PetProfile from './pages/PetProfile'; 
import OrderHistory from './pages/OrderHistory'; 
import Hostel from './pages/Hostel'; 
import HostelBookings from './pages/HostelBookings'; 
import CheckoutVerification from './pages/CheckoutVerification'; 
import PlaceOrder from './pages/PlaceOrder'; 
import Appointment from './components/Appointment';
import Navbar from './components/Navbar'; 
import NotificationBanner from './components/NotificationBanner';

// ✅ Protected Route Logic
const ProtectedRoute = ({ children, isAdminRoute }) => {
  const userString = localStorage.getItem('userInfo');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminRoute && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  // ✅ State for dynamic auth sync
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')));
  
  useEffect(() => {
    const handleAuth = () => {
      const storedUser = JSON.parse(localStorage.getItem('userInfo'));
      setUserInfo(storedUser);
      if (storedUser && storedUser.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
      }
    };

    handleAuth();
    window.addEventListener('storage', handleAuth);
    return () => window.removeEventListener('storage', handleAuth);
  }, []);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '20px',
            background: '#333',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '12px'
          },
        }}
      />
      
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 overflow-x-hidden">
        
        <Navbar /> 
        
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full ${userInfo ? 'md:ml-64' : 'ml-0'}`}>
          
          <NotificationBanner />
          
          <div className={`flex-grow w-full overflow-y-auto ${userInfo ? 'p-3 md:p-6 pt-20 md:pt-6' : 'p-0'}`}> 
            <Routes>
              {/* --- 🏠 Home Logic --- */}
              <Route 
                path="/" 
                element={
                  userInfo ? (
                    userInfo.role === 'admin' ? (
                      <Navigate to="/admin" replace /> 
                    ) : (
                      <UserDashboard />
                    )
                  ) : (
                    <Home />
                  )
                } 
              />

              {/* ✅ 1. PUBLIC ROUTES */}
              <Route path="/shop" element={<Shop />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* ✅ 2. USER PROTECTED ROUTES */}
              <Route path="/appointments" element={<ProtectedRoute><Appointment /></ProtectedRoute>} />
              <Route path="/hostel" element={<ProtectedRoute><Hostel /></ProtectedRoute>} />
              <Route path="/my-hostel-stays" element={<ProtectedRoute><HostelBookings /></ProtectedRoute>} />
              <Route path="/checkout-verification" element={<ProtectedRoute><CheckoutVerification /></ProtectedRoute>} />
              <Route path="/place-order" element={<ProtectedRoute><PlaceOrder /></ProtectedRoute>} />
              <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Shop /></ProtectedRoute>} /> 
              <Route path="/pet-profile/:id" element={<ProtectedRoute><PetProfile /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

              {/* ✅ 3. ADMIN PROTECTED ROUTES */}
              <Route path="/admin" element={<ProtectedRoute isAdminRoute={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/history" element={<ProtectedRoute isAdminRoute={true}><AdminHistory /></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute isAdminRoute={true}><AdminInventory /></ProtectedRoute>} />
              <Route path="/admin/billing" element={<ProtectedRoute isAdminRoute={true}><AdminBilling /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute isAdminRoute={true}><AdminOrders /></ProtectedRoute>} />
              
              {/* ✅ Naya Admin Hostel Route */}
              <Route path="/admin/hostel" element={<ProtectedRoute isAdminRoute={true}><AdminHostel /></ProtectedRoute>} />
              
              <Route path="/admin/customers" element={<ProtectedRoute isAdminRoute={true}><AdminCustomers /></ProtectedRoute>} />
              <Route path="/admin/invoice" element={<ProtectedRoute isAdminRoute={true}><InvoicePage /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;