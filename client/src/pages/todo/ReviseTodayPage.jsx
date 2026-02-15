import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookMarked, Library } from "lucide-react";
import { useRevision } from "../../context/revisionContext";
import ReviseTodayCard from "../../components/revision/ReviseTodayCard";
import RevisionProgressWidget from "../../components/revision/RevisionProgressWidget";

export default function ReviseTodayPage() {
  const navigate = useNavigate();
  const { dueTodayItems, loading } = useRevision();

  const handleStartSession = (item) => {
    navigate(`/todo/revise/session/${item.id}`);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-[var(--color-surface-200)]" />
          <div className="h-24 rounded-lg bg-[var(--color-surface-200)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <BookMarked size={28} />
            Revise Today
          </h1>
          <Link
            to="/todo/revise/library"
            className="btn btn-secondary btn-sm flex items-center gap-2"
          >
            <Library size={16} />
            Revision Library
          </Link>
        </div>

        <RevisionProgressWidget />

        {dueTodayItems.length === 0 ? (
          <div
            className="card p-8 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            <p className="text-lg mb-2">All caught up.</p>
            <p className="text-sm mb-4">
              No topics due for revision today. Add items from the library or
              convert todos to revision items.
            </p>
            <Link to="/todo/revise/library" className="btn btn-primary">
              Go to Revision Library
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {dueTodayItems.map((item, idx) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <ReviseTodayCard item={item} onStartSession={handleStartSession} />
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
