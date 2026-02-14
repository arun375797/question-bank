const Subtopic = require("../models/Subtopic");
const Question = require("../models/Question");
const ApiResponse = require("../utils/apiResponse");
const { slugify } = require("../utils/slugify");

// GET /api/subtopics?topicId=
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.topicId) filter.topicId = req.query.topicId;

    const subtopics = await Subtopic.find(filter)
      .populate("topicId", "name slug")
      .sort({ order: 1, name: 1 })
      .lean();

    return ApiResponse.success(res, subtopics);
  } catch (err) {
    next(err);
  }
};

// POST /api/subtopics
exports.create = async (req, res, next) => {
  try {
    const { topicId, name, order } = req.body;
    const slug = slugify(name);

    const subtopic = await Subtopic.create({ topicId, name, slug, order });
    return ApiResponse.created(res, subtopic);
  } catch (err) {
    next(err);
  }
};

// PUT /api/subtopics/:id
exports.update = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.name) updates.slug = slugify(updates.name);

    const subtopic = await Subtopic.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!subtopic) return ApiResponse.notFound(res, "Subtopic not found");
    return ApiResponse.success(res, subtopic, "Subtopic updated");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/subtopics/:id
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cascade } = req.query;

    const questionCount = await Question.countDocuments({ subtopicId: id });

    if (questionCount > 0 && cascade !== "true") {
      return ApiResponse.conflict(
        res,
        `Cannot delete: ${questionCount} questions reference this subtopic. Use ?cascade=true to clear subtopic references.`,
      );
    }

    if (cascade === "true") {
      // Nullify subtopicId references instead of deleting questions
      await Question.updateMany({ subtopicId: id }, { subtopicId: null });
    }

    const subtopic = await Subtopic.findByIdAndDelete(id);
    if (!subtopic) return ApiResponse.notFound(res, "Subtopic not found");

    return ApiResponse.success(res, subtopic, "Subtopic deleted");
  } catch (err) {
    next(err);
  }
};
