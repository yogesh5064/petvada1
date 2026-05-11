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
      service: 'gmail',

      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.verify();

    console.log("✅ SMTP VERIFIED");

    const mailOptions = {
      from: `"PetVeda Support" <${EMAIL_USER}>`,
      to: options.email,
      subject: options.subject || 'PetVeda Notification',

      html:
        options.html ||
        `
        <div style="font-family:sans-serif;padding:20px;">
          <h2>🐾 PetVeda OTP</h2>

          <h1 style="color:#4f46e5;">
            ${options.otp}
          </h1>
        </div>
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