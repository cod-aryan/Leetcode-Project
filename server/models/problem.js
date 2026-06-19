import mongoose from "mongoose";

const ProblemSchema = new mongoose.Schema({
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
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  visibleTestCases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
      explanation: {
        type: String,
        required: false,
      },
    },
  ],
  hiddenTestCases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
    },
  ],
  startCode: {
    language: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  problemCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Problem = mongoose.model("Problem", ProblemSchema);

export default Problem;
