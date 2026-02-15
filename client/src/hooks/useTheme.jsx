import { createContext, useContext, useEffect, useState } from "react";

export const THEMES = [
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep dark with indigo accents",
    preview: { bg: "#0f172a", card: "#1e293b", accent: "#6366f1" },
  },
  {
    id: "calm",
    name: "Calm",
    description: "Soft purple, relaxed",
    preview: { bg: "#1e1b2e", card: "#2d2a3e", accent: "#a78bfa" },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool blue depth",
    preview: { bg: "#0c1222", card: "#132035", accent: "#38bdf8" },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Earthy greens, natural calm",
    preview: { bg: "#0f1a14", card: "#162419", accent: "#34d399" },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm amber & orange tones",
    preview: { bg: "#1a1109", card: "#271c10", accent: "#f59e0b" },
  },
  {
    id: "rose",
    name: "Rosé",
    description: "Soft pinks, elegant feel",
    preview: { bg: "#1a0f14", card: "#27141d", accent: "#f472b6" },
  },
  {
    id: "light",
    name: "Light",
    description: "Clean, bright & minimal",
    preview: { bg: "#f8fafc", card: "#ffffff", accent: "#6366f1" },
  },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("qb-theme");
    if (stored && THEMES.find((t) => t.id === stored)) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "midnight"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    THEMES.forEach((t) => root.classList.remove(t.id));
    // Legacy: remove old light/dark
    root.classList.remove("light", "dark");
    // Add current theme
    root.classList.add(theme);
    // For components that check for dark mode
    if (theme !== "light") {
      root.classList.add("dark");
    }
    localStorage.setItem("qb-theme", theme);
  }, [theme]);

  const isDark = theme !== "light";

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
