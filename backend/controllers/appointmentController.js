import mongoose from 'mongoose';

import Appointment from '../models/Appointment.js';
import Pet from '../models/Pet.js';

import sendEmail from '../utils/sendEmail.js';


// =======================================================
// ✅ BOOK APPOINTMENT / HOSTEL
// =======================================================
export const bookAppointment = async (req, res) => {
  try {

    const {
      petId,
      petName,
      petType,
      breed,
      category,
      subCategory,
      days,
      vaccineType,
      date,
      time,
      reason,
      visitType,
      houseFlat,
      landmark,
      detectedAddress,
      location,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime
    } = req.body;

    // ✅ Validation
    if (!petName || !petType || !category) {
      return res.status(400).json({
        message: 'Required fields missing!'
      });
    }

    // ✅ Pet Validation
    let pet = null;

    if (petId) {

      if (!mongoose.Types.ObjectId.isValid(petId)) {
        return res.status(400).json({
          message: 'Invalid Pet ID'
        });
      }

      pet = await Pet.findById(petId);

      if (!pet) {
        return res.status(404).json({
          message: 'Pet nahi mila!'
        });
      }
    }

    // ✅ Normalize category
    const normalizedCategory =
      category.toUpperCase() === 'HOSTEL'
        ? 'HOSTEL'
        : category;

    // ✅ Slot validation
    const bookingDate = date || checkInDate;
    const bookingTime = time || checkInTime;

    const slotBusy = await Appointment.findOne({
      date: bookingDate,
      time: bookingTime,
      status: {
        $in: ['Approved', 'Checked-In']
      }
    }).lean();

    // ✅ Full Address
    const fullAddress =
      visitType === 'Home Visit'
        ? `${houseFlat || ''}, ${landmark || ''}, ${detectedAddress || ''}`
        : 'Clinic Visit';

    // ✅ Auto Status Logic
    let appointmentStatus = 'Approved';

    if (slotBusy || normalizedCategory === 'HOSTEL') {
      appointmentStatus = 'Pending';
    }

    // ✅ Create Appointment
    const appointment = await Appointment.create({
      user: req.user._id,

      petId: petId || null,

      petName,
      petType,
      breed,

      category: normalizedCategory,

      subCategory: subCategory || [],
      days,
      vaccineType,

      date: bookingDate,
      time: bookingTime,

      reason: reason || normalizedCategory,

      visitType: visitType || 'Walk-in',

      address: fullAddress,

      location: {
        lat: location?.lat || null,
        lng: location?.lng || null
      },

      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,

      status: appointmentStatus
    });

    // ✅ Email
    try {

      await sendEmail({
        email: req.user.email,

        subject: `🐾 PetVeda Booking ${appointment.status}`,

        html: generateAppointmentTemplate({
          name: req.user.name,
          petName,
          category: normalizedCategory,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status
        })
      });

    } catch (err) {
      console.error('BOOKING_EMAIL_ERROR:', err.message);
    }

    res.status(201).json({
      success: true,

      message:
        appointment.status === 'Pending'
          ? 'Booking request submitted for approval 🕒'
          : 'Appointment booked successfully ✅',

      appointment
    });

  } catch (error) {

    console.error('BOOK_APPOINTMENT_ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =======================================================
// ✅ UPDATE APPOINTMENT STATUS
// =======================================================
export const updateAppointmentStatus = async (req, res) => {
  try {

    const {
      status,
      prescription,
      checkOutDate,
      checkOutTime
    } = req.body;

    const allowedStatuses = [
      'Pending',
      'Approved',
      'Checked-In',
      'Completed',
      'Cancelled'
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status!'
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment nahi mila'
      });
    }

    // ✅ Update fields
    appointment.status = status || appointment.status;

    if (checkOutDate) {
      appointment.checkOutDate = checkOutDate;
    }

    if (checkOutTime) {
      appointment.checkOutTime = checkOutTime;
    }

    // ✅ Prescription
    if (prescription) {

      appointment.prescription = {
        medicine: prescription.medicine || '',
        instructions: prescription.instructions || '',
        addedBy: req.user._id
      };

      appointment.status = 'Completed';
    }

    const updatedAppointment = await appointment.save();

    // ✅ Hostel sync with pet
    if (appointment.petId) {

      const pet = await Pet.findById(appointment.petId);

      if (pet) {

        if (appointment.status === 'Checked-In') {

          pet.hostelStatus = {
            isActive: true,
            currentStayId: appointment._id
          };

        } else if (
          appointment.status === 'Completed' ||
          appointment.status === 'Cancelled'
        ) {

          pet.hostelStatus = {
            isActive: false,
            currentStayId: null
          };
        }

        await pet.save();
      }
    }

    // ✅ Email
    try {

      await sendEmail({
        email: appointment.user.email,

        subject: `📢 PetVeda Status Update: ${updatedAppointment.status}`,

        html: generateStatusTemplate({
          name: appointment.user.name,
          petName: appointment.petName,
          category: appointment.category,
          status: updatedAppointment.status,
          bookingId: updatedAppointment._id
        })
      });

    } catch (err) {
      console.error('STATUS_EMAIL_ERROR:', err.message);
    }

    res.json({
      success: true,
      appointment: updatedAppointment
    });

  } catch (error) {

    console.error('UPDATE_STATUS_ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =======================================================
// ✅ GENERATE RESORT BILL
// =======================================================
export const generateResortBill = async (req, res) => {
  try {

    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name phone email');

    if (!appointment) {
      return res.status(404).json({
        message: 'Booking nahi mili!'
      });
    }

    if (appointment.category !== 'HOSTEL') {
      return res.status(400).json({
        message: 'Ye hostel booking nahi hai!'
      });
    }

    // ✅ Time Calculation
    const start = new Date(
      `${appointment.checkInDate} ${appointment.checkInTime}`
    );

    const end = new Date(
      `${appointment.checkOutDate} ${appointment.checkOutTime}`
    );

    const diffMs = end - start;

    const diffHours = Math.ceil(
      diffMs / (1000 * 60 * 60)
    );

    const totalDays =
      Math.max(1, Math.ceil(diffHours / 24));

    // ✅ Pricing
    const perDayRate = 899;

    const subTotal = totalDays * perDayRate;

    const tax = Number((subTotal * 0.18).toFixed(2));

    const grandTotal = subTotal + tax;

    res.json({
      success: true,

      invoice: {
        invoiceNo: `RES-${Date.now().toString().slice(-6)}`,

        customer: {
          name: appointment.user.name,
          phone: appointment.user.phone,
          pet: appointment.petName
        },

        stay: {
          checkIn:
            `${appointment.checkInDate} ${appointment.checkInTime}`,

          checkOut:
            `${appointment.checkOutDate} ${appointment.checkOutTime}`,

          totalDays,
          perDayRate
        },

        billing: {
          subTotal,
          tax,
          grandTotal
        }
      }
    });

  } catch (error) {

    console.error('BILL_ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =======================================================
// ✅ RESCHEDULE APPOINTMENT
// =======================================================
export const rescheduleAppointment = async (req, res) => {
  try {

    const { newDate, newTime } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name email');

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment nahi mila!'
      });
    }

    // ✅ Ownership check
    if (
      appointment.user._id.toString() !==
      req.user._id.toString()
    ) {
      return res.status(401).json({
        message: 'Not authorized!'
      });
    }

    // ✅ Conflict check
    const slotBusy = await Appointment.findOne({
      _id: { $ne: appointment._id },

      date: newDate,
      time: newTime,

      status: {
        $in: ['Approved', 'Checked-In']
      }
    }).lean();

    if (slotBusy) {
      return res.status(400).json({
        message: 'Ye slot already booked hai!'
      });
    }

    appointment.date = newDate || appointment.date;
    appointment.time = newTime || appointment.time;

    appointment.status = 'Approved';

    const updatedAppointment = await appointment.save();

    // ✅ Email
    try {

      await sendEmail({
        email: appointment.user.email,

        subject: '📅 Appointment Rescheduled',

        html: `
          <div style="font-family:sans-serif;padding:20px;">
            <h2>Appointment Updated ✅</h2>
            <p>New Date: ${updatedAppointment.date}</p>
            <p>New Time: ${updatedAppointment.time}</p>
          </div>
        `
      });

    } catch (err) {
      console.error(err.message);
    }

    res.json({
      success: true,
      appointment: updatedAppointment
    });

  } catch (error) {

    console.error('RESCHEDULE_ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =======================================================
// ✅ GET MY APPOINTMENTS
// =======================================================
export const getMyAppointments = async (req, res) => {
  try {

    const appointments = await Appointment.find({
      user: req.user._id
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =======================================================
// ✅ DELETE APPOINTMENT
// =======================================================
export const deleteAppointment = async (req, res) => {
  try {

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment nahi mila!'
      });
    }

    // ✅ Ownership check
    if (
      appointment.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(401).json({
        message: 'Not authorized!'
      });
    }

    await appointment.deleteOne();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =======================================================
// ✅ ADMIN GET ALL APPOINTMENTS
// =======================================================
export const getAllAppointments = async (req, res) => {
  try {

    const appointments = await Appointment.find({})
      .populate('user', 'name email phone')
      .populate('petId', 'name breed image')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =======================================================
// ✅ EMAIL TEMPLATE HELPERS
// =======================================================

const generateAppointmentTemplate = ({
  name,
  petName,
  category,
  date,
  time,
  status
}) => {

  return `
    <div style="font-family:sans-serif;padding:20px;">
      <h1>🐾 PetVeda</h1>

      <h2>Booking ${status}</h2>

      <p>Hi ${name},</p>

      <p>
        ${petName} ka ${category} booking receive ho gaya hai.
      </p>

      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${time}</p>

      <p><b>Status:</b> ${status}</p>
    </div>
  `;
};


const generateStatusTemplate = ({
  name,
  petName,
  category,
  status,
  bookingId
}) => {

  return `
    <div style="font-family:sans-serif;padding:20px;">
      <h1>🐾 PetVeda</h1>

      <h2>Status Updated</h2>

      <p>Hi ${name},</p>

      <p>
        ${petName} ka ${category} status ab
        <b>${status}</b> hai.
      </p>

      <p>
        Booking ID:
        #${bookingId.toString().slice(-6).toUpperCase()}
      </p>
    </div>
  `;
};