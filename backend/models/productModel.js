import mongoose from 'mongoose';

const purchaseRecordSchema = new mongoose.Schema({
  purchaseDate: { type: Date, default: Date.now },
  purchasePrice: { type: Number, required: true },
  quantityAdded: { type: Number, required: true },
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  billDocument: { type: String }, // Bill URL (Image/PDF)
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  
  // ✅ Category flexibility (Food, Accessories, Medicine)
  category: { 
    type: String, 
    required: true 
  },

  // ✨ Nayi Fields: Food units ke liye
  weight: { 
    type: Number 
  }, // e.g., 500 or 10
  
  unit: { 
    type: String, 
    enum: ['kg', 'g', 'ml', 'pcs'], 
    default: 'kg' 
  }, //

  sellingPrice: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  
  // Display fields for latest stock info
  currentBatch: { type: String },
  currentExpiry: { type: Date },
  
  // Item ki photo ke liye field
  image: { type: String },

  purchaseHistory: [purchaseRecordSchema]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;