import { useCallback, useEffect, useState } from "react";
import { TodoContext } from "./todoContext";
import { todoApi } from "../api/client";

const STORAGE_KEYS = {
  settings: "qb-todo-settings",
};

const LABEL_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return fallback;
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

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

    function safeArray(value) {
      return Array.isArray(value) ? value : [];
    }

    async function loadFromApi() {
      try {
        const [rulesRes, todosRes] = await Promise.all([
          todoApi.getRules(),
          todoApi.getTodos(),
        ]);
        if (cancelled) return;
        const rulesList = safeArray(rulesRes?.data);
        const todosList = safeArray(todosRes?.data);
        setRulesState(rulesList);
        setTodosState(todosList);
      } catch {
        if (cancelled) return;
        setRulesState(safeArray(load("qb-todo-rules", [])));
        setTodosState(safeArray(load("qb-todo-todos", [])));
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
    const order = rules.length;
    const res = await todoApi.createRule({ text, order });
    const created = res?.data;
    if (created) setRulesState((prev) => [...prev, created]);
    return created?.id;
  }, [rules.length]);

  const updateRule = useCallback(async (id, text) => {
    const res = await todoApi.updateRule(id, { text });
    const updated = res?.data;
    if (updated) {
      setRulesState((prev) =>
        prev.map((r) => (r.id === id ? { ...r, text: updated.text } : r))
      );
    }
  }, []);

  const deleteRule = useCallback(async (id) => {
    await todoApi.deleteRule(id);
    setRulesState((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const reorderRules = useCallback(async (fromIndex, toIndex) => {
    const sorted = [...rules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const [removed] = sorted.splice(fromIndex, 1);
    sorted.splice(toIndex, 0, removed);
    const order = sorted.map((r) => r.id);
    const res = await todoApi.reorderRules(order);
    const data = res?.data;
    if (Array.isArray(data)) setRulesState(data);
  }, [rules]);

  const addTodo = useCallback(async (todo) => {
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
  }, []);

  const updateTodo = useCallback(async (id, updates) => {
    const res = await todoApi.updateTodo(id, updates);
    const updated = res?.data;
    if (updated) {
      setTodosState((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
      );
    }
  }, []);

  const deleteTodo = useCallback(async (id) => {
    await todoApi.deleteTodo(id);
    setTodosState((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTodoComplete = useCallback(async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    await todoApi.updateTodo(id, { completed: !todo.completed });
    setTodosState((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
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
