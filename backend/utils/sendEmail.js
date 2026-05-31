import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { otpTemplate } from './emailTemplates/otpTemplate.js';

const getResend = () => {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    throw new Error('RESEND_API_KEY is missing in environment variables');
  }

  return new Resend(key);
};

const getSmtpTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

const withTimeout = (promise, ms = 12000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email service timed out')), ms)
    ),
  ]);
};

const sendEmail = async ({ to, email, subject, html, otp, message }) => {
  const recipient = to || email;
  const body = html || (otp ? otpTemplate(otp) : message);
  const from =
    process.env.EMAIL_FROM ||
    (process.env.EMAIL_USER ? `PetVeda <${process.env.EMAIL_USER}>` : 'PetVeda <onboarding@resend.dev>');

  if (!recipient || !subject || !body) {
    throw new Error('Missing email parameters (to/email, subject, html/otp/message required)');
  }

  try {
    const smtpTransporter = getSmtpTransporter();

    if (smtpTransporter) {
      const response = await withTimeout(
        smtpTransporter.sendMail({
          from,
          to: recipient,
          subject,
          html: body,
        })
      );

      console.log('Email sent via SMTP:', response?.messageId || recipient);
      return response;
    }

    const resend = getResend();

    const response = await withTimeout(
      resend.emails.send({
        from,
        to: recipient,
        subject,
        html: body,
      })
    );

    if (response?.error) {
      throw new Error(response.error.message || JSON.stringify(response.error));
    }

    console.log('Email sent:', response?.data?.id || response?.id || recipient);
    return response;
  } catch (error) {
    console.error('Email send failed:', error);
    throw new Error(error?.message || 'Failed to send email via Resend');
  }
};

export default sendEmail;
