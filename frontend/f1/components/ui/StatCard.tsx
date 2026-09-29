interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: string;
  trend?: { value: string; up?: boolean };
  className?: string;
}

export default function StatCard({ label, value, sub, accent = "#e2e8f0", icon, trend, className = "" }: StatCardProps) {
  const isCustomAccent = accent && accent !== "#e2e8f0";

  return (
    <div
      className={`kpi-card ${className}`}
      style={{
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        background: "var(--card, #171717)",
        border: "1px solid var(--border, #2A2A2A)",
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Subtle top indicator bar if accented */}
      {isCustomAccent && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: accent,
            opacity: 0.85,
          }}
        />
      )}

      {/* Header: Label + Icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span
          className="section-label"
          style={{
            margin: 0,
            fontSize: "0.6875rem",
            color: "var(--muted, #737373)",
            letterSpacing: "0.08em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {icon && (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "6px",
              background: isCustomAccent ? `${accent}15` : "rgba(255, 255, 255, 0.05)",
              border: `1px solid ${isCustomAccent ? `${accent}30` : "var(--border, #2A2A2A)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              color: isCustomAccent ? accent : "var(--muted-foreground, #A3A3A3)",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Metric Value */}
      <div
        className="font-display"
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: "var(--foreground, #F5F5F5)",
          lineHeight: 1.05,
          letterSpacing: "0.01em",
        }}
      >
        {value}
      </div>

      {/* Footer: Subtitle / Trend */}
      {(sub || trend) && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" }}>
          {sub && (
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
              {sub}
            </span>
          )}
          {trend && (
            <span
              style={{
                fontSize: "0.6875rem",
                color: trend.up !== false ? "#22c55e" : "#ef4444",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
                background: trend.up !== false ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                padding: "2px 6px",
                borderRadius: "3px",
              }}
            >
              {trend.up !== false ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
