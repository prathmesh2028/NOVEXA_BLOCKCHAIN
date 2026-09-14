interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: string;
  trend?: { value: string; up?: boolean };
}

export default function StatCard({ label, value, sub, accent, icon, trend }: StatCardProps) {
  return (
    <div
      className="panel"
      style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "8px" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="section-label">{label}</span>
        {icon && (
          <span style={{ fontSize: "1.125rem", opacity: 0.6 }}>{icon}</span>
        )}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: accent ?? "#e2e8f0",
          lineHeight: 1.1,
          letterSpacing: "0.01em",
        }}
      >
        {value}
      </div>
      {(sub || trend) && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {sub && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{sub}</span>}
          {trend && (
            <span
              style={{
                fontSize: "0.6875rem",
                color: trend.up !== false ? "#22c55e" : "#ef4444",
                fontWeight: 600,
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
