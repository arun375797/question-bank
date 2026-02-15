import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { todoApi } from "../api/client";

const STORAGE_KEYS = {
  settings: "qb-todo-settings",
  hasSeeded: "qb-todo-has-seeded",
};

const LABEL_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const DEMO_RULES = [
  { text: "Review top 3 priorities before starting work", order: 0 },
  { text: "No social media before noon", order: 1 },
  { text: "One deep focus block of 25+ minutes daily", order: 2 },
];

const DEMO_TODOS = [
  {
    title: "Complete project proposal",
    priority: "P1",
    colorLabel: "#ef4444",
    dueDate: new Date().toISOString().slice(0, 10),
    dueTime: "17:00",
    notes: "Send to team for review.",
    links: [{ label: "Doc", url: "https://example.com/doc" }],
    subtasks: [
      { id: "s1", text: "Outline sections", done: true },
      { id: "s2", text: "Draft intro", done: false },
    ],
    completed: false,
  },
  {
    title: "Daily standup",
    priority: "P2",
    colorLabel: "#3b82f6",
    dueDate: new Date().toISOString().slice(0, 10),
    dueTime: "09:30",
    notes: "",
    links: [],
    subtasks: [],
    completed: false,
  },
];

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return fallback;
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

const TodoContext = createContext(null);

export function TodoProvider({ children }) {
  const [rules, setRulesState] = useState([]);
  const [todos, setTodosState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettingsState] = useState({
    theme: "calm",
    font: "Inter",
    textColorOverride: null,
    backgroundImage: null,
    overlayDim: 0,
    overlayBlur: 0,
    focusMinutes: 25,
    breakMinutes: 5,
    alarmSound: "bell",
    totalFocusGoalMinutes: 120,
  });

  // Load settings from localStorage only
  useEffect(() => {
    setSettingsState((s) => ({ ...s, ...load(STORAGE_KEYS.settings, {}) }));
  }, []);

  useEffect(() => {
    save(STORAGE_KEYS.settings, settings);
  }, [settings]);

  // Load rules and todos from API (with fallback to localStorage if API fails)
  useEffect(() => {
    let cancelled = false;

    async function loadFromApi() {
      try {
        const [rulesRes, todosRes] = await Promise.all([
          todoApi.getRules(),
          todoApi.getTodos(),
        ]);
        if (cancelled) return;
        const rulesList = rulesRes?.data ?? [];
        const todosList = todosRes?.data ?? [];
        const hasSeeded = load(STORAGE_KEYS.hasSeeded, false);

        if (rulesList.length === 0 && todosList.length === 0 && !hasSeeded) {
          for (const r of DEMO_RULES) {
            await todoApi.createRule(r);
          }
          for (const t of DEMO_TODOS) {
            await todoApi.createTodo(t);
          }
          save(STORAGE_KEYS.hasSeeded, true);
          const [rulesRes2, todosRes2] = await Promise.all([
            todoApi.getRules(),
            todoApi.getTodos(),
          ]);
          if (cancelled) return;
          setRulesState(rulesRes2?.data ?? []);
          setTodosState(todosRes2?.data ?? []);
        } else {
          setRulesState(rulesList);
          setTodosState(todosList);
        }
      } catch (_) {
        if (cancelled) return;
        const storedRules = load("qb-todo-rules", []);
        const storedTodos = load("qb-todo-todos", []);
        setRulesState(storedRules);
        setTodosState(storedTodos);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFromApi();
    return () => { cancelled = true; };
  }, []);

  const setRules = useCallback((updater) => {
    setRulesState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  }, []);

  const setTodos = useCallback((updater) => {
    setTodosState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  }, []);

  const setSettings = useCallback((updater) => {
    setSettingsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  }, []);

  const addRule = useCallback(async (text) => {
    try {
      const order = rules.length;
      const res = await todoApi.createRule({ text, order });
      const created = res?.data;
      if (created) setRulesState((prev) => [...prev, created]);
      return created?.id;
    } catch (err) {
      throw err;
    }
  }, [rules.length]);

  const updateRule = useCallback(async (id, text) => {
    try {
      const res = await todoApi.updateRule(id, { text });
      const updated = res?.data;
      if (updated) {
        setRulesState((prev) =>
          prev.map((r) => (r.id === id ? { ...r, text: updated.text } : r))
        );
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteRule = useCallback(async (id) => {
    try {
      await todoApi.deleteRule(id);
      setRulesState((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  const reorderRules = useCallback(async (fromIndex, toIndex) => {
    const sorted = [...rules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const [removed] = sorted.splice(fromIndex, 1);
    sorted.splice(toIndex, 0, removed);
    const order = sorted.map((r) => r.id);
    try {
      const res = await todoApi.reorderRules(order);
      const data = res?.data;
      if (data) setRulesState(data);
    } catch (err) {
      throw err;
    }
  }, [rules]);

  const addTodo = useCallback(async (todo) => {
    try {
      const payload = {
        title: todo.title || "Untitled",
        priority: todo.priority ?? "P4",
        colorLabel: todo.colorLabel ?? null,
        dueDate: todo.dueDate ?? null,
        dueTime: todo.dueTime ?? null,
        notes: todo.notes ?? "",
        links: Array.isArray(todo.links) ? todo.links : [],
        subtasks: Array.isArray(todo.subtasks) ? todo.subtasks : [],
        completed: false,
      };
      const res = await todoApi.createTodo(payload);
      const created = res?.data;
      if (created) setTodosState((prev) => [...prev, created]);
      return created?.id;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateTodo = useCallback(async (id, updates) => {
    try {
      const res = await todoApi.updateTodo(id, updates);
      const updated = res?.data;
      if (updated) {
        setTodosState((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
        );
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteTodo = useCallback(async (id) => {
    try {
      await todoApi.deleteTodo(id);
      setTodosState((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  const toggleTodoComplete = useCallback(async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      await todoApi.updateTodo(id, { completed: !todo.completed });
      setTodosState((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (err) {
      throw err;
    }
  }, [todos]);

  const sortedRules = [...rules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <TodoContext.Provider
      value={{
        rules: sortedRules,
        todos,
        settings,
        loading,
        setRules,
        setTodos,
        setSettings,
        addRule,
        updateRule,
        deleteRule,
        reorderRules,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodoComplete,
        LABEL_COLORS,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodo must be used within TodoProvider");
  return ctx;
}
