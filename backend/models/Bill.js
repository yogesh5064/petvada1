import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerMobile: { type: String },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      name: String,
      batch: String,
      qty: Number,
      rate: Number,
      amount: Number,
    }
  ],
  totalAmount: { type: Number, required: true },
}, { timestamps: true });

const Bill = mongoose.model('Bill', billSchema);
export default Bill;