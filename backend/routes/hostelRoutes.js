import express from 'express';
const router = express.Router();

import {
  bookHostelStay,
  getAllStays,
  updateHostelStatus
} from '../controllers/hostelController.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';


// --- 🏨 USER ROUTES ---
router.route('/')
  .post(protect, bookHostelStay);


// --- 👑 ADMIN ROUTES ---
router.route('/admin/all-stays')
  .get(protect, adminOnly, getAllStays);

router.route('/admin/stay/:id')
  .put(protect, adminOnly, updateHostelStatus);

export default router;