import Product from '../models/productModel.js';
import fs from 'fs';
import path from 'path';

// ======================================================
// ✅ 1. GET ALL PRODUCTS
// ======================================================
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(products);
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR:", error);

    res.status(500).json({
      success: false,
      message: 'Products fetch failed',
      error: error.message
    });
  }
};

// ======================================================
// ✅ 2. GET SINGLE PRODUCT
// ======================================================
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product nahi mila'
      });
    }

    res.status(200).json(product);

  } catch (error) {
    console.error("GET_PRODUCT_ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================================
// ✅ 3. ADD / RESTOCK PRODUCT
// ======================================================
export const upsertProduct = async (req, res) => {
  try {

    const {
      name,
      category,
      sellingPrice,
      purchasePrice,
      quantity,
      batchNumber,
      expiryDate,
      weight,
      unit
    } = req.body;

    // =========================
    // VALIDATIONS
    // =========================
    if (!name || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name aur quantity required hai'
      });
    }

    const parsedQuantity = Number(quantity);

    if (isNaN(parsedQuantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity invalid hai'
      });
    }

    // =========================
    // IMAGE SETUP
    // =========================
    let imagePath = '';

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // =========================
    // CHECK EXISTING PRODUCT
    // =========================
    let product = await Product.findOne({
      name: {
        $regex: new RegExp(`^${name}$`, 'i')
      }
    });

    // ======================================================
    // ✅ EXISTING PRODUCT
    // ======================================================
    if (product) {

      product.stock += parsedQuantity;

      // Restock Only
      if (parsedQuantity > 0) {

        product.category = category || product.category;

        product.sellingPrice =
          Number(sellingPrice) || product.sellingPrice;

        product.currentBatch =
          batchNumber || product.currentBatch;

        product.currentExpiry =
          expiryDate || product.currentExpiry;

        if (weight) {
          product.weight = Number(weight);
        }

        if (unit) {
          product.unit = unit;
        }

        // Update image only if uploaded
        if (imagePath) {
          product.image = imagePath;
        }

        // Purchase history add
        product.purchaseHistory.push({
          purchaseDate: new Date(),
          purchasePrice: Number(purchasePrice) || 0,
          quantityAdded: parsedQuantity,
          batchNumber: batchNumber || 'N/A',
          expiryDate: expiryDate || null,
          billDocument: imagePath || ''
        });

        await product.save();

        return res.status(200).json({
          success: true,
          message: 'Stock Updated Successfully 📦',
          product
        });

      } else {

        // Negative quantity = stock deduction
        if (product.stock < 0) {
          product.stock = 0;
        }

        await product.save();

        return res.status(200).json({
          success: true,
          message: 'Stock Deducted Successfully 🧾',
          product
        });
      }
    }

    // ======================================================
    // ✅ NEW PRODUCT CREATE
    // ======================================================
    if (parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'New product negative stock ke saath create nahi ho sakta'
      });
    }

    const newProduct = new Product({
      name: name.trim(),
      category: category || 'General',

      sellingPrice: Number(sellingPrice) || 0,

      stock: parsedQuantity,

      weight: weight ? Number(weight) : undefined,

      unit: unit || 'kg',

      currentBatch: batchNumber || 'N/A',

      currentExpiry: expiryDate || null,

      image: imagePath,

      purchaseHistory: [
        {
          purchaseDate: new Date(),
          purchasePrice: Number(purchasePrice) || 0,
          quantityAdded: parsedQuantity,
          batchNumber: batchNumber || 'N/A',
          expiryDate: expiryDate || null,
          billDocument: imagePath || ''
        }
      ]
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'New Product Added Successfully 🆕',
      product: newProduct
    });

  } catch (error) {

    console.error("UPSERT_PRODUCT_ERROR:", error);

    res.status(500).json({
      success: false,
      message: 'Backend Error',
      error: error.message
    });
  }
};

// ======================================================
// ✅ 4. DELETE PRODUCT
// ======================================================
export const deleteProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product nahi mila'
      });
    }

    // =========================
    // DELETE IMAGE FROM STORAGE
    // =========================
    if (product.image) {

      const imagePath = path.join(
        process.cwd(),
        product.image
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product successfully delete ho gaya 🗑️'
    });

  } catch (error) {

    console.error("DELETE_PRODUCT_ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================================
// ✅ 5. LOW STOCK PRODUCTS
// ======================================================
export const getLowStockProducts = async (req, res) => {
  try {

    const products = await Product.find({
      stock: { $lte: 5 }
    })
      .sort({ stock: 1 })
      .lean();

    res.status(200).json(products);

  } catch (error) {

    console.error("LOW_STOCK_ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================================
// ✅ 6. EXPIRING PRODUCTS
// ======================================================
export const getExpiringProducts = async (req, res) => {
  try {

    const today = new Date();

    const next90Days = new Date();

    next90Days.setDate(today.getDate() + 90);

    const products = await Product.find({
      currentExpiry: {
        $gte: today,
        $lte: next90Days
      }
    })
      .sort({ currentExpiry: 1 })
      .lean();

    res.status(200).json(products);

  } catch (error) {

    console.error("EXPIRY_ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================================
// ✅ 7. SEARCH PRODUCTS
// ======================================================
export const searchProducts = async (req, res) => {
  try {

    const keyword = req.query.keyword || '';

    const products = await Product.find({
      name: {
        $regex: keyword,
        $options: 'i'
      }
    })
      .limit(20)
      .lean();

    res.status(200).json(products);

  } catch (error) {

    console.error("SEARCH_PRODUCT_ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};