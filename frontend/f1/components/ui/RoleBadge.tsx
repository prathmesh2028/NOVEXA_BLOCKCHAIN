import { getRoleLabel, getRoleColor, type Role } from "../../context/RoleContext";

interface RoleBadgeProps {
  role: string;
  size?: "sm" | "md";
}

export default function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const knownRole = role as Role;
  let label = role;
  let color = "#94a3b8";
  try {
    label = getRoleLabel(knownRole);
    color = getRoleColor(knownRole);
  } catch {
    // fallback for non-Role strings like "Administrator"
    const map: Record<string, { label: string; color: string }> = {
      Administrator: { label: "Administrator", color: "#ef4444" },
      "NFT Creator": { label: "NFT Creator", color: "#8b5cf6" },
      Technician: { label: "Technician", color: "#f59e0b" },
      Auditor: { label: "Auditor", color: "#22c55e" },
    };
    const m = map[role];
    if (m) { label = m.label; color = m.color; }
  }

  const fs = size === "sm" ? "0.6875rem" : "0.75rem";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 8px",
        background: color + "18",
        color,
        borderRadius: "4px",
        fontSize: fs,
        fontWeight: 600,
        letterSpacing: "0.02em",
        border: `1px solid ${color}30`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
