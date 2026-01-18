import mongoose from "mongoose";

const noteSchema = new mongoose.Schema( // A schema is like a blueprint that defines how each document (record) should look.
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    // { timestamps: true }
    // Automatically adds two fields:
    // createdAt — when the note was created.
    // updatedAt — when the note was last updated.
  }
);

const Note = mongoose.model("Note", noteSchema);
// Creates a model named "Note" from the schema.
// The model represents the collection in MongoDB.
// Mongoose will look for a collection named "notes" (lowercase, plural of "Note").
// You use this Note model to create, read, update, and delete documents in the notes collection.

export default Note;
