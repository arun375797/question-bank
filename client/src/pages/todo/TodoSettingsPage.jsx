import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Type,
  Image,
  Sliders,
  Timer,
  Volume2,
  Check,
} from "lucide-react";
import { useTheme, THEMES } from "../../hooks/useTheme";
import { useTodo } from "../../context/TodoContext";
import toast from "react-hot-toast";

const TODO_THEMES = [
  { id: "calm", name: "Calm", desc: "Purple", accent: "#a78bfa" },
  { id: "forest", name: "Green", desc: "Natural", accent: "#34d399" },
  { id: "ocean", name: "Ocean", desc: "Blue", accent: "#38bdf8" },
  { id: "midnight", name: "Dark", desc: "Deep", accent: "#6366f1" },
];

const FONTS = [
  { id: "Inter", name: "Inter" },
  { id: "Roboto", name: "Roboto" },
  { id: "Lora", name: "Lora" },
  { id: "Space Mono", name: "Space Mono" },
  { id: "Comic Neue", name: "Comic Neue" },
];

const ALARM_OPTIONS = [
  { id: "none", label: "None" },
  { id: "beep", label: "Beep" },
  { id: "bell", label: "Bell" },
  { id: "digital", label: "Digital" },
];

export default function TodoSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, setSettings } = useTodo();
  const [textColor, setTextColor] = useState(settings.textColorOverride || "");
  const fileInputRef = useRef(null);

  const handleBackgroundUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a JPG or PNG image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSettings((s) => ({ ...s, backgroundImage: reader.result }));
      toast.success("Background updated");
    };
    reader.readAsDataURL(file);
  };

  const removeBackground = () => {
    setSettings((s) => ({ ...s, backgroundImage: null }));
    toast.success("Background removed");
  };

  const resetTextColor = () => {
    setTextColor("");
    setSettings((s) => ({ ...s, textColorOverride: null }));
    toast.success("Text color reset to theme");
  };

  const applyTextColor = () => {
    setSettings((s) => ({
      ...s,
      textColorOverride: textColor || null,
    }));
    if (textColor) toast.success("Text color updated");
  };

  return (
    <div className="page-container" style={{ maxWidth: 720 }}>
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
          Personalize your TODO experience
        </p>

        {/* Theme */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={20} style={{ color: "var(--accent)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Theme
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TODO_THEMES.map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  className="rounded-xl p-4 text-left border-2 transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: isActive ? t.accent : "var(--border)",
                    background: "var(--bg-card)",
                  }}
                  onClick={() => setTheme(t.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: t.accent }}
                    />
                    <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                      {t.name}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {t.desc}
                  </p>
                  {isActive && (
                    <Check size={14} className="mt-2 text-[var(--accent)]" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Type size={20} style={{ color: "var(--accent)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Typography
            </h2>
          </div>
          <div className="card p-4 space-y-4">
            <div>
              <label className="label">Font</label>
              <select
                className="select"
                value={settings.font || "Inter"}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, font: e.target.value }))
                }
              >
                {FONTS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Text color override</label>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="color"
                  className="w-10 h-10 rounded cursor-pointer border border-[var(--border)]"
                  value={textColor || "#e9e6f0"}
                  onChange={(e) => setTextColor(e.target.value)}
                  onBlur={applyTextColor}
                />
                <input
                  type="text"
                  className="input flex-1 min-w-[120px]"
                  placeholder="#hex or leave default"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  onBlur={applyTextColor}
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={resetTextColor}>
                  Reset to theme
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Background */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Image size={20} style={{ color: "var(--accent)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Background
            </h2>
          </div>
          <div className="card p-4 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handleBackgroundUpload}
            />
            <div
              className="rounded-xl border-2 border-dashed min-h-[120px] flex items-center justify-center gap-2 p-4"
              style={{
                borderColor: "var(--border)",
                background: settings.backgroundImage
                  ? `url(${settings.backgroundImage}) center/cover`
                  : "var(--bg-elevated)",
              }}
            >
              {!settings.backgroundImage ? (
                <>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload image (JPG/PNG)
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={removeBackground}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1">
                  <Sliders size={14} />
                  Dim / darken (0–0.8)
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  className="w-full"
                  value={settings.overlayDim ?? 0}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      overlayDim: parseFloat(e.target.value),
                    }))
                  }
                />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {(settings.overlayDim ?? 0).toFixed(2)}
                </span>
              </div>
              <div>
                <label className="label">Blur (0–20px)</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  className="w-full"
                  value={settings.overlayBlur ?? 0}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      overlayBlur: parseInt(e.target.value, 10),
                    }))
                  }
                />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {settings.overlayBlur ?? 0}px
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Focus timer */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Timer size={20} style={{ color: "var(--accent)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Focus Timer
            </h2>
          </div>
          <div className="card p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Focus (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="input"
                  value={settings.focusMinutes ?? 25}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      focusMinutes: Math.max(1, parseInt(e.target.value, 10) || 25),
                    }))
                  }
                />
              </div>
              <div>
                <label className="label">Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="input"
                  value={settings.breakMinutes ?? 5}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      breakMinutes: Math.max(1, parseInt(e.target.value, 10) || 5),
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="label">Total focus goal (minutes per day)</label>
              <input
                type="number"
                min="0"
                max="480"
                className="input"
                value={settings.totalFocusGoalMinutes ?? 120}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    totalFocusGoalMinutes: Math.max(0, parseInt(e.target.value, 10) || 0),
                  }))
                }
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Volume2 size={14} />
                Alarm sound when timer ends
              </label>
              <select
                className="select"
                value={settings.alarmSound ?? "bell"}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, alarmSound: e.target.value }))
                }
              >
                {ALARM_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
