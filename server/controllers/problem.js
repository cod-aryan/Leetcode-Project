import Problem from "../models/Problem.js";

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

    Problem.findById(id)
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
    Problem.find().skip(skip).limit(limit)
        .then((problems) => res.status(200).json(problems))
        .catch((error) => res.status(400).json({ error: error.message }));
};

export const getUserProblems = async (req, res) => {
    return res.status(200).json({ message: "This route will return the problems solved by the user." });
}