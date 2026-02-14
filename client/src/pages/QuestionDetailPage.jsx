import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuestion, useQuestions } from "../hooks/useApi";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff,
  BookOpen,
  Tag,
} from "lucide-react";

export default function QuestionDetailPage() {
  const { languageId, questionId } = useParams();
  const navigate = useNavigate();
  const [showAnswer, setShowAnswer] = useState(false);

  const { data: questionData, isLoading } = useQuestion(questionId);
  const question = questionData?.data;

  // Get adjacent questions for navigation
  const { data: adjacentData } = useQuestions({
    languageId,
    sort: "number_asc",
    limit: 999,
  });
  const allQuestions = adjacentData?.data || [];
  const currentIndex = allQuestions.findIndex((q) => q._id === questionId);
  const prevQuestion = currentIndex > 0 ? allQuestions[currentIndex - 1] : null;
  const nextQuestion =
    currentIndex < allQuestions.length - 1
      ? allQuestions[currentIndex + 1]
      : null;

  if (isLoading) {
    return (
      <div className="page-container max-w-3xl mx-auto">
        <div className="skeleton h-4 w-24 mb-4" />
        <div className="skeleton h-8 w-64 mb-4" />
        <div className="skeleton h-6 w-96 mb-6" />
        <div className="card p-6">
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-4/5 mb-2" />
          <div className="skeleton h-4 w-3/5" />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="page-container text-center py-20">
        <BookOpen
          size={48}
          className="mx-auto mb-4"
          style={{ color: "var(--text-muted)" }}
        />
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Question not found
        </h2>
        <Link to={`/study/${languageId}`} className="btn btn-primary mt-4">
          Back to questions
        </Link>
      </div>
    );
  }

  const hasAnswer =
    question.answerText && question.answerText.trim().length > 0;

  return (
    <div className="page-container max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <Link
          to="/"
          className="hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          Home
        </Link>
        <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
        <Link
          to={`/study/${languageId}`}
          className="hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          {question.languageId?.name}
        </Link>
        <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
        <span style={{ color: "var(--text-primary)" }}>
          Q{question.questionNumber}
        </span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span
            className="text-2xl font-bold"
            style={{ color: "var(--accent)" }}
          >
            {question.languageId?.name} — Q{question.questionNumber}
          </span>
        </div>

        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          {question.title}
        </h2>

        {/* Badges */}
        <div className="flex items-center flex-wrap gap-2 mb-6">
          <span className={`badge badge-${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>
          <span className={`badge badge-${question.type.toLowerCase()}`}>
            {question.type}
          </span>
          {question.topicId && (
            <span className="badge-tag">{question.topicId.name}</span>
          )}
          {question.subtopicId && (
            <span className="badge-tag">{question.subtopicId.name}</span>
          )}
        </div>

        {/* Question Text */}
        <div className="card p-6 mb-6">
          <h3
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Question
          </h3>
          <div
            className="text-base leading-relaxed"
            style={{ color: "var(--text-primary)" }}
            dangerouslySetInnerHTML={{ __html: question.questionText }}
          />
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-6">
            <Tag size={14} style={{ color: "var(--text-muted)" }} />
            {question.tags.map((tag) => (
              <span key={tag} className="badge-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Answer */}
        <div className="card mb-6 overflow-hidden">
          <div
            className="flex items-center justify-between p-4"
            style={{
              borderBottom:
                hasAnswer && showAnswer ? "1px solid var(--border)" : "none",
            }}
          >
            <h3
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Answer
            </h3>
            {hasAnswer && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                {showAnswer ? <EyeOff size={14} /> : <Eye size={14} />}
                {showAnswer ? "Hide Answer" : "Reveal Answer"}
              </button>
            )}
          </div>

          {!hasAnswer && (
            <div className="px-4 pb-4">
              <p
                className="text-sm italic"
                style={{ color: "var(--text-muted)" }}
              >
                Answer not added yet.
              </p>
            </div>
          )}

          {hasAnswer && showAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-6"
              style={{ background: "var(--bg-elevated)" }}
            >
              <div
                className="text-base leading-relaxed"
                style={{ color: "var(--text-primary)" }}
                dangerouslySetInnerHTML={{ __html: question.answerText }}
              />
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex gap-2">
            <Link
              to={`/study/${languageId}`}
              className="btn btn-secondary flex-1 sm:flex-initial justify-center"
            >
              <ArrowLeft size={16} /> All Questions
            </Link>
          </div>
          <div className="flex gap-2">
            {prevQuestion && (
              <button
                className="btn btn-secondary flex-1 sm:flex-initial justify-center"
                onClick={() => {
                  setShowAnswer(false);
                  navigate(`/study/${languageId}/question/${prevQuestion._id}`);
                }}
              >
                <ChevronLeft size={16} /> Q{prevQuestion.questionNumber}
              </button>
            )}
            {nextQuestion && (
              <button
                className="btn btn-primary flex-1 sm:flex-initial justify-center"
                onClick={() => {
                  setShowAnswer(false);
                  navigate(`/study/${languageId}/question/${nextQuestion._id}`);
                }}
              >
                Q{nextQuestion.questionNumber} <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
