import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  constraints:{
    type: String,
    required: false,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
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
  startCode: [
    {
      language: {
        type: String,
        required: true,
      },
      version: {
        type: String,
        default: "latest",
      },
      code: {
        type: String,
        required: true,
      },
    }
  ],
  wrapperCode: {
    type: Map,
    of: String,
    default: {},
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

const Problem = mongoose.models.Problem || mongoose.model("Problem", problemSchema);

export default Problem;
