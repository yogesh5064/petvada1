import express from 'express';
import multer from 'multer'; // Local file upload ke liye
import path from 'path';
import Product from '../models/productModel.js';
import { 
  getProducts, 
  getProductById, 
  upsertProduct 
} from '../controllers/productController.js'; 
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// 📂 --- LOCAL MULTER STORAGE SETUP ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ye 'uploads/' wahi folder hai jo tune backend ke root mein banaya hai
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // File ka unique naam (Current Time + Original Name)
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });
// ---------------------------------------

// 1. Get all products (Scan for analytics)
router.get('/', getProducts);

// 2. Get Single Product (For Details View)
router.get('/:id', getProductById);

// 3. Smart Add/Restock (Admin only)
// Note: 'upload.single('image')' ab file ko local 'uploads' folder mein bhejega
router.post('/add', protect, adminOnly, upload.single('image'), upsertProduct);

// 4. Delete product (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (product) {
        await product.deleteOne(); 
        res.json({ message: 'Product successfully hata diya gaya! 🐾' });
      } else {
        res.status(404).json({ message: 'Product nahi mila' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

export default router;