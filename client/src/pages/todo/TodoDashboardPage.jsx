import { useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { ListTodo, ChevronRight } from "lucide-react";
import { useTodo } from "../../context/todoContext";
import DailyRules from "./DailyRules";
import { getPriorityLabel } from "../../utils/todoPriorities";
import ReviseTodayWidget from "../../components/revision/ReviseTodayWidget";
import RevisionProgressWidget from "../../components/revision/RevisionProgressWidget";
import RevisionReminderBanner from "../../components/revision/RevisionReminderBanner";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function isOverdue(todo) {
  if (todo.completed || !todo.dueDate) return false;
  const due = todo.dueTime
    ? new Date(`${todo.dueDate}T${todo.dueTime}`)
    : new Date(todo.dueDate + "T23:59:59");
  return due < new Date();
}

export default function TodoDashboardPage() {
  const navigate = useNavigate();
  const { todos, loading } = useTodo();
  const greeting = getGreeting();

  const handleStartRevisionSession = (item) => {
    navigate(`/todo/revise/session/${item.id}`);
  };

  const todayTodos = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return todos
      .filter((t) => !t.completed && t.dueDate === today)
      .sort((a, b) => {
        const at = a.dueTime ? `${a.dueDate}T${a.dueTime}` : "";
        const bt = b.dueTime ? `${b.dueDate}T${b.dueTime}` : "";
        return at.localeCompare(bt);
      });
  }, [todos]);

  const overdueTodos = useMemo(() => {
    return todos.filter((t) => !t.completed && isOverdue(t));
  }, [todos]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-[var(--color-surface-200)]" />
          <div className="h-4 w-64 rounded bg-[var(--color-surface-200)]" />
          <div className="h-24 rounded-lg bg-[var(--color-surface-200)]" />
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
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          {greeting}
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>

        {/* Revision reminder */}
        <div className="mb-4">
          <RevisionReminderBanner />
        </div>

        {/* Revise Today widget */}
        <ReviseTodayWidget onStartSession={handleStartRevisionSession} />

        {/* Revision stats */}
        <RevisionProgressWidget />

        {/* Daily Rules pinned at top */}
        <section className="mb-8">
          <DailyRules />
        </section>

        {/* Overdue */}
        {overdueTodos.length > 0 && (
          <section className="mb-6">
            <h2
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Overdue
            </h2>
            <ul className="space-y-2">
              {overdueTodos.map((todo) => (
                <motion.li
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card p-3 flex items-center gap-3 border-l-4"
                  style={{
                    borderLeftColor: "var(--color-danger)",
                    background: "var(--bg-card)",
                  }}
                >
                  <span
                    className="badge text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{
                      background: "var(--color-danger)",
                      color: "white",
                    }}
                  >
                    OVERDUE
                  </span>
                  <span
                    className="flex-1 text-sm font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {todo.title}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {todo.dueDate} {todo.dueTime && todo.dueTime}
                  </span>
                  <Link
                    to="/todo/list"
                    className="btn btn-ghost btn-sm btn-icon"
                    title="View in list"
                  >
                    <ChevronRight size={16} />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </section>
        )}

        {/* Today's todos */}
        <section>
          <h2
            className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
            style={{ color: "var(--text-muted)" }}
          >
            <ListTodo size={14} />
            Today&apos;s todos
          </h2>
          {todayTodos.length === 0 ? (
            <div
              className="card p-6 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              <p className="text-sm">No tasks due today.</p>
              <Link to="/todo/list" className="btn btn-primary btn-sm mt-3">
                Add a todo
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {todayTodos.map((todo, idx) => (
                <motion.li
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link
                    to="/todo/list"
                    className="card p-3 flex items-center gap-3 hover:shadow-md transition-shadow block"
                    style={{ textDecoration: "none" }}
                  >
                    {todo.colorLabel && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: todo.colorLabel }}
                      />
                    )}
                    <span
                      className="flex-1 text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {todo.title}
                    </span>
                    {todo.priority && todo.priority !== "P4" && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {getPriorityLabel(todo.priority)}
                      </span>
                    )}
                    {todo.dueTime && (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {todo.dueTime}
                      </span>
                    )}
                    <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </section>
      </motion.div>
    </div>
  );
}
