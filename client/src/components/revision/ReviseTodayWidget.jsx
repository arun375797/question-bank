import { Link } from "react-router-dom";
import { BookMarked, ChevronRight } from "lucide-react";
import { useRevision } from "../../context/revisionContext";
import ReviseTodayCard from "./ReviseTodayCard";

export default function ReviseTodayWidget({ onStartSession, maxItems = 3 }) {
  const { dueTodayItems } = useRevision();
  const show = dueTodayItems.slice(0, maxItems);
  const hasMore = dueTodayItems.length > maxItems;

  if (dueTodayItems.length === 0) {
    return (
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
            style={{ color: "var(--text-muted)" }}
          >
            <BookMarked size={14} />
            Revise Today
          </h2>
          <Link
            to="/todo/revise"
            className="text-xs font-medium"
            style={{ color: "var(--accent)" }}
          >
            Library
          </Link>
        </div>
        <div
          className="card p-4 text-center"
          style={{ color: "var(--text-muted)" }}
        >
          <p className="text-sm">No topics due for revision today.</p>
          <Link to="/todo/revise" className="btn btn-primary btn-sm mt-3">
            Revision Library
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
          style={{ color: "var(--text-muted)" }}
        >
          <BookMarked size={14} />
          Revise Today ({dueTodayItems.length})
        </h2>
        <Link
          to="/todo/revise"
          className="text-xs font-medium flex items-center gap-1"
          style={{ color: "var(--accent)" }}
        >
          View all <ChevronRight size={14} />
        </Link>
      </div>
      <ul className="space-y-2">
        {show.map((item) => (
          <li key={item.id}>
            <ReviseTodayCard item={item} onStartSession={onStartSession} />
          </li>
        ))}
      </ul>
      {hasMore && (
        <Link
          to="/todo/revise"
          className="block mt-2 text-center text-sm font-medium"
          style={{ color: "var(--accent)" }}
        >
          +{dueTodayItems.length - maxItems} more →
        </Link>
      )}
    </section>
  );
}
