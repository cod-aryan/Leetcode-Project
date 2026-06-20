import express from 'express';
import { register, login, logout, getUserProfile, updateUserProfile, deleteUser } from '../controllers/users.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// User registration route
router.post('/register', register);

// User login route
router.post('/login', login);

// User logout route
router.post('/logout', authenticate, logout);

// Get user profile route
router.get('/profile', authenticate, getUserProfile);

// Update user profile route
router.put('/profile', authenticate, updateUserProfile);

// delete user along with submissions (and problem if user is admin)
router.delete('/delete', authenticate, deleteUser);

export default router;