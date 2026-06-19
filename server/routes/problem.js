import express from "express";
import isAdmin from "../middleware/isAdmin.js";
import authenticate from "../middleware/authenticate.js";
import {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblem,
  getAllProblems,
  getUserProblems,
} from "../controllers/problem.js";

const router = express.Router();

router.post("/create", isAdmin, createProblem);
router.put("/update/:id", isAdmin, updateProblem);
router.delete("/delete/:id", isAdmin, deleteProblem);

router.get("/get/:id", getProblem);
router.get("/get-all", getAllProblems);
router.get("/solved-problems", authenticate, getUserProblems);

export default router;