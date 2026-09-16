import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import StatCard from "../../components/ui/StatCard";
import { useState, useEffect } from "react";
import { formatDateTime, shortHash } from "../../data/mockData";
import { blockchainService, BlockchainTransactionResponse } from "../../services/blockchain";
import { dashboardService } from "../../services/dashboard";

export default function BlockchainPage() {
  const [txs, setTxs] = useState<BlockchainTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [listRes, summaryRes] = await Promise.all([
          blockchainService.listTransactions({ page_size: 100 }),
          dashboardService.getSummary()
        ]);
        setTxs(listRes.items);
        // We use the dashboard summary for total blockchain txs, but here we can just use total from list API
        setTotal(listRes.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="page-fade">
      <PageHeader
        title="Blockchain"
        subtitle="Transaction records and verification proof on BEL-TRUST-CHAIN"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Blockchain" }]}
      />

      {/* Network info */}
      <div className="panel" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span style={{ color: "#22c55e", fontSize: "0.75rem" }}>●</span>
          <span className="font-display" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.04em" }}>
            BEL-TRUST-CHAIN
          </span>
          <span style={{ fontSize: "0.6875rem", color: "#f59e0b", fontWeight: 600, padding: "2px 8px", background: "rgba(245,158,11,0.1)", borderRadius: "3px" }}>
            SYNTHETIC DEMO NETWORK
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { label: "Contract Address", value: "0x742d35Cc6634C0532925a3b8D4e9Cc7C0SYNTH", mono: true },
            { label: "Consensus", value: "Proof-of-Authority (Demo)" },
            { label: "Latest Block", value: "19,842,317" },
            { label: "Network Status", value: "Synced ✓" },
          ].map((f) => (
            <div key={f.label}>
              <div className="section-label" style={{ marginBottom: 3 }}>{f.label}</div>
              {f.mono ? (
                <span className="meta-id" style={{ color: "#60a5fa" }}>{f.value}</span>
              ) : (
                <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{f.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Transactions" value={total.toString()} icon="⬡" />
        <StatCard label="Confirmed" value={total.toString()} icon="✓" accent="#22c55e" />
        <StatCard label="Pending" value="0" icon="◐" accent="#f59e0b" />
        <StatCard label="Failed" value="0" icon="✕" />
      </div>

      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e3a60", background: "#08131f" }}>
          <div className="section-label">RECENT TRANSACTIONS</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a60" }}>
                {["Transaction Hash", "Action", "Asset", "Block", "Confirmations", "Status", "Timestamp"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.6875rem", color: "#475569", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>Loading transactions...</td>
                </tr>
              ) : txs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>No transactions found.</td>
                </tr>
              ) : (
                txs.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: "1px solid #152b4a" }} className="table-row">
                    <td style={{ padding: "12px 14px" }}>
                      <div className="meta-id" style={{ color: "#60a5fa" }}>{shortHash(tx.tx_hash, 8)}</div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#94a3b8" }}>{tx.action}</td>
                    <td style={{ padding: "12px 14px" }}>
                      {/* Note: the backend token_id is just an id, not asset ID for now. */}
                      <span className="meta-id" style={{ color: "#94a3b8" }}>{tx.token_id || "—"}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>
                        {(tx.block_number ?? 0) > 0 ? tx.block_number?.toLocaleString() : "Pending"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "0.8125rem", color: "#64748b" }}>{tx.confirmations}</td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={tx.status} size="sm" /></td>
                    <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>
                      {formatDateTime(tx.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: "0.75rem", color: "#475569", lineHeight: 1.6 }}>
        BEL-TRUST-CHAIN is a synthetic demonstration blockchain. Transactions shown are for prototype purposes only and do not represent real on-chain activity.
      </div>
    </div>
  );
}
