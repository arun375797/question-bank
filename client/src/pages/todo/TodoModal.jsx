import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTodo } from "../../context/TodoContext";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";

const PRIORITIES = ["P1", "P2", "P3", "P4"];

export default function TodoModal({ isOpen, onClose, todo: initialTodo, onSuccess }) {
  const { addTodo, updateTodo, LABEL_COLORS } = useTodo();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("P4");
  const [colorLabel, setColorLabel] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [notes, setNotes] = useState("");
  const [links, setLinks] = useState([]);
  const [subtasks, setSubtasks] = useState([]);

  const isEdit = Boolean(initialTodo?.id);

  useEffect(() => {
    if (initialTodo) {
      setTitle(initialTodo.title || "");
      setPriority(initialTodo.priority || "P4");
      setColorLabel(initialTodo.colorLabel ?? null);
      setDueDate(initialTodo.dueDate || "");
      setDueTime(initialTodo.dueTime || "");
      setNotes(initialTodo.notes || "");
      setLinks(Array.isArray(initialTodo.links) ? [...initialTodo.links] : []);
      setSubtasks(
        Array.isArray(initialTodo.subtasks)
          ? initialTodo.subtasks.map((s) => ({ ...s }))
          : []
      );
    } else {
      setTitle("");
      setPriority("P4");
      setColorLabel(null);
      setDueDate("");
      setDueTime("");
      setNotes("");
      setLinks([]);
      setSubtasks([]);
    }
  }, [initialTodo, isOpen]);

  const addLink = () => {
    setLinks((prev) => [...prev, { label: "", url: "" }]);
  };

  const updateLink = (index, field, value) => {
    setLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  };

  const removeLink = (index) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const addSubtask = () => {
    setSubtasks((prev) => [
      ...prev,
      { id: "s" + Date.now(), text: "", done: false },
    ]);
  };

  const updateSubtask = (index, text) => {
    setSubtasks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, text } : s))
    );
  };

  const removeSubtask = (index) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSubtaskDone = (index) => {
    setSubtasks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, done: !s.done } : s))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: title.trim() || "Untitled",
      priority,
      colorLabel: colorLabel || null,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      notes: notes.trim(),
      links: links.filter((l) => l.url?.trim()),
      subtasks: subtasks.filter((s) => s.text?.trim()).map((s) => ({ ...s, text: s.text.trim() })),
    };
    try {
      if (isEdit) {
        await updateTodo(initialTodo.id, payload);
        onSuccess?.("updated");
      } else {
        await addTodo(payload);
        onSuccess?.("created");
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save todo");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit todo" : "New todo"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            autoFocus
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="min-w-[100px]">
            <label className="label">Priority</label>
            <select
              className="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-1.5 mt-1">
              <button
                type="button"
                className="w-6 h-6 rounded-full border-2 transition-transform"
                style={{
                  borderColor: !colorLabel ? "var(--accent)" : "var(--border)",
                  background: "transparent",
                }}
                onClick={() => setColorLabel(null)}
                title="None"
              />
              {LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    background: c,
                    borderColor: colorLabel === c ? "var(--text-primary)" : "transparent",
                  }}
                  onClick={() => setColorLabel(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Due date</label>
            <input
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Due time</label>
            <input
              type="time"
              className="input"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input min-h-[80px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Links</label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addLink}>
              <Plus size={14} /> Add link
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
            <label className="label mb-0">Subtasks</label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addSubtask}>
              <Plus size={14} /> Add subtask
            </button>
          </div>
          <ul className="space-y-2">
            {subtasks.map((st, i) => (
              <li key={st.id || i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!st.done}
                  onChange={() => toggleSubtaskDone(i)}
                  className="rounded border-[var(--border)]"
                />
                <input
                  className="input flex-1 py-1.5 text-sm"
                  placeholder="Subtask"
                  value={st.text}
                  onChange={(e) => updateSubtask(i, e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => removeSubtask(i)}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEdit ? "Save" : "Add todo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
