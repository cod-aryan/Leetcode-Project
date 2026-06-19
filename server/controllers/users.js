import User from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import redisClient from "../config/redisClient.js";

// User registration controller
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("Registering user:", { username, email });

    // Validate username
    if (!usernameRegex.test(username)) {
      return res
        .status(400)
        .json({
          message:
            "Invalid username. Must be 3-30 characters long and contain only letters, numbers, and underscores.",
        });
    }

    // Check if user already exists as username and email should be unique
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
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

    // Create JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.cookie("token", token, {
      httpOnly: true, // Prevents frontend JavaScript from reading the cookie (Protects against XSS)
      secure: process.env.NODE_ENV === "production", // Cookie only sent over HTTPS in production
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiration in milliseconds (e.g., 30 day)
    });

    return res.status(201).json({
      message: "Register successfully",
      user: { id: newUser._id, email: newUser.email },
    });
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
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.cookie("token", token, {
      httpOnly: true, // Prevents frontend JavaScript from reading the cookie (Protects against XSS)
      secure: process.env.NODE_ENV === "production", // Cookie only sent over HTTPS in production
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiration in milliseconds (e.g., 30 day)
    });

    return res.status(200).json({
      message: "Logged in successfully",
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User logout controller
export const logout = async (req, res) => {
  try {
    const token = req.cookies.token;

    // Decode the token to find out when it naturally expires
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ message: "Malformed token" });
    }

    // Calculate remaining seconds until expiration
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - currentTime;

    if (timeLeft > 0) {
      // Store the token in Redis. Key: token, Value: "blacklisted"
      // EX sets the automatic expiration in seconds
      await redisClient.set(token, "blacklisted", {
        EX: timeLeft,
      });
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Match the original cookie settings
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

// Get user profile controller
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile controller
export const updateUserProfile = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.json({ message: "User profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
