import mongoose from 'mongoose';

const petSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Ye pet kis user ka hai
  },
  name: { 
    type: String, 
    required: true 
  },
  petType: { 
    type: String, 
    required: true, 
    enum: ['Dog', 'Cat', 'Rabbit'] // ✅ Sirf yahi 3 categories allow hain
  },
  breed: { 
    type: String, 
    required: true 
  },
  dob: { 
    type: Date, 
    required: true // ✅ Age ki jagah Date of Birth save hogi
  },
  image: { 
    type: String, 
    default: "" 
  },
}, {
  timestamps: true,
});

const Pet = mongoose.model('Pet', petSchema);
export default Pet;