import mongoose from 'mongoose';
import Pet from '../models/Pet.js';
import Appointment from '../models/Appointment.js';


// =======================================================
// ✅ ADD NEW PET
// @route POST /api/pets
// =======================================================
export const addPet = async (req, res) => {
  try {
    const {
      name,
      breed,
      dob,
      petType,
      gender,
      weight,
      medicalNotes,
      vaccinated,
      image,
      emergencyContact
    } = req.body;

    // ✅ Validation
    if (!name || !breed || !dob || !petType) {
      return res.status(400).json({
        message: 'Please fill all required pet details!'
      });
    }

    // ✅ Duplicate check (case-insensitive)
    const petExists = await Pet.findOne({
      owner: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    }).lean();

    if (petExists) {
      return res.status(400).json({
        message: 'Aapne ye pet pehle hi register kiya hua hai!'
      });
    }

    // ✅ Create Pet
    const pet = await Pet.create({
      owner: req.user._id,
      name: name.trim(),
      petType,
      breed: breed.trim(),
      dob,

      gender: gender || 'Male',
      weight: Number(weight) || 0,
      medicalNotes: medicalNotes || '',
      vaccinated: vaccinated || false,
      image: image || '',

      emergencyContact: {
        name: emergencyContact?.name || '',
        phone: emergencyContact?.phone || ''
      }
    });

    res.status(201).json({
      success: true,
      message: 'Pet added successfully 🐾',
      pet
    });

  } catch (error) {
    console.error('ADD_PET_ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =======================================================
// ✅ GET MY PETS
// @route GET /api/pets
// =======================================================
export const getMyPets = async (req, res) => {
  try {

    const pets = await Pet.find({
      owner: req.user._id
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: pets.length,
      pets
    });

  } catch (error) {
    console.error('GET_PETS_ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =======================================================
// ✅ GET SINGLE PET PROFILE + FULL HISTORY
// @route GET /api/pets/:id
// =======================================================
export const getPetProfile = async (req, res) => {
  try {

    // ✅ ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid Pet ID!'
      });
    }

    // ✅ Fetch pet
    const pet = await Pet.findById(req.params.id).lean();

    if (!pet) {
      return res.status(404).json({
        message: 'Pet nahi mila!'
      });
    }

    // ✅ Security check
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: 'Aap is pet ki details nahi dekh sakte!'
      });
    }

    // ✅ Parallel fetch for performance
    const [history, totalVisits] = await Promise.all([

      Appointment.find({
        petId: pet._id
      })
        .sort({ createdAt: -1 })
        .populate('prescription.addedBy', 'name')
        .lean(),

      Appointment.countDocuments({
        petId: pet._id
      })

    ]);

    // ✅ Response
    res.json({
      success: true,

      pet,

      stats: {
        totalVisits,
        hostelActive: pet.hostelStatus?.isActive || false
      },

      history
    });

  } catch (error) {
    console.error('PET_PROFILE_ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =======================================================
// ✅ DELETE PET
// @route DELETE /api/pets/:id
// =======================================================
export const deletePet = async (req, res) => {
  try {

    // ✅ ID Validation
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid Pet ID!'
      });
    }

    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        message: 'Pet nahi mila!'
      });
    }

    // ✅ Ownership check
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: 'Aap is pet ko delete nahi kar sakte!'
      });
    }

    // ✅ Prevent delete if active in hostel
    if (pet.hostelStatus?.isActive) {
      return res.status(400).json({
        message: 'Pet currently hostel mein active hai!'
      });
    }

    await pet.deleteOne();

    res.json({
      success: true,
      message: 'Pet successfully hata diya gaya! 🐾'
    });

  } catch (error) {
    console.error('DELETE_PET_ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};