import Problem from "../models/Problem.js";

const createProblem = (req, res) => {
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution } = req.body;
    const problemCreator = req.user._id;

    const newProblem = new Problem({
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution,
        problemCreator,
    });

    newProblem.save()
        .then((problem) => res.status(201).json(problem))
        .catch((error) => res.status(400).json({ error: error.message }));
};

const updateProblem = (req, res) => {
    const { id } = req.params;
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution } = req.body;

    Problem.findByIdAndUpdate(id, {
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution,
    }, { runValidators: true, new: true })
        .then((problem) => {
            if (!problem) {
                return res.status(404).json({ error: "Problem not found" });
            }
            return res.status(200).json(problem);
        })
        .catch((error) => res.status(400).json({ error: error.message }));
};

const deleteProblem = (req, res) => {
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

const getProblem = (req, res) => {
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

const getAllProblems = (req, res) => {
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10
    const page = parseInt(req.query.page) || 1; // Default page to 1
    const skip = (page - 1) * limit;
    Problem.find().skip(skip).limit(limit)
        .then((problems) => res.status(200).json(problems))
        .catch((error) => res.status(400).json({ error: error.message }));
};

const getUserProblems = (req, res) => {
    return res.status(200).json({ message: "This route will return the problems solved by the user." });
}


export { createProblem, updateProblem, deleteProblem, getProblem, getAllProblems, getUserProblems, };