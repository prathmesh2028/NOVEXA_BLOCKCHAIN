import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader";
import AuditTimeline from "../../components/ui/AuditTimeline";
import { auditService, AuditEventResponse } from "../../services/audit";
import { supplyChainService, SupplyChainEventResponse } from "../../services/supply-chain";
import "./SystemActivityPage.css";

export default function AuditPage() {
  const [filter, setFilter] = useState("ALL");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both audit events and supply chain events to provide comprehensive system activity
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
            action: e.event_type || "SUPPLY_CHAIN_UPDATE",
            resource: `${e.entity_type}: ${e.entity_id}`,
            result: "SUCCESS",
            details: e.description,
            txHash: null,
            category: "SUPPLY_CHAIN",
          });
        });
      }

      // Sort chronological descending
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEvents(items);
    } catch (err: any) {
      console.error("System Activity load error:", err);
      setError(err.message || "Failed to load system activity records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filtered = filter === "ALL"
    ? events
    : filter === "SUPPLY_CHAIN"
    ? events.filter((e) => e.category === "SUPPLY_CHAIN")
    : filter === "AUDIT"
    ? events.filter((e) => e.category === "AUDIT")
    : events.filter((e) => e.result === filter);

  return (
    <div className="system-activity-page-root">
      <PageHeader
        title="System Activity"
        subtitle="Chronological record of platform actions, security events, and supply-chain updates"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "System Activity" }]}
        actions={
          <button className="btn-ghost" onClick={fetchEvents}>
            ↻ Refresh
          </button>
        }
      />

      <div className="sysact-notice-box">
        <span style={{ fontSize: "1rem" }}>ⓘ</span>
        <div>
          <span className="sysact-notice-strong">System Activity Ledger: </span>
          System activity events are cryptographically hashed and anchored. This enables tamper detection for the digital records shown here.
        </div>
      </div>

      <div className="sysact-filter-tabs">
        {[
          { key: "ALL", label: "All Activity" },
          { key: "SUPPLY_CHAIN", label: "Supply Chain" },
          { key: "AUDIT", label: "Audit Records" },
          { key: "SUCCESS", label: "Success" },
          { key: "WARNING", label: "Warning" },
          { key: "FAILED", label: "Failed" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`sysact-filter-tab ${filter === f.key ? "active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="panel" style={{ padding: 40, textAlign: "center", color: "#737373", background: "#181818", border: "1px solid #2a2a2a", borderRadius: "12px" }}>
          Loading system activity events...
        </div>
      ) : error ? (
        <div className="panel" style={{ padding: 40, textAlign: "center", background: "#181818", border: "1px solid #2a2a2a", borderRadius: "12px" }}>
          <div style={{ color: "#ef4444", marginBottom: 12 }}>{error}</div>
          <button className="btn-secondary" onClick={fetchEvents}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel" style={{ padding: 40, textAlign: "center", background: "#181818", border: "1px solid #2a2a2a", borderRadius: "12px" }}>
          <div style={{ color: "#737373" }}>No system activity events match this filter</div>
        </div>
      ) : (
        <AuditTimeline events={filtered} />
      )}

      <div style={{ marginTop: 20, fontSize: "0.75rem", color: "#737373" }}>
        Showing {filtered.length} of {events.length || total} system activity records (Powered by Backend API)
      </div>
    </div>
  );
}

