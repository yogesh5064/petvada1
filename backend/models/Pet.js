import mongoose from 'mongoose';

const petSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },

  name: { 
    type: String, 
    required: true,
    trim: true
  },

  petType: { 
    type: String, 
    required: true, 
    enum: ['Dog', 'Cat', 'Rabbit']
  },

  breed: { 
    type: String, 
    required: true,
    trim: true
  },

  dob: { 
    type: Date, 
    required: true
  },

  image: { 
    type: String,
    default: ""
  },

  // ✅ NEW: Gender Support
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    default: 'Male'
  },

  // ✅ NEW: Weight Support
  weight: {
    type: Number,
    default: 0
  },

  // ✅ NEW: Medical Notes
  medicalNotes: {
    type: String,
    default: ''
  },

  // ✅ NEW: Vaccination Status
  vaccinated: {
    type: Boolean,
    default: false
  },

  // ✅ NEW: Hostel Live Status Tracking
  hostelStatus: {
    isActive: {
      type: Boolean,
      default: false
    },

    currentStayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      default: null
    }
  },

  // ✅ NEW: Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      default: ''
    },

    phone: {
      type: String,
      default: ''
    }
  }

}, {
  timestamps: true
});


// ✅ INDEXES FOR FAST SEARCH
petSchema.index({ owner: 1 });
petSchema.index({ name: 1 });
petSchema.index({ petType: 1 });


// ✅ Virtual Age Field
petSchema.virtual('age').get(function () {
  if (!this.dob) return null;

  const diff = Date.now() - this.dob.getTime();
  const ageDate = new Date(diff);

  return Math.abs(ageDate.getUTCFullYear() - 1970);
});


// ✅ JSON SETTINGS
petSchema.set('toJSON', { virtuals: true });
petSchema.set('toObject', { virtuals: true });

const Pet = mongoose.model('Pet', petSchema);

export default Pet;