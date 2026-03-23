// controllers/authController.js forgot password logic
import User from '../models/User.js';
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User nahi mila" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordOTP = otp;
  user.resetPasswordExpires = Date.now() + 600000; // 10 mins
  await user.save();

  // Send Email with OTP...
  res.json({ message: "OTP sent!" });
};