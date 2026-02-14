const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  languageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Language",
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

/**
 * Atomically increment and return the next question number for a language.
 */
counterSchema.statics.getNextQuestionNumber = async function (languageId) {
  const counter = await this.findOneAndUpdate(
    { languageId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return counter.seq;
};

module.exports = mongoose.model("Counter", counterSchema);
