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
    throw new Error('Missing email parameters');
  }

  const resend = getResend(); // 👈 lazy init FIX

  return await resend.emails.send({
    from: 'PetVeda <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
};

export default sendEmail;