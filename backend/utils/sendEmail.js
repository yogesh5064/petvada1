import { Resend } from 'resend';

const getResend = () => {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    throw new Error('RESEND_API_KEY is missing in environment variables');
  }

  return new Resend(key);
};

const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error('Missing email parameters (to, subject, html required)');
  }

  try {
    const resend = getResend();

    const response = await resend.emails.send({
      from: 'PetVeda <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    // 🔥 DEBUG LOG (IMPORTANT for OTP issue)
    console.log('📧 Email sent response:', response);

    return response;

  } catch (error) {
    console.error('❌ Email send failed:', error);

    throw new Error(
      error?.message || 'Failed to send email via Resend'
    );
  }
};

export default sendEmail;