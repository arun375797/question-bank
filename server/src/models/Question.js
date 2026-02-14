const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
      required: [true, "Language is required"],
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: [true, "Topic is required"],
    },
    subtopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subtopic",
      default: null,
    },
    questionNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: [true, "Question title is required"],
      trim: true,
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    answerText: {
      type: String,
      trim: true,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: [true, "Difficulty is required"],
    },
    type: {
      type: String,
      enum: ["Theory", "Practical", "Both"],
      required: [true, "Question type is required"],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

// Compound unique index for per-language numbering
questionSchema.index({ languageId: 1, questionNumber: 1 }, { unique: true });

// Filtering indexes
questionSchema.index({ languageId: 1, topicId: 1 });
questionSchema.index({ languageId: 1, subtopicId: 1 });
questionSchema.index({ languageId: 1, difficulty: 1 });
questionSchema.index({ languageId: 1, type: 1 });

// Text index for search
questionSchema.index({ title: "text", questionText: "text", tags: "text" });

module.exports = mongoose.model("Question", questionSchema);
