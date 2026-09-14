import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader";
import AuditTimeline from "../../components/ui/AuditTimeline";
import { auditService, AuditEventResponse } from "../../services/audit";
import { dashboardService } from "../../services/dashboard";

export default function AuditPage() {
  const [filter, setFilter] = useState("ALL");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await auditService.listAuditEvents({ page_size: 100 });
        setTotal(res.total);
        // Map backend response to UI format
        const mapped = res.items.map((e: AuditEventResponse) => ({
          id: e.id,
          timestamp: e.timestamp,
          actor: e.actor_did,
          role: e.actor_role,
          action: e.action,
          resource: `${e.resource_type}: ${e.resource_id}`,
          result: e.result,
          details: e.details,
          txHash: e.blockchain_tx_hash
        }));
        setEvents(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = filter === "ALL" ? events : events.filter((e) => e.result === filter);

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
          { key: "ALL", label: "All Events" },
          { key: "SUCCESS", label: "Success" },
          { key: "WARNING", label: "Warning" },
          { key: "FAILED", label: "Failed" },
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
          </button>
        ))}
      </div>

      {loading ? (
        <div className="panel" style={{ padding: 40, textAlign: "center", color: "#475569" }}>Loading audit events...</div>
      ) : filtered.length === 0 ? (
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ color: "#475569" }}>No audit events match this filter</div>
        </div>
      ) : (
        <AuditTimeline events={filtered} />
      )}

      <div style={{ marginTop: 20, fontSize: "0.75rem", color: "#475569" }}>
        Showing {filtered.length} of {total} events (Powered by Backend API)
      </div>
    </div>
  );
}
