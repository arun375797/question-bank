import { motion } from "framer-motion";
import { useTheme, THEMES } from "../hooks/useTheme";
import { Check, Palette, Monitor, Info } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Settings
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          Customize your learning experience
        </p>

        {/* ━━━ Theme Section ━━━ */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Palette size={20} style={{ color: "var(--accent)" }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Appearance
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {THEMES.map((t) => {
              const isActive = theme === t.id;
              return (
                <motion.button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left rounded-xl overflow-hidden transition-all duration-200 group"
                  style={{
                    border: `2px solid ${isActive ? t.preview.accent : "var(--border)"}`,
                    boxShadow: isActive
                      ? `0 0 0 1px ${t.preview.accent}, 0 4px 20px ${t.preview.accent}33`
                      : "var(--shadow-sm)",
                    background: t.preview.bg,
                    cursor: "pointer",
                  }}
                >
                  {/* Theme preview mockup */}
                  <div className="relative p-3">
                    {/* Mini sidebar */}
                    <div className="flex gap-2" style={{ height: 64 }}>
                      <div
                        className="rounded-lg flex-shrink-0"
                        style={{
                          width: 40,
                          background: t.preview.card,
                          padding: "6px 4px",
                        }}
                      >
                        <div
                          className="rounded"
                          style={{
                            width: "100%",
                            height: 4,
                            background: t.preview.accent,
                            marginBottom: 4,
                          }}
                        />
                        <div
                          className="rounded"
                          style={{
                            width: "100%",
                            height: 3,
                            background:
                              t.id === "light"
                                ? "#e2e8f0"
                                : "rgba(255,255,255,0.1)",
                            marginBottom: 3,
                          }}
                        />
                        <div
                          className="rounded"
                          style={{
                            width: "70%",
                            height: 3,
                            background:
                              t.id === "light"
                                ? "#e2e8f0"
                                : "rgba(255,255,255,0.1)",
                          }}
                        />
                      </div>
                      {/* Mini content area */}
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div
                          className="rounded"
                          style={{
                            height: 5,
                            width: "60%",
                            background:
                              t.id === "light"
                                ? "#cbd5e1"
                                : "rgba(255,255,255,0.15)",
                          }}
                        />
                        <div
                          className="rounded-md flex-1"
                          style={{
                            background: t.preview.card,
                          }}
                        />
                        <div className="flex gap-1">
                          <div
                            className="rounded flex-1"
                            style={{
                              height: 12,
                              background: t.preview.card,
                            }}
                          />
                          <div
                            className="rounded flex-1"
                            style={{
                              height: 12,
                              background: t.preview.card,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Active check */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 flex items-center justify-center rounded-full"
                        style={{
                          width: 20,
                          height: 20,
                          background: t.preview.accent,
                        }}
                      >
                        <Check size={12} className="text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Theme info */}
                  <div
                    className="px-3 py-2.5"
                    style={{
                      borderTop: `1px solid ${
                        t.id === "light" ? "#e2e8f0" : "rgba(255,255,255,0.06)"
                      }`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <div
                        className="rounded-full"
                        style={{
                          width: 10,
                          height: 10,
                          background: t.preview.accent,
                        }}
                      />
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color:
                            t.id === "light"
                              ? "#0f172a"
                              : "rgba(255,255,255,0.9)",
                        }}
                      >
                        {t.name}
                      </span>
                    </div>
                    <p
                      className="text-xs"
                      style={{
                        color:
                          t.id === "light"
                            ? "#64748b"
                            : "rgba(255,255,255,0.45)",
                      }}
                    >
                      {t.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ━━━ About Section ━━━ */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Info size={20} style={{ color: "var(--accent)" }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              About
            </h2>
          </div>
          <div className="card p-5">
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                style={{ background: "var(--accent-soft)" }}
              >
                <Monitor size={24} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h3
                  className="font-semibold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  QuestionBank
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Your personal domain question bank for mastering technical
                  interview preparation. Organize questions by language, topic,
                  and subtopic. Track your progress and learn at your own pace.
                </p>
                <p
                  className="text-xs mt-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Version 1.0.0
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ Keyboard Shortcuts ━━━ */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span style={{ color: "var(--accent)", fontSize: 20 }}>⌨</span>
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <div className="card overflow-hidden">
            {[
              { key: "/", action: "Focus search bar" },
              { key: "Esc", action: "Clear search / close modal" },
              { key: "←", action: "Previous question" },
              { key: "→", action: "Next question" },
              { key: "Space", action: "Reveal answer" },
            ].map((shortcut, i, arr) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between px-5 py-3"
                style={{
                  borderBottom:
                    i < arr.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <span
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {shortcut.action}
                </span>
                <kbd
                  className="text-xs font-mono font-medium px-2.5 py-1 rounded-md"
                  style={{
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
