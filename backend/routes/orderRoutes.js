import express from 'express';
const router = express.Router();
import { 
  addOrderItems, 
  getMyOrders, 
  updateOrderStatus 
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// --- 🛒 USER ROUTES ---

// @desc    Naya order banayein (Confirmation Email yahan se trigger hota hai)
// @route   POST /api/orders
router.route('/').post(protect, addOrderItems);

// @desc    Logged-in user ke apne orders dekhein
// @route   GET /api/orders/myorders
router.route('/myorders').get(protect, getMyOrders);


// --- 👑 ADMIN ROUTES ---

// @desc    Order ka status badlein (Shipped/Delivered Email yahan se trigger hota hai)
// @route   PUT /api/orders/:id/status
// Note: Isme 'admin' middleware check karega ki user admin hai ya nahi
router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;