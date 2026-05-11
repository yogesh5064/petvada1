import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import sendEmail from '../utils/sendEmail.js';

// =====================================================
// 🛒 CREATE ORDER
// =====================================================
export const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      ownerName,
    } = req.body;

    if (!orderItems?.length) {
      return res.status(400).json({
        message: 'Cart is empty',
      });
    }

    const order = new Order({
      user: req.user._id,
      ownerName,
      orderItems: orderItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image?.trim() || '/uploads/default-product.png',
        price: item.price || item.sellingPrice,
        product: item._id || item.product,
      })),
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      totalPrice,
    });

    const createdOrder = await order.save();

    // =================================================
    // 📧 ORDER CONFIRMATION EMAIL
    // =================================================
    try {
      const rows = orderItems
        .map(
          (item) => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align:center">${item.qty}</td>
          <td style="text-align:right">₹${item.price || item.sellingPrice}</td>
        </tr>
      `
        )
        .join('');

      await sendEmail({
        email: req.user.email,
        subject: 'Order Confirmed - PetVeda',
        html: generateOrderTemplate(
          'Confirmed',
          ownerName,
          createdOrder._id,
          rows,
          totalPrice,
          shippingAddress
        ),
      });
    } catch (err) {
      console.error('Email Error:', err.message);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({
      message: 'Order creation failed',
      error: error.message,
    });
  }
};

// =====================================================
// 📦 UPDATE ORDER STATUS (ADMIN)
// =====================================================
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const newStatus = req.body.status;
    const oldStatus = order.status;

    // =================================================
    // 🚚 STOCK DEDUCTION ONLY ON DELIVERY
    // =================================================
    if (oldStatus !== 'Delivered' && newStatus === 'Delivered') {
      await Promise.all(
        order.orderItems.map(async (item) => {
          const product = await Product.findById(item.product);

          if (product) {
            product.stock = Math.max(0, product.stock - item.qty);
            await product.save();
          }
        })
      );

      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    order.status = newStatus || order.status;
    const updatedOrder = await order.save();

    // =================================================
    // 📧 STATUS EMAIL
    // =================================================
    if (oldStatus !== updatedOrder.status) {
      try {
        await sendEmail({
          email: order.user.email,
          subject: `Order ${updatedOrder.status} - PetVeda`,
          html: statusEmailTemplate(order, updatedOrder),
        });
      } catch (err) {
        console.error('Status Email Error:', err.message);
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// 👤 GET USER ORDERS
// =====================================================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch orders',
    });
  }
};

// =====================================================
// 📧 ORDER TEMPLATE
// =====================================================
const generateOrderTemplate = (
  type,
  name,
  id,
  rows,
  total,
  addr
) => {
  return `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2>🐾 PetVeda Order ${type}</h2>
      <p>Hi <b>${name}</b></p>

      <table width="100%" style="border-collapse:collapse">
        ${rows}
      </table>

      <h3>Total: ₹${total}</h3>
      <p>Delivery Address: ${addr?.address || ''}</p>
    </div>
  `;
};

// =====================================================
// 📧 STATUS TEMPLATE
// =====================================================
const statusEmailTemplate = (order, updatedOrder) => {
  return `
    <div style="font-family: Arial;">
      <h2>Order Update - ${updatedOrder.status}</h2>
      <p>Hi ${order.ownerName}</p>

      <p>Order ID: ${order._id}</p>
      <p>Status: ${updatedOrder.status}</p>
      <p>Total: ₹${order.totalPrice}</p>
    </div>
  `;
};
export default router;