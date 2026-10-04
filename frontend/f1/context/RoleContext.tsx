import { createContext, useContext, ReactNode } from "react";
import type { Role } from "./AuthContext";

// Re-export Role for use in other components
export type { Role };

interface RoleContextValue {
  getRoleLabel: (role: Role) => string;
  getRoleColor: (role: Role) => string;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export const getRoleLabel = (role: Role): string => {
  const labels: Record<string, string> = {
    "system-admin": "System Administrator",
    "procurement-supply-chain-officer": "Procurement & Supply Chain Officer",
    "quality-inspector": "Quality Inspector",
    "auditor": "Auditor",
  };
  return labels[role] || role;
};

export const getRoleColor = (role: Role): string => {
  const colors: Record<string, string> = {
    "system-admin": "#ef4444",
    "procurement-supply-chain-officer": "#8b5cf6",
    "quality-inspector": "#f59e0b",
    "auditor": "#22c55e",
  };
  return colors[role] || "#64748b";
};

export function RoleProvider({ children }: { children: ReactNode }) {
  return (
    <RoleContext.Provider value={{ getRoleLabel, getRoleColor }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
