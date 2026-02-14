import { Link } from "react-router-dom";
import { useLanguages } from "../hooks/useApi";
import { ArrowRight, BookOpen } from "lucide-react";

export default function StudyIndexPage() {
  const { data, isLoading } = useLanguages();
  const languages = data?.data || [];

  return (
    <div className="page-container">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        Study
      </h1>
      <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
        Select a language to browse its questions.
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <div className="skeleton h-8 w-24" />
              <div className="skeleton h-4 w-48 flex-1" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {languages.map((lang) => (
            <Link
              key={lang._id}
              to={`/study/${lang._id}`}
              className="card flex items-center justify-between p-4 group hover:shadow-md transition-all"
              style={{ textDecoration: "none" }}
            >
              <div className="flex items-center gap-3">
                <BookOpen
                  size={18}
                  style={{ color: "var(--color-primary-500)" }}
                />
                <span
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {lang.name}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {lang.totalQuestions} questions
                </span>
              </div>
              <ArrowRight
                size={16}
                style={{ color: "var(--text-muted)" }}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
