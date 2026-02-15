import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTodo } from "../../context/TodoContext";

function getDaysInMonthView(date) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  const days = [];
  let d = start;
  while (d <= end) {
    days.push(d);
    d = addDays(d, 1);
  }
  return days;
}

export default function TodoCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const { todos } = useTodo();

  const days = useMemo(() => getDaysInMonthView(currentMonth), [currentMonth]);

  const todosByDate = useMemo(() => {
    const map = {};
    todos.forEach((t) => {
      if (!t.dueDate) return;
      const key = t.dueDate;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [todos]);

  const selectedTodos = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return (todosByDate[key] || []).filter((t) => !t.completed);
  }, [selectedDate, todosByDate]);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Calendar
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => setCurrentMonth((d) => subMonths(d, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <span
              className="text-lg font-semibold min-w-[160px] text-center"
              style={{ color: "var(--text-primary)" }}
            >
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--border)" }}>
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                {day}
              </div>
            ))}
          </div>
          <div
            className="grid grid-cols-7 auto-rows-fr"
            style={{ minHeight: 360 }}
          >
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayTodos = todosByDate[key] || [];
              const activeCount = dayTodos.filter((t) => !t.completed).length;
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              return (
                <button
                  key={key}
                  type="button"
                  className="min-h-[80px] p-2 text-left border-b border-r transition-colors hover:bg-[var(--color-surface-50)] dark:hover:bg-[var(--color-surface-800)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent)]"
                  style={{
                    borderColor: "var(--border)",
                    opacity: isCurrentMonth ? 1 : 0.45,
                  }}
                  onClick={() => setSelectedDate(day)}
                >
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium"
                    style={{
                      color: isSelected ? "white" : "var(--text-primary)",
                      background: isSelected ? "var(--accent)" : "transparent",
                    }}
                  >
                    {format(day, "d")}
                  </span>
                  {activeCount > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayTodos
                        .filter((t) => !t.completed)
                        .slice(0, 3)
                        .map((t) => (
                          <div
                            key={t.id}
                            className="text-xs truncate rounded px-1 py-0.5"
                            style={{
                              background: t.colorLabel || "var(--accent-soft)",
                              color: "var(--text-primary)",
                            }}
                          >
                            {t.title}
                          </div>
                        ))}
                      {activeCount > 3 && (
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                          +{activeCount - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 card p-4"
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                {format(selectedDate, "EEEE, MMM d")} — Tasks
              </h3>
              {selectedTodos.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No tasks due this day.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedTodos.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-2 py-2 px-3 rounded-lg"
                      style={{ background: "var(--bg-elevated)" }}
                    >
                      {t.colorLabel && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: t.colorLabel }}
                        />
                      )}
                      <span className="text-sm font-medium flex-1 truncate">
                        {t.title}
                      </span>
                      {t.dueTime && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {t.dueTime}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
