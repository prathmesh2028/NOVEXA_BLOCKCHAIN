interface VerificationItem {
  label: string;
  status: "VERIFIED" | "REVIEW" | "FAILED" | "UNAVAILABLE" | "PENDING";
  detail?: string;
}

interface VerificationPanelProps {
  items: VerificationItem[];
  overall?: "VERIFIED" | "REVIEW" | "FAILED" | "UNAVAILABLE";
  assetId?: string;
}

const STATUS_CFG = {
  VERIFIED:    { icon: "✓", label: "Verified",         color: "#22c55e", bg: "rgba(34,197,94,0.08)"   },
  REVIEW:      { icon: "⚠", label: "Review Required",  color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
  FAILED:      { icon: "✕", label: "Failed",           color: "#ef4444", bg: "rgba(239,68,68,0.08)"   },
  UNAVAILABLE: { icon: "—", label: "Unavailable",      color: "#64748b", bg: "rgba(100,116,139,0.08)" },
  PENDING:     { icon: "◐", label: "Pending",          color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
};

export default function VerificationPanel({ items, overall, assetId }: VerificationPanelProps) {
  const cfg = overall ? STATUS_CFG[overall] : null;
  return (
    <div>
      {overall && cfg && (
        <div
          style={{
            padding: "20px 24px",
            background: cfg.bg,
            border: `1px solid ${cfg.color}30`,
            borderRadius: "8px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: cfg.color + "22",
              border: `2px solid ${cfg.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              color: cfg.color,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {cfg.icon}
          </div>
          <div>
            <div
              className="font-display"
              style={{ fontSize: "1.25rem", fontWeight: 700, color: cfg.color, letterSpacing: "0.04em" }}
            >
              ASSET {cfg.label.toUpperCase()}
            </div>
            {assetId && (
              <div className="meta-id" style={{ marginTop: 2 }}>
                {assetId}
              </div>
            )}
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item) => {
          const c = STATUS_CFG[item.status];
          return (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px 16px",
                background: "#0c1828",
                border: "1px solid #152b4a",
                borderRadius: "5px",
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  color: c.color,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 1,
                  width: 18,
                }}
              >
                {c.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#e2e8f0" }}>
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      color: c.color,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {c.label.toUpperCase()}
                  </span>
                </div>
                {item.detail && (
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "3px" }}>
                    {item.detail}
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
