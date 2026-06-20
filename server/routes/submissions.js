import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  submitCode,
  getAllSubmissions,
  getSubmissionDetail,
} from "../controllers/submissions.js";

// 💡 FIX: Merge parameters from the parent router!
const router = express.Router({ mergeParams: true });

router.post("/", authenticate, submitCode);
router.get("/get-all", authenticate, getAllSubmissions);
router.get("/detail/:id", getSubmissionDetail);


export default router;