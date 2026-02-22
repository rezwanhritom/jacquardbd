import express from "express";
import {
  register,
  login,
  logout,
  me,
  changePassword,
  getSessions,
  revokeSession,
  revokeAllOtherSessions,
} from "../controller/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, me);

router.post("/change-password", protect, changePassword);
router.get("/sessions", protect, getSessions);
router.delete("/sessions", protect, revokeAllOtherSessions);
router.delete("/sessions/:sessionId", protect, revokeSession);

export default router;
