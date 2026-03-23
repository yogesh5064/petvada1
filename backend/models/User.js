import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: { type: String, required: [true, 'Please add a name'] },
  email: { 
    type: String, 
    required: [true, 'Please add an email'], 
    unique: true,
    match: [/.+\@.+\..+/, 'Please use a valid email address']
  },
  password: { type: String, required: [true, 'Please add a password'] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profilePic: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
  membership: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: 'Bronze' },
  totalSpent: { type: Number, default: 0 },
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpire: { type: Date },
  phone: { type: String, default: '' },
  
  addresses: [
    {
      label: { type: String, default: 'Home' }, 
      fullAddress: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
      isDefault: { type: Boolean, default: false }
    }
  ]
}, { timestamps: true });

// Password Match function
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ FIXED: Pre-save Middleware (Simplified for Async)
userSchema.pre('save', async function () {
  // 1. Password Hashing logic
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // 2. Membership logic
  if (this.isModified('totalSpent') || this.isNew) {
    if (this.totalSpent >= 25000) {
      this.membership = 'Gold';
    } else if (this.totalSpent >= 10000) {
      this.membership = 'Silver';
    } else {
      this.membership = 'Bronze';
    }
  }
  // No next() needed here when using async without the next parameter
});

const User = mongoose.model('User', userSchema);
export default User;