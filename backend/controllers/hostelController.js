import Hostel from '../models/Hostel.js'; 
import Pet from '../models/Pet.js'; 
import sendEmail from '../utils/sendEmail.js';

// --- USER FUNCTIONS ---

export const bookHostelStay = async (req, res) => {
  const { 
    petId, petName, checkInDate, checkOutDate, 
    checkInTime, checkOutTime, reason 
  } = req.body;

  try {
    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ message: "Pet nahi mila!" });
    
    // Check if pet is already in resort
    if (pet.hostelStatus?.isActive) {
      return res.status(400).json({ message: "Bhai, ye pet pehle se hi resort mein hai!" });
    }

    const booking = new Hostel({
      pet: petId,
      owner: req.user._id,
      petName,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      notes: reason, 
      status: 'Pending'
    });

    const createdBooking = await booking.save();

    // 📧 Notification Email
    try {
      await sendEmail({
        email: req.user.email,
        subject: '🏨 Hostel Booking Received - PetVeda',
        html: generateHostelEmail('Received', req.user.name, petName, checkInDate, checkOutDate, checkInTime, 'PENDING')
      });
    } catch (err) { console.error("Email Error:", err); }

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ADMIN FUNCTIONS ---

export const getAllStays = async (req, res) => {
  try {
    // ✅ Added phone/mobile and pet image to populate for better UI
    const stays = await Hostel.find({})
      .populate('owner', 'name email phone mobile')
      .populate('pet', 'breed type gender image') 
      .sort({ createdAt: -1 });
    
    // Logic for Resort Desk sections
    const livePets = stays.filter(stay => stay.status === 'Checked-In');
    const pendingRequests = stays.filter(s => s.status === 'Pending');

    res.json({ 
      allStays: stays, 
      livePets,
      stats: {
        totalLive: livePets.length,
        pendingRequests: pendingRequests.length,
        totalHistory: stays.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHostelStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const stay = await Hostel.findById(req.params.id).populate('owner', 'name email');

    if (!stay) return res.status(404).json({ message: "Booking nahi mili" });

    stay.status = status;
    const updatedStay = await stay.save();

    // ✅ Pet's Active Status Sync logic
    const pet = await Pet.findById(stay.pet);
    if (pet) {
      if (status === 'Checked-In') {
        pet.hostelStatus = { isActive: true, currentStayId: stay._id };
      } else if (status === 'Completed' || status === 'Cancelled') {
        pet.hostelStatus = { isActive: false, currentStayId: null };
      }
      await pet.save();
    }

    const subjectMap = {
      'Approved': '✅ Booking Confirmed - PetVeda Resort',
      'Checked-In': '🏠 Pet Checked-In - Welcome to PetVeda!',
      'Completed': '🐾 Stay Completed - Hope to see you again!',
      'Cancelled': '❌ Booking Cancelled'
    };

    // 📧 Status Update Email
    try {
      await sendEmail({
        email: stay.owner.email,
        subject: subjectMap[status] || `🏨 Hostel Update: ${status}`,
        html: generateHostelEmail(status, stay.owner.name, stay.petName, stay.checkInDate, stay.checkOutDate, stay.checkInTime, status)
      });
    } catch (err) { console.error("Email Error:", err); }

    res.json(updatedStay);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- HELPER TEMPLATE ---
const generateHostelEmail = (type, name, pet, checkIn, checkOut, time, status) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 20px; padding: 0; overflow: hidden; background-color: #f9fafb;">
    <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-style: italic;">🐾 PetVeda Resort</h1>
    </div>
    <div style="padding: 30px; background-color: white;">
      <h2 style="color: #111827; text-align: center; margin-top: 0;">Stay Update: ${type} 🏨</h2>
      <p style="color: #4b5563;">Hi <b>${name}</b>,</p>
      <p style="color: #4b5563;">Aapke pet <b>${pet}</b> ka status update hua hai.</p>
      
      <div style="background-color: #f5f3ff; padding: 20px; border-radius: 15px; margin: 25px 0; border: 1px solid #ddd6fe;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><b>Pet Name:</b></td>
            <td style="padding: 8px 0; text-align: right; color: #111827;">${pet}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><b>Check-In:</b></td>
            <td style="padding: 8px 0; text-align: right; color: #111827;">${checkIn} at ${time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><b>Check-Out:</b></td>
            <td style="padding: 8px 0; text-align: right; color: #111827;">${checkOut}</td>
          </tr>
          <tr>
            <td style="padding: 15px 0 0; color: #4f46e5; font-weight: bold;">Current Status:</td>
            <td style="padding: 15px 0 0; text-align: right; color: #4f46e5; font-weight: bold; text-transform: uppercase;">${status}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 11px; color: #9ca3af; text-align: center;">© 2026 PetVeda Systems • Premium Pet Care Desk</p>
    </div>
  </div>
`;