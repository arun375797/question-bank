const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Import routes
const languageRoutes = require("../server/src/routes/language.routes");
const topicRoutes = require("../server/src/routes/topic.routes");
const subtopicRoutes = require("../server/src/routes/subtopic.routes");
const questionRoutes = require("../server/src/routes/question.routes");
const { errorHandler, notFoundHandler } = require("../server/src/middlewares/errorHandler");

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://question-bank-gamma.vercel.app",
    /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Domain Question Bank API is running" });
});

// Routes
app.use("/api/languages", languageRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/subtopics", subtopicRoutes);
app.use("/api/questions", questionRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// MongoDB connection (cached for serverless)
let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/domain-question-bank";
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    isConnected = true;
    console.log("✅ Connected to MongoDB");
    return mongoose.connection;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    isConnected = false;
    throw err;
  }
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Connect to MongoDB before handling request
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }

  // Handle the request with Express
  return app(req, res);
};

