import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import AuditTimeline from "../../components/ui/AuditTimeline";
import { AUDIT_EVENTS } from "../../data/mockData";

export default function AuditPage() {
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? AUDIT_EVENTS : AUDIT_EVENTS.filter((e) => e.result === filter);

  return (
    <div className="page-fade">
      <PageHeader
        title="Audit Logs"
        subtitle="Chronological record of all platform actions for investigation and compliance"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Audit Logs" }]}
      />

      <div
        style={{
          padding: "12px 16px",
          background: "rgba(96,165,250,0.06)",
          border: "1px solid rgba(96,165,250,0.15)",
          borderRadius: "5px",
          marginBottom: 20,
          fontSize: "0.8125rem",
          color: "#64748b",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "#60a5fa" }}>ⓘ Tamper-evident audit log: </strong>
        All audit events are cryptographically linked to blockchain records. Any attempt to modify or delete historical events is detectable.
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { key: "ALL", label: "All Events", count: AUDIT_EVENTS.length },
          { key: "SUCCESS", label: "Success", count: AUDIT_EVENTS.filter((e) => e.result === "SUCCESS").length },
          { key: "WARNING", label: "Warning", count: AUDIT_EVENTS.filter((e) => e.result === "WARNING").length },
          { key: "FAILED", label: "Failed", count: AUDIT_EVENTS.filter((e) => e.result === "FAILED").length },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "6px 14px",
              background: filter === f.key ? "rgba(37,99,235,0.2)" : "transparent",
              border: `1px solid ${filter === f.key ? "#2563eb" : "#1e3a60"}`,
              borderRadius: "4px",
              color: filter === f.key ? "#e2e8f0" : "#64748b",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {f.label}
            <span style={{ marginLeft: 6, fontSize: "0.75rem", opacity: 0.7 }}>({f.count})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ color: "#475569" }}>No audit events match this filter</div>
        </div>
      ) : (
        <AuditTimeline events={filtered} />
      )}

      <div style={{ marginTop: 20, fontSize: "0.75rem", color: "#475569" }}>
        {filtered.length} events shown · Click any event to expand technical details
      </div>
    </div>
  );
}
