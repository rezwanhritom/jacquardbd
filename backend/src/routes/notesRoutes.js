import express from "express";
import { getAllNotes } from "../controller/notesController.js";

const router = express.Router();

router.get("/", getAllNotes);

export default router;
