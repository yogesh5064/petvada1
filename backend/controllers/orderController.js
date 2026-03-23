import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import sendEmail from '../utils/sendEmail.js';

// ✅ 1. Naya Online Order Create Karna (No Stock Deduction here)
export const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      ownerName
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'Cart khali hai bhai!' });
    }

    const order = new Order({
      user: req.user._id, 
      ownerName,
      orderItems: orderItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image && item.image.trim() !== "" ? item.image : '/uploads/default-product.png',
        price: item.sellingPrice || item.price, 
        product: item._id || item.product,     
      })),
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      totalPrice,
    });

    const createdOrder = await order.save();

    // 📧 Notification Email (Confirmation only)
    try {
      const itemsTableRows = orderItems.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.sellingPrice || item.price}</td>
        </tr>
      `).join('');

      await sendEmail({
        email: req.user.email,
        subject: '📦 Order Confirmed - PetVeda',
        html: generateOrderEmailTemplate('Confirmed', ownerName, createdOrder._id, itemsTableRows, totalPrice, shippingAddress)
      });
    } catch (emailErr) {
      console.error("Confirmation Email Error:", emailErr);
    }

    res.status(201).json(createdOrder);

  } catch (error) {
    res.status(500).json({ message: 'Order error!', error: error.message });
  }
};

// ✅ 2. Admin Status Update & Final Billing Logic
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      const oldStatus = order.status;
      const newStatus = req.body.status;

      // 🛡️ Prevent double stock deduction if status is updated multiple times to Delivered
      if (oldStatus !== 'Delivered' && newStatus === 'Delivered') {
        
        // 🚀 INVENTORY MINUS LOGIC: Only happens on Final Delivery/Billing
        await Promise.all(order.orderItems.map(async (item) => {
          const product = await Product.findById(item.product);
          if (product) {
            // Desk biling ko disturb kiye bina, online stock update
            product.stock = Math.max(0, product.stock - item.qty);
            await product.save();
          }
        }));

        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.isPaid = true; // Billing complete assume
      }

      order.status = newStatus || order.status;
      const updatedOrder = await order.save();

      // 📧 Status Update Email
      if (oldStatus !== updatedOrder.status) {
        try {
          let statusEmoji = updatedOrder.status === 'Shipped' ? '🚚' : '✅';
          let statusTitle = updatedOrder.status === 'Shipped' ? 'Order Shipped!' : 'Order Delivered & Billed!';
          let statusMsg = updatedOrder.status === 'Shipped' 
            ? 'Aapka order nikal chuka hai aur jald hi aapke paas pahunchega.' 
            : 'Aapka order successfully deliver ho gaya hai aur billing finalize ho chuki hai.';

          await sendEmail({
            email: order.user.email,
            subject: `${statusEmoji} ${statusTitle} - PetVeda`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #4f46e5; border-radius: 20px; padding: 25px;">
                <h1 style="color: #4f46e5; text-align: center;">🐾 PetVeda Billing</h1>
                <h2 style="text-align: center; color: #111827;">${statusTitle}</h2>
                <p>Hi <b>${order.ownerName}</b>, ${statusMsg}</p>
                <div style="background: #f9fafb; padding: 20px; border-radius: 15px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                  <p><b>Order ID:</b> ${order._id}</p>
                  <p><b>Final Status:</b> ${updatedOrder.status}</p>
                  <p><b>Total Amount:</b> ₹${order.totalPrice}</p>
                </div>
                <p style="text-align: center; font-size: 11px; color: #9ca3af;">Thank you for shopping with PetVeda!</p>
              </div>
            `
          });
        } catch (err) { console.error("Status Email Error:", err); }
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order nahi mila' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 3. Get User Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Orders fetch nahi ho paye' });
  }
};

const generateOrderEmailTemplate = (type, name, id, rows, total, addr) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 20px; padding: 25px;">
      <h1 style="color: #4f46e5; text-align: center;">🐾 PetVeda</h1>
      <h2 style="text-align: center;">Order ${type}! 📦</h2>
      <p>Hi <b>${name}</b>, aapka online order humein mil gaya hai.</p>
      <div style="background: #f9fafb; border-radius: 15px; padding: 20px;">
        <table style="width: 100%; border-collapse: collapse;">${rows}</table>
        <p style="text-align: right; font-size: 18px; font-weight: 900; margin-top: 15px;">Total: ₹${total}</p>
        <p style="font-size: 10px; color: #6b7280; text-align: right;">Delivery to: ${addr.address}</p>
      </div>
    </div>`;
};
