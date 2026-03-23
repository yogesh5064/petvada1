import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Transporter banao (.env se values uthayega)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  // ✅ 2. LOGIC: Agar Controller ne apna 'html' bheja hai toh wo use karo, 
  // varna default mein Verification wala template rakho.
  const defaultTemplate = `
    <div style="font-family: sans-serif; padding: 30px; border: 1px solid #f0f0f0; border-radius: 20px; max-width: 500px; margin: auto;">
      <h1 style="color: #4f46e5; text-align: center;">🐾 PetVeda</h1>
      <h2 style="color: #1f2937; text-align: center;">Verification Code</h2>
      <p style="text-align: center;">Aapka code niche diya gaya hai:</p>
      <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #4f46e5; border-radius: 15px; border: 1px dashed #e5e7eb;">
        ${options.otp}
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"PetVeda Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // ✨ Yahan hum decide kar rahe hain ki kaunsa design bhejna hai
    html: options.html ? options.html : defaultTemplate, 
  };

  // 3. Email bhej do
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Error:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;