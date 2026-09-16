import { Link } from "react-router";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";

const TRUST_CHAIN = ["Identity", "Role", "Permission", "Asset", "Evidence", "Lifecycle", "Certification", "Blockchain", "Audit", "Verification"];

const FEATURES = [
  {
    icon: "◉",
    title: "Role-Based Access Control",
    desc: "Four defined roles — Admin, NFT Creator, Technician, Auditor — each with explicit permissions. No user can exceed their role boundary.",
    color: "#ef4444",
  },
  {
    icon: "◷",
    title: "Asset Lifecycle Management",
    desc: "Track every defence asset from UNREGISTERED through SUPPLIER_DECLARED, RECEIVED, INSPECTION_RECORDED, and ACCEPTED_FOR_ASSEMBLY or REJECTED_QUARANTINED.",
    color: "#f59e0b",
  },
  {
    icon: "◫",
    title: "Evidence Integrity",
    desc: "Every evidence file is fingerprinted with SHA-256 and anchored on-chain. Any tampering is immediately detectable and flagged.",
    color: "#3b82f6",
  },
  {
    icon: "◆",
    title: "Blockchain-Backed Certification",
    desc: "Non-transferable NFT certifications serve as permanent, immutable records of the certification state of each asset batch.",
    color: "#8b5cf6",
  },
  {
    icon: "≡",
    title: "Audit Verification",
    desc: "Every action logged with actor identity, role, timestamp, evidence, and blockchain reference. Full investigation capability for auditors.",
    color: "#22c55e",
  },
  {
    icon: "⊛",
    title: "Cryptographic Identity",
    desc: "Each user carries a Decentralised Identifier (DID) and verified credential. All actions are traceable to a verified actor.",
    color: "#60a5fa",
  },
];

const STATS = [
  { value: "847", label: "Assets Registered", note: "Synthetic demo data" },
  { value: "312", label: "Certifications Issued", note: "On-chain confirmed" },
  { value: "2,411", label: "Blockchain Transactions", note: "BEL-TRUST-CHAIN" },
  { value: "1,096", label: "Evidence Records Verified", note: "Fingerprint integrity" },
];

const HOW_STEPS = [
  {
    n: "01",
    title: "Identity Assignment",
    desc: "Every platform user receives a unique DID and verified credential. Access is governed by assigned role.",
  },
  {
    n: "02",
    title: "Asset Registration",
    desc: "Technician registers the defence asset with full metadata, batch reference, and supplier declaration.",
  },
  {
    n: "03",
    title: "Evidence Capture",
    desc: "Technical evidence is uploaded. A SHA-256 fingerprint is generated and anchored to the blockchain.",
  },
  {
    n: "04",
    title: "Certification Minting",
    desc: "NFT Creator reviews eligible assets, verifies evidence, and mints a non-transferable certification NFT on-chain.",
  },
  {
    n: "05",
    title: "Audit Verification",
    desc: "Auditor searches any asset, inspects its full history, verifies evidence integrity, and confirms the blockchain record.",
  },
];

