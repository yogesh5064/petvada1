import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

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

// ======================================================
// DATABASE CONNECTION
// ======================================================
connectDB();

// ======================================================
// EXPRESS APP
// ======================================================
const app = express();

// ======================================================
// SECURITY MIDDLEWARE
// ======================================================
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// ======================================================
// CORS
// ======================================================
app.use(cors({
  origin: '*',
  credentials: true
}));

// ======================================================
// BODY PARSER
// ======================================================
app.use(express.json({ limit: '20mb' }));

app.use(express.urlencoded({
  extended: true,
  limit: '20mb'
}));

// ======================================================
// STATIC UPLOADS FOLDER
// ======================================================
const __dirname = path.resolve();

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// ======================================================
// ROOT ROUTE
// ======================================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🐾 PetVeda API is running'
  });
});

// ======================================================
// API ROUTES
// ======================================================
app.use('/api/users', userRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/pets', petRoutes);

app.use('/api/products', productRoutes);

app.use('/api/appointments', appointmentRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/hostel', hostelRoutes);

// ======================================================
// CRON JOB
// ======================================================
cron.schedule('0 * * * *', async () => {

  console.log('🔍 Running Scheduled Reminders...');

  try {

    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    const targetDateStr = tomorrow.toISOString().split('T')[0];

    // ==================================================
    // APPOINTMENT REMINDERS
    // ==================================================
    const appointments = await Appointment.find({
      date: targetDateStr,
      status: 'Approved'
    }).populate('user', 'name email');

    for (const appItem of appointments) {

      try {

        await sendEmail({
          email: appItem.user.email,
          subject: `🔔 Reminder: Appointment Tomorrow for ${appItem.petName}`,
          html: `
            <div style="font-family:sans-serif;padding:20px;border-radius:20px;border:1px solid #ddd;">
              <h2 style="color:#4f46e5;">
                🐾 Appointment Reminder
              </h2>

              <p>
                Hi <b>${appItem.user.name}</b>,
              </p>

              <p>
                Aapke pet ka appointment kal scheduled hai.
              </p>

              <p>
                <b>Pet:</b> ${appItem.petName}
              </p>

              <p>
                <b>Time:</b> ${appItem.time}
              </p>
            </div>
          `
        });

      } catch (emailError) {

        console.log('Appointment Email Error:', emailError.message);
      }
    }

    // ==================================================
    // HOSTEL CHECKOUT REMINDERS
    // ==================================================
    const upcomingCheckouts = await Hostel.find({
      checkOutDate: targetDateStr,
      status: 'Checked-In'
    }).populate('owner', 'name email');

    for (const stay of upcomingCheckouts) {

      try {

        await sendEmail({
          email: stay.owner.email,
          subject: `🏨 ${stay.petName}'s Stay Ends Tomorrow`,
          html: `
            <div style="font-family:sans-serif;padding:20px;border-radius:20px;border:1px solid #ddd;">
              <h2 style="color:#10b981;">
                🏨 Resort Reminder
              </h2>

              <p>
                Hi <b>${stay.owner.name}</b>,
              </p>

              <p>
                Aapke pet <b>${stay.petName}</b> ka stay kal complete ho raha hai.
              </p>
            </div>
          `
        });

      } catch (emailError) {

        console.log('Hostel Email Error:', emailError.message);
      }
    }

    console.log('✅ Reminder Cron Completed');

  } catch (error) {

    console.error('❌ CRON ERROR:', error);
  }
});

// ======================================================
// 404 HANDLER
// ======================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================
app.use((err, req, res, next) => {

  console.error('GLOBAL ERROR:', err);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ======================================================
// SERVER LISTENER
// ======================================================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// ======================================================
// EXPORT APP
// ======================================================
export default app;