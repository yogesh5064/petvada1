import nodemailer from 'nodemailer';

// ======================================================
// CREATE TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({
  service: 'gmail',

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ======================================================
// VERIFY SMTP ON SERVER START
// ======================================================

transporter.verify((error, success) => {

  if (error) {

    console.log('❌ SMTP VERIFY ERROR');
    console.log(error);

  } else {

    console.log('✅ SMTP SERVER READY');

  }
});

// ======================================================
// SEND EMAIL FUNCTION
// ======================================================

const sendEmail = async (options) => {

  try {

    console.log('📨 Sending Email To:', options.email);

    const mailOptions = {
      from: `"PetVeda Support" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject || 'PetVeda Notification',

      html: options.html || `
        <h2>PetVeda OTP</h2>
        <h1>${options.otp}</h1>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ EMAIL SENT');
    console.log(info.response);

    return info;

  } catch (error) {

    console.log('❌ SEND MAIL ERROR');
    console.log(error);

    throw error;
  }
};

export default sendEmail;