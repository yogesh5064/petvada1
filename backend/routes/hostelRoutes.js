import express from 'express';
const router = express.Router();
import { 
  bookHostelStay, 
  getAllStays, 
  updateHostelStatus 
} from '../controllers/hostelController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// --- 🏨 USER ROUTES ---

// @desc    Naya hostel stay book karne ke liye
// @route   POST /api/hostel
router.route('/').post(protect, bookHostelStay);


// --- 👑 ADMIN ROUTES (Resort Management) ---

// @desc    Sari bookings aur live pets dekhne ke liye (Admin Desk)
// @route   GET /api/hostel/admin/all-stays
router.route('/admin/all-stays').get(protect, admin, getAllStays);

// @desc    Stay status badalne ke liye (Approve/Check-In/Check-Out)
// @route   PUT /api/hostel/admin/stay/:id
router.route('/admin/stay/:id').put(protect, admin, updateHostelStatus);

export default router;