import express from 'express';
import { register, login, logout, getUserProfile, updateUserProfile } from '../controllers/users.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// User registration route
router.post('/register', register);

// User login route
router.post('/login', login);

// User logout route
router.post('/logout', logout);

// Get user profile route
router.get('/profile', authenticate, getUserProfile);

// Update user profile route
router.put('/profile', authenticate, updateUserProfile);

export default router;