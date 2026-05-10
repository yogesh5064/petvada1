import Hostel from '../models/Hostel.js';
import Pet from '../models/Pet.js';
import sendEmail from '../utils/sendEmail.js';


// =======================================================
// 🏨 USER FUNCTIONS
// =======================================================

// ✅ Book New Hostel Stay
export const bookHostelStay = async (req, res) => {

  try {

    const {
      petId,
      petName,
      checkInDate,
      checkOutDate,
      checkInTime,
      checkOutTime,
      reason,
      packageName,
      charges
    } = req.body;


    // ===================================================
    // 🐾 VALIDATE PET
    // ===================================================

    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet nahi mila!'
      });
    }


    // ===================================================
    // 🔒 SECURITY CHECK
    // ===================================================

    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access!'
      });
    }


    // ===================================================
    // 🚫 ALREADY ACTIVE STAY CHECK
    // ===================================================

    if (pet.hostelStatus?.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Ye pet already hostel mein checked-in hai!'
      });
    }


    // ===================================================
    // 📅 DATE VALIDATION
    // ===================================================

    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);

    if (outDate <= inDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date check-in se badi honi chahiye!'
      });
    }


    // ===================================================
    // 📆 TOTAL DAYS CALCULATION
    // ===================================================

    const diffTime = Math.abs(outDate - inDate);

    const totalDays = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24)
    ) || 1;


    // ===================================================
    // 🏨 CREATE BOOKING
    // ===================================================

    const booking = new Hostel({

      pet: petId,

      owner: req.user._id,

      petName,

      checkInDate,
      checkOutDate,

      checkInTime,
      checkOutTime,

      notes: reason || '',

      packageName: packageName || 'Standard Stay',

      charges: Number(charges) || 0,

      totalDays,

      status: 'Pending'
    });


    const createdBooking = await booking.save();


    // ===================================================
    // 📧 BOOKING EMAIL
    // ===================================================

    try {

      await sendEmail({
        email: req.user.email,

        subject: '🏨 Hostel Booking Received - PetVeda',

        html: generateHostelEmail({
          type: 'Booking Received',
          name: req.user.name,
          pet: petName,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          time: checkInTime,
          status: 'PENDING',
          totalDays,
          packageName: booking.packageName,
          totalPrice: booking.totalPrice
        })
      });

    } catch (emailError) {

      console.error(
        'HOSTEL_BOOKING_EMAIL_ERROR:',
        emailError.message
      );
    }


    // ===================================================
    // ✅ RESPONSE
    // ===================================================

    res.status(201).json({
      success: true,
      message: 'Hostel booking successfully create ho gayi 🏨',
      booking: createdBooking
    });

  } catch (error) {

    console.error(
      'BOOK_HOSTEL_ERROR:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// =======================================================
// 👑 ADMIN FUNCTIONS
// =======================================================

// ✅ Get All Hostel Stays
export const getAllStays = async (req, res) => {

  try {

    const stays = await Hostel.find({})
      .populate(
        'owner',
        'name email phone mobile'
      )
      .populate(
        'pet',
        'name breed petType image'
      )
      .sort({ createdAt: -1 });


    // ===================================================
    // 📊 STATS
    // ===================================================

    const livePets = stays.filter(
      stay => stay.status === 'Checked-In'
    );

    const pendingRequests = stays.filter(
      stay => stay.status === 'Pending'
    );

    const completedStays = stays.filter(
      stay => stay.status === 'Completed'
    );


    // ===================================================
    // ✅ RESPONSE
    // ===================================================

    res.status(200).json({

      success: true,

      allStays: stays,

      livePets,

      stats: {
        totalBookings: stays.length,
        totalLivePets: livePets.length,
        totalPending: pendingRequests.length,
        totalCompleted: completedStays.length
      }
    });

  } catch (error) {

    console.error(
      'GET_ALL_STAYS_ERROR:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ✅ Update Hostel Status
export const updateHostelStatus = async (req, res) => {

  try {

    const { status } = req.body;


    // ===================================================
    // 🔍 FIND STAY
    // ===================================================

    const stay = await Hostel.findById(req.params.id)
      .populate('owner', 'name email');


    if (!stay) {
      return res.status(404).json({
        success: false,
        message: 'Booking nahi mili'
      });
    }


    // ===================================================
    // 🐾 VALID STATUS
    // ===================================================

    const allowedStatuses = [
      'Pending',
      'Approved',
      'Checked-In',
      'Checked-Out',
      'Completed',
      'Cancelled'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status!'
      });
    }


    // ===================================================
    // 🔄 UPDATE STATUS
    // ===================================================

    stay.status = status;

    const updatedStay = await stay.save();


    // ===================================================
    // 🐾 PET STATUS SYNC
    // ===================================================

    const pet = await Pet.findById(stay.pet);

    if (pet) {

      // Create object if not exists
      if (!pet.hostelStatus) {
        pet.hostelStatus = {};
      }

      if (status === 'Checked-In') {

        pet.hostelStatus.isActive = true;
        pet.hostelStatus.currentStayId = stay._id;

      } else if (
        status === 'Completed' ||
        status === 'Cancelled' ||
        status === 'Checked-Out'
      ) {

        pet.hostelStatus.isActive = false;
        pet.hostelStatus.currentStayId = null;
      }

      await pet.save();
    }


    // ===================================================
    // 📧 STATUS EMAIL
    // ===================================================

    const subjectMap = {

      Approved:
        '✅ Booking Approved - PetVeda Resort',

      'Checked-In':
        '🏨 Pet Checked-In Successfully',

      'Checked-Out':
        '🚪 Pet Checked-Out Successfully',

      Completed:
        '🐾 Stay Completed - Thank You',

      Cancelled:
        '❌ Booking Cancelled'
    };


    try {

      await sendEmail({

        email: stay.owner.email,

        subject:
          subjectMap[status] ||
          `🏨 Hostel Status Updated`,

        html: generateHostelEmail({

          type: status,

          name: stay.owner.name,

          pet: stay.petName,

          checkIn: stay.checkInDate,

          checkOut: stay.checkOutDate,

          time: stay.checkInTime,

          status,

          totalDays: stay.totalDays,

          packageName: stay.packageName,

          totalPrice: stay.totalPrice
        })
      });

    } catch (emailError) {

      console.error(
        'HOSTEL_STATUS_EMAIL_ERROR:',
        emailError.message
      );
    }


    // ===================================================
    // ✅ RESPONSE
    // ===================================================

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      stay: updatedStay
    });

  } catch (error) {

    console.error(
      'UPDATE_HOSTEL_STATUS_ERROR:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// =======================================================
// 📧 EMAIL TEMPLATE
// =======================================================

const generateHostelEmail = ({
  type,
  name,
  pet,
  checkIn,
  checkOut,
  time,
  status,
  totalDays,
  packageName,
  totalPrice
}) => `

<div style="
  font-family: Arial, sans-serif;
  max-width: 650px;
  margin: auto;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: #ffffff;
">

  <!-- HEADER -->
  <div style="
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
    padding: 25px;
    text-align: center;
  ">
    <h1 style="
      color: white;
      margin: 0;
      font-size: 32px;
    ">
      🏨 PetVeda Resort
    </h1>
  </div>


  <!-- BODY -->
  <div style="padding: 30px;">

    <h2 style="
      color: #111827;
      margin-top: 0;
      text-align: center;
    ">
      Hostel Stay Update
    </h2>

    <p style="font-size: 16px; color: #374151;">
      Hi <b>${name}</b>,
    </p>

    <p style="font-size: 15px; color: #4b5563;">
      Aapke pet hostel booking ka latest update niche diya gaya hai.
    </p>


    <!-- DETAILS -->
    <div style="
      background: #f9fafb;
      border-radius: 15px;
      padding: 20px;
      margin-top: 25px;
      border-left: 5px solid #4f46e5;
    ">

      <table style="
        width: 100%;
        border-collapse: collapse;
      ">

        <tr>
          <td style="padding: 10px 0;">
            <b>Pet Name</b>
          </td>

          <td style="
            text-align: right;
            padding: 10px 0;
          ">
            ${pet}
          </td>
        </tr>

        <tr>
          <td style="padding: 10px 0;">
            <b>Package</b>
          </td>

          <td style="
            text-align: right;
            padding: 10px 0;
          ">
            ${packageName}
          </td>
        </tr>

        <tr>
          <td style="padding: 10px 0;">
            <b>Check-In</b>
          </td>

          <td style="
            text-align: right;
            padding: 10px 0;
          ">
            ${checkIn} ${time}
          </td>
        </tr>

        <tr>
          <td style="padding: 10px 0;">
            <b>Check-Out</b>
          </td>

          <td style="
            text-align: right;
            padding: 10px 0;
          ">
            ${checkOut}
          </td>
        </tr>

        <tr>
          <td style="padding: 10px 0;">
            <b>Total Days</b>
          </td>

          <td style="
            text-align: right;
            padding: 10px 0;
          ">
            ${totalDays} Days
          </td>
        </tr>

        <tr>
          <td style="padding: 10px 0;">
            <b>Total Price</b>
          </td>

          <td style="
            text-align: right;
            padding: 10px 0;
            font-weight: bold;
            color: #059669;
          ">
            ₹${totalPrice}
          </td>
        </tr>

        <tr>
          <td style="
            padding-top: 18px;
            color: #4f46e5;
            font-weight: bold;
          ">
            STATUS
          </td>

          <td style="
            text-align: right;
            padding-top: 18px;
            color: #4f46e5;
            font-weight: bold;
            text-transform: uppercase;
          ">
            ${status}
          </td>
        </tr>

      </table>
    </div>


    <!-- FOOTER -->
    <p style="
      margin-top: 30px;
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
    ">
      © 2026 PetVeda Resort • Premium Pet Care
    </p>

  </div>

</div>
`;