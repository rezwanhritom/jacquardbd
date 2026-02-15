import express from "express";
import { register, login, logout, me, refresh } from "../controller/auth.controller.js";
import { protect, requireRefreshToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, me);
router.post("/refresh", requireRefreshToken, refresh);

export default router;
