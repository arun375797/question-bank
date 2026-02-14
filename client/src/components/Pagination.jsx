import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages, totalCount, from, to } = meta;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Showing{" "}
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
          {from}
        </span>{" "}
        to{" "}
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
          {Math.min(to, totalCount)}
        </span>{" "}
        of{" "}
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
          {totalCount}
        </span>{" "}
        results
      </p>
      <div className="flex items-center gap-1">
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft size={16} />
        </button>
        {start > 1 && (
          <>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {start > 2 && (
              <span className="px-1" style={{ color: "var(--text-muted)" }}>
                …
              </span>
            )}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            className={`btn btn-sm ${p === page ? "btn-primary" : "btn-ghost"}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span className="px-1" style={{ color: "var(--text-muted)" }}>
                …
              </span>
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
