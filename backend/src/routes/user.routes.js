import express from "express";
import { updateMe } from "../controller/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.patch("/me", updateMe);

export default router;
