const RevisionItem = require("../models/RevisionItem");
const ApiResponse = require("../utils/apiResponse");

function toClient(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : doc;
  return {
    id: d._id.toString(),
    title: d.title ?? "Untitled",
    notes: d.notes ?? "",
    category: d.category ?? "Other",
    tags: Array.isArray(d.tags) ? d.tags : [],
    links: Array.isArray(d.links) ? d.links : [],
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
    lastRevisedAt: d.lastRevisedAt ? new Date(d.lastRevisedAt).toISOString() : null,
    nextDueAt: d.nextDueAt ? new Date(d.nextDueAt).toISOString() : null,
    revisionCount: Number(d.revisionCount) ?? 0,
    confidence: d.confidence ?? "medium",
    mistakesLog: d.mistakesLog ?? "",
    keyQuestions: Array.isArray(d.keyQuestions) ? d.keyQuestions : [],
    keyPoints: Array.isArray(d.keyPoints) ? d.keyPoints : [],
  };
}

function parseBody(body) {
  const nextDueAt = body.nextDueAt
    ? new Date(body.nextDueAt)
    : new Date(Date.now() + 24 * 60 * 60 * 1000);
  nextDueAt.setHours(23, 59, 59, 999);

  return {
    title: body.title ?? "Untitled",
    notes: body.notes ?? "",
    category: body.category ?? "Other",
    tags: Array.isArray(body.tags) ? body.tags : [],
    links: Array.isArray(body.links) ? body.links : [],
    lastRevisedAt: body.lastRevisedAt ? new Date(body.lastRevisedAt) : null,
    nextDueAt,
    revisionCount: body.revisionCount ?? 0,
    confidence: body.confidence ?? "medium",
    mistakesLog: body.mistakesLog ?? "",
    keyQuestions: Array.isArray(body.keyQuestions) ? body.keyQuestions : [],
    keyPoints: Array.isArray(body.keyPoints) ? body.keyPoints : [],
  };
}

exports.getAll = async (req, res, next) => {
  try {
    const items = await RevisionItem.find().sort({ nextDueAt: 1 }).lean();
    const data = items.map(toClient);
    return ApiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payload = parseBody(req.body);
    if (!payload.nextDueAt) {
      const next = new Date();
      next.setDate(next.getDate() + 1);
      next.setHours(23, 59, 59, 999);
      payload.nextDueAt = next;
    }
    const item = await RevisionItem.create(payload);
    return ApiResponse.created(res, toClient(item));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const payload = parseBody(req.body);
    const item = await RevisionItem.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    if (!item) return ApiResponse.notFound(res, "Revision item not found");
    return ApiResponse.success(res, toClient(item), "Revision item updated");
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await RevisionItem.findByIdAndDelete(req.params.id);
    if (!item) return ApiResponse.notFound(res, "Revision item not found");
    return ApiResponse.success(res, toClient(item), "Revision item deleted");
  } catch (err) {
    next(err);
  }
};

exports.markRevised = async (req, res, next) => {
  try {
    const { rating } = req.body; // easy | okay | hard
    const item = await RevisionItem.findById(req.params.id);
    if (!item) return ApiResponse.notFound(res, "Revision item not found");

    const now = new Date();
    const count = (item.revisionCount || 0) + 1;
    const intervals = [1, 3, 7, 14, 30]; // 1st rev +1d, 2nd +3d, 3rd +7d, etc.
    let daysToAdd;
    if (rating === "hard") {
      daysToAdd = 1;
    } else if (rating === "easy") {
      daysToAdd = intervals[Math.min(count, intervals.length - 1)]; // jump ahead
    } else {
      daysToAdd = intervals[Math.min(count - 1, intervals.length - 1)]; // normal
    }

    const nextDue = new Date(now);
    nextDue.setDate(nextDue.getDate() + daysToAdd);
    nextDue.setHours(23, 59, 59, 999);

    const confidenceMap = { easy: "high", okay: "medium", hard: "low" };
    const confidence = confidenceMap[rating] || item.confidence;

    const updated = await RevisionItem.findByIdAndUpdate(
      req.params.id,
      {
        lastRevisedAt: now,
        nextDueAt: nextDue,
        revisionCount: count,
        confidence,
      },
      { new: true }
    );
    return ApiResponse.success(res, toClient(updated), "Revision recorded");
  } catch (err) {
    next(err);
  }
};

exports.snooze = async (req, res, next) => {
  try {
    const { option } = req.body; // 1d | 3d | 7d
    const item = await RevisionItem.findById(req.params.id);
    if (!item) return ApiResponse.notFound(res, "Revision item not found");

    const base = item.nextDueAt && new Date(item.nextDueAt) > new Date()
      ? new Date(item.nextDueAt)
      : new Date();
    const days = option === "1d" ? 1 : option === "3d" ? 3 : 7;
    const nextDue = new Date(base);
    nextDue.setDate(nextDue.getDate() + days);
    nextDue.setHours(23, 59, 59, 999);

    const updated = await RevisionItem.findByIdAndUpdate(
      req.params.id,
      { nextDueAt: nextDue },
      { new: true }
    );
    return ApiResponse.success(res, toClient(updated), "Snoozed");
  } catch (err) {
    next(err);
  }
};
