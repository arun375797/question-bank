import { useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Play, MoreHorizontal, Check } from "lucide-react";
import { useRevision } from "../../context/revisionContext";
import ConfirmDialog from "../ConfirmDialog";

function ConfidenceBadge({ confidence }) {
  const c = (confidence || "medium").toLowerCase();
  const label = c.charAt(0).toUpperCase() + c.slice(1);
  const bg =
    c === "high"
      ? "var(--color-success)"
      : c === "low"
        ? "var(--color-danger)"
        : "var(--color-warning)";
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded"
      style={{ background: bg, color: "white" }}
    >
      {label}
    </span>
  );
}

export default function ReviseTodayCard({ item, onStartSession }) {
  const { markRevised, snooze, isOverdue } = useRevision();
  const [showSnooze, setShowSnooze] = useState(false);
  const [showMarkRevised, setShowMarkRevised] = useState(false);

  const overdue = item.nextDueAt && isOverdue(item.nextDueAt);
  const lastRevised = item.lastRevisedAt
    ? format(new Date(item.lastRevisedAt), "MMM d, yyyy")
    : "Never";
  const nextDue = item.nextDueAt
    ? format(new Date(item.nextDueAt), "MMM d")
    : "—";

  const handleSnooze = (option) => {
    snooze(item.id, option);
    setShowSnooze(false);
  };

  const handleMarkRevised = () => {
    markRevised(item.id, "okay");
    setShowMarkRevised(false);
  };

  return (
    <div
      className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      style={{
        borderLeft: overdue ? "4px solid var(--color-danger)" : undefined,
        background: "var(--bg-card)",
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className="font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {item.title || "Untitled"}
          </span>
          {overdue && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded"
              style={{
                background: "var(--color-danger)",
                color: "white",
              }}
            >
              OVERDUE
            </span>
          )}
          <ConfidenceBadge confidence={item.confidence} />
        </div>
        <div
          className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <span>Last: {lastRevised}</span>
          <span>Next: {nextDue}</span>
          <span>Revised {item.revisionCount || 0}×</span>
          {item.category && (
            <span
              className="px-1.5 py-0.5 rounded"
              style={{ background: "var(--bg-elevated)" }}
            >
              {item.category}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          className="btn btn-primary btn-sm flex items-center gap-1.5"
          onClick={() => onStartSession(item)}
          title="Start revision"
        >
          <Play size={14} />
          Start
        </button>
        <div className="relative">
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => setShowSnooze(!showSnooze)}
            title="Snooze or mark revised"
          >
            <MoreHorizontal size={16} />
          </button>
          {showSnooze && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSnooze(false)}
                aria-hidden="true"
              />
              <div
                className="absolute right-0 top-full mt-1 py-1 rounded-lg shadow-lg z-20 min-w-[140px]"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-card)]"
                  style={{ color: "var(--text-primary)" }}
                  onClick={() => handleSnooze("1d")}
                >
                  Snooze 1 day
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-card)]"
                  style={{ color: "var(--text-primary)" }}
                  onClick={() => handleSnooze("3d")}
                >
                  Snooze 3 days
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-card)]"
                  style={{ color: "var(--text-primary)" }}
                  onClick={() => handleSnooze("7d")}
                >
                  Snooze 1 week
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-card)] flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                  onClick={() => {
                    setShowSnooze(false);
                    setShowMarkRevised(true);
                  }}
                >
                  <Check size={14} />
                  Mark revised
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showMarkRevised}
        onClose={() => setShowMarkRevised(false)}
        onConfirm={handleMarkRevised}
        title="Mark as revised?"
        message="This will schedule the next revision based on your current plan (Okay)."
        confirmLabel="Mark revised"
      />
    </div>
  );
}
