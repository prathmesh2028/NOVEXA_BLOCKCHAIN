import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import AuditTimeline from "../../components/ui/AuditTimeline";
import { auditService, AuditEventResponse } from "../../services/audit";
import { supplyChainService, SupplyChainEventResponse } from "../../services/supply-chain";
import { certificationService } from "../../services/certifications";
import { blockchainService } from "../../services/blockchain";

export default function HistoryPage() {
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch platform audit, certifications, blockchain transactions, and supply-chain events
      const [auditRes, certRes, txRes, scRes] = await Promise.allSettled([
        auditService.listAuditEvents({ page_size: 100 }),
        certificationService.listCertifications({ page_size: 50 }),
        blockchainService.listTransactions({ page_size: 50 }),
        supplyChainService.listEvents({ page_size: 50 }),
      ]);

      const items: any[] = [];

      // 1. Audit events
      if (auditRes.status === "fulfilled" && auditRes.value?.items) {
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

      // 2. Certifications & NFT minting
      if (certRes.status === "fulfilled" && certRes.value?.items) {
        certRes.value.items.forEach((c: any) => {
          const isConfirmed = c.status === "CONFIRMED";
          items.push({
            id: `cert-${c.id || c.cert_id}`,
            timestamp: c.confirmed_at || c.issued_at,
            actor: c.issued_by || "did:bel:actor:002",
            role: "quality-inspector",
            action: isConfirmed ? "NFT_CERTIFICATION_CONFIRMED" : "NFT_CERTIFICATION_MINTED",
            resource: `ASSET: ${c.asset_id} · ${c.cert_id}`,
            result: isConfirmed ? "SUCCESS" : c.status === "FAILED" ? "FAILED" : "WARNING",
            details: `Soulbound NFT Token: ${c.token_id || "Pending Confirmation"} (Batch: ${c.batch_id || "Standard"})`,
            txHash: c.tx_hash,
            category: "NFT_CERT",
          });
        });
      }

      // 3. Blockchain transactions
      if (txRes.status === "fulfilled" && txRes.value?.items) {
        txRes.value.items.forEach((tx: any) => {
          const isSuccess = tx.status === "CONFIRMED" || tx.status === "SUCCESS";
          items.push({
            id: `tx-${tx.id || tx.tx_hash}`,
            timestamp: tx.timestamp,
            actor: tx.from_address || "0x8A42...19F2",
            role: "BLOCKCHAIN",
            action: tx.action || "BLOCKCHAIN_TRANSACTION",
            resource: `TOKEN: ${tx.token_id || "N/A"} · Block #${tx.block_number ?? "Pending"}`,
            result: isSuccess ? "SUCCESS" : tx.status === "FAILED" ? "FAILED" : "WARNING",
            details: `Network: ${tx.network || "BEL-TRUST-CHAIN"} · Confirmations: ${tx.confirmations}`,
            txHash: tx.tx_hash,
            category: "BLOCKCHAIN",
          });
        });
      }

      // 4. Supply chain events
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

  const certCount = events.filter((e) => e.category === "NFT_CERT").length;
  const blockchainCount = events.filter((e) => e.category === "BLOCKCHAIN").length;
  const scCount = events.filter((e) => e.category === "SUPPLY_CHAIN").length;
  const auditCount = events.filter((e) => e.category === "AUDIT").length;

  const filtered = events.filter((e) => {
    const matchesFilter = filter === "ALL"
      ? true
      : filter === "SUCCESS" || filter === "WARNING" || filter === "FAILED"
      ? e.result === filter
      : e.category === filter;

    const s = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (e.action && e.action.toLowerCase().includes(s)) ||
      (e.resource && e.resource.toLowerCase().includes(s)) ||
      (e.actor && e.actor.toLowerCase().includes(s)) ||
      (e.details && e.details.toLowerCase().includes(s)) ||
      (e.txHash && e.txHash.toLowerCase().includes(s));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-fade">
      <PageHeader
        title="History"
        subtitle="Chronological historical log of platform events, asset certifications, and blockchain lifecycle transactions"
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Events" value={events.length.toString()} icon="≡" />
        <StatCard label="Certifications & NFT" value={certCount.toString()} icon="◆" accent="#8b5cf6" />
        <StatCard label="Blockchain Txs" value={blockchainCount.toString()} icon="⬡" accent="#22c55e" />
        <StatCard label="Supply Chain" value={scCount.toString()} icon="⛟" accent="#60a5fa" />
      </div>

      <div
        style={{
          padding: "12px 16px",
          background: "rgba(96,165,250,0.06)",
          border: "1px solid rgba(96,165,250,0.15)",
          borderRadius: "5px",
          marginBottom: 16,
          fontSize: "0.8125rem",
          color: "#94a3b8",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "#60a5fa" }}>Historical Event Ledger: </strong>
        Tamper-resistant timeline combining cryptographic certifications, blockchain transactions, supply chain checkpoints, and platform audit records.
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "ALL", label: `All (${events.length})` },
            { key: "NFT_CERT", label: `NFT & Certifications (${certCount})` },
            { key: "BLOCKCHAIN", label: `Blockchain (${blockchainCount})` },
            { key: "SUPPLY_CHAIN", label: `Supply Chain (${scCount})` },
            { key: "AUDIT", label: `Audit (${auditCount})` },
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

        <div style={{ minWidth: 260 }}>
          <input
            type="text"
            className="input"
            style={{ width: "100%", padding: "6px 12px", fontSize: "0.8125rem", background: "#08131f", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
            placeholder="Search history by keyword, hash, or DID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
        Showing {filtered.length} of {events.length} platform history events (Powered by Backend API & BEL-TRUST-CHAIN)
      </div>
    </div>
  );
}
