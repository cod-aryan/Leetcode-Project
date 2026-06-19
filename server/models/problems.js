import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  acceptanceRate: {
    type: Number,
    default: 0,
  },
});

const Problem = mongoose.model('Problem', problemSchema);

export { Problem as problemSchema };