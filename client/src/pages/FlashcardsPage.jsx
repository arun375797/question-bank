import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  useFlashcards,
  useCreateFlashcard,
  useUpdateFlashcard,
  useDeleteFlashcard,
} from "../hooks/useApi";
import {
  Plus,
  Pencil,
  Trash2,
  Layers,
  ChevronDown,
  X,
  RotateCcw,
} from "lucide-react";

const CARD_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#64748b", // slate
];

function safeList(value) {
  return Array.isArray(value) ? value : [];
}

export default function FlashcardsPage() {
  const [subjectFilter, setSubjectFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [flippedId, setFlippedId] = useState(null);

  const { data, isLoading } = useFlashcards(); // fetch all for filter list
  const cards = useMemo(() => safeList(data?.data), [data]);
  const filteredCards = useMemo(() => {
    if (!subjectFilter || subjectFilter === "all") return cards;
    return cards.filter((c) => (c.subject || "General") === subjectFilter);
  }, [cards, subjectFilter]);

  const subjects = useMemo(() => {
    const set = new Set(cards.map((c) => c.subject || "General"));
    return ["General", ...[...set].filter((s) => s !== "General").sort()];
  }, [cards]);

  const createMutation = useCreateFlashcard();
  const updateMutation = useUpdateFlashcard();
  const deleteMutation = useDeleteFlashcard();

  const openCreate = () => {
    setEditingId(null);
    setModalOpen(true);
  };
  const openEdit = (card) => {
    setEditingId(card.id);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this flashcard?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Flashcard deleted");
      if (flippedId === id) setFlippedId(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <Layers size={28} style={{ color: "var(--accent)" }} />
            Flashcards
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Create and review flashcards. Filter by subject or change card color.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SubjectFilter
            subjects={subjects}
            value={subjectFilter}
            onChange={setSubjectFilter}
          />
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white transition-all hover:opacity-90 shadow-md"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={18} />
            Create flashcard
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl border p-5 h-40 animate-pulse"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            />
          ))}
        </div>
      ) : filteredCards.length === 0 ? (
        <div
          className="rounded-2xl border-2 border-dashed p-12 text-center"
          style={{
            borderColor: "var(--border)",
            background: "var(--bg-elevated)",
          }}
        >
          <Layers size={48} className="mx-auto mb-3 opacity-50" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
            No flashcards yet
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            {subjectFilter && subjectFilter !== "all"
              ? `No cards in "${subjectFilter}". Try another subject or create one.`
              : "Create your first flashcard to get started."}
          </p>
          {(!subjectFilter || subjectFilter === "all") && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              <Plus size={18} />
              Create flashcard
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => (
              <FlashcardItem
                key={card.id}
                card={card}
                isFlipped={flippedId === card.id}
                onFlip={() => setFlippedId((id) => (id === card.id ? null : card.id))}
                onEdit={() => openEdit(card)}
                onDelete={() => handleDelete(card.id)}
                onColorChange={async (color) => {
                  try {
                    await updateMutation.mutateAsync({ id: card.id, data: { color } });
                    toast.success("Color updated");
                  } catch (e) {
                    toast.error(e.response?.data?.message || "Failed to update");
                  }
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <FlashcardModal
        open={modalOpen}
        onClose={closeModal}
        editingId={editingId}
        initialCard={editingId ? cards.find((c) => c.id === editingId) : null}
        subjects={subjects}
        onCreate={async (payload) => {
          try {
            await createMutation.mutateAsync(payload);
            toast.success("Flashcard created");
            closeModal();
          } catch (e) {
            toast.error(e.response?.data?.message || "Failed to create");
            throw e;
          }
        }}
        onUpdate={async (payload) => {
          try {
            await updateMutation.mutateAsync({ id: editingId, data: payload });
            toast.success("Flashcard updated");
            closeModal();
          } catch (e) {
            toast.error(e.response?.data?.message || "Failed to update");
            throw e;
          }
        }}
      />
    </div>
  );
}

function SubjectFilter({ subjects, value, onChange }) {
  const [open, setOpen] = useState(false);
  const display = !value || value === "all" ? "All subjects" : value;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium min-w-[140px] justify-between"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-card)",
          color: "var(--text-primary)",
        }}
      >
        <span className="truncate">{display}</span>
        <ChevronDown size={16} className={open ? "rotate-180" : ""} style={{ color: "var(--text-muted)" }} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 mt-1 py-1 rounded-xl border shadow-lg z-20 min-w-[160px] max-h-60 overflow-y-auto"
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  onChange("all");
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--text-primary)" }}
              >
                All subjects
              </button>
              {subjects.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlashcardItem({ card, isFlipped, onFlip, onEdit, onDelete, onColorChange }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const color = card.color || "#6366f1";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="relative rounded-xl border overflow-hidden group"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Color bar */}
      <div
        className="h-1.5 w-full shrink-0"
        style={{ background: color }}
      />
      <div className="p-4">
        {/* Subject tag */}
        <span
          className="inline-block text-xs font-medium px-2 py-0.5 rounded-md mb-2"
          style={{
            background: `${color}20`,
            color: color,
          }}
        >
          {card.subject || "General"}
        </span>

        {/* Card content - click to flip */}
        <button
          type="button"
          onClick={onFlip}
          className="relative w-full text-left rounded-lg p-3 min-h-[100px] transition-colors hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center"
          style={{ color: "var(--text-primary)" }}
        >
          <span className="text-sm whitespace-pre-wrap wrap-break-word pr-16">
            {isFlipped ? card.back : card.front}
          </span>
          <span className="absolute bottom-2 right-2 text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <RotateCcw size={12} />
            {isFlipped ? "Back" : "Front"}
          </span>
        </button>

        {/* Actions */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker((v) => !v)}
              className="w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110"
              style={{ borderColor: "var(--border)", background: color }}
              title="Change color"
            />
            <AnimatePresence>
              {showColorPicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowColorPicker(false)} aria-hidden />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute left-0 bottom-full mb-1 p-2 rounded-xl border shadow-lg z-20 flex flex-wrap gap-1.5"
                    style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}
                  >
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          onColorChange(c);
                          setShowColorPicker(false);
                        }}
                        className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                        style={{
                          background: c,
                          borderColor: color === c ? "var(--text-primary)" : "transparent",
                        }}
                      />
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--text-secondary)" }}
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-500/10"
              style={{ color: "var(--color-danger, #ef4444)" }}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FlashcardModal({
  open,
  onClose,
  editingId,
  initialCard,
  subjects,
  onCreate,
  onUpdate,
}) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [subject, setSubject] = useState("General");
  const [color, setColor] = useState("#6366f1");

  const isEdit = !!editingId;

  useEffect(() => {
    if (!open) return;
    if (initialCard) {
      setFront(initialCard.front || "");
      setBack(initialCard.back || "");
      setSubject(initialCard.subject || "General");
      setColor(initialCard.color || "#6366f1");
    } else {
      setFront("");
      setBack("");
      setSubject("General");
      setColor("#6366f1");
    }
  }, [open, editingId, initialCard?.id]);

  const effectiveSubject = (subject && subject.trim()) || "General";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) {
      toast.error("Front and back are required");
      return;
    }
    const payload = {
      front: front.trim(),
      back: back.trim(),
      subject: effectiveSubject || "General",
      color,
    };
    if (isEdit) onUpdate(payload);
    else onCreate(payload);
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border shadow-xl"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {isEdit ? "Edit flashcard" : "New flashcard"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Front
            </label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-3 py-2 text-sm resize-none"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
              }}
              placeholder="Question or term"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Back
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-3 py-2 text-sm resize-none"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
              }}
              placeholder="Answer or definition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              list="flashcard-subjects"
              className="w-full rounded-xl border px-3 py-2 text-sm"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
              }}
              placeholder="e.g. Math, History (type to add new)"
            />
            <datalist id="flashcard-subjects">
              {subjects.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Card color
            </label>
            <div className="flex flex-wrap gap-2">
              {CARD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    background: c,
                    borderColor: color === c ? "var(--text-primary)" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-medium border"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
                background: "var(--bg-elevated)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              {isEdit ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
