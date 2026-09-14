import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useRole, type Role } from "../../context/RoleContext";

const ROLES: { role: Role; label: string; icon: string; color: string; mental: string; did: string }[] = [
  {
    role: "admin",
    label: "Administrator",
    icon: "⊛",
    color: "#ef4444",
    mental: "Control, governance and system oversight",
    did: "did:bel:actor:001",
  },
  {
    role: "nft-creator",
    label: "NFT Creator",
    icon: "◆",
    color: "#8b5cf6",
    mental: "Review records and create trusted digital certification",
    did: "did:bel:actor:002",
  },
  {
    role: "technician",
    label: "Technician",
    icon: "◈",
    color: "#f59e0b",
    mental: "Create and maintain accurate technical records",
    did: "did:bel:actor:003",
  },
  {
    role: "auditor",
    label: "Auditor",
    icon: "◎",
    color: "#22c55e",
    mental: "Investigate and verify",
    did: "did:bel:actor:004",
  },
];

export default function LoginPage() {
  const { login } = useRole();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSignIn() {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      login(selected);
      navigate("/app/dashboard");
    }, 800);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070f1d",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 40 }}>
        <div
          style={{
            width: 36,
            height: 36,
            background: "#2563eb",
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: "1rem",
            color: "#fff",
            letterSpacing: "-0.03em",
          }}
        >
          BT
        </div>
        <div>
          <div className="font-display" style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.05em" }}>
            BEL-DEFENCE-ASSET-TRUST
          </div>
          <div style={{ fontSize: "0.6rem", color: "#475569", fontWeight: 600, letterSpacing: "0.1em" }}>
            SYNTHETIC DEMONSTRATION PLATFORM · SIH 2026
          </div>
        </div>
      </Link>

      <div style={{ width: "100%", maxWidth: 520 }}>
        <div
          style={{
            background: "#0c1828",
            border: "1px solid #1e3a60",
            borderRadius: "8px",
            padding: "36px 32px",
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <h1
              className="font-display"
              style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px", letterSpacing: "0.04em" }}
            >
              PLATFORM ACCESS
            </h1>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              Select your assigned role to access the platform. Each role provides a different
              view and capabilities governed by your permission level.
            </p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>SELECT ROLE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ROLES.map((r) => (
                <button
                  key={r.role}
                  onClick={() => setSelected(r.role)}
                  style={{
                    width: "100%",
                    background: selected === r.role ? r.color + "14" : "#070f1d",
                    border: `1px solid ${selected === r.role ? r.color : "#1e3a60"}`,
                    borderRadius: "6px",
                    padding: "12px 14px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: r.color + "18",
                      border: `1px solid ${r.color}40`,
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      color: r.color,
                      flexShrink: 0,
                    }}
                  >
                    {r.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        className="font-display"
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 700,
                          color: selected === r.role ? "#e2e8f0" : "#94a3b8",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {r.label.toUpperCase()}
                      </span>
                      <span className="meta-id" style={{ color: "#475569" }}>{r.did}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: 1 }}>
                      {r.mental}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: `2px solid ${selected === r.role ? r.color : "#1e3a60"}`,
                      background: selected === r.role ? r.color : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {selected === r.role && (
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DID / credential display */}
          {selected && (
            <div
              style={{
                background: "#070f1d",
                border: "1px solid #152b4a",
                borderRadius: "5px",
                padding: "12px 14px",
                marginBottom: 20,
              }}
            >
              <div className="section-label" style={{ marginBottom: 8 }}>IDENTITY & CREDENTIAL</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "DID", value: ROLES.find((r) => r.role === selected)?.did ?? "—" },
                  { label: "Credential", value: "Verified ✓" },
                  { label: "Identity Status", value: "VERIFIED" },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: "0.6875rem", color: "#475569", width: 100, flexShrink: 0 }}>{row.label}</span>
                    <span className="meta-id" style={{ color: "#60a5fa" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleSignIn}
            disabled={!selected || loading}
            style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: "0.9375rem", letterSpacing: "0.04em" }}
          >
            {loading ? "Authenticating…" : "SIGN IN →"}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#475569", marginTop: 16, lineHeight: 1.5 }}>
            This is a synthetic demonstration platform. No real credentials or classified data.
          </p>
        </div>
      </div>
    </div>
  );
}
