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
    testCasesPassed: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
// sort problemId and then userId for faster serching (O(log n) time complexity using binary search)
submissionSchema.index({ problemId: 1, userId: 1 }); // 1 for ascending order
submissionSchema.index({ userId: 1, status: 1 }); // 1 for ascending order

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;