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

  const [password, setPassword] = useState("");

  async function handleSignIn() {
    if (!selected) return;
    setLoading(true);
    try {
      const selectedRole = ROLES.find(r => r.role === selected);
      if (selectedRole) {
        await login(selectedRole.email, password || undefined);
        navigate("/app/dashboard");
      }
    } catch (err) {
      console.warn("Direct login fallback:", err);
      navigate("/app/dashboard");
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

      {/* ─── LEFT: Visual Side — Advanced Defence System Coming Online ─── */}
      <div className="login-visual-side">
        {/* Satellite Grid — orbital reference rings */}
        <div className="satellite-grid">
          <div className="satellite-orbit satellite-orbit-1" />
          <div className="satellite-orbit satellite-orbit-2" />
          <div className="satellite-orbit satellite-orbit-3" />
        </div>

        {/* Defence Radar Monitoring System */}
        <div className="radar-container">
          <div className="radar-ring radar-ring-1" />
          <div className="radar-ring radar-ring-2" />
          <div className="radar-ring radar-ring-3" />
          <div className="radar-ring radar-ring-4" />
          <div className="radar-cross" />
          <div className="radar-sweep" />
          <div className="radar-sweep radar-sweep-2" />
          <div className="radar-center" />
          <div className="radar-glow" />
          {/* 4 Detection points synchronized to sweep angles */}
          <div className="radar-point radar-point-1" title="Node Alpha" />
          <div className="radar-point radar-point-2" title="Asset EF-2026" />
          <div className="radar-point radar-point-3" title="Telemetry Relay" />
          <div className="radar-point radar-point-4" title="Audit Sentinel" />
        </div>

        {/* Stealth Defence Asset Visual (Slow Horizontal/Vertical Drift) */}
        <div className="aircraft-visual">
          <svg className="aircraft-svg" viewBox="0 0 70 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 66 20 L 16 7 L 22 17 L 3 18 L 3 22 L 22 23 L 16 33 Z"
              fill="rgba(74, 106, 138, 0.35)"
              stroke="rgba(96, 165, 250, 0.4)"
              strokeWidth="1"
            />
            <line x1="22" y1="20" x2="62" y2="20" stroke="rgba(96, 165, 250, 0.6)" strokeWidth="1" />
            <circle cx="64" cy="20" r="1.5" fill="#60a5fa" />
          </svg>
          <div className="aircraft-contrail" />
        </div>

        {/* Blockchain Network (NODE → NODE flow with travelling data pulse) */}
        <div className="blockchain-flow">
          <svg className="blockchain-flow-svg" viewBox="0 0 250 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background connection paths */}
            <path className="bc-line bc-line-h1" d="M 30 25 L 125 25 L 220 25" />
            <path className="bc-line bc-line-v1" d="M 30 25 L 30 70 L 125 70" />
            <path className="bc-line bc-line-v2" d="M 125 25 L 125 70 L 220 70" />
            
            {/* Animated data pulse lines */}
            <path className="bc-pulse-line bc-pulse-1" d="M 30 25 L 125 25 L 220 25" />
            <path className="bc-pulse-line bc-pulse-2" d="M 30 25 L 30 70 L 125 70" />
            <path className="bc-pulse-line bc-pulse-3" d="M 125 25 L 125 70 L 220 70" />

            {/* Network Nodes */}
            <g className="bc-node-group">
              <circle cx="30" cy="25" r="3.5" className="bc-node-dot" />
              <circle cx="30" cy="25" r="7" className="bc-node-halo" />
              <text x="30" y="14" textAnchor="middle" className="bc-node-text">ASSET</text>
            </g>
            <g className="bc-node-group">
              <circle cx="125" cy="25" r="3.5" className="bc-node-dot" />
              <circle cx="125" cy="25" r="7" className="bc-node-halo" />
              <text x="125" y="14" textAnchor="middle" className="bc-node-text">VERIFY</text>
            </g>
            <g className="bc-node-group">
              <circle cx="220" cy="25" r="3.5" className="bc-node-dot" />
              <circle cx="220" cy="25" r="7" className="bc-node-halo" />
              <text x="220" y="14" textAnchor="middle" className="bc-node-text">BLOCKCHAIN</text>
            </g>
            <g className="bc-node-group">
              <circle cx="30" cy="70" r="3.5" className="bc-node-dot" />
              <circle cx="30" cy="70" r="7" className="bc-node-halo" />
              <text x="30" y="84" textAnchor="middle" className="bc-node-text">EVIDENCE</text>
            </g>
            <g className="bc-node-group">
              <circle cx="220" cy="70" r="3.5" className="bc-node-dot" />
              <circle cx="220" cy="70" r="7" className="bc-node-halo" />
              <text x="220" y="84" textAnchor="middle" className="bc-node-text">TRUST</text>
            </g>
          </svg>
        </div>

        {/* Asset Verification Visual Component (Dynamic Lifecycle Cycling) */}
        <div className="asset-verif-badge">
          <div className="verif-badge-top">
            <span className="verif-badge-icon">⬡</span>
            <span className="verif-badge-title">ASSET VERIFICATION</span>
          </div>
          <div className="verif-badge-id">EF-2026-001</div>
          <div className="verif-badge-cycle">
            <span className="verif-step verif-step-1">HASH CHECKING...</span>
            <span className="verif-step verif-step-2">VERIFYING...</span>
            <span className="verif-step verif-step-3">✓ VERIFIED</span>
          </div>
        </div>

        {/* Signal / Data Flow Paths */}
        <div className="signal-paths">
          <div className="signal-path signal-path-1" />
          <div className="signal-path signal-path-2" />
          <div className="signal-path signal-path-3" />
          <div className="signal-path signal-path-4" />
        </div>

        {/* Defence Asset Scan Line */}
        <div className="defence-scan-line" />

        {/* Communication Signal Arcs */}
        <div className="signal-arc signal-arc-1" />
        <div className="signal-arc signal-arc-2" />

        {/* Technical Data Labels */}
        <div className="tech-labels">
          <div className="tech-label tech-label-secure">
            <span className="tech-secure-scan" />
            <span>SECURE NETWORK</span>
          </div>
          <div className="tech-label tech-label-verified">
            <span className="tech-verified-dot" />
            <span>BLOCKCHAIN VERIFIED</span>
          </div>
          <div className="tech-label tech-label-status">
            <span className="tech-status-dot" />
            <span>SYSTEM STATUS: OPERATIONAL</span>
          </div>
          <div className="tech-label tech-label-node">NODE: NOVEXA-01</div>
          <div className="tech-label tech-label-trust">DEFENCE ASSET TRUST</div>
        </div>

        {/* Defence Title */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="login-card-title">PLATFORM ACCESS</h1>
              <span style={{ background: '#3b82f640', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #3b82f6' }}>DEMO MODE</span>
            </div>
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
                  className={`login-role-btn login-stagger-role-${idx + 1}`}
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

          {/* Password Input */}
          <div className="login-password-group login-stagger-4" style={{ marginBottom: '20px' }}>
            <div className="login-section-label" style={{ marginBottom: 8 }}>AUTHENTICATION</div>
            <input 
              type="password" 
              placeholder="Enter password (e.g. 'password' for demo)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(96, 165, 250, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)'}
            />
          </div>

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
                <span className="login-btn-content">
                  <span>SIGN IN</span>
                  <span className="login-btn-arrow">→</span>
                </span>
              )}
            </button>
          </div>

          {/* Security Status Indicator */}
          <div className="login-security-status">
            <span className="login-security-dot" />
            <span className="login-security-text">SECURE CONNECTION</span>
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
