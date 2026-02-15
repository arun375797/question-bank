import { createContext, useContext } from "react";

export const TodoContext = createContext(null);

export function useTodo() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodo must be used within TodoProvider");
  return ctx;
}
