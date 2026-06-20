import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    language: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Wrong Answer", "Runtime Error", "Time Limit Exceeded"],
        default: "Pending"
    },
    outputs: {
        type: [String],
        default: []
    },
    executionTime: {
        type: Number,
        default: null
    },
    memoryUsage: {
        type: Number,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;