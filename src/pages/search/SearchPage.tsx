import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { ASSETS, CERTIFICATIONS, USERS_LIST, BLOCKCHAIN_TXS } from "../../data/mockData";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [submitted, setSubmitted] = useState(!!searchParams.get("q"));

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) { setQuery(q); setSubmitted(true); }
  }, [searchParams]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      setSubmitted(true);
    }
  }

  const q = query.trim().toLowerCase();

  const assetResults = submitted && q
    ? ASSETS.filter((a) => a.id.toLowerCase().includes(q) || a.batchId.toLowerCase().includes(q) || a.type.toLowerCase().includes(q))
    : [];

  const certResults = submitted && q
    ? CERTIFICATIONS.filter((c) => c.id.toLowerCase().includes(q) || c.assetId.toLowerCase().includes(q) || c.tokenId.toLowerCase().includes(q))
    : [];

  const txResults = submitted && q
    ? BLOCKCHAIN_TXS.filter((t) => t.hash.toLowerCase().includes(q) || (t.assetId ?? "").toLowerCase().includes(q))
    : [];

  const userResults = submitted && q
    ? USERS_LIST.filter((u) => u.name.toLowerCase().includes(q) || u.did.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    : [];

  const total = assetResults.length + certResults.length + txResults.length + userResults.length;

  return (
    <div className="page-fade">
      <PageHeader
        title="Search"
        subtitle="Search across assets, certifications, blockchain transactions, and users"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Search" }]}
      />

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }}>◎</span>
            <input
              className="input-field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Asset ID, Batch ID, Certification ID, Token ID, DID, or Transaction Hash…"
              style={{ paddingLeft: 34, fontSize: "0.9375rem", padding: "11px 14px 11px 34px" }}
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: "11px 20px" }}>Search</button>
        </div>
      </form>

      {submitted && (
        <div style={{ marginBottom: 16, fontSize: "0.8125rem", color: "#64748b" }}>
          {total === 0
            ? `No results for "${searchParams.get("q")}"`
            : `${total} result${total !== 1 ? "s" : ""} for "${searchParams.get("q")}"`}
        </div>
      )}

      {/* Results */}
      {assetResults.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>ASSETS ({assetResults.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {assetResults.map((a) => (
              <Link key={a.id} to={`/app/assets/${a.id}`} style={{ textDecoration: "none" }}>
                <div className="panel" style={{ padding: "14px 18px", transition: "border-color 0.15s", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span className="meta-id" style={{ color: "#60a5fa", marginRight: 10 }}>{a.id}</span>
                      <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{a.type} · {a.batchId}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <StatusBadge status={a.lifecycle} size="sm" />
                      <StatusBadge status={a.verification} size="sm" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {certResults.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>CERTIFICATIONS ({certResults.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {certResults.map((c) => (
              <Link key={c.id} to={`/app/certifications/${c.id}`} style={{ textDecoration: "none" }}>
                <div className="panel" style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span className="meta-id" style={{ color: "#60a5fa", marginRight: 10 }}>{c.id}</span>
                      <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>Token {c.tokenId} · {c.assetId}</span>
                    </div>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {txResults.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>BLOCKCHAIN TRANSACTIONS ({txResults.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {txResults.map((t) => (
              <div key={t.hash} className="panel" style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span className="meta-id" style={{ color: "#60a5fa", marginRight: 10 }}>{t.hash.slice(0, 20)}…</span>
                    <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{t.action}</span>
                  </div>
                  <StatusBadge status={t.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {submitted && total === 0 && (
        <div className="panel" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12, opacity: 0.3 }}>◎</div>
          <div className="font-display" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.04em" }}>
            NO RESULTS FOUND
          </div>
          <p style={{ fontSize: "0.8125rem", color: "#475569", maxWidth: 360, margin: "8px auto 0" }}>
            Try searching by Asset ID (e.g. EF-2026-00421), Batch ID, Certification ID, or Transaction Hash.
          </p>
        </div>
      )}

      {!submitted && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="section-label" style={{ marginBottom: 4 }}>SEARCHABLE RECORDS</div>
          {[
            { icon: "◈", label: "Asset ID / Batch ID", example: "EF-2026-00421 · EF-BATCH-2026-017" },
            { icon: "◆", label: "Certification ID / Token ID", example: "CERT-2026-00089 · TKN-00089" },
            { icon: "⬡", label: "Transaction Hash", example: "0x8A42b3…19F2" },
            { icon: "◉", label: "User DID / Name", example: "did:bel:actor:001 · Priya Sharma" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "#0c1828", border: "1px solid #152b4a", borderRadius: "5px", alignItems: "center" }}>
              <span style={{ color: "#64748b", fontSize: "0.875rem" }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{item.label}</div>
                <div className="meta-id" style={{ color: "#475569" }}>{item.example}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
