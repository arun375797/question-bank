const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const revisionItemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "Untitled" },
    notes: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "Other" },
    tags: [{ type: String, trim: true }],
    links: {
      type: [linkSchema],
      default: [],
    },
    createdAt: { type: Date, default: Date.now },
    lastRevisedAt: { type: Date, default: null },
    nextDueAt: { type: Date, required: true },
    revisionCount: { type: Number, default: 0 },
    confidence: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    mistakesLog: { type: String, trim: true, default: "" },
    keyQuestions: [{ type: String, trim: true }],
    keyPoints: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

revisionItemSchema.index({ nextDueAt: 1 });
revisionItemSchema.index({ lastRevisedAt: 1 });

module.exports = mongoose.model("RevisionItem", revisionItemSchema);
