interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  VERIFIED: { label: "Verified", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "✓" },
  CONFIRMED: { label: "Confirmed", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "✓" },
  SUCCESS: { label: "Success", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "✓" },
  Complete: { label: "Complete", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "✓" },
  ACCEPTED_FOR_ASSEMBLY: { label: "Accepted", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "✓" },
  ACTIVE: { label: "Active", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "●" },

  PENDING: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "◐" },
  Processing: { label: "Processing", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "◐" },
  Uploading: { label: "Uploading", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "↑" },
  Hashing: { label: "Hashing", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "◐" },
  REVIEW_REQUIRED: { label: "Review Required", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "⚠" },
  WARNING: { label: "Warning", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "⚠" },
  INSPECTION_RECORDED: { label: "Inspection Recorded", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", icon: "●" },
  RECEIVED: { label: "Received", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", icon: "●" },
  SUPPLIER_DECLARED: { label: "Supplier Declared", color: "#94a3b8", bg: "rgba(148,163,184,0.1)", icon: "●" },
  UNREGISTERED: { label: "Unregistered", color: "#64748b", bg: "rgba(100,116,139,0.1)", icon: "○" },
  NOT_CERTIFIED: { label: "Not Certified", color: "#64748b", bg: "rgba(100,116,139,0.1)", icon: "—" },

  FAILED: { label: "Failed", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "✕" },
  REJECTED_QUARANTINED: { label: "Rejected / Quarantined", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "✕" },
  Failed: { label: "Failed", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "✕" },
  Invalid: { label: "Invalid", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "✕" },
  UNAVAILABLE: { label: "Unavailable", color: "#64748b", bg: "rgba(100,116,139,0.1)", icon: "—" },

  REVOKED: { label: "Revoked", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: "⊘" },
  LOCKED: { label: "Non-transferable", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: "⊠" },
  Duplicate: { label: "Duplicate", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: "⊘" },
  DISABLED: { label: "Disabled", color: "#64748b", bg: "rgba(100,116,139,0.1)", icon: "⊘" },

  // Inspection Statuses
  SCHEDULED: { label: "Scheduled", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", icon: "◷" },
  Scheduled: { label: "Scheduled", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", icon: "◷" },
  IN_PROGRESS: { label: "In Progress", color: "#38bdf8", bg: "rgba(56,189,248,0.12)", icon: "◐" },
  "In Progress": { label: "In Progress", color: "#38bdf8", bg: "rgba(56,189,248,0.12)", icon: "◐" },
  COMPLETED: { label: "Completed", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "✓" },
  Completed: { label: "Completed", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "✓" },
  ATTENTION_REQUIRED: { label: "Attention Required", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "⚠" },
  "Attention Required": { label: "Attention Required", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "⚠" },

  // Priorities
  CRITICAL: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "▲" },
  Critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "▲" },
  HIGH: { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: "▲" },
  High: { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: "▲" },
  MEDIUM: { label: "Medium", color: "#eab308", bg: "rgba(234,179,8,0.12)", icon: "■" },
  Medium: { label: "Medium", color: "#eab308", bg: "rgba(234,179,8,0.12)", icon: "■" },
  STANDARD: { label: "Standard", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: "●" },
  Standard: { label: "Standard", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: "●" },

  // Checklist Item States
  Pass: { label: "Pass", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "✓" },
  Passed: { label: "Pass", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "✓" },
  Fail: { label: "Fail", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "✕" },
  "Not Checked": { label: "Not Checked", color: "#64748b", bg: "rgba(100,116,139,0.12)", icon: "○" },

  // Evidence Requirements
  Required: { label: "Required", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "!" },
  Attached: { label: "Attached", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "✓" },
  Missing: { label: "Missing", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "✕" },
  "Not Required": { label: "Not Required", color: "#64748b", bg: "rgba(100,116,139,0.12)", icon: "—" },
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
    icon: "●",
  };

  const px = size === "sm" ? "6px 8px" : "4px 10px";
  const fs = size === "sm" ? "0.6875rem" : "0.75rem";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: px,
        background: cfg.bg,
        color: cfg.color,
        borderRadius: "4px",
        fontSize: fs,
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        border: `1px solid ${cfg.color}22`,
      }}
    >
      <span style={{ fontSize: "0.65rem" }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}
