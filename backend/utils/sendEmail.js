import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error('Missing email parameters');
  }

  return resend.emails.send({
    from: 'PetVeda <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
};

export default sendEmail;