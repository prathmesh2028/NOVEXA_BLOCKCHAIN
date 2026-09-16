import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../context/RoleContext";
import "./LoginPage.css";

const ROLES: { role: Role; label: string; icon: string; color: string; mental: string; did: string; email: string; }[] = [
  {
    role: "admin",
    label: "Administrator",
    icon: "⊛",
    color: "#ef4444",
    mental: "Control, governance and system oversight",
    did: "did:ethr:sepolia:0x1234abcd...",
    email: "admin@kavachtrust.bel.in",
  },
  {
    role: "nft-creator",
    label: "NFT Creator",
    icon: "◆",
    color: "#8b5cf6",
    mental: "Review records and create trusted digital certification",
    did: "did:ethr:sepolia:0x5678efgh...",
    email: "nft@kavachtrust.bel.in",
  },
  {
    role: "technician",
    label: "Technician",
    icon: "◈",
    color: "#f59e0b",
    mental: "Create and maintain accurate technical records",
    did: "did:ethr:sepolia:0x9012ijkl...",
    email: "tech@kavachtrust.bel.in",
  },
  {
    role: "auditor",
    label: "Auditor",
    icon: "◎",
    color: "#22c55e",
    mental: "Investigate and verify",
    did: "did:ethr:sepolia:0x3456mnop...",
    email: "audit@dod.gov.in",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!selected) return;
    setLoading(true);
    try {
      const selectedRole = ROLES.find(r => r.role === selected);
      if (selectedRole) {
        await login(selectedRole.email);
        navigate("/app/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* ─── Cinematic Background ─── */}
      <div className="login-bg">
        <div className="login-grid-overlay" />
        <div className="login-scanline" />
      </div>

      {/* ─── LEFT: Visual Side ─── */}
      <div className="login-visual-side">
        {/* Radar */}
        <div className="radar-container">
          <div className="radar-ring radar-ring-1" />
          <div className="radar-ring radar-ring-2" />
          <div className="radar-ring radar-ring-3" />
          <div className="radar-ring radar-ring-4" />
          <div className="radar-cross" />
          <div className="radar-sweep" />
          <div className="radar-center" />
          <div className="radar-glow" />
          <div className="radar-point radar-point-1" />
          <div className="radar-point radar-point-2" />
          <div className="radar-point radar-point-3" />
          <div className="radar-point radar-point-4" />
        </div>

        {/* Abstract aircraft silhouette */}
        <div className="aircraft-visual">
          <div className="aircraft-body">
            <div className="aircraft-wing" />
            <div className="aircraft-tail" />
          </div>
        </div>

        {/* Technical data labels */}
        <div className="tech-labels">
          <div className="tech-label tech-label-1">SECURE NETWORK</div>
          <div className="tech-label tech-label-2">ASSET VERIFICATION</div>
          <div className="tech-label tech-label-3">BLOCKCHAIN VERIFIED</div>
          <div className="tech-label tech-label-4 tech-label-pulse">SYSTEM STATUS: OPERATIONAL</div>
          <div className="tech-label tech-label-5">NODE: NOVEXA-01</div>
        </div>

        {/* Visual side title */}
        <div className="defence-title">
          <div className="defence-title-main">NOVEXA SECURE DEFENCE ACCESS</div>
          <div className="defence-title-sub">ENCRYPTED · BLOCKCHAIN VERIFIED · MISSION-CRITICAL</div>
        </div>
      </div>

      {/* ─── RIGHT: Login Form Side ─── */}
      <div className="login-form-side">
        {/* Branding */}
        <Link to="/" className="login-branding" style={{ textDecoration: "none" }}>
          <div className="login-brand-icon">NX</div>
          <div className="login-brand-text">
            <div className="login-brand-title">NOVEXA DEFENCE TRUST</div>
            <div className="login-brand-sub">SYNTHETIC DEMONSTRATION PLATFORM · SIH 2026</div>
          </div>
        </Link>

        {/* Login Card */}
        <div className="login-card">
          {/* Header */}
          <div className="login-card-header login-stagger-1">
            <h1 className="login-card-title">PLATFORM ACCESS</h1>
            <p className="login-card-desc">
              Select your assigned role to access the platform. Each role provides a different
              view and capabilities governed by your permission level.
            </p>
          </div>

          {/* Role selector */}
          <div className="login-role-group login-stagger-2">
            <div className="login-section-label">SELECT ROLE</div>
            <div className="login-role-list">
              {ROLES.map((r, idx) => (
                <button
                  key={r.role}
                  className={`login-role-btn login-stagger-${Math.min(idx + 2, 5)}`}
                  data-selected={selected === r.role}
                  onClick={() => setSelected(r.role)}
                >
                  <div
                    className="login-role-icon"
                    style={{
                      background: (selected === r.role ? r.color : r.color) + "18",
                      border: `1px solid ${selected === r.role ? r.color : r.color + "40"}`,
                      color: r.color,
                    }}
                  >
                    {r.icon}
                  </div>
                  <div className="login-role-info">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span className="login-role-name">
                        {r.label.toUpperCase()}
                      </span>
                      <span className="login-role-did">{r.did}</span>
                    </div>
                    <div className="login-role-desc">{r.mental}</div>
                  </div>
                  <div className="login-radio" data-active={selected === r.role}>
                    <div className="login-radio-dot" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DID / credential display */}
          {selected && (
            <div className="login-cred-panel login-stagger-4">
              <div className="login-section-label" style={{ marginBottom: 8 }}>IDENTITY & CREDENTIAL</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "DID", value: ROLES.find((r) => r.role === selected)?.did ?? "—" },
                  { label: "Credential", value: "Verified ✓" },
                  { label: "Identity Status", value: "VERIFIED" },
                ].map((row) => (
                  <div key={row.label} className="login-cred-row">
                    <span className="login-cred-label">{row.label}</span>
                    <span className="login-cred-value">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <div className="login-stagger-5">
            <button
              className="login-submit-btn"
              onClick={handleSignIn}
              disabled={!selected || loading}
            >
              {loading ? (
                <>
                  <div className="login-spinner" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <span>SIGN IN →</span>
              )}
            </button>
          </div>

          {/* Security Status Indicator */}
          <div className="login-security-status">
            <div className="login-security-dot" />
            <span className="login-security-text">Secure Connection</span>
          </div>

          {/* Footer */}
          <p className="login-footer">
            This is a synthetic demonstration platform. No real credentials or classified data.
          </p>
        </div>
      </div>
    </div>
  );
}
