const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Rule text is required"],
      trim: true,
      maxlength: [500, "Rule text cannot exceed 500 characters"],
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

ruleSchema.index({ order: 1 });

module.exports = mongoose.model("Rule", ruleSchema);
