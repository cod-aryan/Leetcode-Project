import Problem from "../models/Problem.js";
import Submission from "../models/submissions.js";

export const createProblem = async (req, res) => {
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, wrapperCode } = req.body;
    const problemCreator = req.user._id;

    const newProblem = new Problem({
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        wrapperCode,
        problemCreator,
    });

    newProblem.save()
        .then((problem) => res.status(201).json(problem))
        .catch((error) => res.status(400).json({ error: error.message }));
};

export const updateProblem = async (req, res) => {
    const { id } = req.params;
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, wrapperCode } = req.body;

    Problem.findByIdAndUpdate(id, {
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        wrapperCode,
    }, { runValidators: true, new: true })
        .then((problem) => {
            if (!problem) {
                return res.status(404).json({ error: "Problem not found" });
            }
            return res.status(200).json(problem);
        })
        .catch((error) => res.status(400).json({ error: error.message }));
};

export const deleteProblem = async (req, res) => {
    const { id } = req.params;

    Problem.findByIdAndDelete(id)
        .then((problem) => {
            if (!problem) {
                return res.status(404).json({ error: "Problem not found" });
            }
            return res.status(200).json({ message: "Problem deleted successfully" });
        })
        .catch((error) => res.status(400).json({ error: error.message }));
};

export const getProblem = async (req, res) => {
    const { id } = req.params;

    Problem.findById(id).select("-hiddenTestCases -wrapperCode -problemCreator")
        .then((problem) => {
            if (!problem) {
                return res.status(404).json({ error: "Problem not found" });
            }
            return res.status(200).json(problem);
        })
        .catch((error) => res.status(400).json({ error: error.message }));
};

export const getAllProblems = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10
    const page = parseInt(req.query.page) || 1; // Default page to 1
    const skip = (page - 1) * limit;
    Problem.find().skip(skip).limit(limit).select("-hiddenTestCases -wrapperCode -problemCreator")
        .then((problems) => res.status(200).json(problems))
        .catch((error) => res.status(400).json({ error: error.message }));
};

export const getUserSolvedProblems = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all successful submissions belonging to this user
        const acceptedSubmissions = await Submission.find({
            userId: userId,
            status: "Accepted"
        }).select("problemId");

        // Extract unique problem IDs using a Set to avoid duplicates
        const solvedProblemIds = [
            ...new Set(acceptedSubmissions.map(sub => sub.problemId.toString()))
        ];

        // Query the Problem collection for all matching IDs
        const solvedProblems = await Problem.find({
            _id: { $in: solvedProblemIds }
        }).select("-hiddenTestCases -wrapperCode -problemCreator");

        return res.status(200).json(solvedProblems);
    } catch (error) {
        console.error("Error fetching user solved problems:", error);
        return res.status(500).json({ error: error.message });
    }
};