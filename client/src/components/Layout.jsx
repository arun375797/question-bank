import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { useTodo } from "../context/todoContext";
import { Toaster } from "react-hot-toast";
import {
  Home,
  BookOpen,
  Settings,
  Palette,
  Menu,
  X,
  Code2,
  Wrench,
  LayoutList,
  BookText,
  LayoutDashboard,
  ListTodo,
  Calendar,
  Timer,
  Download,
  BookMarked,
  Library,
} from "lucide-react";

const navLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/study", label: "Study", icon: BookOpen },
  { to: "/notebook", label: "Notebook", icon: BookText },
  { to: "/overview", label: "Overview", icon: LayoutList },
  { to: "/manage", label: "Manage", icon: Wrench },
  { to: "/settings", label: "Settings", icon: Settings },
];

const todoNavLinks = [
  { to: "/todo", label: "Dashboard", icon: LayoutDashboard },
  { to: "/todo/revise", label: "Revise Today", icon: BookMarked },
  { to: "/todo/revise/library", label: "Revision Library", icon: Library },
  { to: "/todo/list", label: "All Todos", icon: ListTodo },
  { to: "/todo/calendar", label: "Calendar", icon: Calendar },
  { to: "/todo/focus", label: "Focus Timer", icon: Timer },
  { to: "/todo/settings", label: "Settings", icon: Settings },
  { to: "/todo/install", label: "Install App", icon: Download },
];

// Fewer items for the mobile bottom nav to avoid cramping
const mobileNavLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/study", label: "Study", icon: BookOpen },
  { to: "/todo", label: "TODO", icon: ListTodo },
  { to: "/manage", label: "Manage", icon: Wrench },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const { theme, isDark } = useTheme();
  const { settings: todoSettings } = useTodo();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const font = todoSettings?.font || "Inter";
    document.documentElement.style.setProperty(
      "--font-sans",
      `"${font}", system-ui, -apple-system, sans-serif`
    );
    if (todoSettings?.textColorOverride) {
      document.documentElement.style.setProperty("--text-primary", todoSettings.textColorOverride);
    } else {
      document.documentElement.style.removeProperty("--text-primary");
    }
  }, [todoSettings?.font, todoSettings?.textColorOverride]);

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const bgImage = todoSettings?.backgroundImage;
  const overlayDim = todoSettings?.overlayDim ?? 0;
  const overlayBlur = todoSettings?.overlayBlur ?? 0;

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{ background: "var(--bg)" }}
    >
      {bgImage && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      {bgImage && (
        <div
          className="absolute inset-0 pointer-events-none z-1"
          style={{
            backgroundColor: `rgba(0,0,0,${overlayDim})`,
            backdropFilter: `blur(${overlayBlur}px)`,
            WebkitBackdropFilter: `blur(${overlayBlur}px)`,
          }}
        />
      )}
      <div className="relative z-10 flex flex-1 min-w-0 h-screen overflow-hidden" style={{ flex: 1 }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - hidden on mobile, shown on desktop; glassmorphism on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 hidden lg:flex`}
        style={{
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ background: "var(--accent, var(--color-primary-600))" }}
          >
            <Code2 size={20} className="text-white" />
          </div>
          <div>
            <h1
              className="text-base font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              QuestionBank
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Domain Questions
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: active
                    ? "var(--accent-soft, var(--color-primary-50))"
                    : "transparent",
                  color: active
                    ? "var(--accent, var(--color-primary-700))"
                    : "var(--text-secondary)",
                }}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            );
          })}

          {/* TODO section */}
          <div
            className="pt-4 mt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <p
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              TODO
            </p>
            <div className="space-y-1 pt-1">
              {todoNavLinks.map(({ to, label, icon: Icon }) => {
                const active = isActive(to) || (to === "/todo" && location.pathname === "/todo");
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: active
                        ? "var(--accent-soft, var(--color-primary-50))"
                        : "transparent",
                      color: active
                        ? "var(--accent, var(--color-primary-700))"
                        : "var(--text-secondary)",
                    }}
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Current theme label */}
        <div
          className="px-4 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <Link
            to="/settings"
            className="flex items-center gap-2 text-xs font-medium px-1 py-1 rounded hover:opacity-80 transition-opacity"
            style={{ color: "var(--text-muted)", textDecoration: "none" }}
          >
            <Palette size={14} />
            <span>Theme: </span>
            <span
              className="inline-flex items-center gap-1.5"
              style={{ color: "var(--accent)" }}
            >
              <span
                className="rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: "var(--accent)",
                  display: "inline-block",
                }}
              />
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center gap-4 px-4 py-3 lg:px-6"
          style={{
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {/* Mobile: show logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-md"
              style={{ background: "var(--accent, var(--color-primary-600))" }}
            >
              <Code2 size={14} className="text-white" />
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              QuestionBank
            </span>
          </div>
          <div className="flex-1" />
          <Link
            to="/settings"
            className="btn btn-ghost btn-icon hidden lg:flex"
            title="Settings"
          >
            <Palette size={18} />
          </Link>
        </header>

        {/* TODO sub-nav on mobile when inside /todo */}
        {location.pathname.startsWith("/todo") && (
          <div
            className="lg:hidden flex gap-1 px-2 py-2 overflow-x-auto shrink-0"
            style={{
              borderBottom: "1px solid var(--border)",
              background: "var(--bg-card)",
            }}
          >
            {todoNavLinks.map(({ to, label }) => {
              const active = to === "/todo" ? location.pathname === "/todo" : location.pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: active ? "var(--accent-soft)" : "transparent",
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  {label}
                </NavLink>
              );
            })}
          </div>
        )}

       
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="main-content-pad lg:pb-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      </div>

      {/* ━━━ Mobile Bottom Navigation ━━━ */}
      <nav className="mobile-bottom-nav">
        {mobileNavLinks.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <NavLink key={to} to={to} className={active ? "active" : ""}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? "var(--bg-card)" : "#ffffff",
            color: isDark ? "var(--text-primary)" : "#0f172a",
            border: `1px solid var(--border)`,
          },
        }}
      />
    </div>
  );
}
