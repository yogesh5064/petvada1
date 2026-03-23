import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getDashboardStats } from '../controllers/adminController.js';
// ✅ Controller Imports
import { 
  updateAppointmentStatus, 
  generateResortBill 
} from '../controllers/appointmentController.js'; 
import Appointment from '../models/Appointment.js';
import Product from '../models/productModel.js';
import Bill from '../models/Bill.js'; // 👈 Ye model use hoga invoice count ke liye
import User from '../models/User.js'; 
import Pet from '../models/Pet.js'; 
import Order from '../models/orderModel.js'; 

const router = express.Router();

// 📊 Dashboard Stats
router.get('/stats', protect, adminOnly, getDashboardStats);

// =========================================================
// 🆕 ADDED: Latest Invoice Route (Fixes Frontend 404)
// =========================================================
router.get('/latest-invoice', protect, adminOnly, async (req, res) => {
  try {
    // Bills collection mein total kitne bills hain check karo
    const count = await Bill.countDocuments(); 
    res.json({ count: count || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invoice count', error: error.message });
  }
});

// ✅ NEW: Resort Billing Route
router.get('/hostel/generate-bill/:id', protect, adminOnly, generateResortBill);

// ✅ FIXED: Status Update Route
router.put('/appointment/:id', protect, adminOnly, updateAppointmentStatus);

// ✅ Resort Desk Sync Logic
router.get('/hostel-stays-from-appointments', protect, adminOnly, async (req, res) => {
  try {
    const appointments = await Appointment.find({ category: 'HOSTEL' })
      .populate('user', 'name email phone mobile')
      .sort({ date: -1 });

    const allStays = appointments.map(app => ({
      _id: app._id,
      petName: app.petName,
      owner: app.user,
      checkInDate: app.date, 
      checkOutDate: app.checkOutDate || "Not Set", 
      status: app.status,
      category: app.category
    }));

    const livePets = allStays.filter(stay => stay.status === 'Checked-In');
    res.json({ allStays, livePets });
  } catch (error) {
    res.status(500).json({ message: 'Hostel sync failed', error: error.message });
  }
});

// 🔍 Master Bills List
router.get('/customer-details/all-bills', protect, adminOnly, async (req, res) => {
  try {
    const bills = await Bill.find({}).sort({ createdAt: -1 });
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all bills' });
  }
});

// ✅ Dashboard Data
router.get('/dashboard-data', protect, adminOnly, async (req, res) => {
  try {
    const bills = await Bill.find();
    const totalCounterSales = bills.reduce((acc, bill) => acc + (bill.totalAmount || 0), 0);
    const deliveredOrders = await Order.find({ status: 'Delivered' });
    const totalOnlineSales = deliveredOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

    const salesByMonth = await Bill.aggregate([
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$totalAmount" } } },
      { $sort: { "_id": 1 } }
    ]);

    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const nearExpiryProducts = await Product.find({
      currentExpiry: { $gte: today, $lte: threeMonthsLater }
    }).select('name currentExpiry stock currentBatch');

    const lowStockProducts = await Product.find({ stock: { $lt: 5 } }).select('name stock');

    res.json({ 
      totalSalesAmount: totalCounterSales + totalOnlineSales, 
      counterSaleTotal: totalCounterSales,
      onlineSaleTotal: totalOnlineSales,
      salesByMonth, 
      nearExpiryProducts, 
      lowStockProducts 
    });
  } catch (error) {
    res.status(500).json({ message: 'Dashboard fetch failed' });
  }
});

// ✅ Customer Deep Analytics
router.get('/customer-details/:id', protect, adminOnly, async (req, res) => {
  try {
    const customerId = req.params.id;
    const [customer, pets, bills, onlineOrders, visits] = await Promise.all([
      User.findById(customerId).select('-password'),
      Pet.find({ owner: customerId }),
      Bill.find({ customerId: customerId }).sort({ createdAt: -1 }), 
      Order.find({ user: customerId }).sort({ createdAt: -1 }),
      Appointment.find({ user: customerId }).sort({ date: -1 })
    ]);

    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ customer, pets, bills, onlineOrders, visits });
  } catch (error) {
    res.status(500).json({ message: 'History fetch failed' });
  }
});

// ✅ Online Orders Management
router.get('/online-orders', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({ path: 'user', select: 'name email mobile address phone' })
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Orders fetch failed' });
  }
});

// ✅ Appointments Fetch
router.get('/appointments', protect, adminOnly, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('user', 'name phone mobile') 
      .populate('petId', 'name species') 
      .lean(); 
    res.status(200).json(appointments || []);
  } catch (error) {
    res.status(500).json({ message: 'Appointment query failed' });
  }
});

// ✅ Bill Saving
router.post('/save-bill', protect, adminOnly, async (req, res) => {
  try {
    const { customerName, customerMobile, customerId, items, totalAmount, invoiceNo, category } = req.body;
    if (customerId && customerMobile && customerMobile !== "N/A") {
      await User.findByIdAndUpdate(customerId, { $set: { mobile: customerMobile, phone: customerMobile } });
    }
    const cleanedItems = items.map(({ _id, ...rest }) => rest);
    const newBill = new Bill({ invoiceNo, customerName, customerMobile, items: cleanedItems, totalAmount, customerId, category: category || 'Store' });
    await newBill.save();
    for (const item of items) {
      if (item.productId) await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -Number(item.qty) } });
    }
    res.status(201).json({ success: true, message: 'Bill saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;