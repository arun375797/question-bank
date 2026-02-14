import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  useLanguages,
  useQuestions,
  useTopics,
  useSubtopics,
} from "../hooks/useApi";
import { useDebounce } from "../hooks/useDebounce";
import Pagination from "../components/Pagination";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronRight,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];
const TYPE_OPTIONS = ["Theory", "Practical", "Both"];

export default function LanguageQuestionsPage() {
  const { languageId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from URL
  const topicId = searchParams.get("topicId") || "";
  const subtopicId = searchParams.get("subtopicId") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const type = searchParams.get("type") || "";
  const hasAnswer = searchParams.get("hasAnswer") || "";
  const tags = searchParams.get("tags") || "";
  const sort = searchParams.get("sort") || "number_asc";
  const page = parseInt(searchParams.get("page") || "1");
  const searchFromUrl = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const debouncedSearch = useDebounce(searchInput, 300);
  const [showFilters, setShowFilters] = useState(false);

  // Sync debounced search to URL
  useEffect(() => {
    setFilter("search", debouncedSearch);
  }, [debouncedSearch]);

  // Data fetching
  const { data: langData } = useLanguages();
  const languages = langData?.data || [];
  const currentLang = languages.find((l) => l._id === languageId);

  const { data: topicsData } = useTopics(languageId);
  const topics = topicsData?.data || [];

  const { data: subtopicsData } = useSubtopics(topicId || undefined);
  const subtopics = subtopicsData?.data || [];

  const queryParams = useMemo(
    () => ({
      languageId,
      ...(topicId && { topicId }),
      ...(subtopicId && { subtopicId }),
      ...(difficulty && { difficulty }),
      ...(type && { type }),
      ...(hasAnswer && { hasAnswer }),
      ...(tags && { tags }),
      ...(debouncedSearch && { search: debouncedSearch }),
      sort,
      page,
      limit: 20,
    }),
    [
      languageId,
      topicId,
      subtopicId,
      difficulty,
      type,
      hasAnswer,
      tags,
      debouncedSearch,
      sort,
      page,
    ],
  );

  const { data: questionsData, isLoading } = useQuestions(queryParams);
  const questions = questionsData?.data || [];
  const meta = questionsData?.meta;

  const setFilter = (key, value) => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (!value) p.delete(key);
        else p.set(key, value);
        if (key !== "page") p.delete("page");
        return p;
      },
      { replace: true },
    );
  };

  const toggleMultiFilter = (key, val) => {
    const current = searchParams.get(key)?.split(",").filter(Boolean) || [];
    const updated = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    setFilter(key, updated.join(","));
  };

  const clearAll = () => {
    setSearchInput("");
    setSearchParams({}, { replace: true });
  };

  const activeFilterCount = [
    topicId,
    subtopicId,
    difficulty,
    type,
    hasAnswer,
    tags,
  ].filter(Boolean).length;

  // Active filter chips
  const activeChips = [];
  if (topicId) {
    const t = topics.find((t) => t._id === topicId);
    activeChips.push({ key: "topicId", label: `Topic: ${t?.name || topicId}` });
  }
  if (subtopicId) {
    const s = subtopics.find((s) => s._id === subtopicId);
    activeChips.push({
      key: "subtopicId",
      label: `Subtopic: ${s?.name || subtopicId}`,
    });
  }
  if (difficulty) {
    difficulty
      .split(",")
      .forEach((d) =>
        activeChips.push({ key: "difficulty", val: d, label: d }),
      );
  }
  if (type) {
    type
      .split(",")
      .forEach((t) => activeChips.push({ key: "type", val: t, label: t }));
  }
  if (hasAnswer) {
    activeChips.push({
      key: "hasAnswer",
      label: hasAnswer === "true" ? "Has Answer" : "No Answer",
    });
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Link
          to="/"
          className="text-sm hover:underline"
          style={{ color: "var(--text-muted)" }}
        >
          Home
        </Link>
        <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
        <span
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {currentLang?.name || "Questions"}
        </span>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {currentLang?.name || "Questions"}
        </h1>
        {meta && (
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {meta.totalCount} question{meta.totalCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Search + Sort + Filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search questions... (press /)"
            className="input pl-9 pr-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchInput("");
              }
            }}
            id="search-input"
          />
          {searchInput && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
              onClick={() => setSearchInput("")}
            >
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          className="select"
          style={{ width: "auto", minWidth: "180px" }}
          value={sort}
          onChange={(e) => setFilter("sort", e.target.value)}
        >
          <option value="number_asc">Q# Ascending</option>
          <option value="number_desc">Q# Descending</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* Filter toggle */}
        <button
          className={`btn ${showFilters ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white text-indigo-600 font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 mb-4">
          {activeChips.map((chip, i) => (
            <span key={i} className="chip">
              {chip.label}
              <button
                onClick={() => {
                  if (chip.val) toggleMultiFilter(chip.key, chip.val);
                  else setFilter(chip.key, "");
                }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            className="text-xs font-medium hover:underline"
            style={{ color: "var(--accent)" }}
            onClick={clearAll}
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filter sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 260 }}
              exit={{ opacity: 0, width: 0 }}
              className="hidden lg:block shrink-0 overflow-hidden"
            >
              <div className="card p-4 sticky top-4 space-y-5">
                {/* Topic */}
                <div>
                  <label className="label">Topic</label>
                  <select
                    className="select"
                    value={topicId}
                    onChange={(e) => {
                      setFilter("topicId", e.target.value);
                      setFilter("subtopicId", "");
                    }}
                  >
                    <option value="">All Topics</option>
                    {topics.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subtopic */}
                <div>
                  <label className="label">Subtopic</label>
                  <select
                    className="select"
                    value={subtopicId}
                    disabled={!topicId || subtopics.length === 0}
                    onChange={(e) => setFilter("subtopicId", e.target.value)}
                  >
                    <option value="">
                      {!topicId
                        ? "Select topic first"
                        : subtopics.length === 0
                          ? "No subtopics"
                          : "All Subtopics"}
                    </option>
                    {subtopics.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="label">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_OPTIONS.map((d) => {
                      const active = difficulty.split(",").includes(d);
                      return (
                        <button
                          key={d}
                          className={`badge cursor-pointer ${active ? `badge-${d.toLowerCase()}` : ""}`}
                          style={
                            !active
                              ? {
                                  background: "var(--color-surface-100)",
                                  color: "var(--text-secondary)",
                                }
                              : {}
                          }
                          onClick={() => toggleMultiFilter("difficulty", d)}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="label">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_OPTIONS.map((t) => {
                      const active = type.split(",").includes(t);
                      return (
                        <button
                          key={t}
                          className={`badge cursor-pointer ${active ? `badge-${t.toLowerCase()}` : ""}`}
                          style={
                            !active
                              ? {
                                  background: "var(--color-surface-100)",
                                  color: "var(--text-secondary)",
                                }
                              : {}
                          }
                          onClick={() => toggleMultiFilter("type", t)}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Has Answer */}
                <div>
                  <label className="label">Has Answer</label>
                  <select
                    className="select"
                    value={hasAnswer}
                    onChange={(e) => setFilter("hasAnswer", e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <button
                  className="btn btn-secondary w-full btn-sm"
                  onClick={clearAll}
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile filters sheet */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden card p-4 mb-4 space-y-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Topic</label>
                  <select
                    className="select"
                    value={topicId}
                    onChange={(e) => {
                      setFilter("topicId", e.target.value);
                      setFilter("subtopicId", "");
                    }}
                  >
                    <option value="">All</option>
                    {topics.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Subtopic</label>
                  <select
                    className="select"
                    value={subtopicId}
                    disabled={!topicId || subtopics.length === 0}
                    onChange={(e) => setFilter("subtopicId", e.target.value)}
                  >
                    <option value="">
                      {!topicId ? "Select topic first" : "All"}
                    </option>
                    {subtopics.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Has Answer</label>
                  <select
                    className="select"
                    value={hasAnswer}
                    onChange={(e) => setFilter("hasAnswer", e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_OPTIONS.map((d) => {
                  const active = difficulty.split(",").includes(d);
                  return (
                    <button
                      key={d}
                      className={`badge cursor-pointer ${active ? `badge-${d.toLowerCase()}` : ""}`}
                      style={
                        !active
                          ? {
                              background: "var(--color-surface-100)",
                              color: "var(--text-secondary)",
                            }
                          : {}
                      }
                      onClick={() => toggleMultiFilter("difficulty", d)}
                    >
                      {d}
                    </button>
                  );
                })}
                {TYPE_OPTIONS.map((t) => {
                  const active = type.split(",").includes(t);
                  return (
                    <button
                      key={t}
                      className={`badge cursor-pointer ${active ? `badge-${t.toLowerCase()}` : ""}`}
                      style={
                        !active
                          ? {
                              background: "var(--color-surface-100)",
                              color: "var(--text-secondary)",
                            }
                          : {}
                      }
                      onClick={() => toggleMultiFilter("type", t)}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <button
                className="btn btn-secondary btn-sm w-full"
                onClick={clearAll}
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questions list */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton h-4 w-16 mb-2" />
                  <div className="skeleton h-5 w-3/4 mb-2" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen
                size={40}
                className="mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <h3
                className="text-lg font-semibold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                No questions found
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Try adjusting your filters or search term.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {questions.map((q, idx) => (
                  <motion.div
                    key={q._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <Link
                      to={`/study/${languageId}/question/${q._id}`}
                      className="card block p-4 hover:shadow-md transition-all group"
                      style={{ textDecoration: "none" }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="shrink-0 text-lg font-bold tabular-nums"
                          style={{
                            color: "var(--accent)",
                            minWidth: "3rem",
                          }}
                        >
                          Q{q.questionNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-medium mb-1.5 group-hover:text-indigo-600 transition-colors"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {q.title}
                          </h3>
                          <div className="flex items-center flex-wrap gap-2">
                            <span
                              className={`badge badge-${q.difficulty.toLowerCase()}`}
                            >
                              {q.difficulty}
                            </span>
                            <span
                              className={`badge badge-${q.type.toLowerCase()}`}
                            >
                              {q.type}
                            </span>
                            {q.topicId && (
                              <span className="badge-tag">
                                {q.topicId.name}
                              </span>
                            )}
                            {q.subtopicId && (
                              <span className="badge-tag">
                                {q.subtopicId.name}
                              </span>
                            )}
                            {q.answerText && (
                              <span
                                className="flex items-center gap-1 text-xs"
                                style={{ color: "var(--color-success)" }}
                              >
                                <CheckCircle2 size={12} /> Answered
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          size={16}
                          className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "var(--text-muted)" }}
                        />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <Pagination
            meta={meta}
            onPageChange={(p) => setFilter("page", p.toString())}
          />
        </div>
      </div>
    </div>
  );
}

// Keyboard shortcut for search
if (typeof window !== "undefined") {
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "/" &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
    ) {
      e.preventDefault();
      document.getElementById("search-input")?.focus();
    }
  });
}
