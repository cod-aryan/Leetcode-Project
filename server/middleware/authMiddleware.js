import jwt from 'jsonwebtoken';
import User from '../models/users.js';

const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }

    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    req.user = user; // Attach user information to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { authenticate };