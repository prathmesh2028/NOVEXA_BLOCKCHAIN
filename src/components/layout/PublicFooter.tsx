export default function PublicFooter() {
  return (
    <footer style={{ borderTop: "1px solid #152b4a", background: "#08131f", padding: "40px 24px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40,
            marginBottom: 40,
          }}
        >
          <div>
            <div className="font-display" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.05em", marginBottom: 8 }}>
              BEL-DEFENCE-ASSET-TRUST
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.6, maxWidth: 240 }}>
              Blockchain-based secure platform for identity, access control, and digital asset management.
              SIH 2026 PS 26125.
            </div>
            <div
              style={{
                marginTop: 14,
                padding: "5px 10px",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: "4px",
                display: "inline-block",
                fontSize: "0.65rem",
                color: "#f59e0b",
                fontWeight: 600,
                letterSpacing: "0.06em",
              }}
            >
              SYNTHETIC DEMONSTRATION DATA
            </div>
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Platform</div>
            {["Asset Management", "Evidence Integrity", "Certification", "Blockchain", "Audit"].map((item) => (
              <div key={item} style={{ fontSize: "0.8125rem", color: "#475569", marginBottom: 6 }}>
                {item}
              </div>
            ))}
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Roles</div>
            {["Administrator", "NFT Creator", "Technician", "Auditor"].map((item) => (
              <div key={item} style={{ fontSize: "0.8125rem", color: "#475569", marginBottom: 6 }}>
                {item}
              </div>
            ))}
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Trust Chain</div>
            <div style={{ fontSize: "0.75rem", color: "#475569", lineHeight: 2 }}>
              {["Identity", "Role", "Permission", "Asset", "Evidence", "Lifecycle", "Certification", "Blockchain", "Audit", "Verification"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#1e3a60" }}>↓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            paddingTop: 20,
            borderTop: "1px solid #152b4a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#475569" }}>
            © 2026 BEL-Defence-Asset-Trust. Synthetic demonstration prototype. Non-classified.
          </div>
          <div style={{ fontSize: "0.75rem", color: "#475569" }}>
            SIH 2026 · PS 26125 · Blockchain-Based Secure Platform
          </div>
        </div>
      </div>
    </footer>
  );
}
