import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// =======================================================
// 🔐 PROTECT MIDDLEWARE (AUTH CHECK)
// =======================================================
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Not authorized, token missing',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, invalid token format',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Not authorized, token failed',
    });
  }
};

// =======================================================
// 👑 ADMIN ONLY MIDDLEWARE
// =======================================================
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Not authorized',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied: Admins only',
    });
  }

  next();
};