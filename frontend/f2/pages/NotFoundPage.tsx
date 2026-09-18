import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070f1d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          className="font-display"
          style={{ fontSize: "6rem", fontWeight: 900, color: "#1e3a60", lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          404
        </div>
        <h1 className="font-display" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2e8f0", margin: "16px 0 8px", letterSpacing: "0.04em" }}>
          PAGE NOT FOUND
        </h1>
        <p style={{ color: "#64748b", marginBottom: 24 }}>This page does not exist or you do not have permission to view it.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link to="/" className="btn-secondary">Home</Link>
          <Link to="/app/dashboard" className="btn-primary">Dashboard →</Link>
        </div>
      </div>
    </div>
  );
}
