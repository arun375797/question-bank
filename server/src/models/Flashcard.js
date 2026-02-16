const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
  {
    front: {
      type: String,
      required: [true, "Front text is required"],
      trim: true,
      maxlength: 2000,
    },
    back: {
      type: String,
      required: [true, "Back text is required"],
      trim: true,
      maxlength: 2000,
    },
    subject: {
      type: String,
      trim: true,
      default: "General",
      maxlength: 100,
    },
    color: {
      type: String,
      trim: true,
      default: "#6366f1",
      maxlength: 20,
    },
  },
  { timestamps: true }
);

flashcardSchema.index({ subject: 1 });
flashcardSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Flashcard", flashcardSchema);
