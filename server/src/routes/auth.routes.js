const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/apiResponse");

const PASSWORD_HASH = process.env.SITE_PASSWORD_HASH;
const JWT_SECRET = process.env.SITE_AUTH_JWT_SECRET;
const JWT_EXPIRY_DAYS = 7;

function createToken() {
  if (!JWT_SECRET) return null;
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    { sub: "site", iat: now, exp: now + JWT_EXPIRY_DAYS * 24 * 60 * 60 },
    JWT_SECRET
  );
}

// POST /api/auth/verify — check password, return JWT
router.post("/verify", (req, res) => {
  if (!PASSWORD_HASH || !JWT_SECRET) {
    return ApiResponse.error(res, "Auth not configured", 503);
  }
  const password = req.body?.password;
  if (typeof password !== "string") {
    return ApiResponse.badRequest(res, "Password required");
  }
  bcrypt.compare(password, PASSWORD_HASH).then((match) => {
    if (!match) {
      return ApiResponse.error(res, "Invalid password", 401);
    }
    const token = createToken();
    return ApiResponse.success(res, { token }, "OK");
  }).catch(() => ApiResponse.error(res, "Invalid password", 401));
});

// GET /api/auth/me — validate token (no auth middleware; used to check session)
router.get("/me", (req, res) => {
  if (!JWT_SECRET) {
    return ApiResponse.error(res, "Auth not configured", 503);
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ApiResponse.error(res, "Unauthorized", 401);
  }
  const token = authHeader.slice(7);
  try {
    jwt.verify(token, JWT_SECRET);
    return ApiResponse.success(res, { valid: true }, "OK");
  } catch {
    return ApiResponse.error(res, "Unauthorized", 401);
  }
});

module.exports = router;
