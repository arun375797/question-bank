const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
      required: [true, "Language is required"],
    },
    name: {
      type: String,
      required: [true, "Topic name is required"],
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

topicSchema.index({ languageId: 1, slug: 1 }, { unique: true });
topicSchema.index({ languageId: 1, order: 1 });

module.exports = mongoose.model("Topic", topicSchema);
