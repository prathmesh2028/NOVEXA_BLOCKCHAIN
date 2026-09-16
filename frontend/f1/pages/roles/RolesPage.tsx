import PageHeader from "../../components/ui/PageHeader";

const ROLES_DATA = [
  {
    key: "admin",
    label: "Administrator",
    color: "#ef4444",
    icon: "⊛",
    description: "Full platform governance and oversight. System configuration, user management, and security monitoring.",
    capabilities: [
      "Manage all users and role assignments",
      "View and manage all assets, certifications, blockchain records",
      "Configure system settings and network parameters",
      "Monitor security events and audit logs",
      "Manage data retention and compliance policies",
    ],
    users: 1,
  },
  {
    key: "nft-creator",
    label: "NFT Creator",
    color: "#8b5cf6",
    icon: "◆",
    description: "Review eligible asset records and create trusted non-transferable digital certification records on the blockchain.",
    capabilities: [
      "Review eligible assets and their evidence",
      "Verify evidence integrity and lifecycle completeness",
      "Initiate certification minting on-chain",
      "Monitor blockchain transaction status",
      "Inspect and manage certification history",
    ],
    users: 1,
  },
  {
    key: "technician",
    label: "Technician",
    color: "#f59e0b",
    icon: "◈",
    description: "Create and maintain accurate technical records for assigned defence assets through the complete lifecycle.",
    capabilities: [
      "Register new assets and update existing records",
      "Upload evidence files (fingerprinted and stored)",
      "Record inspection results and lifecycle transitions",
      "Submit technical data and specifications",
      "View assigned asset history and certification status",
    ],
    users: 2,
  },
  {
    key: "auditor",
    label: "Auditor",
    color: "#22c55e",
    icon: "◎",
    description: "Investigate and verify asset records, evidence integrity, certifications, and blockchain proof for compliance.",
    capabilities: [
      "Search all assets, certifications, and transactions",
      "Verify evidence integrity and fingerprint matching",
      "Inspect lifecycle history and event sequences",
      "Verify blockchain proof and confirmation status",
      "Review complete audit trail for any asset or action",
    ],
    users: 1,
  },
];

export default function RolesPage() {
  return (
    <div className="page-fade">
      <PageHeader
        title="Roles & Permissions"
        subtitle="Role-based access control governing all platform actions"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Roles" }]}
      />

      <div
        style={{
          padding: "12px 16px",
          background: "rgba(96,165,250,0.06)",
          border: "1px solid rgba(96,165,250,0.15)",
          borderRadius: "5px",
          marginBottom: 24,
          fontSize: "0.8125rem",
          color: "#64748b",
        }}
      >
        <strong style={{ color: "#60a5fa" }}>RBAC Principle: </strong>
        No user can exceed the boundary of their assigned role. Every action is authorized against role permissions before execution.
        Role changes generate an audit event and require admin authorization.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {ROLES_DATA.map((r) => (
          <div
            key={r.key}
            className="panel"
            style={{ padding: 24, borderTop: `2px solid ${r.color}` }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: r.color + "18",
                    border: `1px solid ${r.color}40`,
                    borderRadius: "7px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    color: r.color,
                  }}
                >
                  {r.icon}
                </div>
                <div>
                  <div
                    className="font-display"
                    style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.04em" }}
                  >
                    {r.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>{r.users} user{r.users !== 1 ? "s" : ""} assigned</div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.6, marginBottom: 16 }}>
              {r.description}
            </p>
            <div className="section-label" style={{ marginBottom: 8 }}>CAPABILITIES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {r.capabilities.map((c) => (
                <div key={c} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: "0.75rem", color: "#64748b" }}>
                  <span style={{ color: r.color, fontSize: "0.625rem", marginTop: 3, flexShrink: 0 }}>✓</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
