import Note from "../models/Note.js";

/**
 * GET /api/notes - Return all notes sorted by newest first.
 * Placeholder endpoint; use next(err) for consistent error handling if needed.
 */
export async function getAllNotes(req, res) {
  try {
    const notes = await Note.find().lean().sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    console.error("getAllNotes error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