export default function HomePage() {
  return (
    <div style={{ background: "#070f1d", minHeight: "100vh", color: "#e2e8f0" }}>
      <PublicNavbar />

      {/* Hero */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 64px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 12px",
              background: "rgba(37,99,235,0.12)",
              border: "1px solid rgba(37,99,235,0.3)",
              borderRadius: "20px",
              fontSize: "0.75rem",
              color: "#60a5fa",
              fontWeight: 600,
              letterSpacing: "0.06em",
              marginBottom: 20,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            SIH 2026 · PS 26125 · SYNTHETIC DEMO
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              color: "#e2e8f0",
              margin: "0 0 20px",
              letterSpacing: "0.02em",
              lineHeight: 1.05,
            }}
          >
            BLOCKCHAIN-BASED
            <br />
            <span style={{ color: "#3b82f6" }}>SECURE PLATFORM</span>
            <br />
            FOR DEFENCE ASSETS
          </h1>
          <p style={{ fontSize: "1rem", color: "#64748b", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
            Identity-verified, role-governed, evidence-backed, and blockchain-certified asset management
            for defence component records. Every action traceable. Every claim verifiable.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/login" className="btn-primary" style={{ fontSize: "0.9375rem", padding: "11px 24px" }}>
              Access Platform →
            </Link>
            <a href="#how-it-works" className="btn-secondary" style={{ fontSize: "0.9375rem", padding: "11px 24px" }}>
              How It Works
            </a>
          </div>

          {/* Trust chain mini */}
          <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
            {TRUST_CHAIN.map((item, i) => (
              <span key={item} style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "0.6875rem", color: "#475569", fontWeight: 500, letterSpacing: "0.04em" }}>
                  {item}
                </span>
                {i < TRUST_CHAIN.length - 1 && (
                  <span style={{ margin: "0 4px", color: "#1e3a60", fontSize: "0.75rem" }}>→</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Right — System status panel */}
        <div>
          <div
            className="panel"
            style={{ padding: "24px", background: "#0c1828" }}
          >
            <div className="section-label" style={{ marginBottom: 16 }}>SYSTEM STATUS</div>
            {[
              { label: "Platform", status: "Operational", ok: true },
              { label: "Identity Service", status: "Verified", ok: true },
              { label: "Blockchain Network", status: "Synced", ok: true },
              { label: "Evidence Store", status: "Healthy", ok: true },
              { label: "Audit Log", status: "Active", ok: true },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #152b4a",
                }}
              >
                <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{row.label}</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: row.ok ? "#22c55e" : "#ef4444",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: row.ok ? "#22c55e" : "#ef4444", display: "inline-block" }} />
                  {row.status}
                </span>
              </div>
            ))}

            <div style={{ marginTop: 20, padding: "14px", background: "#070f1d", borderRadius: "5px", border: "1px solid #152b4a" }}>
              <div style={{ fontSize: "0.6875rem", color: "#475569", marginBottom: 8, fontWeight: 600, letterSpacing: "0.06em" }}>
                SYNTHETIC ASSET EXAMPLE
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="meta-id">EF-2026-00421</span>
                  <span style={{ color: "#22c55e", fontSize: "0.6875rem", fontWeight: 600 }}>✓ VERIFIED</span>
                </div>
                <div>Electronic Fuze · EF-BATCH-2026-017</div>
                <div style={{ color: "#64748b" }}>Accepted for Assembly · Certified on-chain</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            {[
              { label: "RBAC Enforced", icon: "◉", color: "#ef4444" },
              { label: "Evidence Fingerprinted", icon: "◫", color: "#3b82f6" },
              { label: "On-Chain Certified", icon: "◆", color: "#8b5cf6" },
              { label: "Audit Immutable", icon: "≡", color: "#22c55e" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "12px 14px",
                  background: "#0c1828",
                  border: "1px solid #152b4a",
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ color: item.color, fontSize: "1rem" }}>{item.icon}</span>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="platform" style={{ background: "#08131f", padding: "60px 24px", borderTop: "1px solid #152b4a", borderBottom: "1px solid #152b4a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 1,
              background: "#152b4a",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                style={{
                  padding: "32px 28px",
                  background: "#08131f",
                }}
              >
                <div
                  className="font-display"
                  style={{ fontSize: "2.5rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 4, letterSpacing: "0.01em" }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: "0.6875rem", color: "#475569", marginTop: 4 }}>{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="roles" style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>PLATFORM CAPABILITIES</div>
            <h2
              className="font-display"
              style={{ fontSize: "2rem", fontWeight: 700, color: "#e2e8f0", margin: 0, letterSpacing: "0.02em" }}
            >
              Built for Trust, Designed for Clarity
            </h2>
            <p style={{ color: "#64748b", marginTop: 8, maxWidth: 560, lineHeight: 1.6 }}>
              Every capability exists to answer one question: who did what, on which asset, with what evidence, under which permission?
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="panel"
                style={{ padding: "24px" }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: f.color + "18",
                    border: `1px solid ${f.color}30`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    color: f.color,
                    marginBottom: 16,
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  className="font-display"
                  style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0", margin: "0 0 8px", letterSpacing: "0.02em" }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ background: "#08131f", padding: "72px 24px", borderTop: "1px solid #152b4a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>WORKFLOW</div>
            <h2
              className="font-display"
              style={{ fontSize: "2rem", fontWeight: 700, color: "#e2e8f0", margin: 0, letterSpacing: "0.02em" }}
            >
              From Registration to Verified Record
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
            <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 1, background: "#152b4a" }} />
            {HOW_STEPS.map((step, i) => (
              <div
                key={step.n}
                style={{
                  display: "flex",
                  gap: 24,
                  paddingLeft: 52,
                  paddingBottom: i < HOW_STEPS.length - 1 ? 32 : 0,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    top: 0,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6rem",
                    fontWeight: 900,
                    color: "#fff",
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div
                    className="font-display"
                    style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.04em", marginBottom: 6 }}
                  >
                    {step.title}
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="blockchain" style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>ROLE SYSTEM</div>
            <h2 className="font-display" style={{ fontSize: "2rem", fontWeight: 700, color: "#e2e8f0", margin: 0, letterSpacing: "0.02em" }}>
              Four Roles. Clear Accountability.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              {
                role: "Administrator", color: "#ef4444", icon: "⊛",
                mental: "Control, governance and system oversight.",
                can: ["Manage users & roles", "Monitor all assets", "Review audit logs", "Configure system"],
              },
              {
                role: "NFT Creator", color: "#8b5cf6", icon: "◆",
                mental: "Review eligible records and create trusted digital certification.",
                can: ["Review eligible assets", "Verify evidence", "Mint certifications", "Monitor blockchain"],
              },
              {
                role: "Technician", color: "#f59e0b", icon: "◈",
                mental: "Create and maintain accurate technical records.",
                can: ["Register assets", "Upload evidence", "Record inspections", "Update lifecycle"],
              },
              {
                role: "Auditor", color: "#22c55e", icon: "◎",
                mental: "Investigate and verify.",
                can: ["Search all assets", "Verify evidence integrity", "Inspect blockchain proof", "Review audit trail"],
              },
            ].map((r) => (
              <div
                key={r.role}
                className="panel"
                style={{ padding: "24px", borderTop: `2px solid ${r.color}` }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: "1.25rem", color: r.color }}>{r.icon}</span>
                  <span
                    className="font-display"
                    style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.04em" }}
                  >
                    {r.role.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.5, marginBottom: 16, fontStyle: "italic" }}>
                  "{r.mental}"
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {r.can.map((c) => (
                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#64748b" }}>
                      <span style={{ color: r.color, fontSize: "0.625rem" }}>✓</span> {c}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="security" style={{ background: "#08131f", padding: "80px 24px", borderTop: "1px solid #152b4a" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div className="section-label" style={{ marginBottom: 12, textAlign: "center" }}>ACCESS THE PLATFORM</div>
          <h2
            className="font-display"
            style={{ fontSize: "2.25rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 16, letterSpacing: "0.02em" }}
          >
            Sign In to Your Role Dashboard
          </h2>
          <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 32 }}>
            Access is governed by your assigned role. Sign in with your identity credentials to enter the platform.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/login" className="btn-primary" style={{ fontSize: "0.9375rem", padding: "12px 28px" }}>
              Sign In to Platform
            </Link>
          </div>
          <p style={{ marginTop: 16, fontSize: "0.75rem", color: "#475569" }}>
            Synthetic demonstration data · Non-classified · SIH 2026
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
