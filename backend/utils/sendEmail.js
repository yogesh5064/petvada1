import nodemailer from 'nodemailer';

// ==================================================
// TRANSPORTER (GLOBAL)
// ==================================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  try {

    // ==================================================
    // VALIDATION
    // ==================================================
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ EMAIL ENV Missing');
      return false;
    }

    // ==================================================
    // EMAIL TEMPLATE
    // ==================================================
    const htmlTemplate = options.html || `
      <div style="font-family:sans-serif;padding:20px;">
        <h2>🐾 PetVeda Verification</h2>

        <p>Your OTP Code:</p>

        <div style="
          font-size:32px;
          font-weight:bold;
          color:#4f46e5;
          padding:15px;
          border:1px dashed #ccc;
          display:inline-block;
          border-radius:10px;
        ">
          ${options.otp}
        </div>
      </div>
    `;

    // ==================================================
    // MAIL OPTIONS
    // ==================================================
    const mailOptions = {
      from: `"PetVeda Support" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject || 'PetVeda Notification',
      text: options.message || '',
      html: htmlTemplate,
    };

    // ==================================================
    // SEND EMAIL (NON-BLOCKING)
    // ==================================================
    transporter.sendMail(mailOptions)
      .then(info => {
        console.log('✅ Email sent:', info.response);
      })
      .catch(error => {
        console.error('❌ Email Error:', error.message);
      });

    // API ko turant response
    return true;

  } catch (error) {

    console.error('❌ EMAIL ERROR:', error.message);

    return false;
  }
};

export default sendEmail;