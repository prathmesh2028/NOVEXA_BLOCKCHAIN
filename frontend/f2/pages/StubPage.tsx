import { Link } from "react-router";

interface StubPageProps {
  title: string;
  icon?: string;
  description?: string;
  parent?: { label: string; to: string };
}

export default function StubPage({ title, icon = "◈", description, parent }: StubPageProps) {
  return (
    <div className="page-fade">
      {parent && (
        <div style={{ marginBottom: 20 }}>
          <Link to={parent.to} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "4px 0", color: "#64748b" }}>
            ← {parent.label}
          </Link>
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            background: "rgba(37,99,235,0.1)",
            border: "1px solid rgba(37,99,235,0.2)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            color: "#3b82f6",
            marginBottom: 20,
            opacity: 0.7,
          }}
        >
          {icon}
        </div>
        <h1
          className="font-display"
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#e2e8f0",
            letterSpacing: "0.04em",
            margin: "0 0 8px",
          }}
        >
          {title.toUpperCase()}
        </h1>
        {description && (
          <p style={{ fontSize: "0.875rem", color: "#64748b", maxWidth: 400, lineHeight: 1.6 }}>
            {description}
          </p>
        )}
        <div
          style={{
            marginTop: 24,
            padding: "8px 16px",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: "4px",
            fontSize: "0.75rem",
            color: "#f59e0b",
          }}
        >
          Module in development · Navigation active
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
          <Link to="/app/dashboard" className="btn-secondary">← Dashboard</Link>
          <Link to="/app/assets" className="btn-ghost">View Assets</Link>
        </div>
      </div>
    </div>
  );
}
