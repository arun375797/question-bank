import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguages } from "../hooks/useApi";
import { BookOpen, CheckCircle, ArrowRight } from "lucide-react";

const langColors = {
  javascript: { from: "#f7df1e", to: "#e6c300", icon: "🟨" },
  nodejs: { from: "#68a063", to: "#3c873a", icon: "🟩" },
  react: { from: "#61dafb", to: "#00b4d8", icon: "⚛️" },
  mongodb: { from: "#4db33d", to: "#3fa037", icon: "🍃" },
  typescript: { from: "#3178c6", to: "#265da3", icon: "🔷" },
};

const fallbackColor = { from: "#6366f1", to: "#4f46e5", icon: "📘" };

export default function HomePage() {
  const { data, isLoading } = useLanguages();
  const languages = data?.data || [];

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="text-center mb-10 pt-4">
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Domain Question Bank
        </motion.h1>
        <motion.p
          className="text-base max-w-xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          Master your technical knowledge with curated questions across multiple
          domains
        </motion.p>
      </div>

      {/* Language Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-12 w-12 rounded-xl mb-4" />
              <div className="skeleton h-5 w-32 mb-2" />
              <div className="skeleton h-3 w-48 mb-4" />
              <div className="skeleton h-3 w-36" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {languages.map((lang, idx) => {
            const colors = langColors[lang.slug] || fallbackColor;
            const progress =
              lang.totalQuestions > 0
                ? Math.round(
                    (lang.answeredQuestions / lang.totalQuestions) * 100,
                  )
                : 0;

            return (
              <motion.div
                key={lang._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <Link
                  to={`/study/${lang._id}`}
                  className="card block p-6 transition-all duration-200 hover:shadow-lg group"
                  style={{ textDecoration: "none" }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 transition-transform duration-200 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                    }}
                  >
                    <span>{colors.icon}</span>
                  </div>

                  {/* Name */}
                  <h3
                    className="text-lg font-semibold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {lang.name}
                  </h3>

                  {/* Description */}
                  {lang.description && (
                    <p
                      className="text-sm mb-4 line-clamp-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {lang.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <BookOpen size={14} />
                      <span>{lang.totalQuestions} questions</span>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: "var(--color-success)" }}
                    >
                      <CheckCircle size={14} />
                      <span>{lang.answeredQuestions} answered</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="w-full h-1.5 rounded-full mb-3"
                    style={{ background: "var(--color-surface-200)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
                      }}
                    />
                  </div>

                  {/* CTA */}
                  <div
                    className="flex items-center gap-1 text-sm font-medium transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: "var(--accent)" }}
                  >
                    Start studying <ArrowRight size={14} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {!isLoading && languages.length === 0 && (
        <div className="text-center py-20">
          <BookOpen
            size={48}
            className="mx-auto mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No languages yet
          </h3>
          <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
            Get started by adding languages in the Manage section.
          </p>
          <Link to="/manage" className="btn btn-primary">
            Go to Manage
          </Link>
        </div>
      )}
    </div>
  );
}
