import express from 'express';
import { 
  bookAppointment, 
  getMyAppointments, 
  deleteAppointment,
  getAllAppointments,
  updateAppointmentStatus 
} from '../controllers/appointmentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- 🏥 APPOINTMENT ROUTES ONLY ---

// 1. Booking (User) & Full List (Admin)
router.route('/')
  .post(protect, bookAppointment) 
  .get(protect, adminOnly, getAllAppointments); 

// 2. Logged-in User ki apni history
router.route('/my')
  .get(protect, getMyAppointments); 

// 3. Appointment Cancel ya Delete karne ke liye
router.route('/:id')
  .delete(protect, deleteAppointment); 

// 4. Admin Update: Status (Approved/Completed) aur Prescription add karne ke liye
router.route('/:id/update')
  .put(protect, adminOnly, updateAppointmentStatus); 

export default router;