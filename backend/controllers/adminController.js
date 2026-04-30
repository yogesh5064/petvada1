import User from '../models/User.js';
import Pet from '../models/Pet.js';
import Appointment from '../models/Appointment.js';
import Bill from '../models/Bill.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

// ✅ 1. Dashboard Statistics (Analytics Logic) - Optimized with Promise.all
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(now.getMonth() + 3);

    // 🔥 Parallel execution: Saari queries ek saath start hongi
    const [
      totalUsers,
      totalPets,
      activeAppointments,
      counterSalesData,
      onlineSalesData,
      nearExpiryProducts,
      lowStockProducts
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Pet.countDocuments(),
      Appointment.countDocuments({ status: { $in: ['Pending', 'Approved'] } }),
      
      // Offline Sales Aggregation
      Bill.aggregate([
        { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),

      // Online Sales Aggregation
      Order.aggregate([
        { $match: { status: 'Delivered', createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]),

      // Inventory Alerts
      Product.find({
        currentExpiry: { $gte: now, $lte: threeMonthsLater }
      }).select('name currentExpiry stock').lean(),

      Product.find({ stock: { $lt: 5 } }).select('name stock').lean()
    ]);

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

// ✅ 2. CUSTOMER DEEP ANALYTICS (Optimized with Promise.all)
export const getCustomerDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    // Pehle check karein ki customer exist karta hai ya nahi
    const customer = await User.findById(userId).select('-password').lean();
    if (!customer) return res.status(404).json({ message: "User nahi mila" });

    // 🔥 Related data parallel mein fetch karein
    const [pets, bills, onlineOrders, visits] = await Promise.all([
      Pet.find({ owner: userId }).lean(),
      Bill.find({ user: userId }).sort({ createdAt: -1 }).lean(),
      Order.find({ user: userId }).sort({ createdAt: -1 }).lean(),
      Appointment.find({ 
        user: userId, 
        status: { $in: ['Approved', 'Completed'] } 
      }).sort({ date: -1 }).lean()
    ]);

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
    // .lean() add kiya fast processing ke liye
    const bills = await Bill.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bills" });
  }
};