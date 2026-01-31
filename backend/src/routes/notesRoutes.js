import express from "express";
import { getAllNotes } from "../controller/notesController.js";

const router = express.Router();

// GET /api/notes - list all notes (demo/placeholder)
router.get("/", getAllNotes);

export default router;
