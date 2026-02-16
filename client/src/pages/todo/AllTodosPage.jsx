import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Check,
  Circle,
  BookMarked,
} from "lucide-react";
import { useTodo } from "../../context/todoContext";
import { useRevision } from "../../context/revisionContext";
import TodoModal from "./TodoModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import toast from "react-hot-toast";
import { PRIORITY_OPTIONS, priorityOrder, getPriorityLabel, getPriorityColor } from "../../utils/todoPriorities";

const SORT_OPTIONS = [
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
  { value: "created", label: "Created" },
];

export default function AllTodosPage() {
  const { todos, loading, updateTodo, deleteTodo, toggleTodoComplete } = useTodo();
  const { addRevisionItem } = useRevision();
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("active"); // active | completed | all
  const [sortBy, setSortBy] = useState("dueDate");
  const [modalTodo, setModalTodo] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => {
    let list = [...todos];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      );
    }
    if (filterPriority) {
      list = list.filter((t) => t.priority === filterPriority);
    }
    if (filterStatus === "active") list = list.filter((t) => !t.completed);
    else if (filterStatus === "completed") list = list.filter((t) => t.completed);

    if (sortBy === "dueDate") {
      list.sort((a, b) => {
        const ad = a.dueDate ? new Date(a.dueDate + (a.dueTime ? "T" + a.dueTime : "")) : new Date(9e12);
        const bd = b.dueDate ? new Date(b.dueDate + (b.dueTime ? "T" + b.dueTime : "")) : new Date(9e12);
        return ad - bd;
      });
    } else if (sortBy === "priority") {
      list.sort(
        (a, b) =>
          (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    return list;
  }, [todos, search, filterPriority, filterStatus, sortBy]);

  const handleTodoSuccess = (action) => {
    toast.success(action === "created" ? "Todo added" : "Todo updated");
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setDeleteId(null);
      toast.success("Todo deleted");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete todo");
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await toggleTodoComplete(id);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update todo");
    }
  };

  const handleConvertToRevision = async (todo) => {
    try {
      await addRevisionItem({
        title: todo.title || "Untitled",
        notes: todo.notes || "",
        links: Array.isArray(todo.links) ? todo.links.filter((l) => l?.url) : [],
      });
      toast.success("Todo added to Revision Library. You can edit it there.");
    } catch (e) {
      toast.error("Failed to add to Revision Library. Try again.");
    }
  };

  const isOverdue = (todo) => {
    if (todo.completed || !todo.dueDate) return false;
    const due = todo.dueTime
      ? new Date(`${todo.dueDate}T${todo.dueTime}`)
      : new Date(todo.dueDate + "T23:59:59");
    return due < new Date();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 rounded bg-[var(--color-surface-200)]" />
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
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            All Todos
          </h1>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setModalTodo({})}
          >
            <Plus size={18} />
            New todo
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="search"
            className="input pl-10"
            placeholder="Search by title or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters + Sort */}
        <div className="flex flex-wrap gap-2 mb-6">
          <select
            className="select w-auto min-w-[120px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="all">All</option>
          </select>
          <select
            className="select w-auto min-w-[100px]"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            className="select w-auto min-w-[120px]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* List */}
        <ul className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((todo, idx) => (
              <motion.li
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: Math.min(idx * 0.03, 0.2) }}
                className="card p-4"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className="shrink-0 mt-0.5 p-0.5 rounded-full hover:bg-[var(--color-surface-200)] dark:hover:bg-[var(--color-surface-700)] transition-colors"
                    onClick={() => handleToggleComplete(todo.id)}
                    aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {todo.completed ? (
                      <Check size={20} style={{ color: "var(--color-success)" }} />
                    ) : (
                      <Circle size={20} style={{ color: "var(--text-muted)" }} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {todo.colorLabel && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: todo.colorLabel }}
                        />
                      )}
                      <span
                        className="font-medium truncate"
                        style={{
                          color: "var(--text-primary)",
                          textDecoration: todo.completed ? "line-through" : "none",
                          opacity: todo.completed ? 0.7 : 1,
                        }}
                      >
                        {todo.title}
                      </span>
                      {todo.priority && todo.priority !== "P4" && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded"
                          style={{
                            background: getPriorityColor(todo.priority),
                            color: "white",
                          }}
                        >
                          {getPriorityLabel(todo.priority)}
                        </span>
                      )}
                      {isOverdue(todo) && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            background: "var(--color-danger)",
                            color: "white",
                          }}
                        >
                          OVERDUE
                        </span>
                      )}
                    </div>
                    {(todo.dueDate || todo.notes) && (
                      <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
                        {todo.dueDate && (
                          <span>
                            {format(
                              new Date(todo.dueTime ? `${todo.dueDate}T${todo.dueTime}` : todo.dueDate + "T12:00:00"),
                              "MMM d, yyyy" + (todo.dueTime ? " HH:mm" : "")
                            )}
                          </span>
                        )}
                        {todo.notes && (
                          <span className="ml-2 truncate block sm:inline">
                            {todo.notes}
                          </span>
                        )}
                      </p>
                    )}
                    {todo.subtasks?.length > 0 && (
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {todo.subtasks.filter((s) => s.done).length} / {todo.subtasks.length} subtasks
                      </p>
                    )}
                    {todo.links?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {todo.links.filter((l) => l.url).map((l, i) => (
                          <a
                            key={i}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1 text-[var(--accent)] hover:underline"
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
                      className="btn btn-ghost btn-icon"
                      onClick={() => handleConvertToRevision(todo)}
                      title="Convert to Revision Item"
                    >
                      <BookMarked size={16} style={{ color: "var(--accent)" }} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => setModalTodo(todo)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon text-[var(--color-danger)]"
                      onClick={() => setDeleteId(todo.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {filtered.length === 0 && (
          <div
            className="card p-8 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            <p className="mb-3">No todos match your filters.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setModalTodo({})}
            >
              Add your first todo
            </button>
          </div>
        )}
      </motion.div>

      <TodoModal
        isOpen={Boolean(modalTodo)}
        onClose={() => setModalTodo(null)}
        todo={modalTodo || undefined}
        onSuccess={handleTodoSuccess}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId).catch(() => {})}
        title="Delete todo?"
        message="This cannot be undone."
        confirmLabel="Delete"
        danger={true}
      />
    </div>
  );
}
