import { useCallback, useEffect, useMemo, useState } from "react";
import { RevisionContext } from "./revisionContext";
import {
  getNextDueSimple,
  getNextDueAdaptive,
  snoozeNextDue as snoozeNextDueUtil,
} from "../utils/revisionScheduling";
import { revisionApi } from "../api/client";

const STORAGE_KEY = "qb-revision-items";
const SETTINGS_KEY = "qb-revision-settings";

export const REVISION_CATEGORIES = [
  "JS",
  "Node",
  "MongoDB",
  "React",
  "DSA",
  "CSS",
  "API",
  "Other",
];

export const CONFIDENCE_LEVELS = ["low", "medium", "high"];

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

function generateId() {
  return "rev-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Local date as YYYY-MM-DD (for consistent comparison in user's timezone). */
function getLocalDateStr(dateOrStr) {
  const d = typeof dateOrStr === "string" ? new Date(dateOrStr) : dateOrStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isDueToday(nextDue) {
  if (!nextDue) return false;
  const d = typeof nextDue === "string" ? new Date(nextDue) : nextDue;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/** True if the item's due date (in local time) is today or in the past. */
function isDueTodayOrOverdue(nextDueAt) {
  if (!nextDueAt) return false;
  const localDue = getLocalDateStr(nextDueAt);
  const localToday = getLocalDateStr(new Date());
  return localDue <= localToday;
}

function isOverdue(nextDue) {
  if (!nextDue) return false;
  const d = typeof nextDue === "string" ? new Date(nextDue) : nextDue;
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return d < endOfToday;
}

export function createEmptyRevisionItem(overrides = {}) {
  const now = new Date();
  const nextDue = new Date(now);
  nextDue.setDate(nextDue.getDate() + 1);
  nextDue.setHours(23, 59, 59, 999);
  return {
    id: generateId(),
    title: "",
    notes: "",
    category: "Other",
    tags: [],
    links: [],
    createdAt: now.toISOString(),
    lastRevisedAt: null,
    nextDueAt: nextDue.toISOString(),
    revisionCount: 0,
    confidence: "medium",
    mistakesLog: "",
    keyQuestions: [],
    keyPoints: [],
    ...overrides,
  };
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function RevisionProvider({ children }) {
  const [items, setItemsState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettingsState] = useState({
    reminderTime: "09:00",
    soundOn: true,
    useAdaptiveScheduling: true,
  });

  // Load settings from localStorage only
  useEffect(() => {
    setSettingsState((s) => ({ ...s, ...load(SETTINGS_KEY, {}) }));
  }, []);

  useEffect(() => {
    save(SETTINGS_KEY, settings);
  }, [settings]);

  // Load revision items from API (fallback to localStorage if API fails)
  useEffect(() => {
    let cancelled = false;
    async function loadItems() {
      try {
        const res = await revisionApi.getAll();
        if (cancelled) return;
        const list = safeArray(res?.data);
        setItemsState(list);
      } catch (err) {
        if (cancelled) return;
        setItemsState(safeArray(load(STORAGE_KEY, [])));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadItems();
    return () => { cancelled = true; };
  }, []);

  // Persist to localStorage when items change (backup / offline)
  useEffect(() => {
    if (items.length > 0) save(STORAGE_KEY, items);
  }, [items]);

  const setItems = useCallback((updater) => {
    setItemsState((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  }, []);

  const setSettings = useCallback((updater) => {
    setSettingsState((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  }, []);

  const addRevisionItem = useCallback(async (item) => {
    const payload = {
      title: item.title ?? "Untitled",
      notes: item.notes ?? "",
      category: item.category ?? "Other",
      tags: Array.isArray(item.tags) ? item.tags : [],
      links: Array.isArray(item.links) ? item.links : [],
      keyQuestions: Array.isArray(item.keyQuestions) ? item.keyQuestions : [],
      keyPoints: Array.isArray(item.keyPoints) ? item.keyPoints : [],
      mistakesLog: item.mistakesLog ?? "",
      confidence: item.confidence ?? "medium",
    };
    if (item.nextDueAt) payload.nextDueAt = item.nextDueAt;
    try {
      const res = await revisionApi.create(payload);
      const created = res?.data;
      if (created) setItemsState((prev) => [...prev, created]);
      return created?.id;
    } catch {
      const full = {
        ...createEmptyRevisionItem(),
        ...item,
        id: item.id || generateId(),
      };
      if (!full.nextDueAt) {
        const next = new Date();
        next.setDate(next.getDate() + 1);
        next.setHours(23, 59, 59, 999);
        full.nextDueAt = next.toISOString();
      }
      setItemsState((prev) => [...prev, full]);
      return full.id;
    }
  }, []);

  const updateRevisionItem = useCallback(async (id, updates) => {
    const payload = { ...updates };
    if (payload.nextDueAt && typeof payload.nextDueAt === "string" && payload.nextDueAt.length === 10) {
      const d = new Date(payload.nextDueAt);
      d.setHours(23, 59, 59, 999);
      payload.nextDueAt = d.toISOString();
    }
    try {
      const res = await revisionApi.update(id, payload);
      const updated = res?.data;
      if (updated) {
        setItemsState((prev) =>
          prev.map((it) => (it.id === id ? { ...it, ...updated } : it))
        );
      }
    } catch {
      setItemsState((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...updates } : it))
      );
    }
  }, []);

  const deleteRevisionItem = useCallback(async (id) => {
    try {
      await revisionApi.delete(id);
      setItemsState((prev) => prev.filter((it) => it.id !== id));
    } catch {
      setItemsState((prev) => prev.filter((it) => it.id !== id));
    }
  }, []);

  const getRevisionItem = useCallback(
    (id) => items.find((it) => it.id === id),
    [items]
  );

  /** Mark as revised with optional rating (easy / okay / hard). */
  const markRevised = useCallback(
    async (id, rating = "okay") => {
      const item = items.find((it) => it.id === id);
      if (!item) return;
      try {
        const res = await revisionApi.markRevised(id, rating);
        const updated = res?.data;
        if (updated) {
          setItemsState((prev) =>
            prev.map((it) => (it.id === id ? { ...it, ...updated } : it))
          );
        }
      } catch {
        const now = new Date();
        const count = (item.revisionCount || 0) + 1;
        const useAdaptive = settings.useAdaptiveScheduling !== false;
        const nextDue = useAdaptive
          ? getNextDueAdaptive(item.revisionCount || 0, rating)
          : getNextDueSimple(count);
        const confidenceMap = { easy: "high", okay: "medium", hard: "low" };
        const confidence = confidenceMap[rating] || item.confidence;
        setItemsState((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  lastRevisedAt: now.toISOString(),
                  nextDueAt: nextDue.toISOString(),
                  revisionCount: count,
                  confidence,
                }
              : it
          )
        );
      }
    },
    [items, settings.useAdaptiveScheduling]
  );

  /** Snooze: 1d, 3d, 7d */
  const snooze = useCallback(async (id, option) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    try {
      const res = await revisionApi.snooze(id, option);
      const updated = res?.data;
      if (updated) {
        setItemsState((prev) =>
          prev.map((it) => (it.id === id ? { ...it, ...updated } : it))
        );
      }
    } catch {
      const next = snoozeNextDueUtil(item.nextDueAt, option);
      setItemsState((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, nextDueAt: next.toISOString() } : it
        )
      );
    }
  }, [items]);

  /** Reschedule to exact date (ISO date string YYYY-MM-DD). */
  const reschedule = useCallback(async (id, dateStr) => {
    const d = new Date(dateStr);
    d.setHours(23, 59, 59, 999);
    const nextDueAt = d.toISOString();
    try {
      const res = await revisionApi.update(id, { nextDueAt });
      const updated = res?.data;
      if (updated) {
        setItemsState((prev) =>
          prev.map((it) => (it.id === id ? { ...it, ...updated } : it))
        );
      }
    } catch {
      setItemsState((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, nextDueAt } : it
        )
      );
    }
  }, []);

  // —— Computed: due today (including overdue) — use local date so Revise Today matches Library ——
  const dueTodayItems = useMemo(() => {
    return items.filter((it) => isDueTodayOrOverdue(it.nextDueAt));
  }, [items]);

  const overdueItems = useMemo(
    () => items.filter((it) => it.nextDueAt && isOverdue(it.nextDueAt)),
    [items]
  );

  // —— Stats ——
  const revisedTodayCount = useMemo(() => {
    const today = todayStr();
    return items.filter(
      (it) => it.lastRevisedAt && it.lastRevisedAt.startsWith(today)
    ).length;
  }, [items]);

  const streakDays = useMemo(() => {
    const revisedDates = new Set(
      items
        .map((it) => it.lastRevisedAt)
        .filter(Boolean)
        .map((d) => d.slice(0, 10))
    );
    let streak = 0;
    const today = new Date();
    let d = new Date(today);
    d.setHours(0, 0, 0, 0);
    while (true) {
      const dateStr = d.toISOString().slice(0, 10);
      if (!revisedDates.has(dateStr)) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, [items]);

  const confidenceBreakdown = useMemo(() => {
    const low = items.filter((it) => (it.confidence || "medium") === "low").length;
    const medium = items.filter((it) => (it.confidence || "medium") === "medium").length;
    const high = items.filter((it) => (it.confidence || "medium") === "high").length;
    return { low, medium, high };
  }, [items]);

  const value = {
    items,
    loading,
    setItems,
    settings,
    setSettings,
    addRevisionItem,
    updateRevisionItem,
    deleteRevisionItem,
    getRevisionItem,
    markRevised,
    snooze,
    reschedule,
    dueTodayItems,
    overdueItems,
    revisedTodayCount,
    streakDays,
    confidenceBreakdown,
    isDueToday: (nextDue) => isDueToday(nextDue),
    isOverdue: (nextDue) => isOverdue(nextDue),
  };

  return (
    <RevisionContext.Provider value={value}>{children}</RevisionContext.Provider>
  );
}
