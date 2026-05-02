import express from "express";
import { addSale, getSales } from "../controllers/salesController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware as any);

router.get("/", getSales);
router.post("/", addSale);

export default router;
