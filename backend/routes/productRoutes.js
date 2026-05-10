import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import Product from '../models/productModel.js';

import {
  getProducts,
  getProductById,
  upsertProduct
} from '../controllers/productController.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();


// =======================================================
// 📂 UPLOADS FOLDER AUTO CREATE
// =======================================================

const uploadPath = 'uploads/';

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}


// =======================================================
// 📂 MULTER STORAGE SETUP
// =======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {

    // File Extension Safe Handling
    const ext = path.extname(file.originalname);

    // File Name Clean
    const fileName =
      file.originalname
        .replace(ext, '')
        .toLowerCase()
        .split(' ')
        .join('-');

    // Final Unique Name
    cb(null, `${Date.now()}-${fileName}${ext}`);
  }
});


// =======================================================
// 📂 FILE FILTER
// =======================================================

const fileFilter = (req, file, cb) => {

  const allowedFileTypes = /jpg|jpeg|png|webp/;

  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only JPG, JPEG, PNG, WEBP images are allowed!'
      )
    );
  }
};


// =======================================================
// 📂 MULTER CONFIG
// =======================================================

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },

  fileFilter
});


// =======================================================
// 🚀 PUBLIC ROUTES
// =======================================================

// ✅ Get All Products
router.get('/', getProducts);

// ✅ Get Single Product
router.get('/:id', getProductById);


// =======================================================
// 👑 ADMIN ROUTES
// =======================================================

// ✅ Add / Restock Product
router.post(
  '/add',
  protect,
  adminOnly,
  upload.single('image'),
  upsertProduct
);


// ✅ Delete Product
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product nahi mila'
      });
    }

    // ===================================================
    // 🗑️ IMAGE DELETE FROM SERVER
    // ===================================================

    if (product.image) {

      const imagePath = path.join(
        process.cwd(),
        product.image
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // ===================================================
    // 🗑️ PRODUCT DELETE
    // ===================================================

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product successfully delete ho gaya 🗑️'
    });

  } catch (error) {

    console.error('DELETE_PRODUCT_ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// =======================================================
// ❌ MULTER ERROR HANDLER
// =======================================================

router.use((error, req, res, next) => {

  if (error instanceof multer.MulterError) {

    // File Size Error
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'Image size 5MB se zyada nahi honi chahiye!'
      });
    }

    return res.status(400).json({
      message: error.message
    });
  }

  // Custom File Type Error
  if (error) {
    return res.status(400).json({
      message: error.message
    });
  }

  next();
});


// =======================================================
// EXPORT ROUTER
// =======================================================

export default router;