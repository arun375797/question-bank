import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Target } from "lucide-react";
import { useTodo } from "../../context/todoContext";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

const ALARM_SOUNDS = {
  none: null,
  beep: "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUtvT19XQVZFZm10IA==",
  bell: null,
  digital: null,
};

function useAlarm(soundKey) {
  const audioRef = useRef(null);
  useEffect(() => {
    if (soundKey === "none") return;
    if (soundKey === "beep") {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const playBeep = () => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = 880;
          g.gain.setValueAtTime(0.3, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          o.start(ctx.currentTime);
          o.stop(ctx.currentTime + 0.5);
        };
        const id = setInterval(playBeep, 400);
        const t = setTimeout(() => clearInterval(id), 2000);
        return () => {
          clearInterval(id);
          clearTimeout(t);
        };
      } catch (_) {}
    }
    const audio = new Audio();
    if (soundKey === "bell") {
      audio.src = "https://assets.mixkit.co/active_storage/sfx/2568-keyboard-notification-alert-2568.mp3";
    } else if (soundKey === "digital") {
      audio.src = "https://assets.mixkit.co/active_storage/sfx/2566-melodic-marimba-notification-2566.mp3";
    }
    if (audio.src) {
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
    return () => {};
  }, [soundKey]);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function FocusTimerPage() {
  const { settings, setSettings } = useTodo();
  const [mode, setMode] = useState("focus"); // focus | break
  const [secondsLeft, setSecondsLeft] = useState(settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalFocusDone, setTotalFocusDone] = useState(0);
  const intervalRef = useRef(null);

  const focusSec = settings.focusMinutes * 60;
  const breakSec = settings.breakMinutes * 60;
  const goalMinutes = settings.totalFocusGoalMinutes || 120;

  const resetTimer = useCallback(() => {
    setSecondsLeft(mode === "focus" ? focusSec : breakSec);
  }, [mode, focusSec, breakSec]);

  useEffect(() => {
    setSecondsLeft(mode === "focus" ? focusSec : breakSec);
  }, [mode, focusSec, breakSec]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft !== 0) return;
    clearInterval(intervalRef.current);
    setIsRunning(false);
    if (mode === "focus") {
      setTotalFocusDone((p) => p + settings.focusMinutes);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      if (settings.alarmSound && settings.alarmSound !== "none") {
        try {
          const audio = new Audio();
          if (settings.alarmSound === "bell") {
            audio.src = "https://assets.mixkit.co/active_storage/sfx/2568-keyboard-notification-alert-2568.mp3";
          } else if (settings.alarmSound === "digital") {
            audio.src = "https://assets.mixkit.co/active_storage/sfx/2566-melodic-marimba-notification-2566.mp3";
          } else if (settings.alarmSound === "beep") {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.frequency.value = 880;
            g.gain.setValueAtTime(0.3, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            o.start(ctx.currentTime);
            o.stop(ctx.currentTime + 0.5);
          }
          if (audio?.src) {
            audio.volume = 0.5;
            audio.play().catch(() => {});
          }
        } catch (_) {}
      }
      toast.success("Focus session complete! Take a break.");
      setMode("break");
      setSecondsLeft(breakSec);
    } else {
      toast("Break over. Ready for another focus session?");
      setMode("focus");
      setSecondsLeft(focusSec);
    }
  }, [secondsLeft, mode, settings.focusMinutes, settings.breakMinutes, settings.alarmSound, focusSec, breakSec]);

  const handleStartPause = () => setIsRunning((r) => !r);
  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(mode === "focus" ? focusSec : breakSec);
  };

  const progressToGoal = Math.min(100, (totalFocusDone / goalMinutes) * 100);

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md mx-auto"
      >
        <h1
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: "var(--text-primary)" }}
        >
          Focus Timer
        </h1>

        <div
          className="card p-8 flex flex-col items-center"
          style={{
            background: mode === "focus" ? "var(--bg-card)" : "var(--bg-elevated)",
            borderColor: mode === "focus" ? "var(--accent)" : "var(--border)",
          }}
        >
          <p
            className="text-sm font-medium uppercase tracking-wider mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            {mode === "focus" ? "Focus" : "Break"}
          </p>
          <motion.div
            key={secondsLeft}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className="text-6xl font-mono font-bold mb-8 tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {formatTime(secondsLeft)}
          </motion.div>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleStartPause}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={handleReset}
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        </div>

        <div className="card p-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} style={{ color: "var(--accent)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Daily focus goal: {totalFocusDone} / {goalMinutes} min
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "var(--color-surface-200)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--accent)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressToGoal}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
          Focus: {settings.focusMinutes} min · Break: {settings.breakMinutes} min · Change in Settings
        </p>
      </motion.div>
    </div>
  );
}
