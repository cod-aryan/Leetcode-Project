import mongoose from 'mongoose';
import { problemSchema } from './problems.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  rank: {
    type: Number,
    default: 0,
  },
  followers: {
    type: Number,
    default: 0,
  },
  following: {
    type: Number,
    default: 0,
  },
  problemsSolved: {
    type: Number,
    default: 0,
  },
  easyProblemsSolved: {
    type: Number,
    default: 0,
  },
  mediumProblemsSolved: {
    type: Number,
    default: 0,
  },
  hardProblemsSolved: {
    type: Number,
    default: 0,
  },
  submissions: {
    type: Number,
    default: 0,
  },
  accuracy: {
    type: Number,
    default: 0,
  },
  badgeCount: {
    type: Number,
    default: 0,
  },
  totalActiveDays: {
    type: Number,
    default: 0,
  },
  maxStreak: {
    type: Number,
    default: 0,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  country: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  socialMediaLinks: {
    type: Map,
    of: String,
    default: {},
  },
  languagesUsed: {
    type: [String],
    default: [],
  },
  badgesEarned: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;