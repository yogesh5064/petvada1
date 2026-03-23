import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // StrictQuery warning ko handle karne ke liye
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // IPv4 force karega (Vi/Hotspot fix)
      serverSelectionTimeoutMS: 5000, // 5 second se zyada wait nahi karega
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ DB ERROR: ${error.message}`);
    
    // Agar connection fail ho toh ye steps check karein
    console.log('💡 Tip: Check if your Local MongoDB is running or MONGO_URI is correct in .env');
    
    process.exit(1);
  }
};

export default connectDB;