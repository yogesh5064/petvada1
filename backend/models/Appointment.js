import mongoose from 'mongoose';


// =======================================================
// 💊 PRESCRIPTION SUB SCHEMA
// =======================================================

const prescriptionSchema = new mongoose.Schema({

  medicine: {
    type: String,
    trim: true
  },

  instructions: {
    type: String,
    trim: true
  },

  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  addedAt: {
    type: Date,
    default: Date.now
  }

}, { _id: false });


// =======================================================
// 📍 LOCATION SUB SCHEMA
// =======================================================

const locationSchema = new mongoose.Schema({

  lat: {
    type: Number
  },

  lng: {
    type: Number
  }

}, { _id: false });


// =======================================================
// 🐾 APPOINTMENT SCHEMA
// =======================================================

const appointmentSchema = new mongoose.Schema({

  // =====================================================
  // 👤 USER INFO
  // =====================================================

  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },


  // =====================================================
  // 🐶 PET INFO
  // =====================================================

  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    index: true
  },

  petName: {
    type: String,
    required: true,
    trim: true
  },

  petType: {
    type: String,
    required: true,

    enum: [
      'Dog',
      'Cat',
      'Rabbit'
    ]
  },

  breed: {
    type: String,
    trim: true
  },


  // =====================================================
  // 🏥 APPOINTMENT CATEGORY
  // =====================================================

  category: {
    type: String,
    required: true,

    enum: [
      'Treatment',
      'Grooming',
      'Vaccination',
      'Hostel'
    ]
  },

  subCategory: [{
    type: String,
    trim: true
  }],

  vaccineType: {
    type: String,
    trim: true
  },

  reason: {
    type: String,
    default: 'General Checkup',
    trim: true
  },


  // =====================================================
  // 📅 DATE & TIME
  // =====================================================

  date: {
    type: String,
    required: true
  },

  time: {
    type: String,
    required: true
  },


  // =====================================================
  // 🚦 STATUS
  // =====================================================

  status: {
    type: String,

    default: 'Pending',

    enum: [
      'Pending',
      'Approved',
      'Checked-In',
      'In-Progress',
      'Completed',
      'Cancelled',
      'Rejected'
    ]
  },


  // =====================================================
  // 💊 PRESCRIPTION
  // =====================================================

  prescription: prescriptionSchema,


  // =====================================================
  // 🚗 VISIT TYPE
  // =====================================================

  visitType: {
    type: String,

    default: 'Walk-in',

    enum: [
      'Walk-in',
      'Home Visit'
    ]
  },


  // =====================================================
  // 🏠 ADDRESS
  // =====================================================

  address: {
    type: String,
    trim: true
  },

  location: locationSchema,


  // =====================================================
  // 🏨 HOSTEL DATA
  // =====================================================

  checkInDate: {
    type: String
  },

  checkOutDate: {
    type: String
  },

  checkInTime: {
    type: String
  },

  checkOutTime: {
    type: String
  },

  days: {
    type: Number,
    default: 1
  },


  // =====================================================
  // 💰 PAYMENT / BILLING
  // =====================================================

  consultationFee: {
    type: Number,
    default: 0
  },

  totalAmount: {
    type: Number,
    default: 0
  },

  paymentStatus: {
    type: String,

    enum: [
      'Pending',
      'Paid',
      'Partial',
      'Refunded'
    ],

    default: 'Pending'
  },


  // =====================================================
  // 📝 ADMIN NOTES
  // =====================================================

  adminNotes: {
    type: String,
    trim: true
  },


  // =====================================================
  // ⭐ FEEDBACK
  // =====================================================

  rating: {
    type: Number,
    min: 1,
    max: 5
  },

  review: {
    type: String,
    trim: true
  }

}, {
  timestamps: true
});


// =======================================================
// 🔍 DATABASE INDEXES
// =======================================================

appointmentSchema.index({
  user: 1,
  createdAt: -1
});

appointmentSchema.index({
  status: 1
});

appointmentSchema.index({
  category: 1
});

appointmentSchema.index({
  petName: 1
});


// =======================================================
// ⚡ PRE SAVE HOOK
// =======================================================

appointmentSchema.pre('save', function(next) {

  // Auto calculate hostel days
  if (
    this.category === 'Hostel' &&
    this.checkInDate &&
    this.checkOutDate
  ) {

    const inDate = new Date(this.checkInDate);
    const outDate = new Date(this.checkOutDate);

    const diff =
      Math.ceil(
        (outDate - inDate) /
        (1000 * 60 * 60 * 24)
      );

    this.days = diff > 0 ? diff : 1;
  }

  next();
});


// =======================================================
// 🚀 EXPORT MODEL
// =======================================================

const Appointment = mongoose.model(
  'Appointment',
  appointmentSchema
);

export default Appointment;