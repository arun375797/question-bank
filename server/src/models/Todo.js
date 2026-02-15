const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const subtaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, trim: true, default: "" },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      default: "Untitled",
    },
    priority: {
      type: String,
      enum: ["P1", "P2", "P3", "P4"],
      default: "P4",
    },
    colorLabel: { type: String, trim: true, default: null },
    dueDate: { type: String, trim: true, default: null },
    dueTime: { type: String, trim: true, default: null },
    notes: { type: String, trim: true, default: "" },
    links: {
      type: [linkSchema],
      default: [],
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

todoSchema.index({ dueDate: 1 });
todoSchema.index({ completed: 1 });

module.exports = mongoose.model("Todo", todoSchema);
