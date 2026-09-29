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
          padding: "14px 18px",
          background: "var(--primary-muted, rgba(37,99,235,0.06))",
          border: "1px solid var(--border-subtle, rgba(37,99,235,0.2))",
          borderRadius: "8px",
          marginBottom: 24,
          fontSize: "0.8125rem",
          color: "var(--muted, #4A4A4A)",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "var(--primary, #2563eb)", fontWeight: 700 }}>RBAC Principle: </strong>
        No user can exceed the boundary of their assigned role. Every action is authorized against role permissions before execution.
        Role changes generate an audit event and require admin authorization.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {ROLES_DATA.map((r) => (
          <div
            key={r.key}
            className="panel"
            style={{
              padding: 24,
              borderTop: `3px solid ${r.color}`,
              background: "var(--card)",
              borderColor: "var(--border)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    background: r.color + "18",
                    border: `1px solid ${r.color}40`,
                    borderRadius: "8px",
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
                    style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground, #171717)", letterSpacing: "0.04em" }}
                  >
                    {r.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted, #4A4A4A)", fontWeight: 600 }}>
                    {r.users} user{r.users !== 1 ? "s" : ""} assigned
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--muted, #4A4A4A)", lineHeight: 1.6, marginBottom: 16, fontWeight: 500 }}>
              {r.description}
            </p>
            <div className="section-label" style={{ marginBottom: 10, fontSize: "0.6875rem", fontWeight: 700, color: "var(--subtle-text, #707070)", letterSpacing: "0.08em" }}>
              CAPABILITIES
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {r.capabilities.map((c) => (
                <div key={c} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.78125rem", color: "var(--foreground, #171717)", fontWeight: 500 }}>
                  <span style={{ color: r.color, fontSize: "0.75rem", marginTop: 2, flexShrink: 0, fontWeight: 700 }}>✓</span>
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
