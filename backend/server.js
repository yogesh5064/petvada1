import path from 'path';
import dotenv from 'dotenv'; 
dotenv.config();           

import express from 'express';
import cors from 'cors';
import cron from 'node-cron'; 
import connectDB from './config/db.js';

// Models
import Appointment from './models/Appointment.js';
import Hostel from './models/Hostel.js'; 
import sendEmail from './utils/sendEmail.js';

// Route Imports
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import petRoutes from './routes/petRoutes.js';
import productRoutes from './routes/productRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import orderRoutes from './routes/orderRoutes.js'; 
import hostelRoutes from './routes/hostelRoutes.js';

// Database connection
connectDB();

const app = express();

// ✅ CORS: Sabhi origins allow hain (Frontend ke liye zaroori)
app.use(cors({
  origin: '*', 
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// ✅ STATIC FOLDER SETUP
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// ---------------------------------------------------------
// ⏰ AUTOMATED EMAIL CRON JOB
// ---------------------------------------------------------
cron.schedule('0 * * * *', async () => {
  console.log('🔍 Running Scheduled Reminders...');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDateStr = tomorrow.toISOString().split('T')[0];
    
    const appointments = await Appointment.find({ 
      date: targetDateStr, 
      status: 'Approved' 
    }).populate('user', 'name email');

    for (const appItem of appointments) {
       await sendEmail({
          email: appItem.user.email,
          subject: `🔔 Reminder: Appointment Tomorrow for ${appItem.petName}`,
          html: `<div style="font-family: sans-serif; padding: 20px; border: 2px solid #4f46e5; border-radius: 20px;">
                  <h2 style="color: #4f46e5;">See you tomorrow! 🐾</h2>
                  <p>Hi <b>${appItem.user.name}</b>, aaj se 24 ghante baad aapke pet ka visit scheduled hai.</p>
                  <p><b>Time:</b> ${appItem.time}</p>
                </div>`
        });
    }

    const upcomingCheckouts = await Hostel.find({
      checkOutDate: targetDateStr,
      status: 'Checked-In'
    }).populate('owner', 'name email');

    for (const stay of upcomingCheckouts) {
      await sendEmail({
        email: stay.owner.email,
        subject: `🏨 Reminder: ${stay.petName}'s Stay Ends Tomorrow`,
        html: `<div style="font-family: sans-serif; padding: 20px; border: 2px solid #10b981; border-radius: 20px;">
                <h2 style="color: #10b981;">Resort Stay Ending 🏨</h2>
                <p>Hi <b>${stay.owner.name}</b>, aapke pet <b>${stay.petName}</b> ka resort stay kal khatam ho raha hai.</p>
              </div>`
      });
    }
    console.log(`✅ Automated tasks completed`);
  } catch (error) {
    console.error('❌ Cron Job Error:', error);
  }
});

// 🚀 API Routes
app.use('/api/users', userRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/pets', petRoutes);
app.use('/api/products', productRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/hostel', hostelRoutes); 

app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'PetVeda API is live 🐾' });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
});

// Server listener setup
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
    });
}

// ✅ VERCEL EXPORT
export default app;