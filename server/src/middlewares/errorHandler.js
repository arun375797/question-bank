const ApiResponse = require("../utils/apiResponse");

function errorHandler(err, req, res, next) {
  console.error("Error:", err.message);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return ApiResponse.badRequest(res, "Validation failed", errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return ApiResponse.conflict(res, `Duplicate value for field: ${field}`);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return ApiResponse.badRequest(res, `Invalid ${err.path}: ${err.value}`);
  }

  // Zod validation error
  if (err.name === "ZodError") {
    const errors = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
    return ApiResponse.badRequest(res, "Validation failed", errors);
  }

  // Custom AppError
  if (err.statusCode) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  // Default 500
  return ApiResponse.error(
    res,
    process.env.NODE_ENV === "development"
      ? err.message
      : "Internal server error",
    500,
  );
}

function notFoundHandler(req, res) {
  return ApiResponse.notFound(res, `Route ${req.originalUrl} not found`);
}

module.exports = { errorHandler, notFoundHandler };
