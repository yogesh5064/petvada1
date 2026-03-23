import Product from '../models/productModel.js';

// ✅ 1. Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 2. Get Single Product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product nahi mila' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 3. Smart Restock & Billing Deduction
export const upsertProduct = async (req, res) => {
  try {
    const { 
      name, category, sellingPrice, purchasePrice, 
      quantity, batchNumber, expiryDate,
      weight, unit 
    } = req.body;

    if (!name || quantity === undefined) {
      return res.status(400).json({ message: "Product name and quantity are required!" });
    }

    // ✨ IMAGE PATH FIX: Backslash (\) ko Forward Slash (/) mein badalna zaroori hai
    // Hum sirf "/uploads/filename.jpg" format save karenge
    let image = "";
    if (req.file) {
        image = `/uploads/${req.file.filename}`; 
    }

    let product = await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (product) {
      product.stock += Number(quantity); 

      if (Number(quantity) > 0) {
        product.sellingPrice = Number(sellingPrice) || product.sellingPrice;
        product.currentBatch = batchNumber || product.currentBatch;
        product.currentExpiry = expiryDate || product.currentExpiry;
        
        if (weight) product.weight = Number(weight);
        if (unit) product.unit = unit;
        
        // Agar naya restock ke waqt image bheji hai toh hi update karein
        if (image) product.image = image;

        product.purchaseHistory.push({
          purchasePrice: Number(purchasePrice) || 0,
          quantityAdded: Number(quantity),
          batchNumber: batchNumber || 'N/A',
          expiryDate: expiryDate || null,
          billDocument: image 
        });
        
        await product.save();
        return res.status(200).json({ message: "Stock Updated Successfully! 📦", product });
      } else {
        await product.save();
        return res.status(200).json({ message: "Stock Deducted Successfully! 🧾", product });
      }
    } else {
      if (Number(quantity) <= 0) {
        return res.status(400).json({ message: "Cannot create new product with negative stock!" });
      }

      const newProduct = new Product({
        name,
        category: category || 'General',
        sellingPrice: Number(sellingPrice) || 0,
        stock: Number(quantity),
        weight: weight ? Number(weight) : undefined,
        unit: unit || 'kg',
        currentBatch: batchNumber || 'N/A',
        currentExpiry: expiryDate || null,
        image: image, // ✨ "/uploads/filename.jpg" save hoga
        purchaseHistory: [{
          purchasePrice: Number(purchasePrice) || 0,
          quantityAdded: Number(quantity),
          batchNumber: batchNumber || 'N/A',
          expiryDate: expiryDate || null,
          billDocument: image
        }]
      });

      await newProduct.save();
      return res.status(201).json({ message: "New Product Added! 🆕", product: newProduct });
    }
  } catch (error) {
    console.error("UPSERT_ERROR:", error); 
    res.status(500).json({ message: "Backend Error: " + error.message });
  }
};