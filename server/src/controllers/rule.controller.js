const Rule = require("../models/Rule");
const ApiResponse = require("../utils/apiResponse");

function toClient(rule) {
  if (!rule) return null;
  const doc = rule.toObject ? rule.toObject() : rule;
  return {
    id: doc._id.toString(),
    text: doc.text,
    order: doc.order ?? 0,
  };
}

exports.getAll = async (req, res, next) => {
  try {
    const rules = await Rule.find().sort({ order: 1 }).lean();
    const data = rules.map((r) => ({
      id: r._id.toString(),
      text: r.text,
      order: r.order ?? 0,
    }));
    return ApiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { text, order } = req.body;
    const rule = await Rule.create({ text, order: order ?? 0 });
    return ApiResponse.created(res, toClient(rule));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const rule = await Rule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!rule) return ApiResponse.notFound(res, "Rule not found");
    return ApiResponse.success(res, toClient(rule), "Rule updated");
  } catch (err) {
    next(err);
  }
};

exports.reorder = async (req, res, next) => {
  try {
    const { order } = req.body; // array of ids in new order
    if (!Array.isArray(order) || order.length === 0) {
      return ApiResponse.badRequest(res, "order must be a non-empty array of rule ids");
    }
    const updates = order.map((id, index) =>
      Rule.findByIdAndUpdate(id, { order: index }, { new: true })
    );
    await Promise.all(updates);
    const rules = await Rule.find().sort({ order: 1 }).lean();
    const data = rules.map((r) => ({
      id: r._id.toString(),
      text: r.text,
      order: r.order ?? 0,
    }));
    return ApiResponse.success(res, data, "Rules reordered");
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);
    if (!rule) return ApiResponse.notFound(res, "Rule not found");
    return ApiResponse.success(res, toClient(rule), "Rule deleted");
  } catch (err) {
    next(err);
  }
};
