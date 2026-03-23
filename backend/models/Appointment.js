import mongoose from 'mongoose';

const appointmentSchema = mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  petId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pet' 
  },
  petName: { type: String, required: true },
  petType: { 
    type: String, 
    required: true, 
    // ✅ FIXED: Case-sensitivity issues handle karne ke liye lowercase rakha hai
    enum: ['Dog', 'Cat', 'Rabbit', 'dog', 'cat', 'rabbit'] 
  },
  breed: { type: String }, 
  category: { 
    type: String, 
    required: true,
    // ✅ FIXED: 'HOSTEL' aur 'Hostel' dono allow kiye hain taaki 400 error na aaye
    enum: ["Treatment", "Grooming", "Vaccination", "Hostel", "HOSTEL", "TREATMENT", "GROOMING"]
  },
  subCategory: { type: [String] },
  days: { type: Number },
  vaccineType: { type: String },
  
  // ✅ TIP: Date ko String rakhna asan hota hai agar aap sirf formatting display kar rahe ho
  date: { type: String, required: true }, 
  time: { type: String, required: true },

  status: { 
    type: String, 
    default: 'Pending',
    // ✅ FIXED: 'Checked-In' add kiya hai taaki Resort Desk par pet dikhe
    enum: ['Pending', 'Approved', 'Checked-In', 'Completed', 'Cancelled']
  },

  reason: { 
    type: String, 
    default: "General Checkup" 
  },

  prescription: {
    medicine: { type: String },
    instructions: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  visitType: { 
    type: String, 
    default: 'Walk-in',
    enum: ['Walk-in', 'Home Visit'] 
  },

  address: { 
    type: String 
  },

  location: {
    lat: { type: Number },
    lng: { type: Number }
  },

  // ✨ --- 🏨 HOSTEL SPECIFIC STUFF --- ✨
  checkInDate: { type: String }, // Date object ki jagah String use karein frontend sync ke liye
  checkOutDate: { type: String },
  checkInTime: { type: String },
  checkOutTime: { type: String }

}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;