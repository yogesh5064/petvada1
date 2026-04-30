// controllers/authController.js forgot password logic
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js'; // Email utility import karein

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    // 1. User ko find karein (Optimized query)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User nahi mila" });
    }

    // 2. 6-digit OTP generate karein
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Database mein OTP aur Expiry save karein
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 600000; // 10 mins
    await user.save({ validateBeforeSave: false }); // Validation bypass karein password reset ke waqt

    // 4. 🔥 NON-BLOCKING Email logic: Isse spinner nahi atkeyga
    sendEmail({
      email: user.email,
      subject: 'PetVeda - Password Reset OTP',
      otp: otp,
      message: `Aapka password reset code hai: ${otp}. Ye sirf 10 minute tak valid hai.`
    }).catch(err => console.error("Forgot Password Email Error (Handled):", err.message));

    // 5. Success Response turant bhej dein
    res.json({ message: "OTP sent to your email! 📩" });

  } catch (error) {
    // Server crash hone se bachane ke liye catch block
    res.status(500).json({ message: "Server error: OTP nahi bheja ja saka" });
  }
};