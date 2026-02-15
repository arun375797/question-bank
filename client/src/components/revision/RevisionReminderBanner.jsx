import { Link } from "react-router-dom";
import { BookMarked, X } from "lucide-react";
import { useState } from "react";
import { useRevision } from "../../context/revisionContext";

const BANNER_DISMISS_KEY = "qb-revision-banner-dismissed";

export default function RevisionReminderBanner() {
  const { dueTodayItems } = useRevision();
  const [dismissed, setDismissed] = useState(() => {
    try {
      const date = localStorage.getItem(BANNER_DISMISS_KEY);
      return date === new Date().toISOString().slice(0, 10);
    } catch {
      return false;
    }
  });

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(BANNER_DISMISS_KEY, new Date().toISOString().slice(0, 10));
    } catch {
      // ignore
    }
  };

  if (dueTodayItems.length === 0 || dismissed) return null;

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-lg"
      style={{
        background: "var(--accent-soft)",
        border: "1px solid var(--accent)",
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <BookMarked size={18} style={{ color: "var(--accent)" }} />
        <span style={{ color: "var(--text-primary)" }}>
          You have{" "}
          <strong>{dueTodayItems.length}</strong> topic
          {dueTodayItems.length !== 1 ? "s" : ""} to revise today.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/todo/revise"
          className="btn btn-primary btn-sm"
        >
          Revise now
        </Link>
        <button
          type="button"
          className="btn btn-ghost btn-icon btn-sm"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
