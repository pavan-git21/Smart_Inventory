import express from "express";
import { getReports } from "../controllers/reportController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware as any);
router.get("/", getReports);

export default router;
