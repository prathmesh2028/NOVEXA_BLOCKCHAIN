import { useState } from "react";
import { formatDateTime } from "../../data/utils";
import RoleBadge from "./RoleBadge";
import StatusBadge from "./StatusBadge";
import type { AuditEventResponse } from "../../services/audit";

type AnyAuditEvent = AuditEventResponse | any;

interface AuditTimelineProps {
  events: AnyAuditEvent[];
}

export default function AuditTimeline({ events }: AuditTimelineProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 0,
          bottom: 0,
          width: "1px",
          background: "#152b4a",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {events.map((e) => {
          const isOpen = expanded === e.id;
          // Backend shape uses 'result', mock shape also uses 'result'
          const result: string = e.result || "SUCCESS";
          const resultColor = result === "SUCCESS" ? "#22c55e" : result === "FAILED" ? "#ef4444" : "#f59e0b";

          // Normalise field names between backend and legacy shapes
          const actorDisplay = e.actor_did || e.actorDid || e.actor || "—";
          const actorRole = e.actor_role || e.actorRole || e.role || "";
          const action = e.action || "—";
          const timestamp = e.timestamp || "";
          const details = e.details || "";
          const assetId = e.resource_id || e.assetId || null;
          const blockchainTx = e.blockchain_tx_hash || e.blockchainTx || null;
          const evidenceId = e.evidenceId || null;

          return (
            <div key={e.id} style={{ paddingLeft: 48, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: 16,
                  width: 17,
                  height: 17,
                  borderRadius: "50%",
                  background: resultColor + "22",
                  border: `2px solid ${resultColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.5rem",
                  color: resultColor,
                  fontWeight: 700,
                  zIndex: 1,
                }}
              >
                {result === "SUCCESS" ? "✓" : result === "FAILED" ? "✕" : "⚠"}
              </div>

              <div
                onClick={() => setExpanded(isOpen ? null : e.id)}
                style={{
                  padding: "12px 16px",
                  background: isOpen ? "#0f2040" : "transparent",
                  border: "1px solid",
                  borderColor: isOpen ? "#1e3a60" : "transparent",
                  borderRadius: "5px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  marginBottom: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                      {e.category === "SUPPLY_CHAIN" && (
                        <span
                          style={{
                            fontSize: "0.625rem",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: "rgba(14, 165, 233, 0.15)",
                            border: "1px solid rgba(14, 165, 233, 0.35)",
                            color: "#38bdf8",
                          }}
                        >
                          SUPPLY CHAIN
                        </span>
                      )}
                      {actorRole && <RoleBadge role={actorRole} size="sm" />}
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#e2e8f0" }}>
                        {actorDisplay}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{action}</div>
                    {assetId && (
                      <div className="meta-id" style={{ marginTop: 4 }}>
                        {assetId}
                      </div>
                    )}
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b", marginBottom: 4 }}>
                      {formatDateTime(timestamp)}
                    </div>
                    <StatusBadge status={result} size="sm" />
                  </div>
                </div>

                {isOpen && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid #152b4a",
                    }}
                  >
                    <div style={{ fontSize: "0.8125rem", color: "#94a3b8", marginBottom: 8 }}>
                      {details}
                    </div>
                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                      <div>
                        <div className="section-label" style={{ marginBottom: 2 }}>Actor DID</div>
                        <div className="meta-id">{actorDisplay}</div>
                      </div>
                      {blockchainTx && (
                        <div>
                          <div className="section-label" style={{ marginBottom: 2 }}>Blockchain Ref</div>
                          <div className="meta-id">{blockchainTx}</div>
                        </div>
                      )}
                      {evidenceId && (
                        <div>
                          <div className="section-label" style={{ marginBottom: 2 }}>Evidence</div>
                          <div className="meta-id">{evidenceId}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
