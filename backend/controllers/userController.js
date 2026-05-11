import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

// =========================
// TOKEN HELPER
// =========================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// =========================
// 1. GET ALL USERS (ADMIN)
// =========================
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

// =========================
// 2. SEND SIGNUP OTP (FIXED)
// =========================
export const sendSignupOTP = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const userExists = await User.findOne({ email });

    if (userExists && userExists.isVerified) {
      return res.status(400).json({
        message: 'User already exists and is verified',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    await User.findOneAndUpdate(
      { email },
      { email, otp, otpExpire, isVerified: false },
      { upsert: true, new: true }
    );

    // ✅ FIXED EMAIL FORMAT
    await sendEmail({
      to: email,
      subject: 'PetVeda - Email Verification Code',
      html: `
        <div style="font-family:Arial;padding:10px">
          <h2>PetVeda OTP Verification</h2>
          <h1 style="color:#4f46e5;font-size:32px">${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    res.status(200).json({
      message: 'Verification code sent to your email! 📩',
    });
  } catch (error) {
    console.error('OTP ERROR:', error.message);
    res.status(500).json({
      message: 'Email sending failed!',
      error: error.message,
    });
  }
};

// =========================
// 3. VERIFY OTP + SIGNUP
// =========================
export const verifyOTPAndSignup = async (req, res) => {
  const { name, email, password, otp, phone } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({
        message: 'Invalid or Expired OTP! ❌',
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

// =========================
// 4. LOGIN
// =========================
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && !user.isVerified) {
      return res.status(401).json({
        message: 'Please verify your email first!',
      });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// 5. FORGOT PASSWORD OTP
// =========================
export const forgotPasswordOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'No user found with this email!',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: email,
      subject: 'PetVeda - Password Reset Code',
      html: `<h2>Your OTP is</h2><h1>${otp}</h1>`,
    });

    res.json({ message: 'Reset code sent to email! 📩' });
  } catch (error) {
    res.status(500).json({
      message: 'Error processing request',
      error: error.message,
    });
  }
};

// =========================
// 6. RESET PASSWORD
// =========================
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({
        message: 'Invalid or Expired OTP! ❌',
      });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully! 🔐' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========================
// PROFILE + OTHER FUNCTIONS (UNCHANGED)
// =========================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};