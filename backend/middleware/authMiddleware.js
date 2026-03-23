import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. User protection middleware (Login check)
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Token verify karna
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User fetch karna (select -password safety ke liye)
      req.user = await User.findById(decoded.id).select('-password');
      
      return next(); 
    } catch (error) {
      console.error("❌ Auth Error:", error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 🔥 2. Admin access middleware (Primary Name)
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only!' });
  }
};

// ✅ 3. Alias for Backward Compatibility (Purane routes ke liye)
// Isse petRoutes, adminRoutes etc. mein adminOnly wale errors khatam ho jayenge.
export const adminOnly = admin;