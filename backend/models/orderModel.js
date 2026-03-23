import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  ownerName: { type: String, required: true }, 
  
  orderItems: [{
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    weight: { type: String }, 
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: 'Product' 
    },
  }],

  shippingAddress: {
    address: { type: String, required: true }, 
    city: { type: String, required: true },
    pincode: { type: String }, // ✅ Naya: Delivery ke liye zaroori hai
    phone: { type: String, required: true }, // ✅ Naya: Contact ke liye
    location: {
      lat: { type: Number }, 
      lng: { type: Number }  
    }
  },

  // ✅ Payment Details (Repeat order aur record ke liye)
  paymentMethod: { 
    type: String, 
    required: true, 
    default: 'Cash on Delivery' 
  },
  
  totalPrice: { type: Number, required: true, default: 0.0 },

  // ✅ Order Lifecycle Tracking
  status: { 
    type: String, 
    required: true, 
    default: 'Processing',
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'] //
  },

  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: { type: Date }, // ✅ Delivery time track karne ke liye

}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;