import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { searchService, SearchResult } from "../../services/search";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      setSubmitted(true);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (q: string) => {
    if (!q) return;
    setLoading(true);
    try {
      const res = await searchService.search(q);
      setResults(res.results);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      setSubmitted(true);
      // performSearch will be triggered by useEffect when searchParams change
    }
  }

  const assetResults = results.filter(r => r.type === "asset");
  const certResults = results.filter(r => r.type === "certification");
  const txResults = results.filter(r => r.type === "blockchain_tx");
  const userResults = results.filter(r => r.type === "user");

  const total = results.length;

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
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted, #475569)", pointerEvents: "none", fontSize: "1rem" }}>◎</span>
            <input
              className="input-field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Asset ID, Batch ID, Certification ID, Token ID, DID, or Transaction Hash…"
              style={{ paddingLeft: 42, fontSize: "0.9375rem", paddingRight: 14, paddingTop: 11, paddingBottom: 11 }}
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: "11px 20px" }}>Search</button>
        </div>
      </form>

      {submitted && loading && (
        <div style={{ marginBottom: 16, fontSize: "0.8125rem", color: "var(--muted, #64748b)", fontWeight: 500 }}>
          Searching...
        </div>
      )}

      {submitted && !loading && (
        <div style={{ marginBottom: 16, fontSize: "0.8125rem", color: "var(--foreground, #171717)", fontWeight: 600 }}>
          {total === 0
            ? `No results for "${searchParams.get("q")}"`
            : `${total} result${total !== 1 ? "s" : ""} for "${searchParams.get("q")}"`}
        </div>
      )}

      {/* Results */}
      {!loading && assetResults.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>ASSETS ({assetResults.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {assetResults.map((a) => (
              <Link key={a.id} to={a.url} style={{ textDecoration: "none" }}>
                <div className="panel search-result-card" style={{ padding: "14px 18px", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span className="meta-id" style={{ color: "var(--primary, #2563eb)", fontWeight: 600, marginRight: 10 }}>{a.title}</span>
                      <span style={{ fontSize: "0.8125rem", color: "var(--foreground, #171717)", fontWeight: 500 }}>{a.subtitle}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {a.status && <StatusBadge status={a.status} size="sm" />}
                      {a.badge && <StatusBadge status={a.badge} size="sm" />}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!loading && certResults.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>CERTIFICATIONS ({certResults.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {certResults.map((c) => (
              <Link key={c.id} to={c.url} style={{ textDecoration: "none" }}>
                <div className="panel search-result-card" style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span className="meta-id" style={{ color: "var(--primary, #2563eb)", fontWeight: 600, marginRight: 10 }}>{c.title}</span>
                      <span style={{ fontSize: "0.8125rem", color: "var(--foreground, #171717)", fontWeight: 500 }}>{c.subtitle}</span>
                    </div>
                    {c.status && <StatusBadge status={c.status} size="sm" />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!loading && txResults.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>BLOCKCHAIN TRANSACTIONS ({txResults.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {txResults.map((t) => (
              <div key={t.id} className="panel search-result-card" style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span className="meta-id" style={{ color: "var(--primary, #2563eb)", fontWeight: 600, marginRight: 10 }}>{t.title}</span>
                    <span style={{ fontSize: "0.8125rem", color: "var(--foreground, #171717)", fontWeight: 500 }}>{t.subtitle}</span>
                  </div>
                  {t.status && <StatusBadge status={t.status} size="sm" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && userResults.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>USERS ({userResults.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {userResults.map((u) => (
              <div key={u.id} className="panel search-result-card" style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span className="meta-id" style={{ color: "var(--primary, #2563eb)", fontWeight: 600, marginRight: 10 }}>{u.title}</span>
                    <span style={{ fontSize: "0.8125rem", color: "var(--foreground, #171717)", fontWeight: 500 }}>{u.subtitle}</span>
                  </div>
                  {u.status && <StatusBadge status={u.status} size="sm" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && submitted && total === 0 && (
        <div className="panel search-result-card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12, opacity: 0.3 }}>◎</div>
          <div className="font-display" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground, #171717)", letterSpacing: "0.04em" }}>
            NO RESULTS FOUND
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted, #475569)", maxWidth: 360, margin: "8px auto 0" }}>
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
            <div key={item.label} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", alignItems: "center" }}>
              <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: "0.8125rem", color: "var(--foreground)", fontWeight: 500 }}>{item.label}</div>
                <div className="meta-id" style={{ color: "var(--subtle-text)" }}>{item.example}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
