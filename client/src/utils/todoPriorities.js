/**
 * Priority is stored as P1–P4 in the API. We display professional labels in the UI.
 */
export const PRIORITY_VALUES = ["P1", "P2", "P3", "P4"];

export const PRIORITY_OPTIONS = [
  { value: "P1", label: "Critical" },
  { value: "P2", label: "High" },
  { value: "P3", label: "Medium" },
  { value: "P4", label: "Low" },
];

export const priorityOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };

export function getPriorityLabel(priority) {
  const opt = PRIORITY_OPTIONS.find((o) => o.value === priority);
  return opt ? opt.label : priority || "Low";
}

export function getPriorityColor(priority) {
  switch (priority) {
    case "P1":
      return "var(--color-danger)";
    case "P2":
      return "var(--color-warning, #f59e0b)";
    case "P3":
      return "var(--accent)";
    default:
      return "var(--text-muted)";
  }
}
