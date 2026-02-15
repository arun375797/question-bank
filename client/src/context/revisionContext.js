import { createContext, useContext } from "react";

export const RevisionContext = createContext(null);

export function useRevision() {
  const ctx = useContext(RevisionContext);
  if (!ctx) throw new Error("useRevision must be used within RevisionProvider");
  return ctx;
}
