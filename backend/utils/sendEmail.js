import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const response = await resend.emails.send({
      from: 'PetVeda <onboarding@resend.dev>',
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
    });

    console.log('EMAIL RESPONSE:', JSON.stringify(response, null, 2));

    return response;

  } catch (error) {
    console.log('❌ EMAIL ERROR');
    console.log(error);

    throw error;
  }
};

export default sendEmail;