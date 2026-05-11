import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
  try {

    const EMAIL_USER = process.env.EMAIL_USER?.trim();
    const EMAIL_PASS = process.env.EMAIL_PASS?.trim();

    console.log("SMTP USER:", EMAIL_USER);
    console.log("SMTP PASS EXISTS:", !!EMAIL_PASS);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"PetVeda Support" <${EMAIL_USER}>`,
      to: options.email,
      subject: options.subject || 'PetVeda Notification',
      html:
        options.html ||
        `
        <h2>PetVeda OTP</h2>
        <h1>${options.otp}</h1>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ EMAIL SENT:", info.response);

    return info;

  } catch (error) {

    console.log("❌ EMAIL ERROR FULL:");
    console.log(error);

    throw error;
  }
};

export default sendEmail;