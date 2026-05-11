import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
  try {

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      tls: {
        rejectUnauthorized: false
      },

      family: 4 // ✅ FORCE IPV4
    });

    const mailOptions = {
      from: `"PetVeda Support" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject || 'PetVeda Notification',

      html:
        options.html ||
        `
        <div style="font-family:sans-serif;padding:20px;">
          <h2>🐾 PetVeda OTP</h2>
          <h1>${options.otp}</h1>
        </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ EMAIL SENT:", info.response);

    return info;

  } catch (error) {

    console.log("❌ EMAIL ERROR:");
    console.log(error);

    throw error;
  }
};

export default sendEmail;