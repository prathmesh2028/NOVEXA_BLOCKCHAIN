import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import StatCard from "../../components/ui/StatCard";
import { useState, useEffect } from "react";
import { formatDateTime, shortHash } from "../../data/utils";
import { blockchainService, BlockchainTransactionResponse } from "../../services/blockchain";
import { dashboardService } from "../../services/dashboard";
import "./BlockchainPage.css";

export default function BlockchainPage() {
  const [txs, setTxs] = useState<BlockchainTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTx, setSelectedTx] = useState<BlockchainTransactionResponse | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, summaryRes] = await Promise.all([
        blockchainService.listTransactions({ page_size: 100 }),
        dashboardService.getSummary()
      ]);
      setTxs(listRes.items || []);
      setTotal(listRes.total || (listRes.items ? listRes.items.length : 0));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load blockchain transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  const confirmedCount = txs.filter((t) => t.status === "CONFIRMED" || t.status === "SUCCESS").length;
  const pendingCount = txs.filter((t) => t.status === "PENDING").length;
  const failedCount = txs.filter((t) => t.status === "FAILED" || t.status === "ERROR").length;

  const filteredTxs = txs.filter((tx) => {
    const matchesStatus = statusFilter === "ALL"
      ? true
      : statusFilter === "CONFIRMED"
      ? tx.status === "CONFIRMED" || tx.status === "SUCCESS"
      : statusFilter === "PENDING"
      ? tx.status === "PENDING"
      : tx.status === "FAILED" || tx.status === "ERROR";

    const s = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (tx.tx_hash && tx.tx_hash.toLowerCase().includes(s)) ||
      (tx.action && tx.action.toLowerCase().includes(s)) ||
      (tx.token_id && tx.token_id.toLowerCase().includes(s));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="blockchain-page-root">
      <PageHeader
        title="Blockchain"
        subtitle="Transaction records and verification proof on BEL-TRUST-CHAIN"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Blockchain" }]}
        actions={
          <button className="btn-ghost" onClick={fetchData}>
            ↻ Refresh
          </button>
        }
      />

      {/* Network info */}
      <div className="bc-network-panel">
        <div className="bc-network-header">
          <span style={{ color: "#22c55e", fontSize: "0.75rem" }}>●</span>
          <span className="font-display bc-network-title">
            BEL-TRUST-CHAIN
          </span>
          <span className="bc-network-badge">
            SYNTHETIC DEMO NETWORK
          </span>
        </div>
        <div className="bc-network-grid">
          {[
            { label: "Contract Address", value: "0x742d35Cc6634C0532925a3b8D4e9Cc7C0SYNTH", mono: true },
            { label: "Consensus", value: "Proof-of-Authority (Demo)" },
            { label: "Latest Block", value: "19,842,317" },
            { label: "Network Status", value: "Synced ✓" },
          ].map((f) => (
            <div key={f.label} className="bc-network-item">
              <div className="label">{f.label}</div>
              {f.mono ? (
                <span className="value-mono">{f.value}</span>
              ) : (
                <span className="value">{f.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Transactions" value={total.toString()} icon="⬡" accent="#f5f5f5" />
        <StatCard label="Confirmed" value={confirmedCount.toString()} icon="✓" accent="#22c55e" />
        <StatCard label="Pending" value={pendingCount.toString()} icon="◐" accent="#f59e0b" />
        <StatCard label="Failed" value={failedCount.toString()} icon="✕" accent="#ef4444" />
      </div>

      {/* Filter and Search Tabs */}
      <div className="bc-toolbar">
        <div className="bc-tabs-group">
          {[
            { key: "ALL", label: `All (${txs.length})` },
            { key: "CONFIRMED", label: `Confirmed (${confirmedCount})` },
            { key: "PENDING", label: `Pending (${pendingCount})` },
            { key: "FAILED", label: `Failed (${failedCount})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`bc-tab-btn ${statusFilter === f.key ? "active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ minWidth: 260 }}>
          <input
            type="text"
            className="bc-search-input"
            placeholder="Search tx hash, action, or token ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bc-table-wrap">
        <div className="bc-table-header">
          <div className="section-label" style={{ color: "#d4d4d4", fontWeight: 600 }}>TRANSACTION RECORDS</div>
          <span style={{ fontSize: "0.75rem", color: "#737373" }}>
            Showing {filteredTxs.length} of {txs.length} transactions
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="bc-table">
            <thead>
              <tr>
                {["Transaction Hash", "Action", "Asset / Token", "Block", "Confirmations", "Status", "Timestamp", "Detail"].map((h) => (
                  <th key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#737373" }}>Loading transactions...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
                    <div>{error}</div>
                    <button className="btn-secondary" style={{ marginTop: 10 }} onClick={fetchData}>Retry</button>
                  </td>
                </tr>
              ) : filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#737373" }}>No transactions found for this filter.</td>
                </tr>
              ) : (
                filteredTxs.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div
                        className="bc-tx-hash"
                        onClick={() => setSelectedTx(tx)}
                        title="Click to view full details"
                      >
                        {shortHash(tx.tx_hash, 8)}
                      </div>
                    </td>
                    <td style={{ color: "#f5f5f5" }}>{tx.action}</td>
                    <td>
                      <span className="meta-id" style={{ color: "#a3a3a3" }}>{tx.token_id || "—"}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "#737373" }}>
                        {(tx.block_number ?? 0) > 0 ? tx.block_number?.toLocaleString() : "Pending"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "#737373" }}>{tx.confirmations}</td>
                    <td><StatusBadge status={tx.status} size="sm" /></td>
                    <td style={{ fontSize: "0.75rem", color: "#737373", whiteSpace: "nowrap" }}>
                      {formatDateTime(tx.timestamp)}
                    </td>
                    <td>
                      <button
                        className="btn-ghost"
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        onClick={() => setSelectedTx(tx)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div className="bc-modal-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#f5f5f5" }}>Blockchain Transaction Detail</div>
              <button
                onClick={() => setSelectedTx(null)}
                style={{ background: "none", border: "none", color: "#737373", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Tx Hash", value: selectedTx.tx_hash, mono: true },
                { label: "Action", value: selectedTx.action },
                { label: "Token / Asset ID", value: selectedTx.token_id || "—", mono: true },
                { label: "Status", value: selectedTx.status },
                { label: "Block Number", value: selectedTx.block_number?.toString() || "Pending" },
                { label: "Confirmations", value: selectedTx.confirmations.toString() },
                { label: "Timestamp", value: formatDateTime(selectedTx.timestamp) },
                { label: "Network", value: "BEL-TRUST-CHAIN" },
              ].map((row) => (
                <div key={row.label} className="bc-modal-row">
                  <span style={{ fontSize: "0.75rem", color: "#737373" }}>{row.label}</span>
                  {row.label === "Status" ? (
                    <StatusBadge status={selectedTx.status} size="sm" />
                  ) : row.mono ? (
                    <span className="meta-id" style={{ color: "#f5f5f5", wordBreak: "break-all", textAlign: "right", maxWidth: 300, fontSize: "0.75rem" }}>
                      {row.value}
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.8125rem", color: "#d4d4d4", textAlign: "right" }}>{row.value}</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
              <button className="btn-secondary" onClick={() => setSelectedTx(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: "0.75rem", color: "#737373", lineHeight: 1.6 }}>
        BEL-TRUST-CHAIN is a synthetic demonstration blockchain. Transactions shown are for prototype purposes only and do not represent real on-chain activity.
      </div>
    </div>
  );
}
