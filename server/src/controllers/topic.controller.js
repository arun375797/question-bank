const Topic = require("../models/Topic");
const Subtopic = require("../models/Subtopic");
const Question = require("../models/Question");
const ApiResponse = require("../utils/apiResponse");
const { slugify } = require("../utils/slugify");

// GET /api/topics?languageId=
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.languageId) filter.languageId = req.query.languageId;

    const topics = await Topic.find(filter)
      .populate("languageId", "name slug")
      .sort({ order: 1, name: 1 })
      .lean();

    return ApiResponse.success(res, topics);
  } catch (err) {
    next(err);
  }
};

// POST /api/topics
exports.create = async (req, res, next) => {
  try {
    const { languageId, name, order } = req.body;
    const slug = slugify(name);

    const topic = await Topic.create({ languageId, name, slug, order });
    return ApiResponse.created(res, topic);
  } catch (err) {
    next(err);
  }
};

// PUT /api/topics/:id
exports.update = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.name) updates.slug = slugify(updates.name);

    const topic = await Topic.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!topic) return ApiResponse.notFound(res, "Topic not found");
    return ApiResponse.success(res, topic, "Topic updated");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/topics/:id
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cascade } = req.query;

    const subtopicCount = await Subtopic.countDocuments({ topicId: id });
    const questionCount = await Question.countDocuments({ topicId: id });

    if ((subtopicCount > 0 || questionCount > 0) && cascade !== "true") {
      return ApiResponse.conflict(
        res,
        `Cannot delete: ${subtopicCount} subtopics and ${questionCount} questions depend on this topic. Use ?cascade=true to force delete.`,
      );
    }

    if (cascade === "true") {
      await Subtopic.deleteMany({ topicId: id });
      await Question.deleteMany({ topicId: id });
    }

    const topic = await Topic.findByIdAndDelete(id);
    if (!topic) return ApiResponse.notFound(res, "Topic not found");

    return ApiResponse.success(res, topic, "Topic deleted");
  } catch (err) {
    next(err);
  }
};
