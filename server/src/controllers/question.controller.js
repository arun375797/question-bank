const Question = require("../models/Question");
const Counter = require("../models/Counter");
const ApiResponse = require("../utils/apiResponse");

// GET /api/questions - with filtering, search, sort, pagination
exports.getAll = async (req, res, next) => {
  try {
    const {
      languageId,
      topicId,
      subtopicId,
      difficulty,
      type,
      hasAnswer,
      tags,
      search,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (languageId) filter.languageId = languageId;
    if (topicId) filter.topicId = topicId;
    if (subtopicId) filter.subtopicId = subtopicId;

    // Multi-select difficulty
    if (difficulty) {
      const diffs = difficulty.split(",").filter(Boolean);
      if (diffs.length > 0) filter.difficulty = { $in: diffs };
    }

    // Multi-select type
    if (type) {
      const types = type.split(",").filter(Boolean);
      if (types.length > 0) filter.type = { $in: types };
    }

    // Has answer filter
    if (hasAnswer === "true") {
      filter.answerText = { $nin: ["", null] };
    } else if (hasAnswer === "false") {
      filter.$or = [
        { answerText: "" },
        { answerText: null },
        { answerText: { $exists: false } },
      ];
    }

    // Tags filter
    if (tags) {
      const tagArr = tags.split(",").filter(Boolean);
      if (tagArr.length > 0) filter.tags = { $in: tagArr };
    }

    // Text search
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // Sorting
    let sortObj = {};
    switch (sort) {
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "number_asc":
        sortObj = { questionNumber: 1 };
        break;
      case "number_desc":
        sortObj = { questionNumber: -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    // If text search, include score for relevance
    if (filter.$text) {
      sortObj = { score: { $meta: "textScore" }, ...sortObj };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [questions, totalCount] = await Promise.all([
      Question.find(
        filter,
        filter.$text ? { score: { $meta: "textScore" } } : {},
      )
        .populate("languageId", "name slug")
        .populate("topicId", "name slug")
        .populate("subtopicId", "name slug")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Question.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return ApiResponse.success(res, questions, "Questions retrieved", 200, {
      page: pageNum,
      limit: limitNum,
      totalCount,
      totalPages,
      from: skip + 1,
      to: Math.min(skip + limitNum, totalCount),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/questions/:id
exports.getById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("languageId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug")
      .lean();

    if (!question) return ApiResponse.notFound(res, "Question not found");
    return ApiResponse.success(res, question);
  } catch (err) {
    next(err);
  }
};

/**
 * Get the smallest available question number for a language (fills gaps after deletions).
 */
async function getNextAvailableQuestionNumber(languageId) {
  const used = await Question.distinct("questionNumber", { languageId });
  const usedSet = new Set(used);
  let n = 1;
  while (usedSet.has(n)) n++;
  return n;
}

// POST /api/questions
exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Assign smallest available question number (reuses gaps after deletions)
    const questionNumber = await getNextAvailableQuestionNumber(data.languageId);
    data.questionNumber = questionNumber;

    const question = await Question.create(data);

    // Keep counter in sync so it never hands out a number we've already used
    await Counter.findOneAndUpdate(
      { languageId: data.languageId },
      [{ $set: { seq: { $max: [{ $ifNull: ["$seq", 0] }, questionNumber] } } }],
      { upsert: true },
    );

    const populated = await Question.findById(question._id)
      .populate("languageId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug")
      .lean();

    return ApiResponse.created(res, populated, "Question created");
  } catch (err) {
    next(err);
  }
};

// PUT /api/questions/:id
exports.update = async (req, res, next) => {
  try {
    // Don't allow changing languageId or questionNumber
    const { languageId, questionNumber, ...updates } = req.body;

    const question = await Question.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("languageId", "name slug")
      .populate("topicId", "name slug")
      .populate("subtopicId", "name slug");

    if (!question) return ApiResponse.notFound(res, "Question not found");
    return ApiResponse.success(res, question, "Question updated");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/questions/:id
exports.remove = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return ApiResponse.notFound(res, "Question not found");
    // Do NOT reorder question numbers
    return ApiResponse.success(res, question, "Question deleted");
  } catch (err) {
    next(err);
  }
};

// POST /api/questions/bulk
exports.bulk = async (req, res, next) => {
  try {
    const { action, ids, value } = req.body;
    let result;

    switch (action) {
      case "delete":
        result = await Question.deleteMany({ _id: { $in: ids } });
        return ApiResponse.success(
          res,
          { deletedCount: result.deletedCount },
          "Bulk delete completed",
        );

      case "updateDifficulty":
        if (!["Easy", "Medium", "Hard"].includes(value)) {
          return ApiResponse.badRequest(res, "Invalid difficulty value");
        }
        result = await Question.updateMany(
          { _id: { $in: ids } },
          { difficulty: value },
        );
        return ApiResponse.success(
          res,
          { modifiedCount: result.modifiedCount },
          "Bulk update difficulty completed",
        );

      case "updateType":
        if (!["Theory", "Practical", "Both"].includes(value)) {
          return ApiResponse.badRequest(res, "Invalid type value");
        }
        result = await Question.updateMany(
          { _id: { $in: ids } },
          { type: value },
        );
        return ApiResponse.success(
          res,
          { modifiedCount: result.modifiedCount },
          "Bulk update type completed",
        );

      default:
        return ApiResponse.badRequest(res, "Invalid bulk action");
    }
  } catch (err) {
    next(err);
  }
};
