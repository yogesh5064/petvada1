import Appointment from '../models/Appointment.js';
import sendEmail from '../utils/sendEmail.js';

// --- USER FUNCTIONS ---

// @desc    Book naya appointment ya Hostel Stay
export const bookAppointment = async (req, res) => {
  const { 
    petName, petType, breed, category, 
    subCategory, days, vaccineType, date, time, reason,
    visitType, houseFlat, landmark, detectedAddress, location,
    checkInDate, checkInTime, checkOutDate, checkOutTime 
  } = req.body;

  try {
    const slotBusy = await Appointment.findOne({ 
      date: date || checkInDate, 
      time: time || checkInTime, 
      status: 'Approved' 
    });

    const fullAddress = visitType === 'Home Visit' 
      ? `${houseFlat || ''}, ${landmark || ''}, ${detectedAddress || ''}`
      : 'Clinic Visit';

    const appointment = new Appointment({
      user: req.user._id, 
      petName, petType, breed,
      category: category || 'General',
      subCategory, days, vaccineType,
      date: date || checkInDate,
      time: time || checkInTime,
      checkInDate, checkInTime,
      checkOutDate, checkOutTime,
      reason: reason || category || "General Visit",
      visitType: visitType || 'Walk-in',
      address: fullAddress,
      location: location,
      status: category === 'HOSTEL' ? 'Pending' : (slotBusy ? 'Pending' : 'Approved')
    });

    const createdAppointment = await appointment.save();

    const statusMsg = appointment.status === 'Pending' 
      ? "Aapka booking request receive ho gaya hai, manual approval ka wait karein." 
      : "Aapka appointment confirm ho gaya hai! ✅";

    try {
      await sendEmail({
        email: req.user.email,
        subject: `🏥 PetVeda: ${category} Booking ${appointment.status}`,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 20px; padding: 25px;">
            <div style="text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 15px;">
              <h1 style="color: #4f46e5; margin: 0; font-style: italic;">🐾 PetVeda</h1>
            </div>
            <h2 style="text-align: center;">Booking Received!</h2>
            <p>Hi <b>${req.user.name}</b>, aapke pet <b>${petName}</b> ka <b>${category}</b> set ho gaya hai.</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 15px; border: 1px solid #f0f0f0;">
              <p><b>Service:</b> ${category}</p>
              <p><b>Date:</b> ${appointment.date}</p>
              <p><b>Time:</b> ${appointment.time}</p>
              ${checkOutDate ? `<p><b>Check-Out:</b> ${checkOutDate}</p>` : ''}
              <p style="color: #4f46e5; font-weight: bold;">Status: ${appointment.status}</p>
            </div>
          </div>
        `
      });
    } catch (e) { console.log("Email Error ignored"); }

    res.status(201).json({ message: statusMsg, appointment: createdAppointment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- ADMIN FUNCTIONS ---

// @desc    Update Status + Dynamic Billing Calculation for Resort
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, prescription, checkOutDate } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('user', 'name email phone mobile');

    if (appointment) {
      appointment.status = status || appointment.status;
      if (checkOutDate) appointment.checkOutDate = checkOutDate;
      
      if (prescription) {
        appointment.prescription = { 
          medicine: prescription.medicine, 
          instructions: prescription.instructions, 
          addedBy: req.user._id 
        };
        appointment.status = 'Completed';
      }

      const updatedAppointment = await appointment.save();

      let subject = `📢 PetVeda Update: ${updatedAppointment.status}`;
      let accentColor = '#4f46e5'; 
      let statusMessage = `Aapke pet **${appointment.petName}** ka status ab **${updatedAppointment.status}** hai.`;

      if (status === 'Approved') {
        subject = `✅ Booking Confirmed - PetVeda`;
        accentColor = '#22c55e';
        statusMessage = `Aapka booking request **Approve** ho gaya hai. Hum aapka intezar kar rahe hain.`;
      } else if (status === 'Checked-In') {
        subject = `🏠 Welcome to PetVeda Resort!`;
        accentColor = '#8b5cf6';
        statusMessage = `Aapka pet successfully **Check-In** ho gaya hai. Hum unka poora khayal rakhenge!`;
      }

      await sendEmail({
        email: appointment.user.email,
        subject: subject,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 20px; padding: 25px;">
            <div style="text-align: center; border-bottom: 2px solid ${accentColor}; padding-bottom: 15px; margin-bottom: 20px;">
              <h1 style="color: ${accentColor}; margin: 0; font-style: italic;">🐾 PetVeda</h1>
            </div>
            <h2 style="color: #111827; text-align: center;">Status: ${updatedAppointment.status}</h2>
            <p>Hi <b>${appointment.user.name}</b>,</p>
            <p>${statusMessage}</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 15px; border: 1px solid #f0f0f0; margin: 20px 0;">
              <p><b>Pet:</b> ${appointment.petName}</p>
              <p><b>Service:</b> ${appointment.category}</p>
              <p><b>Booking ID:</b> #${updatedAppointment._id.toString().slice(-6).toUpperCase()}</p>
            </div>
          </div>
        `
      });

      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment nahi mila' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ NEW: Resort Billing Generator Logic (Time-Based)
export const generateResortBill = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('user');
    
    if (!appointment || appointment.category !== 'HOSTEL') {
      return res.status(404).json({ message: "Hostel booking nahi mili!" });
    }

    // 🕒 Duration Calculation (Check-in se Check-out tak)
    const start = new Date(`${appointment.checkInDate} ${appointment.checkInTime}`);
    const end = new Date(`${appointment.checkOutDate} ${appointment.checkOutTime}`);
    
    const diffInMs = end - start;
    const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));
    const totalDays = Math.ceil(diffInHours / 24) || 1; 

    const perDayRate = 899; 
    const subTotal = totalDays * perDayRate;
    const tax = subTotal * 0.18; 

    const invoice = {
      clinic: {
        name: "PetVeda Premium Care",
        address: "Phase 1, Cyber City, Gurgaon, HR",
        contact: "+91 99999-88888",
        gstin: "06ABCDE1234F1Z5"
      },
      customer: {
        name: appointment.user.name,
        phone: appointment.user.phone || appointment.user.mobile,
        pet: appointment.petName,
        breed: appointment.breed || "N/A"
      },
      stay: {
        checkIn: `${appointment.checkInDate} | ${appointment.checkInTime}`,
        checkOut: `${appointment.checkOutDate} | ${appointment.checkOutTime}`,
        duration: `${totalDays} Day(s)`,
        rate: perDayRate
      },
      billing: {
        invoiceNo: `RES-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString(),
        subTotal,
        tax,
        grandTotal: subTotal + tax
      }
    };

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reschedule Logic
export const rescheduleAppointment = async (req, res) => {
  try {
    const { newDate, newTime } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('user', 'name email');

    if (appointment) {
      const slotBusy = await Appointment.findOne({ date: newDate, time: newTime, status: 'Approved' });
      if (slotBusy) return res.status(400).json({ message: 'Ye naya slot pehle se busy hai!' });

      const oldDate = appointment.date;
      appointment.date = newDate || appointment.date;
      appointment.time = newTime || appointment.time;
      appointment.status = 'Approved'; 
      const updatedApp = await appointment.save();

      await sendEmail({
        email: appointment.user.email,
        subject: '📅 Schedule Updated - PetVeda',
        html: `<div style="padding: 20px; border: 1px solid #f59e0b; border-radius: 20px;"><h2>Rescheduled!</h2><p>Nayi Date: ${updatedApp.date} at ${updatedApp.time}</p></div>`
      });

      res.json(updatedApp);
    } else { res.status(404).json({ message: 'Nahi mila' }); }
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// --- GETTERS & DELETE ---

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id }).sort({ date: -1 });
    res.json(appointments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id); 
    if (!appointment) return res.status(404).json({ message: 'Not found' });
    if (appointment.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });
    await appointment.deleteOne(); 
    res.json({ message: 'Cancelled successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({}).populate('user', 'name email').sort({ date: -1 });
    res.json(appointments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};