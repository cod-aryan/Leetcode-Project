import express from "express";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblem,
  getAllProblems,
  getUserSolvedProblems,
} from "../controllers/problem.js";
import submissionRoutes from "./submissions.js";

const router = express.Router();

router.post("/create", authenticate, isAdmin, createProblem);
router.put("/update/:id", authenticate, isAdmin, updateProblem);
router.delete("/delete/:id", authenticate, isAdmin, deleteProblem);

router.get("/get/:id", getProblem);
router.get("/get-all", getAllProblems);
router.get("/solved-problems", authenticate, getUserSolvedProblems);

router.use("/:problemId/submissions", submissionRoutes);

export default router;