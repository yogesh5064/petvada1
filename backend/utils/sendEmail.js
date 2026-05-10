import nodemailer from 'nodemailer';

const sendEmail = async (options) => {

  try {

    // ==================================================
    // VALIDATION
    // ==================================================
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('EMAIL_USER or EMAIL_PASS missing in ENV');
    }

    // ==================================================
    // TRANSPORTER
    // ==================================================
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

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
    // SEND EMAIL
    // ==================================================
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent:', info.response);

    return info;

  } catch (error) {

    console.error('❌ EMAIL ERROR:', error);

    throw error;
  }
};

export default sendEmail;