import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Smile,
  Meh,
  Frown,
  ExternalLink,
  Clock,
  ChevronLeft,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useRevision } from "../../context/revisionContext";
import toast from "react-hot-toast";

const TIMER_PRESETS = [5, 10, 25];

export default function RevisionSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRevisionItem, markRevised, dueTodayItems } = useRevision();
  const [item, setItem] = useState(null);
  const [rating, setRating] = useState(null);
  const [timerMinutes, setTimerMinutes] = useState(null);
  const [timerRemaining, setTimerRemaining] = useState(null);

  useEffect(() => {
    const rev = getRevisionItem(id);
    setItem(rev || null);
  }, [id, getRevisionItem]);

  useEffect(() => {
    if (timerMinutes == null || timerRemaining == null) return;
    if (timerRemaining <= 0) return;
    const t = setInterval(() => {
      setTimerRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          toast("Time’s up! How did it go?");
          return 0;
        }
        return r - 1;
      });
    }, 60 * 1000);
    return () => clearInterval(t);
  }, [timerMinutes, timerRemaining]);

  const handleRate = (r) => {
    setRating(r);
    if (item) {
      const wasLastDueToday = dueTodayItems.length === 1 && dueTodayItems[0]?.id === item.id;
      markRevised(item.id, r);
      toast.success("Revision recorded. Next review scheduled.");
      if (wasLastDueToday) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }
    }
  };

  const handleFinish = () => {
    navigate("/todo/revise", { replace: true });
  };

  if (!item) {
    return (
      <div className="page-container">
        <p style={{ color: "var(--text-muted)" }}>
          Revision item not found.
          <button
            type="button"
            className="btn btn-ghost btn-sm ml-2"
            onClick={() => navigate("/todo/revise")}
          >
            Back to Revise Today
          </button>
        </p>
      </div>
    );
  }

  const rated = rating !== null;

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <button
          type="button"
          className="btn btn-ghost btn-sm flex items-center gap-1 mb-4"
          onClick={() => navigate("/todo/revise")}
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div
          className="card p-6 mb-4"
          style={{ background: "var(--bg-card)" }}
        >
          <h1
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {item.title || "Untitled"}
          </h1>
          {item.category && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded mb-3 inline-block"
              style={{ background: "var(--bg-elevated)" }}
            >
              {item.category}
            </span>
          )}

          {item.notes && (
            <div
              className="prose prose-sm max-w-none mb-4 rounded-lg p-4"
              style={{
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
              }}
            >
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                Notes / Summary
              </h3>
              <div className="whitespace-pre-wrap text-sm">{item.notes}</div>
            </div>
          )}

          {item.keyQuestions?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                Key questions to recall
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {item.keyQuestions.filter(Boolean).map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {item.keyPoints?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                Key points checklist
              </h3>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                {item.keyPoints.filter(Boolean).map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span style={{ color: "var(--accent)" }}>•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.links?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.links.filter((l) => l.url).map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center gap-1"
                  style={{ color: "var(--accent)" }}
                >
                  {l.label || "Link"} <ExternalLink size={12} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Optional timer */}
        {!rated && timerMinutes == null && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <Clock size={14} />
              Revise sprint:
            </span>
            {TIMER_PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ border: "1px solid var(--border)" }}
                onClick={() => {
                  setTimerMinutes(m);
                  setTimerRemaining(m);
                }}
              >
                {m} min
              </button>
            ))}
          </div>
        )}
        {timerRemaining != null && timerRemaining > 0 && (
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            <Clock size={14} className="inline mr-1" />
            {Math.floor(timerRemaining / 60)}:{(timerRemaining % 60).toString().padStart(2, "0")} left
          </p>
        )}

        {/* Rating buttons */}
        <div className="card p-4" style={{ background: "var(--bg-card)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
            How did it go?
          </h3>
          {!rated ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all hover:scale-105"
                style={{
                  borderColor: "var(--color-success)",
                  background: "var(--color-success)",
                  color: "white",
                }}
                onClick={() => handleRate("easy")}
              >
                <Smile size={28} />
                <span className="text-sm font-medium">Easy</span>
                <span className="text-xs opacity-90">I remembered well</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all hover:scale-105"
                style={{
                  borderColor: "var(--color-warning)",
                  background: "var(--color-warning)",
                  color: "white",
                }}
                onClick={() => handleRate("okay")}
              >
                <Meh size={28} />
                <span className="text-sm font-medium">Okay</span>
                <span className="text-xs opacity-90">Partial recall</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all hover:scale-105"
                style={{
                  borderColor: "var(--color-danger)",
                  background: "var(--color-danger)",
                  color: "white",
                }}
                onClick={() => handleRate("hard")}
              >
                <Frown size={28} />
                <span className="text-sm font-medium">Hard</span>
                <span className="text-xs opacity-90">Forgot / struggled</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Check size={24} style={{ color: "var(--color-success)" }} />
              <span style={{ color: "var(--text-primary)" }}>
                Recorded as{" "}
                <strong>{rating === "easy" ? "Easy" : rating === "okay" ? "Okay" : "Hard"}</strong>.
                Next review has been scheduled.
              </span>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleFinish}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
