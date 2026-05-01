import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

// Token Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ✅ 1. Sabhi customers fetch karna (Admin ke liye)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 2. Signup OTP Bhejna - FIXED: Using 'await' for Debugging Email errors
export const sendSignupOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'User already exists and is verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); 

    await User.findOneAndUpdate(
      { email },
      { otp, otpExpire, isVerified: false },
      { upsert: true, new: true }
    );

    // 🛠️ DEBUG MODE: 'await' wapas lagaya gaya hai exact error dekhne ke liye
    await sendEmail({
      email,
      subject: 'PetVeda - Email Verification Code',
      otp: otp,
      message: `Aapka signup verification code hai: ${otp}.`
    });

    res.status(200).json({ message: 'Verification code sent to your email! 📩' });
  } catch (error) {
    console.error("❌ Email Error in Controller:", error.message);
    res.status(500).json({ message: 'Email sending failed!', error: error.message });
  }
};

// ✅ 3. OTP Verify karke Signup Complete karna
export const verifyOTPAndSignup = async (req, res) => {
  const { name, email, password, otp, phone } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or Expired OTP! ❌' });
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

// ✅ 4. Login User
export const authUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    if (user && !user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first! Check OTP.' });
    }

    if (user && (await user.matchPassword(password))) {
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
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 5. Forgot Password - Step 1: Send Reset OTP (Debug Mode)
export const forgotPasswordOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with this email!' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // 🛠️ DEBUG MODE: 'await' lagaya gaya hai
    await sendEmail({
      email,
      subject: 'PetVeda - Password Reset Code',
      otp: otp,
      message: `Aapka password reset code hai: ${otp}.`
    });

    res.status(200).json({ message: 'Reset code sent to email! 📩' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing reset request', error: error.message });
  }
};

// ✅ 6. Forgot Password - Step 2: Verify & Reset Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or Expired OTP! ❌' });
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

// ✅ 7. UPDATE Profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.profilePic = req.body.profilePic || user.profilePic;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save({ validateBeforeSave: false });

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profilePic: updatedUser.profilePic,
        addresses: updatedUser.addresses,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 8. GET Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 9. Change Password 
export const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user && (await user.matchPassword(oldPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully! 🔐' });
    } else {
      res.status(401).json({ message: 'Purana password galat hai!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 10. Add New Address
export const addUserAddress = async (req, res) => {
  try {
    const { label, fullAddress, city, pincode, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      const isFirst = user.addresses.length === 0;
      user.addresses.push({
        label: label || 'Home',
        fullAddress,
        city,
        pincode,
        phone,
        isDefault: isFirst
      });

      await user.save({ validateBeforeSave: false }); 
      res.status(201).json(user.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 11. Delete Address
export const deleteUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.addresses = user.addresses.filter(
        (addr) => addr._id.toString() !== req.params.id
      );
      await user.save({ validateBeforeSave: false });
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 12. Set Default Address
export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.addresses.forEach((addr) => {
        addr.isDefault = addr._id.toString() === req.params.id;
      });
      await user.save({ validateBeforeSave: false });
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};