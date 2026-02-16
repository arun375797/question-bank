const ApiResponse = require("../utils/apiResponse");

/**
 * Middleware factory that validates req.body against a Zod schema.
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      const issues = err.issues || err.errors || [];
      const errors = issues.map((e) => `${(e.path || []).join(".")}: ${e.message}`);
      return ApiResponse.badRequest(res, "Validation failed", errors);
    }
  };
}

module.exports = validate;
