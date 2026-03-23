import Pet from '../models/Pet.js';
import Appointment from '../models/Appointment.js'; // 👈 History fetch karne ke liye

// @desc    Add a new pet
export const addPet = async (req, res) => {
  try {
    const { name, breed, dob, petType } = req.body;

    const petExists = await Pet.findOne({ owner: req.user._id, name: name });
    if (petExists) {
      return res.status(400).json({ message: 'Aapne ye pet pehle hi register kiya hua hai!' });
    }

    const pet = await Pet.create({
      owner: req.user._id, 
      name,
      petType,
      breed,
      dob 
    });

    res.status(201).json(pet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged in user's pets
export const getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Naya Function: Pet Profile with Full History & Prescriptions
// @desc    Get Single Pet Details with History
// @route   GET /api/pets/:id
export const getPetProfile = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (pet) {
      // Security Check: Kya ye pet isi user ka hai?
      if (pet.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Aap is pet ki details nahi dekh sakte!' });
      }

      // 1. Pet ki saari visit history mangwao (Treatment, Vaccination, etc.)
      // Hum petName ke base par match kar rahe hain
      const history = await Appointment.find({ 
        user: req.user._id,
        petName: pet.name 
      }).sort({ date: -1 });

      // 2. Pet details aur history ko merge karke bhejo
      res.json({
        ...pet._doc,
        history // Isme saare purane visits aur prescriptions honge
      });
    } else {
      res.status(404).json({ message: 'Pet nahi mila!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a pet
export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (pet) {
      if (pet.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Aap is pet ko delete nahi kar sakte!' });
      }
      await pet.deleteOne();
      res.json({ message: 'Pet successfully hata diya gaya! 🐾' });
    } else {
      res.status(404).json({ message: 'Pet nahi mila!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};