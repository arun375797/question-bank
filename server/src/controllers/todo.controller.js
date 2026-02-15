const Todo = require("../models/Todo");
const ApiResponse = require("../utils/apiResponse");

function toClient(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : doc;
  return {
    id: d._id.toString(),
    title: d.title ?? "Untitled",
    priority: d.priority ?? "P4",
    colorLabel: d.colorLabel ?? null,
    dueDate: d.dueDate ?? null,
    dueTime: d.dueTime ?? null,
    notes: d.notes ?? "",
    links: Array.isArray(d.links) ? d.links : [],
    subtasks: Array.isArray(d.subtasks) ? d.subtasks : [],
    completed: Boolean(d.completed),
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
  };
}

exports.getAll = async (req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 }).lean();
    const data = todos.map(toClient);
    return ApiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const todo = await Todo.create(req.body);
    return ApiResponse.created(res, toClient(todo));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!todo) return ApiResponse.notFound(res, "Todo not found");
    return ApiResponse.success(res, toClient(todo), "Todo updated");
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return ApiResponse.notFound(res, "Todo not found");
    return ApiResponse.success(res, toClient(todo), "Todo deleted");
  } catch (err) {
    next(err);
  }
};
