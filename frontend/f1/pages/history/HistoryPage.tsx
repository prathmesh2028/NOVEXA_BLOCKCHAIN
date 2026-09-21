import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader";
import AuditTimeline from "../../components/ui/AuditTimeline";
import { auditService, AuditEventResponse } from "../../services/audit";
import { supplyChainService, SupplyChainEventResponse } from "../../services/supply-chain";

export default function HistoryPage() {
  const [filter, setFilter] = useState("ALL");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch platform audit and supply-chain events
      const [auditRes, scRes] = await Promise.allSettled([
        auditService.listAuditEvents({ page_size: 100 }),
        supplyChainService.listEvents({ page_size: 50 }),
      ]);

      const items: any[] = [];

      if (auditRes.status === "fulfilled" && auditRes.value?.items) {
        setTotal(auditRes.value.total || auditRes.value.items.length);
        auditRes.value.items.forEach((e: AuditEventResponse) => {
          items.push({
            id: e.id,
            timestamp: e.timestamp,
            actor: e.actor_did,
            role: e.actor_role,
            action: e.action,
            resource: `${e.resource_type}: ${e.resource_id}`,
            result: e.result,
            details: e.details,
            txHash: e.blockchain_tx_hash,
            category: "AUDIT",
          });
        });
      }

      if (scRes.status === "fulfilled" && scRes.value?.items) {
        scRes.value.items.forEach((e: SupplyChainEventResponse) => {
          items.push({
            id: `sc-${e.id}`,
            timestamp: e.created_at,
            actor: e.actor || "SUPPLY_CHAIN",
            role: "SYSTEM",
            action: e.event_type || "SUPPLY_CHAIN_EVENT",
            resource: `${e.entity_type}: ${e.entity_id}`,
            result: "SUCCESS",
            details: e.description,
            txHash: null,
            category: "SUPPLY_CHAIN",
          });
        });
      }

      // Sort by timestamp descending
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEvents(items);
    } catch (err: any) {
      console.error("Failed to load history:", err);
      setError(err.message || "Failed to load history events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = filter === "ALL"
    ? events
    : filter === "SUPPLY_CHAIN"
    ? events.filter((e) => e.category === "SUPPLY_CHAIN")
    : events.filter((e) => e.result === filter);

  return (
    <div className="page-fade">
      <PageHeader
        title="History"
        subtitle="Chronological historical log of platform events, asset certifications, and lifecycle transitions"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "History" },
        ]}
        actions={
          <button className="btn-ghost" onClick={fetchHistory}>
            ↻ Refresh
          </button>
        }
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
        <strong style={{ color: "#60a5fa" }}>Historical Record: </strong>
        Tamper-resistant timeline of all verified asset milestones, certification states, and custody transfers.
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { key: "ALL", label: "All Events" },
          { key: "SUCCESS", label: "Success" },
          { key: "WARNING", label: "Warning" },
          { key: "FAILED", label: "Failed" },
          { key: "SUPPLY_CHAIN", label: "Supply Chain" },
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
        <div className="panel" style={{ padding: 40, textAlign: "center", color: "#475569" }}>
          Loading history events...
        </div>
      ) : error ? (
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ color: "#ef4444", marginBottom: 12 }}>{error}</div>
          <button className="btn-secondary" onClick={fetchHistory}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ color: "#475569" }}>No history events match this filter</div>
        </div>
      ) : (
        <AuditTimeline events={filtered} />
      )}

      <div style={{ marginTop: 20, fontSize: "0.75rem", color: "#475569" }}>
        Showing {filtered.length} of {events.length || total} platform history events (Powered by Backend API)
      </div>
    </div>
  );
}
