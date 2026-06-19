import User from '../models/users.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// User registration controller
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('Registering user:', { username, email });

    // Validate username
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: 'Invalid username. Must be 3-30 characters long and contain only letters, numbers, and underscores.' });
    }

    // Check if user already exists as username and email should be unique
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User logout controller
export const logout = (req, res) => {
  // Invalidate the token on the client side (e.g., by deleting it from local storage)
  res.json({ message: 'User logged out successfully' });
};

// Get user profile controller
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile controller
export const updateUserProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.json({ message: 'User profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};