const mongoose = require("mongoose");

const subtopicSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: [true, "Topic is required"],
    },
    name: {
      type: String,
      required: [true, "Subtopic name is required"],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

subtopicSchema.index({ topicId: 1, slug: 1 }, { unique: true });
subtopicSchema.index({ topicId: 1, order: 1 });

module.exports = mongoose.model("Subtopic", subtopicSchema);
