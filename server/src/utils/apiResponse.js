class ApiResponse {
  static success(
    res,
    data,
    message = "Success",
    statusCode = 200,
    meta = null,
  ) {
    const response = { success: true, message, data };
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
  }

  static created(res, data, message = "Created successfully") {
    return this.success(res, data, message, 201);
  }

  static error(
    res,
    message = "Internal server error",
    statusCode = 500,
    errors = null,
  ) {
    const response = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  }

  static notFound(res, message = "Resource not found") {
    return this.error(res, message, 404);
  }

  static badRequest(res, message = "Bad request", errors = null) {
    return this.error(res, message, 400, errors);
  }

  static conflict(res, message = "Conflict") {
    return this.error(res, message, 409);
  }
}

module.exports = ApiResponse;
