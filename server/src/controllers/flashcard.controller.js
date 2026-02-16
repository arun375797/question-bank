const Flashcard = require("../models/Flashcard");
const ApiResponse = require("../utils/apiResponse");

function toClient(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : doc;
  return {
    id: d._id.toString(),
    front: d.front ?? "",
    back: d.back ?? "",
    subject: d.subject ?? "General",
    color: d.color ?? "#6366f1",
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
  };
}

exports.getAll = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const filter = subject && subject.trim() !== "" ? { subject: subject.trim() } : {};
    const cards = await Flashcard.find(filter).sort({ createdAt: -1 }).lean();
    const data = cards.map(toClient);
    return ApiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const card = await Flashcard.create(req.body);
    return ApiResponse.created(res, toClient(card));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const card = await Flashcard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!card) return ApiResponse.notFound(res, "Flashcard not found");
    return ApiResponse.success(res, toClient(card), "Flashcard updated");
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const card = await Flashcard.findByIdAndDelete(req.params.id);
    if (!card) return ApiResponse.notFound(res, "Flashcard not found");
    return ApiResponse.success(res, toClient(card), "Flashcard deleted");
  } catch (err) {
    next(err);
  }
};
