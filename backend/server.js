import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';

import Appointment from './models/Appointment.js';
import Hostel from './models/Hostel.js';
import sendEmail from './utils/sendEmail.js';

import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import petRoutes from './routes/petRoutes.js';
import productRoutes from './routes/productRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import hostelRoutes from './routes/hostelRoutes.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET missing in .env');
  process.exit(1);
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('SMTP email env missing. EMAIL_USER and EMAIL_PASS are required for admin email sending.');
}

if (!process.env.RESEND_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
  console.warn('No email provider configured. Emails will fail.');
}

console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
console.log('SMTP READY:', !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS);
console.log('RESEND KEY LOADED:', !!process.env.RESEND_API_KEY);

connectDB();

const app = express();

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PetVeda API is live',
  });
});

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/products', productRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/hostel', hostelRoutes);

cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled email reminders...');

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toISOString().split('T')[0];

    const appointments = await Appointment.find({
      date: targetDate,
      status: 'Approved',
    }).populate('user', 'name email');

    for (const appointment of appointments) {
      if (!appointment.user?.email) continue;

      try {
        await sendEmail({
          to: appointment.user.email,
          subject: `Reminder: Appointment Tomorrow for ${appointment.petName}`,
          html: `
            <div style="font-family:sans-serif;padding:20px;border:2px solid #4f46e5;border-radius:20px;">
              <h2 style="color:#4f46e5;">See you tomorrow!</h2>
              <p>Hi <b>${appointment.user.name}</b>, your pet visit is scheduled tomorrow.</p>
              <p><b>Time:</b> ${appointment.time}</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('Appointment reminder email failed:', err.message);
      }
    }

    const upcomingCheckouts = await Hostel.find({
      checkOutDate: targetDate,
      status: 'Checked-In',
    }).populate('owner', 'name email');

    for (const stay of upcomingCheckouts) {
      if (!stay.owner?.email) continue;

      try {
        await sendEmail({
          to: stay.owner.email,
          subject: `Reminder: ${stay.petName}'s Stay Ends Tomorrow`,
          html: `
            <div style="font-family:sans-serif;padding:20px;border:2px solid #10b981;border-radius:20px;">
              <h2 style="color:#10b981;">Resort Stay Ending</h2>
              <p>Hi <b>${stay.owner.name}</b>, your pet <b>${stay.petName}</b>'s resort stay ends tomorrow.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('Hostel reminder email failed:', err.message);
      }
    }

    console.log(`Scheduled email reminders completed for ${targetDate}`);
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 4000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
