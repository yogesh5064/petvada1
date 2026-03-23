import User from '../models/User.js';
import Pet from '../models/Pet.js';
import Appointment from '../models/Appointment.js';
import Bill from '../models/Bill.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

// ✅ 1. Dashboard Statistics (Analytics Logic)
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPets = await Pet.countDocuments();
    const activeAppointments = await Appointment.countDocuments({ 
      status: { $in: ['Pending', 'Approved'] } 
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Offline Sales
    const counterSalesData = await Bill.aggregate([
      { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    // Online Sales (Only Delivered)
    const onlineSalesData = await Order.aggregate([
      { $match: { status: 'Delivered', createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    // Inventory Alerts
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(now.getMonth() + 3);

    const nearExpiryProducts = await Product.find({
      currentExpiry: { $gte: now, $lte: threeMonthsLater }
    }).select('name currentExpiry stock');

    const lowStockProducts = await Product.find({ stock: { $lt: 5 } }).select('name stock');

    const currentCounterSale = counterSalesData[0]?.total || 0;
    const currentOnlineSale = onlineSalesData[0]?.total || 0;

    res.json({ 
      totalUsers, 
      totalPets, 
      activeAppointments,
      totalSalesAmount: currentCounterSale + currentOnlineSale,
      counterSaleTotal: currentCounterSale,
      onlineSaleTotal: currentOnlineSale,
      nearExpiryProducts,
      lowStockProducts,
      currentMonthName: now.toLocaleString('default', { month: 'long' })
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard Error", error: error.message });
  }
};

// ✅ 2. CUSTOMER DEEP ANALYTICS (Frontend ke liye zaroori function)
export const getCustomerDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    // A. User Identity
    const customer = await User.findById(userId).select('-password');
    if (!customer) return res.status(404).json({ message: "User nahi mila" });

    // B. Pets Portfolio
    const pets = await Pet.find({ owner: userId });

    // C. Store Bills (Offline Desk Billing)
    const bills = await Bill.find({ user: userId }).sort({ createdAt: -1 });

    // D. Online Orders (Website E-commerce)
    const onlineOrders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    // E. Clinic Visits (Appointments)
    const visits = await Appointment.find({ 
      user: userId, 
      status: { $in: ['Approved', 'Completed'] } 
    }).sort({ date: -1 });

    // ✅ Combined Data Send
    res.json({
      customer,
      pets,
      bills,
      onlineOrders,
      visits
    });
  } catch (error) {
    res.status(500).json({ message: "Customer detail error", error: error.message });
  }
};

// ✅ 3. Get All Bills (Master List)
export const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find({}).sort({ createdAt: -1 });
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bills" });
  }
};