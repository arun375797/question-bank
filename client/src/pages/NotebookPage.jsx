import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTheme } from "../hooks/useTheme";
import {
  useLanguages,
  useQuestions,
  useTopics,
  useSubtopics,
  useUpdateQuestion,
} from "../hooks/useApi";
import {
  ChevronLeft,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  Save,
  SlidersHorizontal,
  Pencil,
  Eye,
  BookText,
  Undo2,
  Redo2,
  BookOpen,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Toolbar Button
   ───────────────────────────────────────────── */
function ToolbarBtn({ onClick, icon: Icon, label, children }) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="toolbar-btn"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: "0.375rem",
        background: "transparent",
        color: "var(--text-secondary)",
        border: "none",
        cursor: "pointer",
        transition: "all 150ms",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--accent-soft)";
        e.currentTarget.style.color = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {Icon ? <Icon size={16} /> : children}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <div
      style={{
        width: 1,
        height: 20,
        background: "var(--border)",
        margin: "0 0.25rem",
        flexShrink: 0,
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Rich Text Toolbar
   ───────────────────────────────────────────── */
function RichTextToolbar({ onSave, hasChanges, saving, isDark }) {
  const exec = (cmd, val = null) => document.execCommand(cmd, false, val);
  const highlightColor = isDark ? "rgba(250, 204, 21, 0.35)" : "#fef08a";

  return (
    <div
      className="flex items-center gap-0.5 overflow-x-auto"
      style={{
        padding: "0.5rem 0.75rem",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        borderRadius: "0.75rem 0.75rem 0 0",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Text Formatting */}
      <ToolbarBtn
        icon={Bold}
        label="Bold (Ctrl+B)"
        onClick={() => exec("bold")}
      />
      <ToolbarBtn
        icon={Italic}
        label="Italic (Ctrl+I)"
        onClick={() => exec("italic")}
      />
      <ToolbarBtn
        icon={Underline}
        label="Underline (Ctrl+U)"
        onClick={() => exec("underline")}
      />
      <ToolbarBtn
        icon={Strikethrough}
        label="Strikethrough"
        onClick={() => exec("strikeThrough")}
      />

      <ToolbarDivider />

      {/* Font Size */}
      <ToolbarBtn
        label="Increase font size"
        onClick={() => exec("fontSize", "5")}
      >
        <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>
          A<span style={{ fontSize: 8, verticalAlign: "super" }}>▲</span>
        </span>
      </ToolbarBtn>
      <ToolbarBtn
        label="Decrease font size"
        onClick={() => exec("fontSize", "2")}
      >
        <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>
          A<span style={{ fontSize: 8, verticalAlign: "sub" }}>▼</span>
        </span>
      </ToolbarBtn>

      <ToolbarDivider />

      {/* Highlight */}
      <ToolbarBtn
        icon={Highlighter}
        label="Highlight text"
        onClick={() => exec("hiliteColor", highlightColor)}
      />

      {/* Lists */}
      <ToolbarBtn
        icon={List}
        label="Bullet list"
        onClick={() => exec("insertUnorderedList")}
      />
      <ToolbarBtn
        icon={ListOrdered}
        label="Numbered list"
        onClick={() => exec("insertOrderedList")}
      />

      <ToolbarDivider />

      {/* Undo/Redo */}
      <ToolbarBtn
        icon={Undo2}
        label="Undo (Ctrl+Z)"
        onClick={() => exec("undo")}
      />
      <ToolbarBtn
        icon={Redo2}
        label="Redo (Ctrl+Y)"
        onClick={() => exec("redo")}
      />

      {/* Save Button */}
      <div className="flex-1" style={{ minWidth: 8 }} />
      {hasChanges && (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onMouseDown={(e) => {
            e.preventDefault();
            onSave();
          }}
          disabled={saving}
          className="btn btn-primary btn-sm"
          style={{
            height: 32,
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <Save size={14} />
          {saving ? "Saving…" : "Save"}
        </motion.button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page Flip Variants
   ───────────────────────────────────────────── */
const pageVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir) => ({
    x: dir > 0 ? -200 : 200,
    opacity: 0,
  }),
};

/* ─────────────────────────────────────────────
   NotebookPage
   ───────────────────────────────────────────── */
export default function NotebookPage() {
  const { isDark } = useTheme();

  // ─── State ───
  const [selectedLangId, setSelectedLangId] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [subtopicFilter, setSubtopicFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [direction, setDirection] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  // ─── Data ───
  const { data: langData } = useLanguages();
  const languages = langData?.data || [];
  const effectiveLangId = selectedLangId || languages[0]?._id || "";

  const { data: topicsData } = useTopics(effectiveLangId);
  const topics = topicsData?.data || [];

  const { data: subtopicsData } = useSubtopics(topicFilter || undefined);
  const subtopics = subtopicsData?.data || [];

  const queryParams = useMemo(
    () => ({
      languageId: effectiveLangId || undefined,
      ...(topicFilter && { topicId: topicFilter }),
      ...(subtopicFilter && { subtopicId: subtopicFilter }),
      ...(difficultyFilter && { difficulty: difficultyFilter }),
      sort: "number_asc",
      limit: 999,
    }),
    [effectiveLangId, topicFilter, subtopicFilter, difficultyFilter],
  );

  const { data: questionsData, isLoading } = useQuestions(queryParams);
  const questions = questionsData?.data || [];
  const totalPages = questions.length;
  const currentQuestion = questions[currentPage] || null;

  const updateMut = useUpdateQuestion();

  // ─── Refs ───
  const questionRef = useRef(null);
  const answerRef = useRef(null);

  // ─── Sync content when question changes ───
  useEffect(() => {
    if (currentQuestion) {
      setEditTitle(currentQuestion.title || "");
      if (questionRef.current) {
        questionRef.current.innerHTML = currentQuestion.questionText || "";
      }
      if (answerRef.current) {
        answerRef.current.innerHTML =
          currentQuestion.answerText ||
          '<span style="color: var(--text-muted); font-style: italic;">Click Edit to add an answer…</span>';
      }
      setHasChanges(false);
    }
  }, [currentQuestion?._id]);

  // ─── Save ───
  const saveChanges = async () => {
    if (!currentQuestion || !hasChanges) return;
    const qText = questionRef.current?.innerHTML || "";
    const aText = answerRef.current?.innerHTML || "";
    try {
      await updateMut.mutateAsync({
        id: currentQuestion._id,
        data: {
          title: editTitle,
          questionText: qText,
          answerText: aText,
        },
      });
      toast.success("Saved!");
      setHasChanges(false);
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  // ─── Navigate ───
  const navigateTo = async (idx) => {
    if (idx < 0 || idx >= totalPages) return;
    if (hasChanges) {
      await saveChanges();
    }
    setDirection(idx > currentPage ? 1 : -1);
    setCurrentPage(idx);
  };

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && isEditing) {
        e.preventDefault();
        saveChanges();
        return;
      }
      // Arrow keys to navigate (only when not editing)
      if (
        !isEditing &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName,
        )
      ) {
        if (e.key === "ArrowLeft" && currentPage > 0) {
          e.preventDefault();
          navigateTo(currentPage - 1);
        }
        if (e.key === "ArrowRight" && currentPage < totalPages - 1) {
          e.preventDefault();
          navigateTo(currentPage + 1);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isEditing, currentPage, totalPages, hasChanges]);

  // ─── Reset page when filters change ───
  useEffect(() => {
    setCurrentPage(0);
  }, [effectiveLangId, topicFilter, subtopicFilter, difficultyFilter]);

  // ─── Paper background ───
  const paperBg = isDark ? "var(--bg-card)" : "#fefcf7";
  const ruledLines = isDark
    ? "repeating-linear-gradient(transparent, transparent 31px, rgba(255,255,255,0.03) 31px, rgba(255,255,255,0.03) 32px)"
    : "repeating-linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.04) 31px, rgba(0,0,0,0.04) 32px)";

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: "var(--accent-soft)" }}
            >
              <BookText size={22} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Notebook
              </h1>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                One question per page · Edit with rich text
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="select"
              style={{ width: "auto", minWidth: 140 }}
              value={effectiveLangId}
              onChange={(e) => {
                setSelectedLangId(e.target.value);
                setTopicFilter("");
                setSubtopicFilter("");
                setIsEditing(false);
              }}
            >
              {languages.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                </option>
              ))}
            </select>
            <button
              className={`btn ${showFilters ? "btn-primary" : "btn-secondary"} btn-sm`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline ml-1">Filters</span>
            </button>
          </div>
        </div>

        {/* ─── Filters ─── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div className="card p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="label">Topic</label>
                    <select
                      className="select"
                      value={topicFilter}
                      onChange={(e) => {
                        setTopicFilter(e.target.value);
                        setSubtopicFilter("");
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
                  <div>
                    <label className="label">Subtopic</label>
                    <select
                      className="select"
                      value={subtopicFilter}
                      disabled={!topicFilter || subtopics.length === 0}
                      onChange={(e) => setSubtopicFilter(e.target.value)}
                    >
                      <option value="">
                        {!topicFilter
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
                  <div>
                    <label className="label">Difficulty</label>
                    <select
                      className="select"
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Content ─── */}
        {isLoading ? (
          <div className="card" style={{ minHeight: 400 }}>
            <div className="p-8">
              <div className="skeleton h-6 w-20 mb-4" />
              <div className="skeleton h-8 w-3/4 mb-6" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-5/6 mb-2" />
              <div className="skeleton h-4 w-4/6 mb-6" />
              <div className="skeleton h-px w-full mb-6" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="card p-12 text-center" style={{ minHeight: 300 }}>
            <BookOpen
              size={48}
              className="mx-auto mb-4"
              style={{ color: "var(--text-muted)" }}
            />
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No questions found
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              {topicFilter || subtopicFilter || difficultyFilter
                ? "Try adjusting your filters"
                : "Add questions from the Manage page to get started"}
            </p>
          </div>
        ) : (
          <>
            {/* ─── Notebook ─── */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border: "1px solid var(--border)",
                boxShadow: isDark
                  ? "0 8px 32px rgba(0,0,0,0.4)"
                  : "0 8px 32px rgba(0,0,0,0.08)",
              }}
            >
              {/* Toolbar */}
              {isEditing && (
                <RichTextToolbar
                  onSave={saveChanges}
                  hasChanges={hasChanges}
                  saving={updateMut.isPending}
                  isDark={isDark}
                />
              )}

              {/* Page */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentQuestion?._id}
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <div
                    style={{
                      background: paperBg,
                      backgroundImage: ruledLines,
                      minHeight: 480,
                      padding: "1.5rem 1.5rem 3rem 1.5rem",
                      borderLeft: `4px solid var(--accent)`,
                      position: "relative",
                    }}
                    className="sm:p-8 sm:pb-12"
                  >
                    {/* Edit/View Toggle */}
                    <button
                      onClick={() => {
                        if (isEditing && hasChanges) saveChanges();
                        setIsEditing(!isEditing);
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        zIndex: 2,
                      }}
                    >
                      {isEditing ? <Eye size={14} /> : <Pencil size={14} />}
                      <span className="ml-1">
                        {isEditing ? "View" : "Edit"}
                      </span>
                    </button>

                    {/* Question Number */}
                    <div className="mb-3">
                      <span
                        className="text-sm font-bold uppercase tracking-wider"
                        style={{ color: "var(--accent)" }}
                      >
                        Question {currentQuestion.questionNumber}
                      </span>
                    </div>

                    {/* Title */}
                    {isEditing ? (
                      <input
                        className="input text-xl font-semibold mb-4"
                        value={editTitle}
                        onChange={(e) => {
                          setEditTitle(e.target.value);
                          setHasChanges(true);
                        }}
                        style={{ fontSize: "1.25rem" }}
                      />
                    ) : (
                      <h2
                        className="text-xl font-semibold mb-4"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {currentQuestion.title}
                      </h2>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      <span
                        className={`badge badge-${currentQuestion.difficulty.toLowerCase()}`}
                      >
                        {currentQuestion.difficulty}
                      </span>
                      <span
                        className={`badge badge-${currentQuestion.type.toLowerCase()}`}
                      >
                        {currentQuestion.type}
                      </span>
                      {currentQuestion.topicId && (
                        <span className="badge-tag">
                          {currentQuestion.topicId.name}
                        </span>
                      )}
                      {currentQuestion.subtopicId && (
                        <span className="badge-tag">
                          {currentQuestion.subtopicId.name}
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <hr
                      style={{
                        border: "none",
                        borderTop: `2px solid var(--accent)`,
                        opacity: 0.3,
                        marginBottom: "1.5rem",
                      }}
                    />

                    {/* Question Text */}
                    <div className="mb-6">
                      <label
                        className="text-xs font-bold uppercase tracking-wider mb-2 block"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Question
                      </label>
                      <div
                        ref={questionRef}
                        contentEditable={isEditing}
                        onInput={() => setHasChanges(true)}
                        className="outline-none"
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "0.9375rem",
                          lineHeight: 1.8,
                          minHeight: isEditing ? 80 : "auto",
                          padding: isEditing ? "0.75rem 1rem" : 0,
                          borderRadius: isEditing ? "0.5rem" : 0,
                          border: isEditing
                            ? "1px solid var(--border)"
                            : "none",
                          background: isEditing
                            ? isDark
                              ? "rgba(0,0,0,0.2)"
                              : "rgba(255,255,255,0.7)"
                            : "transparent",
                          transition: "all 200ms",
                        }}
                        suppressContentEditableWarning
                      />
                    </div>

                    {/* Divider */}
                    <hr
                      style={{
                        border: "none",
                        borderTop: "1px dashed var(--border)",
                        marginBottom: "1.5rem",
                      }}
                    />

                    {/* Answer Text */}
                    <div>
                      <label
                        className="text-xs font-bold uppercase tracking-wider mb-2 block"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Answer
                      </label>
                      <div
                        ref={answerRef}
                        contentEditable={isEditing}
                        onInput={() => setHasChanges(true)}
                        className="outline-none"
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "0.9375rem",
                          lineHeight: 1.8,
                          minHeight: isEditing ? 150 : "auto",
                          padding: isEditing ? "0.75rem 1rem" : 0,
                          borderRadius: isEditing ? "0.5rem" : 0,
                          border: isEditing
                            ? "1px solid var(--border)"
                            : "none",
                          background: isEditing
                            ? isDark
                              ? "rgba(0,0,0,0.2)"
                              : "rgba(255,255,255,0.7)"
                            : "transparent",
                          transition: "all 200ms",
                        }}
                        suppressContentEditableWarning
                      />
                    </div>

                    {/* Page Fold Decoration */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 36,
                        height: 36,
                        background: isDark
                          ? "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.04) 50%)"
                          : "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.04) 50%)",
                      }}
                    />

                    {/* Page Number */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0.75rem",
                        left: "50%",
                        transform: "translateX(-50%)",
                        color: "var(--text-muted)",
                        fontSize: "0.75rem",
                        fontStyle: "italic",
                      }}
                    >
                      Page {currentPage + 1} of {totalPages}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ─── Page Navigation ─── */}
            <div className="flex items-center justify-between mt-5 gap-3">
              <button
                className="btn btn-secondary flex items-center gap-1.5"
                disabled={currentPage === 0}
                onClick={() => navigateTo(currentPage - 1)}
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Jump */}
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Page
                </span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage + 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= totalPages) {
                      navigateTo(val - 1);
                    }
                  }}
                  className="input text-center"
                  style={{
                    width: 56,
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.875rem",
                  }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  of {totalPages}
                </span>
              </div>

              <button
                className="btn btn-primary flex items-center gap-1.5"
                disabled={currentPage >= totalPages - 1}
                onClick={() => navigateTo(currentPage + 1)}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
