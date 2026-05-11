import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

// =====================================================
// 🔐 TOKEN GENERATOR
// =====================================================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// =====================================================
// 👑 GET ALL USERS (ADMIN)
// =====================================================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .lean();

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 📩 SEND SIGNUP OTP
// =====================================================
export const sendSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser?.isVerified) {
      return res.status(400).json({
        message: 'User already exists and is verified',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    await User.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        otpExpire,
        isVerified: false,
      },
      { upsert: true, new: true }
    );

    await sendEmail({
      email,
      subject: 'PetVeda Email Verification',
      otp,
      message: `Your verification code is ${otp}`,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'OTP sending failed',
      error: error.message,
    });
  }
};

// =====================================================
// ✅ VERIFY OTP + SIGNUP COMPLETE
// =====================================================
export const verifyOTPAndSignup = async (req, res) => {
  try {
    const { name, email, password, otp, phone } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
      });
    }

    user.name = name;
    user.password = password;
    user.phone = phone || '';
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🔑 LOGIN
// =====================================================
export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Please verify your email first',
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      phone: user.phone,
      addresses: user.addresses,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🔐 FORGOT PASSWORD OTP
// =====================================================
export const forgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email,
      subject: 'PetVeda Password Reset OTP',
      otp,
      message: `Your reset code is ${otp}`,
    });

    res.json({ message: 'Reset OTP sent' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
};

// =====================================================
// 🔁 RESET PASSWORD
// =====================================================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
      });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 👤 GET PROFILE
// =====================================================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// ✏️ UPDATE PROFILE
// =====================================================
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, phone, profilePic, password } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.profilePic = profilePic || user.profilePic;

    if (password) {
      user.password = password;
    }

    await user.save({ validateBeforeSave: false });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
      addresses: user.addresses,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🔐 CHANGE PASSWORD
// =====================================================
export const updateUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user || !(await user.matchPassword(oldPassword))) {
      return res.status(401).json({
        message: 'Old password incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🏠 ADD ADDRESS
// =====================================================
export const addUserAddress = async (req, res) => {
  try {
    const { label, fullAddress, city, pincode, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFirst = user.addresses.length === 0;

    user.addresses.push({
      label: label || 'Home',
      fullAddress,
      city,
      pincode,
      phone,
      isDefault: isFirst,
    });

    await user.save({ validateBeforeSave: false });

    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// 🗑️ DELETE ADDRESS
// =====================================================
export const deleteUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== req.params.id
    );

    await user.save({ validateBeforeSave: false });

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================================================
// ⭐ SET DEFAULT ADDRESS
// =====================================================
export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.addresses.forEach((a) => {
      a.isDefault = a._id.toString() === req.params.id;
    });

    await user.save({ validateBeforeSave: false });

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};