import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useTodo } from "../../context/todoContext";
import toast from "react-hot-toast";

function RuleRow({ id, text, onEdit, onDelete, isEditing, onStartEdit, onSaveEdit }) {
  const [editText, setEditText] = useState(text);
  useEffect(() => {
    setEditText(text);
  }, [text]);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = async () => {
    const t = editText.trim();
    if (t) {
      try {
        await onSaveEdit(id, t);
        onEdit(null);
      } catch (_) {}
    } else {
      onEdit(null);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2 py-2 group"
    >
      <button
        className="touch-none cursor-grab active:cursor-grabbing p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: "var(--text-muted)" }}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <input
            className="input flex-1 py-1.5 text-sm"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="flex-1 text-left px-2 py-1.5 rounded-lg hover:bg-[var(--color-surface-100)] dark:hover:bg-[var(--color-surface-800)] transition-colors text-sm"
            style={{ color: "var(--text-primary)" }}
            onClick={() => onStartEdit(id)}
          >
            {text}
          </button>
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-all"
            onClick={() => onDelete(id)}
            aria-label="Delete rule"
          >
            <Trash2 size={14} />
          </button>
        </>
      )}
    </motion.div>
  );
}

export default function DailyRules() {
  const { rules, addRule, updateRule, deleteRule, reorderRules } = useTodo();
  const [editingId, setEditingId] = useState(null);
  const [newRuleText, setNewRuleText] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = rules.findIndex((r) => r.id === active.id);
      const newIndex = rules.findIndex((r) => r.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        try {
          await reorderRules(oldIndex, newIndex);
          toast.success("Rules reordered");
        } catch (e) {
          toast.error(e.response?.data?.message || "Failed to reorder rules");
        }
      }
    }
  };

  const handleAdd = async () => {
    const t = newRuleText.trim();
    if (t) {
      try {
        await addRule(t);
        setNewRuleText("");
        toast.success("Rule added");
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to add rule");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRule(id);
      toast.success("Rule removed");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to remove rule");
    }
  };

  const handleSaveEdit = async (id, text) => {
    try {
      await updateRule(id, text);
      setEditingId(null);
      toast.success("Rule updated");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update rule");
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Daily Rules
        </h3>
        <div className="flex gap-2 flex-1 max-w-xs ml-2">
          <input
            className="input flex-1 py-1.5 text-sm"
            placeholder="Add a rule..."
            value={newRuleText}
            onChange={(e) => setNewRuleText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm btn-icon"
            onClick={handleAdd}
            title="Add rule"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {rules.map((rule) => (
              <RuleRow
                key={rule.id}
                id={rule.id}
                text={rule.text}
                onEdit={setEditingId}
                onDelete={handleDelete}
                onSaveEdit={handleSaveEdit}
                isEditing={editingId === rule.id}
                onStartEdit={setEditingId}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>
    </div>
  );
}
