import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Play,
  ExternalLink,
  BookMarked,
} from "lucide-react";
import { useRevision } from "../../context/revisionContext";
import { REVISION_CATEGORIES, CONFIDENCE_LEVELS } from "../../context/RevisionContext.jsx";
import RevisionItemModal from "../../components/revision/RevisionItemModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import toast from "react-hot-toast";

const SORT_OPTIONS = [
  { value: "nextDue", label: "Next due date" },
  { value: "overdue", label: "Most overdue" },
  { value: "leastRevised", label: "Least revised" },
  { value: "lowestConfidence", label: "Lowest confidence" },
];

export default function RevisionLibraryPage() {
  const navigate = useNavigate();
  const {
    items,
    loading,
    deleteRevisionItem,
    dueTodayItems,
    overdueItems,
    isOverdue,
    isDueToday,
  } = useRevision();
  const [search, setSearch] = useState("");
  const [filterDue, setFilterDue] = useState(""); // '' | 'today' | 'overdue'
  const [filterConfidence, setFilterConfidence] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("nextDue");
  const [modalItem, setModalItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => {
    let list = [...items];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (it) =>
          (it.title && it.title.toLowerCase().includes(q)) ||
          (it.notes && it.notes.toLowerCase().includes(q)) ||
          (Array.isArray(it.tags) && it.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    if (filterDue === "today") {
      list = list.filter((it) => it.nextDueAt && isDueToday(it.nextDueAt));
    } else if (filterDue === "overdue") {
      list = list.filter((it) => it.nextDueAt && isOverdue(it.nextDueAt));
    }
    if (filterConfidence) {
      list = list.filter((it) => (it.confidence || "medium") === filterConfidence);
    }
    if (filterCategory) {
      list = list.filter((it) => (it.category || "") === filterCategory);
    }
    if (sortBy === "nextDue") {
      list.sort((a, b) => {
        const ad = a.nextDueAt ? new Date(a.nextDueAt) : new Date(9e12);
        const bd = b.nextDueAt ? new Date(b.nextDueAt) : new Date(9e12);
        return ad - bd;
      });
    } else if (sortBy === "overdue") {
      list.sort((a, b) => {
        const ad = a.nextDueAt ? new Date(a.nextDueAt) : new Date(9e12);
        const bd = b.nextDueAt ? new Date(b.nextDueAt) : new Date(9e12);
        return ad - bd; // earliest first = most overdue first
      });
    } else if (sortBy === "leastRevised") {
      list.sort((a, b) => (a.revisionCount || 0) - (b.revisionCount || 0));
    } else if (sortBy === "lowestConfidence") {
      const order = { low: 0, medium: 1, high: 2 };
      list.sort(
        (a, b) =>
          (order[a.confidence] ?? 1) - (order[b.confidence] ?? 1)
      );
    }
    return list;
  }, [
    items,
    search,
    filterDue,
    filterConfidence,
    filterCategory,
    sortBy,
    isDueToday,
    isOverdue,
  ]);

  const handleDelete = (id) => {
    deleteRevisionItem(id);
    setDeleteId(null);
    toast.success("Revision item deleted");
  };

  const handleStartSession = (item) => {
    navigate(`/todo/revise/session/${item.id}`);
  };

  const handleSuccess = (action) => {
    toast.success(action === "created" ? "Revision item added" : "Revision item updated");
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-[var(--color-surface-200)]" />
          <div className="h-10 w-full max-w-md rounded bg-[var(--color-surface-200)]" />
          <div className="h-20 rounded-lg bg-[var(--color-surface-200)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <BookMarked size={28} />
            Revision Library
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate("/todo/revise")}
            >
              Revise Today
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setModalItem({})}
            >
              <Plus size={18} />
              New revision item
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="search"
            className="input pl-10"
            placeholder="Search by title, notes, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <select
            className="select w-auto min-w-[120px]"
            value={filterDue}
            onChange={(e) => setFilterDue(e.target.value)}
          >
            <option value="">All</option>
            <option value="today">Due today</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            className="select w-auto min-w-[100px]"
            value={filterConfidence}
            onChange={(e) => setFilterConfidence(e.target.value)}
          >
            <option value="">All confidence</option>
            {CONFIDENCE_LEVELS.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="select w-auto min-w-[100px]"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {REVISION_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="select w-auto min-w-[140px]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <ul className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, idx) => {
              const overdue = item.nextDueAt && isOverdue(item.nextDueAt);
              const dueToday = item.nextDueAt && isDueToday(item.nextDueAt);
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.2) }}
                  className="card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className="font-medium truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.title || "Untitled"}
                        </span>
                        {overdue && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded"
                            style={{
                              background: "var(--color-danger)",
                              color: "white",
                            }}
                          >
                            OVERDUE
                          </span>
                        )}
                        {dueToday && !overdue && (
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded"
                            style={{
                              background: "var(--accent)",
                              color: "white",
                            }}
                          >
                            Due today
                          </span>
                        )}
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ background: "var(--bg-elevated)" }}
                        >
                          {item.category || "—"}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded capitalize"
                          style={{
                            background:
                              item.confidence === "high"
                                ? "var(--color-success)"
                                : item.confidence === "low"
                                  ? "var(--color-danger)"
                                  : "var(--color-warning)",
                            color: "white",
                          }}
                        >
                          {item.confidence || "medium"}
                        </span>
                      </div>
                      <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
                        Last:{" "}
                        {item.lastRevisedAt
                          ? format(new Date(item.lastRevisedAt), "MMM d, yyyy")
                          : "Never"}{" "}
                        · Next:{" "}
                        {item.nextDueAt
                          ? format(new Date(item.nextDueAt), "MMM d, yyyy")
                          : "—"}{" "}
                        · Revised {item.revisionCount || 0}×
                      </p>
                      {item.links?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.links.filter((l) => l.url).slice(0, 3).map((l, i) => (
                            <a
                              key={i}
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1"
                              style={{ color: "var(--accent)" }}
                            >
                              {l.label || "Link"} <ExternalLink size={10} />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm flex items-center gap-1"
                        onClick={() => handleStartSession(item)}
                        title="Start revision"
                      >
                        <Play size={14} />
                        Start
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        onClick={() => setModalItem(item)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon text-[var(--color-danger)]"
                        onClick={() => setDeleteId(item.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {filtered.length === 0 && (
          <div
            className="card p-8 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            <p className="mb-3">No revision items match your filters.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setModalItem({})}
            >
              Add your first revision item
            </button>
          </div>
        )}
      </motion.div>

      <RevisionItemModal
        isOpen={Boolean(modalItem)}
        onClose={() => setModalItem(null)}
        item={modalItem || undefined}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete revision item?"
        message="This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
