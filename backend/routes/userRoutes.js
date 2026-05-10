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

// ✅ ORDER CONTROLLERS
import { getMyOrders, addOrderItems } from '../controllers/orderController.js';

// ✅ EMAIL DEBUG IMPORT
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();


// =====================================================
// 🔐 AUTH ROUTES
// =====================================================

router.post('/login', authUser);

router.post('/send-otp', sendSignupOTP);

router.post('/verify-signup', verifyOTPAndSignup);

router.post('/forgot-password-otp', forgotPasswordOTP);

router.post('/reset-password', resetPassword);


// =====================================================
// 🧪 TEST EMAIL ROUTE
// =====================================================

router.get('/test-email', async (req, res) => {

  try {

    await sendEmail({
      email: 'ykumawat8690@gmail.com',
      subject: '🐾 PetVeda SMTP Test',
      otp: '123456'
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });

  } catch (error) {

    console.log('❌ TEST EMAIL ERROR');
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// =====================================================
// 👤 PROFILE ROUTES
// =====================================================

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);


// =====================================================
// 🔑 PASSWORD ROUTES
// =====================================================

router.route('/change-password')
  .put(protect, updateUserPassword);


// =====================================================
// 🏠 ADDRESS ROUTES
// =====================================================

router.post('/add-address', protect, addUserAddress);

router.delete('/address/:id', protect, deleteUserAddress);

router.put('/address/default/:id', protect, setDefaultAddress);


// =====================================================
// 🛒 ORDER ROUTES
// =====================================================

router.route('/my-orders')
  .get(protect, getMyOrders);

router.route('/orders')
  .post(protect, addOrderItems);


// =====================================================
// 👑 ADMIN ROUTES
// =====================================================

router.route('/')
  .get(protect, admin, getAllUsers);


export default router;