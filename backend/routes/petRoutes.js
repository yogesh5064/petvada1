import express from 'express';
import { 
  addPet, 
  getMyPets, 
  deletePet,
  getPetProfile // ✅ Naya controller import kiya
} from '../controllers/petController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Base Routes (Add pet aur User ke apne pets)
router.route('/')
  .post(protect, addPet)
  .get(protect, getMyPets);

// 2. Specific Route for User Pets
router.get('/my-pets', protect, getMyPets);

// 3. Delete aur Profile Fetch Route (ID ke saath)
router.route('/:id')
  .get(protect, getPetProfile) // ✅ Specific pet ki details aur history ke liye
  .delete(protect, deletePet);

// 4. Admin ONLY Route (Saare pets dekhne ke liye)
router.get('/all', protect, adminOnly, async (req, res) => {
    try {
        const Pet = (await import('../models/Pet.js')).default;
        const allPets = await Pet.find({}).populate('owner', 'name email');
        res.json(allPets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;