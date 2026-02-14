const Language = require("../models/Language");
const Topic = require("../models/Topic");
const Question = require("../models/Question");
const ApiResponse = require("../utils/apiResponse");
const { slugify } = require("../utils/slugify");

// GET /api/languages
exports.getAll = async (req, res, next) => {
  try {
    const languages = await Language.find().sort({ name: 1 }).lean();

    // Get question counts and answer stats for each language
    const stats = await Question.aggregate([
      {
        $group: {
          _id: "$languageId",
          totalQuestions: { $sum: 1 },
          answeredQuestions: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$answerText", ""] },
                    { $ne: ["$answerText", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const statsMap = {};
    stats.forEach((s) => {
      statsMap[s._id.toString()] = {
        totalQuestions: s.totalQuestions,
        answeredQuestions: s.answeredQuestions,
      };
    });

    const data = languages.map((lang) => ({
      ...lang,
      totalQuestions: statsMap[lang._id.toString()]?.totalQuestions || 0,
      answeredQuestions: statsMap[lang._id.toString()]?.answeredQuestions || 0,
    }));

    return ApiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};

// POST /api/languages
exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name);

    const language = await Language.create({ name, slug, description });
    return ApiResponse.created(res, language);
  } catch (err) {
    next(err);
  }
};

// PUT /api/languages/:id
exports.update = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.name) {
      updates.slug = slugify(updates.name);
    }

    const language = await Language.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!language) return ApiResponse.notFound(res, "Language not found");
    return ApiResponse.success(res, language, "Language updated");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/languages/:id
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cascade } = req.query;

    // Check for dependent topics
    const topicCount = await Topic.countDocuments({ languageId: id });
    const questionCount = await Question.countDocuments({ languageId: id });

    if ((topicCount > 0 || questionCount > 0) && cascade !== "true") {
      return ApiResponse.conflict(
        res,
        `Cannot delete: ${topicCount} topics and ${questionCount} questions depend on this language. Use ?cascade=true to force delete.`,
      );
    }

    if (cascade === "true") {
      // Cascade delete - get topic IDs first for subtopic cleanup
      const topicIds = await Topic.find({ languageId: id }).distinct("_id");
      const Subtopic = require("../models/Subtopic");
      await Subtopic.deleteMany({ topicId: { $in: topicIds } });
      await Topic.deleteMany({ languageId: id });
      await Question.deleteMany({ languageId: id });
      // Also remove counter
      const Counter = require("../models/Counter");
      await Counter.deleteOne({ languageId: id });
    }

    const language = await Language.findByIdAndDelete(id);
    if (!language) return ApiResponse.notFound(res, "Language not found");

    return ApiResponse.success(res, language, "Language deleted");
  } catch (err) {
    next(err);
  }
};
