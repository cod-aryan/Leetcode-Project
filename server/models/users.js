import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
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
    index: true, // Optimized for fast leaderboard sorting
  },
  followers: {
    type: Number,
    default: 0,
  },
  following: {
    type: Number,
    default: 0,
  },
  
  // --- PROBLEM TRACKING METRICS ---
  // Detailed tracking by problem complexity level
  solvedCounts: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  },
  accuracy: {
    type: Number,
    default: 0,
  },
  
  // --- ANALYTICS & REWARDS ---
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
  
  // --- PROFILE METADATA ---
  location: {
    country: { type: String, default: '' },
    city: { type: String, default: '' },
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


userSchema.post("findOneAndDelete", async (user) => {
  await mongoose.model("Submission").deleteMany({ userId: user._id })
})


const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;