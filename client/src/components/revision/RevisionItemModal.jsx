import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "../Modal";
import { useRevision } from "../../context/revisionContext";
import {
  createEmptyRevisionItem,
  REVISION_CATEGORIES,
  CONFIDENCE_LEVELS,
} from "../../context/RevisionContext.jsx";

export default function RevisionItemModal({
  isOpen,
  onClose,
  item: initialItem,
  onSuccess,
}) {
  const { addRevisionItem, updateRevisionItem } = useRevision();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("Other");
  const [tags, setTags] = useState("");
  const [links, setLinks] = useState([]);
  const [keyQuestions, setKeyQuestions] = useState([]);
  const [keyPoints, setKeyPoints] = useState([]);
  const [mistakesLog, setMistakesLog] = useState("");
  const [confidence, setConfidence] = useState("medium");
  const [nextDueAt, setNextDueAt] = useState("");

  const isEdit = Boolean(initialItem?.id);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title || "");
      setNotes(initialItem.notes || "");
      setCategory(initialItem.category || "Other");
      setTags(Array.isArray(initialItem.tags) ? initialItem.tags.join(", ") : "");
      setLinks(Array.isArray(initialItem.links) ? [...initialItem.links] : []);
      setKeyQuestions(
        Array.isArray(initialItem.keyQuestions) ? [...initialItem.keyQuestions] : []
      );
      setKeyPoints(
        Array.isArray(initialItem.keyPoints) ? [...initialItem.keyPoints] : []
      );
      setMistakesLog(initialItem.mistakesLog || "");
      setConfidence(initialItem.confidence || "medium");
      setNextDueAt(
        initialItem.nextDueAt
          ? initialItem.nextDueAt.slice(0, 10)
          : ""
      );
    } else {
      const empty = createEmptyRevisionItem();
      setTitle("");
      setNotes("");
      setCategory("Other");
      setTags("");
      setLinks([]);
      setKeyQuestions([]);
      setKeyPoints([]);
      setMistakesLog("");
      setConfidence("medium");
      setNextDueAt(empty.nextDueAt ? empty.nextDueAt.slice(0, 10) : "");
    }
  }, [initialItem, isOpen]);

  const addLink = () => setLinks((prev) => [...prev, { label: "", url: "" }]);
  const updateLink = (index, field, value) =>
    setLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  const removeLink = (index) => setLinks((prev) => prev.filter((_, i) => i !== index));

  const addKeyQuestion = () =>
    setKeyQuestions((prev) => [...prev, ""]);
  const updateKeyQuestion = (index, value) =>
    setKeyQuestions((prev) =>
      prev.map((q, i) => (i === index ? value : q))
    );
  const removeKeyQuestion = (index) =>
    setKeyQuestions((prev) => prev.filter((_, i) => i !== index));

  const addKeyPoint = () => setKeyPoints((prev) => [...prev, ""]);
  const updateKeyPoint = (index, value) =>
    setKeyPoints((prev) =>
      prev.map((p, i) => (i === index ? value : p))
    );
  const removeKeyPoint = (index) =>
    setKeyPoints((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = {
      title: title.trim() || "Untitled",
      notes: notes.trim(),
      category,
      tags: tagList,
      links: links.filter((l) => l.url?.trim()),
      keyQuestions: keyQuestions.filter(Boolean),
      keyPoints: keyPoints.filter(Boolean),
      mistakesLog: mistakesLog.trim(),
      confidence,
    };
    if (nextDueAt) {
      const d = new Date(nextDueAt);
      d.setHours(23, 59, 59, 999);
      payload.nextDueAt = d.toISOString();
    }
    try {
      if (isEdit) {
        await updateRevisionItem(initialItem.id, payload);
        onSuccess?.("updated");
      } else {
        await addRevisionItem(payload);
        onSuccess?.("created");
      }
      onClose();
    } catch {
      // Error toast can be shown by caller or context
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit revision item" : "New revision item"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Topic title"
          />
        </div>
        <div>
          <label className="label">Category</label>
          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {REVISION_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Tags (comma-separated)</label>
          <input
            className="input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. async, closures, APIs"
          />
        </div>
        <div>
          <label className="label">Notes / Summary</label>
          <textarea
            className="input min-h-[80px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Summary or key content..."
          />
        </div>
        {isEdit && (
          <div>
            <label className="label">Next due date</label>
            <input
              type="date"
              className="input"
              value={nextDueAt}
              onChange={(e) => setNextDueAt(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="label">Confidence</label>
          <select
            className="select"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
          >
            {CONFIDENCE_LEVELS.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Links</label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addLink}>
              <Plus size={14} /> Add
            </button>
          </div>
          {links.map((link, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="input flex-1 py-1.5 text-sm"
                placeholder="Label"
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
              />
              <input
                className="input flex-1 py-1.5 text-sm"
                placeholder="URL"
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => removeLink(i)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Key questions (recall prompts)</label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addKeyQuestion}>
              <Plus size={14} /> Add
            </button>
          </div>
          {keyQuestions.map((q, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="input flex-1 py-1.5 text-sm"
                placeholder="e.g. What is a preflight request?"
                value={q}
                onChange={(e) => updateKeyQuestion(i, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => removeKeyQuestion(i)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Key points checklist</label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addKeyPoint}>
              <Plus size={14} /> Add
            </button>
          </div>
          {keyPoints.map((p, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="input flex-1 py-1.5 text-sm"
                placeholder="Point to remember"
                value={p}
                onChange={(e) => updateKeyPoint(i, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => removeKeyPoint(i)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div>
          <label className="label">Mistakes log (optional)</label>
          <textarea
            className="input min-h-[60px] text-sm"
            value={mistakesLog}
            onChange={(e) => setMistakesLog(e.target.value)}
            placeholder="Notes on what you got wrong..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEdit ? "Save" : "Add revision item"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
