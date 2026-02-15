const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/apiResponse");

const JWT_SECRET = process.env.SITE_AUTH_JWT_SECRET;

function authMiddleware(req, res, next) {
  if (!JWT_SECRET) {
    return ApiResponse.error(res, "Auth not configured", 503);
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ApiResponse.error(res, "Unauthorized", 401);
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
    next();
  } catch (err) {
    return ApiResponse.error(res, "Unauthorized", 401);
  }
}

module.exports = authMiddleware;
