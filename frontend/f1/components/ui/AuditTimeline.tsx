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
    <div className="sysact-timeline-container">
      <div className="sysact-timeline-rail" />
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {events.map((e) => {
          const isOpen = expanded === e.id;
          const result: string = e.result || "SUCCESS";
          const dotClass = result === "SUCCESS" ? "success" : result === "FAILED" ? "failed" : "warning";

          const actorDisplay = e.actor_did || e.actorDid || e.actor || "—";
          const actorRole = e.actor_role || e.actorRole || e.role || "";
          const action = e.action || "—";
          const timestamp = e.timestamp || "";
          const details = e.details || "";
          const assetId = e.resource_id || e.assetId || null;
          const blockchainTx = e.blockchain_tx_hash || e.blockchainTx || null;
          const evidenceId = e.evidenceId || null;

          return (
            <div key={e.id} className="sysact-event-item">
              <div className={`sysact-event-dot ${dotClass}`}>
                {result === "SUCCESS" ? "✓" : result === "FAILED" ? "✕" : "⚠"}
              </div>

              <div
                onClick={() => setExpanded(isOpen ? null : e.id)}
                className={`sysact-event-card ${isOpen ? "expanded" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                      {e.category === "SUPPLY_CHAIN" && (
                        <span className="sysact-badge-supply-chain">
                          SUPPLY CHAIN
                        </span>
                      )}
                      {actorRole && <RoleBadge role={actorRole} size="sm" />}
                      <span className="sysact-event-title">
                        {actorDisplay}
                      </span>
                    </div>
                    <div className="sysact-event-sub">{action}</div>
                    {assetId && (
                      <div className="meta-id" style={{ marginTop: 4, color: "#d4d4d4" }}>
                        {assetId}
                      </div>
                    )}
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <div style={{ fontSize: "0.6875rem", color: "#737373", marginBottom: 0 }}>
                      {formatDateTime(timestamp)}
                    </div>
                    <StatusBadge status={result} size="sm" />
                    <button
                      type="button"
                      className="btn-ghost"
                      data-testid="view-details-btn"
                      onClick={(ev) => { ev.stopPropagation(); setExpanded(isOpen ? null : e.id); }}
                      style={{
                        fontSize: "0.6875rem",
                        padding: "3px 10px",
                        borderRadius: 4,
                        border: "1px solid #334155",
                        background: isOpen ? "rgba(59,130,246,0.12)" : "transparent",
                        color: isOpen ? "#60a5fa" : "#94a3b8",
                        cursor: "pointer",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isOpen ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="sysact-event-detail-box">
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#60a5fa", marginBottom: 8, letterSpacing: "0.04em" }}>
                      EVENT DETAILS
                    </div>
                    {details && (
                      <div style={{ fontSize: "0.8125rem", color: "#a3a3a3", marginBottom: 12 }}>
                        {details}
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                      <div>
                        <div className="section-label" style={{ marginBottom: 2 }}>Event ID</div>
                        <div className="meta-id" style={{ color: "#f5f5f5", fontSize: "0.75rem" }}>{e.id}</div>
                      </div>
                      <div>
                        <div className="section-label" style={{ marginBottom: 2 }}>Actor DID</div>
                        <div className="meta-id" style={{ color: "#f5f5f5" }}>{actorDisplay}</div>
                      </div>
                      {actorRole && (
                        <div>
                          <div className="section-label" style={{ marginBottom: 2 }}>Role</div>
                          <div className="meta-id" style={{ color: "#f5f5f5" }}>{actorRole}</div>
                        </div>
                      )}
                      <div>
                        <div className="section-label" style={{ marginBottom: 2 }}>Action</div>
                        <div className="meta-id" style={{ color: "#f5f5f5" }}>{action}</div>
                      </div>
                      <div>
                        <div className="section-label" style={{ marginBottom: 2 }}>Resource</div>
                        <div className="meta-id" style={{ color: "#f5f5f5" }}>{e.resource || `${e.resource_type || ""}: ${assetId || ""}`}</div>
                      </div>
                      <div>
                        <div className="section-label" style={{ marginBottom: 2 }}>Timestamp</div>
                        <div className="meta-id" style={{ color: "#f5f5f5" }}>{formatDateTime(timestamp)}</div>
                      </div>
                      <div>
                        <div className="section-label" style={{ marginBottom: 2 }}>Result</div>
                        <div className="meta-id" style={{ color: "#f5f5f5" }}>{result}</div>
                      </div>
                      {e.category && (
                        <div>
                          <div className="section-label" style={{ marginBottom: 2 }}>Category</div>
                          <div className="meta-id" style={{ color: "#f5f5f5" }}>{e.category}</div>
                        </div>
                      )}
                      {blockchainTx && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <div className="section-label" style={{ marginBottom: 2 }}>Blockchain Ref</div>
                          <div className="meta-id" style={{ color: "#f5f5f5", wordBreak: "break-all" }}>{blockchainTx}</div>
                        </div>
                      )}
                      {evidenceId && (
                        <div>
                          <div className="section-label" style={{ marginBottom: 2 }}>Evidence</div>
                          <div className="meta-id" style={{ color: "#f5f5f5" }}>{evidenceId}</div>
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
