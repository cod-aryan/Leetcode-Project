import jwt from "jsonwebtoken";
import User from "../models/users.js";
import redisClient from "../config/redisClient.js";

const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
};

const authenticate = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const isBlacklisted = await redisClient.get(token);
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ message: "Token is invalid (logged out)." });
    }

    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.user = user; // Attach user information to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export { authenticate };
