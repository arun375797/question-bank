const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const authMiddleware = require("./middlewares/auth");
const authRoutes = require("./routes/auth.routes");
const languageRoutes = require("./routes/language.routes");
const topicRoutes = require("./routes/topic.routes");
const subtopicRoutes = require("./routes/subtopic.routes");
const questionRoutes = require("./routes/question.routes");
const todoRoutes = require("./routes/todo.routes");
const flashcardRoutes = require("./routes/flashcard.routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://question-bank-gamma.vercel.app",
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "10mb" }));

// Routes (health and auth are public; rest require auth)
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Domain Question Bank API is running" });
});
app.use("/api/auth", authRoutes);

app.use("/api/languages", authMiddleware, languageRoutes);
app.use("/api/topics", authMiddleware, topicRoutes);
app.use("/api/subtopics", authMiddleware, subtopicRoutes);
app.use("/api/questions", authMiddleware, questionRoutes);
app.use("/api/todo", authMiddleware, todoRoutes);
app.use("/api/flashcards", authMiddleware, flashcardRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

module.exports = app;
