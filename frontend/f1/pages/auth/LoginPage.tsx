import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/app/dashboard");
    } catch (err: any) {
      setError(err?.message || err?.data?.detail || "Authentication failed. Check your credentials.");
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
        {/* Satellite Grid */}
        <div className="satellite-grid">
          <div className="satellite-orbit satellite-orbit-1" />
          <div className="satellite-orbit satellite-orbit-2" />
          <div className="satellite-orbit satellite-orbit-3" />
        </div>

        {/* Defence Radar */}
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
          <div className="radar-point radar-point-1" title="Node Alpha" />
          <div className="radar-point radar-point-2" title="Asset EF-2026" />
          <div className="radar-point radar-point-3" title="Telemetry Relay" />
          <div className="radar-point radar-point-4" title="Audit Sentinel" />
        </div>

        {/* Stealth Asset Visual */}
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

        {/* Blockchain Network */}
        <div className="blockchain-flow">
          <svg className="blockchain-flow-svg" viewBox="0 0 250 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className="bc-line bc-line-h1" d="M 30 25 L 125 25 L 220 25" />
            <path className="bc-line bc-line-v1" d="M 30 25 L 30 70 L 125 70" />
            <path className="bc-line bc-line-v2" d="M 125 25 L 125 70 L 220 70" />
            <path className="bc-pulse-line bc-pulse-1" d="M 30 25 L 125 25 L 220 25" />
            <path className="bc-pulse-line bc-pulse-2" d="M 30 25 L 30 70 L 125 70" />
            <path className="bc-pulse-line bc-pulse-3" d="M 125 25 L 125 70 L 220 70" />
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

        {/* Asset Verification Badge */}
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

        {/* Signal Paths */}
        <div className="signal-paths">
          <div className="signal-path signal-path-1" />
          <div className="signal-path signal-path-2" />
          <div className="signal-path signal-path-3" />
          <div className="signal-path signal-path-4" />
        </div>
        <div className="defence-scan-line" />
        <div className="signal-arc signal-arc-1" />
        <div className="signal-arc signal-arc-2" />

        {/* Labels */}
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
            <div className="login-brand-sub">KAVACHTRUST PLATFORM · SECURE ACCESS</div>
          </div>
        </Link>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-card-header login-stagger-1">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h1 className="login-card-title">PLATFORM ACCESS</h1>
            </div>
            <p className="login-card-desc">
              Enter your credentials to access the platform. Your role and permissions
              are determined by your account configuration.
            </p>
          </div>

          <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Error Banner */}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  borderRadius: 6,
                  color: "#fca5a5",
                  fontSize: "0.875rem",
                  lineHeight: 1.4,
                }}
              >
                ✕ {error}
              </div>
            )}

            {/* Email */}
            <div className="login-stagger-2">
              <div className="login-section-label" style={{ marginBottom: 8 }}>EMAIL ADDRESS</div>
              <input
                type="email"
                id="login-email"
                autoComplete="email"
                placeholder="you@kavachtrust.bel.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(96, 165, 250, 0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(148, 163, 184, 0.2)")}
              />
            </div>

            {/* Password */}
            <div className="login-stagger-3">
              <div className="login-section-label" style={{ marginBottom: 8 }}>PASSWORD</div>
              <input
                type="password"
                id="login-password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(96, 165, 250, 0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(148, 163, 184, 0.2)")}
              />
            </div>

            {/* Sign In Button */}
            <div className="login-stagger-4">
              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
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
          </form>

          {/* Security Status */}
          <div className="login-security-status" style={{ marginTop: 16 }}>
            <span className="login-security-dot" />
            <span className="login-security-text">SECURE CONNECTION · TLS ENCRYPTED</span>
          </div>

          <p className="login-footer">
            Access is governed by role-based permissions. Contact your administrator if you cannot sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
