import express from 'express';
import { 
  authUser, 
  sendSignupOTP, 
  verifyOTPAndSignup, 
  getUserProfile, 
  updateUserProfile, 
  getAllUsers, 
  forgotPasswordOTP, 
  resetPassword,
  updateUserPassword,
  addUserAddress,
  deleteUserAddress,
  setDefaultAddress
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// ✅ Order Controller imports
import { getMyOrders, addOrderItems } from '../controllers/orderController.js';

const router = express.Router();

// --- 🔐 AUTH & VERIFICATION (Public) ---
router.post('/login', authUser);
router.post('/send-otp', sendSignupOTP);           
router.post('/verify-signup', verifyOTPAndSignup); 
router.post('/forgot-password-otp', forgotPasswordOTP); 
router.post('/reset-password', resetPassword);     

// --- 👤 PROFILE MANAGEMENT (Private) ---
router.route('/profile')
  .get(protect, getUserProfile) 
  .put(protect, updateUserProfile);

// ✅ FIX 1: Frontend '/api/users/change-password' call karta hai, isliye yahan change kiya
router.route('/change-password').put(protect, updateUserPassword);

// --- 🏠 ADDRESS MANAGEMENT (Private) ---
router.post('/add-address', protect, addUserAddress);
router.delete('/address/:id', protect, deleteUserAddress);

// ✅ FIX 2: Profile.jsx mein URL '/address/default/:id' hai, isliye yahan match kiya
router.put('/address/default/:id', protect, setDefaultAddress);

// --- 🛒 SHOPPING & ORDERS (Private) ---
router.route('/my-orders').get(protect, getMyOrders); 
router.route('/orders').post(protect, addOrderItems);

// --- 👑 ADMIN ONLY ---
router.route('/').get(protect, admin, getAllUsers);

export default router;