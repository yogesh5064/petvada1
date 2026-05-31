import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// =========================
// TOKEN GENERATOR
// =========================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// =========================
// CONTROLLERS
// =========================

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendSignupOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email required' });

    const userExists = await User.findOne({ email }).select('isVerified');
    if (userExists?.isVerified) {
      return res.status(400).json({ message: 'This email is already registered' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    await User.findOneAndUpdate(
      { email },
      { email, otp, otpExpire, isVerified: false },
      { upsert: true, new: true }
    );

    await sendEmail({
      to: email,
      subject: 'PetVeda OTP Verification',
      html: `
        <div style="font-family:Arial;padding:10px">
          <h2>OTP Verification</h2>
          <h1 style="color:#4f46e5">${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Signup OTP failed:', err.message);
    res.status(500).json({ message: 'OTP sending failed', error: err.message });
  }
};

export const verifyOTPAndSignup = async (req, res) => {
  try {
    const { name, email, password, otp, phone } = req.body;
    const user = await User.findOne({ email });

    if (!user || String(user.otp) !== String(otp) || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(401).json({ message: 'Verify email first' });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic || '',
      phone: user.phone || '',
      addresses: user.addresses || [],
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPasswordOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: email,
      subject: 'PetVeda Password Reset OTP',
      otp,
    });
    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('Forgot password OTP failed:', err.message);
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || String(user.otp) !== String(otp) || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, phone, profilePic, password } = req.body;
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.profilePic = profilePic || user.profilePic;
    if (password) user.password = password;

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user || !(await user.matchPassword(oldPassword))) {
      return res.status(401).json({ message: 'Old password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.addresses) user.addresses = [];
    user.addresses.push({ ...req.body, isDefault: user.addresses.length === 0 });
    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = (user.addresses || []).filter((a) => a._id.toString() !== req.params.id);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    (user.addresses || []).forEach((a) => {
      a.isDefault = a._id.toString() === req.params.id;
    });
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// ROUTE DEFINITIONS
// =========================

router.get('/all', getAllUsers);
router.post('/signup-otp', sendSignupOTP);
router.post('/verify-signup', verifyOTPAndSignup);
router.post('/login', authUser);
router.post('/forgot-password', forgotPasswordOTP);
router.post('/reset-password', resetPassword);

// These usually need a 'protect' middleware before the controller
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/change-password', updateUserPassword);
router.post('/address', addUserAddress);
router.delete('/address/:id', deleteUserAddress);
router.patch('/address/default/:id', setDefaultAddress);

// =========================
// THE FINAL EXPORT (Fixed the error)
// =========================
export default router;
