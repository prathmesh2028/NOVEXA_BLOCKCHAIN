import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "admin" | "nft-creator" | "technician" | "auditor";

interface RoleUser {
  id: string;
  name: string;
  role: Role;
  did: string;
  email: string;
  wallet?: string;
}

interface RoleContextValue {
  user: RoleUser | null;
  login: (role: Role) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const USERS: Record<Role, RoleUser> = {
  admin: {
    id: "USR-001",
    name: "Arjun Mehta",
    role: "admin",
    did: "did:bel:actor:001",
    email: "a.mehta@bel-defence.in",
    wallet: "0x8A42...19F2",
  },
  "nft-creator": {
    id: "USR-002",
    name: "Priya Sharma",
    role: "nft-creator",
    did: "did:bel:actor:002",
    email: "p.sharma@bel-defence.in",
    wallet: "0x3C77...A4D1",
  },
  technician: {
    id: "USR-003",
    name: "Rajesh Kumar",
    role: "technician",
    did: "did:bel:actor:003",
    email: "r.kumar@bel-defence.in",
  },
  auditor: {
    id: "USR-004",
    name: "Deepa Nair",
    role: "auditor",
    did: "did:bel:actor:004",
    email: "d.nair@bel-defence.in",
  },
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RoleUser | null>(() => {
    const stored = localStorage.getItem("bel_role");
    return stored ? USERS[stored as Role] ?? null : null;
  });

  function login(role: Role) {
    const u = USERS[role];
    setUser(u);
    localStorage.setItem("bel_role", role);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("bel_role");
  }

  return (
    <RoleContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    admin: "Administrator",
    "nft-creator": "NFT Creator",
    technician: "Technician",
    auditor: "Auditor",
  };
  return labels[role];
}

export function getRoleColor(role: Role): string {
  const colors: Record<Role, string> = {
    admin: "#ef4444",
    "nft-creator": "#8b5cf6",
    technician: "#f59e0b",
    auditor: "#22c55e",
  };
  return colors[role];
}
