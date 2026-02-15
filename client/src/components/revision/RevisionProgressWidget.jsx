import { Link } from "react-router-dom";
import { TrendingUp, Flame, AlertCircle, BookMarked } from "lucide-react";
import { useRevision } from "../../context/revisionContext";

export default function RevisionProgressWidget() {
  const {
    revisedTodayCount,
    streakDays,
    overdueItems,
    confidenceBreakdown,
    dueTodayItems,
  } = useRevision();

  return (
    <section className="mb-6">
      <h2
        className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        <TrendingUp size={14} />
        Revision Stats
      </h2>
      <div
        className="card p-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
        style={{ background: "var(--bg-card)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent-soft)" }}
          >
            <BookMarked size={18} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {revisedTodayCount}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Revised today
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-warning)" }}
          >
            <Flame size={18} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {streakDays}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Day streak
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-danger)" }}
          >
            <AlertCircle size={18} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {overdueItems.length}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Overdue
            </p>
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1 flex flex-col justify-center">
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
            Confidence
          </p>
          <div className="flex gap-1.5 flex-wrap">
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded"
              style={{
                background: "var(--color-danger)",
                color: "white",
              }}
            >
              {confidenceBreakdown.low} Low
            </span>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded"
              style={{
                background: "var(--color-warning)",
                color: "white",
              }}
            >
              {confidenceBreakdown.medium} Med
            </span>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded"
              style={{
                background: "var(--color-success)",
                color: "white",
              }}
            >
              {confidenceBreakdown.high} High
            </span>
          </div>
        </div>
      </div>
      {dueTodayItems.length > 0 && (
        <Link
          to="/todo/revise"
          className="block mt-2 text-sm font-medium text-center"
          style={{ color: "var(--accent)" }}
        >
          {dueTodayItems.length} due today — Revise now
        </Link>
      )}
    </section>
  );
}
