import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  petName: { type: String, required: true },
  
  // Professional Stay Details
  checkInDate: { type: Date, required: true },
  checkInTime: { type: String, required: true }, 
  checkOutDate: { type: Date, required: true },
  checkOutTime: { type: String, required: true },
  
  // Package Information (Professional feel ke liye)
  packageName: { type: String, default: 'Standard Stay' }, // e.g., 'Luxury Suite', 'Classic'
  totalDays: { type: Number, required: true, default: 1 },

  // Notes/Requirements
  notes: { type: String }, 
  
  // Professional Status Management
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Checked-In', 'Checked-Out', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },

  // Financials (Total Price management)
  charges: { type: Number, required: true, default: 0 }, // Per day charge
  totalPrice: { type: Number, required: true, default: 0 }, // Final Calculated Bill (charges * days)
  paymentStatus: { 
    type: String, 
    enum: ['Unpaid', 'Paid', 'Partial'], 
    default: 'Unpaid' 
  }
}, { timestamps: true });

// Pre-save hook to ensure totalPrice is always calculated correctly
hostelSchema.pre('save', function(next) {
  if (this.charges && this.totalDays) {
    this.totalPrice = this.charges * this.totalDays;
  }
  next();
});

export default mongoose.model('Hostel', hostelSchema);