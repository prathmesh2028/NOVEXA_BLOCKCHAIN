import { useState } from "react";
import type { AuditEvent } from "../../data/mockData";
import { formatDateTime } from "../../data/mockData";
import RoleBadge from "./RoleBadge";
import StatusBadge from "./StatusBadge";

interface AuditTimelineProps {
  events: AuditEvent[];
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
          const resultColor = e.result === "SUCCESS" ? "#22c55e" : e.result === "FAILED" ? "#ef4444" : "#f59e0b";
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
                {e.result === "SUCCESS" ? "✓" : e.result === "FAILED" ? "✕" : "⚠"}
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
                      <RoleBadge role={e.actorRole} size="sm" />
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#e2e8f0" }}>
                        {e.actor}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{e.action}</div>
                    {e.assetId && (
                      <div className="meta-id" style={{ marginTop: 4 }}>
                        {e.assetId}
                        {e.certId && <span style={{ marginLeft: 8 }}>{e.certId}</span>}
                      </div>
                    )}
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{ fontSize: "0.6875rem", color: "#64748b", marginBottom: 4 }}>
                      {formatDateTime(e.timestamp)}
                    </div>
                    <StatusBadge status={e.result} size="sm" />
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
                      {e.details}
                    </div>
                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                      <div>
                        <div className="section-label" style={{ marginBottom: 2 }}>Actor DID</div>
                        <div className="meta-id">{e.actorDid}</div>
                      </div>
                      {e.blockchainTx && (
                        <div>
                          <div className="section-label" style={{ marginBottom: 2 }}>Blockchain Ref</div>
                          <div className="meta-id">{e.blockchainTx}</div>
                        </div>
                      )}
                      {e.evidenceId && (
                        <div>
                          <div className="section-label" style={{ marginBottom: 2 }}>Evidence</div>
                          <div className="meta-id">{e.evidenceId}</div>
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
