import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { api } from "../../services/api";

interface BlockchainProof {
  asset_id: string;
  found: boolean;
  lifecycle_state?: string;
  blockchain_connected: boolean;
  network?: string;
  proof?: {
    certification?: {
      cert_id: string;
      tx_hash: string;
      block_number?: number;
      confirmations?: number;
      status: string;
      on_chain_verified?: boolean | null;
    } | null;
    evidence_anchors: Array<{
      evidence_id: string;
      filename: string;
      hash: string;
      blockchain_tx: string;
      integrity_verified: boolean;
    }>;
    anchored_evidence_count: number;
    total_evidence_count: number;
  };
  note?: string;
}

export default function BlockchainProofPage() {
  const [assetId, setAssetId] = useState("");
  const [proof, setProof] = useState<BlockchainProof | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId) {
      setError("Please enter an Asset ID");
      return;
    }

    setLoading(true);
    setError("");
    setProof(null);

    try {
      const result = await api.get<BlockchainProof>(`/blockchain/proof/${assetId}`);
      setProof(result);
    } catch (err: any) {
      setError(err.message || "Failed to fetch blockchain proof");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-fade">
      <PageHeader
        title="Blockchain Proof"
        subtitle="Verify blockchain proof for assets and certifications. Check transaction confirmation, block number, and on-chain status."
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Blockchain Proof" },
        ]}
      />

      <div className="panel" style={{ maxWidth: 800, margin: "0 auto" }}>
        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#cbd5e1",
                marginBottom: 6,
              }}
            >
              Asset ID
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                placeholder="e.g., AST-2024-0001"
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  background: "#0a1628",
                  border: "1px solid #1e3a60",
                  borderRadius: 6,
                  color: "#e2e8f0",
                  fontSize: "0.875rem",
                }}
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Verifying..." : "Verify Proof"}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div
            style={{
              padding: 12,
              background: "#7f1d1d",
              border: "1px solid #991b1b",
              borderRadius: 6,
              marginBottom: 20,
              color: "#fca5a5",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        {proof && (
          <>
            {!proof.found ? (
              <div
                style={{
                  padding: 20,
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "0.875rem",
                }}
              >
                Asset not found. Please check the Asset ID and try again.
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #152b4a" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>
                      Asset Information
                    </h3>
                    <StatusBadge status={proof.lifecycle_state || "UNKNOWN"} size="sm" />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 8 }}>
                    <strong style={{ color: "#94a3b8" }}>Asset ID:</strong>{" "}
                    <span className="meta-id">{proof.asset_id}</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 8 }}>
                    <strong style={{ color: "#94a3b8" }}>Network:</strong> {proof.network || "N/A"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 8 }}>
                    <strong style={{ color: "#94a3b8" }}>Blockchain Connected:</strong>{" "}
                    <StatusBadge status={proof.blockchain_connected ? "Connected" : "Disconnected"} size="sm" />
                  </div>
                  {proof.note && (
                    <div
                      style={{
                        padding: 10,
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: 4,
                        marginTop: 12,
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                      }}
                    >
                      ℹ️ {proof.note}
                    </div>
                  )}
                </div>

                {proof.proof?.certification ? (
                  <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #152b4a" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>
                      Certification Proof
                    </h3>
                    <div style={{ display: "grid", gap: 10 }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        <strong style={{ color: "#94a3b8" }}>Cert ID:</strong>{" "}
                        <span className="meta-id">{proof.proof.certification.cert_id}</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        <strong style={{ color: "#94a3b8" }}>TX Hash:</strong>{" "}
                        <span className="meta-id">{proof.proof.certification.tx_hash}</span>
                      </div>
                      {proof.proof.certification.block_number && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          <strong style={{ color: "#94a3b8" }}>Block Number:</strong>{" "}
                          {proof.proof.certification.block_number}
                        </div>
                      )}
                      {proof.proof.certification.confirmations !== undefined && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          <strong style={{ color: "#94a3b8" }}>Confirmations:</strong>{" "}
                          {proof.proof.certification.confirmations}
                        </div>
                      )}
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        <strong style={{ color: "#94a3b8" }}>Status:</strong>{" "}
                        <StatusBadge status={proof.proof.certification.status} size="sm" />
                      </div>
                      {proof.proof.certification.on_chain_verified !== null && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          <strong style={{ color: "#94a3b8" }}>On-Chain Verified:</strong>{" "}
                          <StatusBadge
                            status={proof.proof.certification.on_chain_verified ? "VERIFIED" : "FAILED"}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      marginBottom: 20,
                      paddingBottom: 20,
                      borderBottom: "1px solid #152b4a",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "0.875rem",
                    }}
                  >
                    No certification proof available for this asset.
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>
                    Evidence Anchors ({proof.proof?.anchored_evidence_count || 0}/{proof.proof?.total_evidence_count || 0})
                  </h3>
                  {proof.proof?.evidence_anchors && proof.proof.evidence_anchors.length > 0 ? (
                    <div style={{ display: "grid", gap: 12 }}>
                      {proof.proof.evidence_anchors.map((evidence) => (
                        <div
                          key={evidence.evidence_id}
                          style={{
                            padding: 12,
                            background: "#0a1628",
                            border: "1px solid #1e3a60",
                            borderRadius: 6,
                          }}
                        >
                          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
                            {evidence.filename}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>
                            <strong style={{ color: "#94a3b8" }}>Hash:</strong>{" "}
                            <span className="meta-id">{evidence.hash}</span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 4 }}>
                            <strong style={{ color: "#94a3b8" }}>Blockchain TX:</strong>{" "}
                            <span className="meta-id">{evidence.blockchain_tx}</span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            <strong style={{ color: "#94a3b8" }}>Integrity:</strong>{" "}
                            <StatusBadge
                              status={evidence.integrity_verified ? "VERIFIED" : "FAILED"}
                              size="sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", color: "#64748b", fontSize: "0.875rem", padding: 20 }}>
                      No evidence has been anchored to the blockchain yet.
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
