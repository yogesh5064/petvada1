import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// =======================
// 🔐 ENV SAFETY CHECKS
// =======================
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET missing in .env');
  process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY missing — emails will fail');
}

console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
console.log('RESEND KEY LOADED:', !!process.env.RESEND_API_KEY);

// =======================
// IMPORTS
// =======================
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';

// Models
import Appointment from './models/Appointment.js';
import Hostel from './models/Hostel.js';

// Utils
import sendEmail from './utils/sendEmail.js';

// Routes
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import petRoutes from './routes/petRoutes.js';
import productRoutes from './routes/productRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import hostelRoutes from './routes/hostelRoutes.js';

// =======================
// DB CONNECTION
// =======================
connectDB();

// =======================
// APP INIT
// =======================
const app = express();

// =======================
// SECURITY
// =======================
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
  })
);

// =======================
// CORS
// =======================
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// =======================
// BODY PARSER
// =======================
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// =======================
// STATIC FILES
// =======================
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =======================
// ROOT
// =======================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🐾 PetVeda API Running',
  });
});

// =======================
// ROUTES
// =======================
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/products', productRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/hostel', hostelRoutes);

// =======================
// CRON JOB (EMAIL REMINDERS)
// =======================
cron.schedule('0 * * * *', async () => {
  console.log('🔔 Running reminder cron...');

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const targetDate = tomorrow.toISOString().split('T')[0];

    // ================= APPOINTMENTS =================
    const appointments = await Appointment.find({
      status: 'Approved',
    }).populate('user', 'name email');

    for (const a of appointments) {
      if (!a.user?.email) continue;

      try {
        await sendEmail({
          to: a.user.email,
          subject: `🔔 Reminder: Appointment for ${a.petName}`,
          html: `
            <div style="font-family:sans-serif">
              <h2>Appointment Reminder</h2>
              <p>Hi ${a.user.name}</p>
              <p>Your appointment for <b>${a.petName}</b> is scheduled tomorrow.</p>
              <p><b>Time:</b> ${a.time}</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('Appointment email failed:', err.message);
      }
    }

    // ================= HOSTEL =================
    const stays = await Hostel.find({
      status: 'Checked-In',
    }).populate('owner', 'name email');

    for (const s of stays) {
      if (!s.owner?.email) continue;

      try {
        await sendEmail({
          to: s.owner.email,
          subject: `🏨 Stay Ending Soon - ${s.petName}`,
          html: `
            <div style="font-family:sans-serif">
              <h2>Hostel Reminder</h2>
              <p>Hi ${s.owner.name}</p>
              <p>Your pet <b>${s.petName}</b> stay is ending soon.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('Hostel email failed:', err.message);
      }
    }

    console.log('✅ Cron completed');
  } catch (err) {
    console.error('❌ Cron error:', err);
  }
});

// =======================
// 404 HANDLER
// =======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// =======================
// ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error('🔥 ERROR:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;