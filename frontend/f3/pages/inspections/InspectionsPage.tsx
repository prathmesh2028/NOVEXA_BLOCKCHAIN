import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import StatCard from "../../components/ui/StatCard";
import { formatDateTime, formatDate } from "../../data/mockData";
import { inspectionService, InspectionStats } from "../../services/inspections";
import type { Inspection } from "../../data/mockData";

export default function InspectionsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "priority" | "id">("date-desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InspectionStats>(() => inspectionService.getStats());

  // Subscribe to service mutations and load list
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await inspectionService.listInspections({
        search: search || undefined,
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        priority: filterPriority !== "ALL" ? filterPriority : undefined,
        sortBy,
        page,
        pageSize,
      });
      setInspections(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setStats(inspectionService.getStats());
    } catch (err) {
      console.error("Failed to load inspections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = inspectionService.subscribe(() => {
      setStats(inspectionService.getStats());
      loadData();
    });
    return unsub;
  }, [search, filterStatus, filterPriority, sortBy, page]);

  useEffect(() => {
    const timer = setTimeout(loadData, 150);
    return () => clearTimeout(timer);
  }, [search, filterStatus, filterPriority, sortBy, page]);

  const hasActiveFilters = search.trim() !== "" || filterStatus !== "ALL" || filterPriority !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setFilterStatus("ALL");
    setFilterPriority("ALL");
    setSortBy("date-desc");
    setPage(1);
  };

  const handleResetDemoData = () => {
    if (window.confirm("Reset all inspection mock records to their original baseline state?")) {
      inspectionService.resetToDefault();
      handleResetFilters();
    }
  };

  return (
    <div className="page-fade">
      {/* Page Header with DEMO DATA indicator */}
      <PageHeader
        title="Inspections"
        subtitle="Monitor, verify, and complete defence asset quality and compliance inspections."
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Inspections" }]}
        badge={
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              background: "rgba(37,99,235,0.12)",
              border: "1px solid rgba(59,130,246,0.35)",
              borderRadius: "4px",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "#60a5fa",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <span>◌</span>
            <span>DEMO DATA · SIMULATED SESSION</span>
          </div>
        }
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleResetDemoData}
              className="btn-ghost"
              style={{ fontSize: "0.75rem", padding: "6px 12px", border: "1px solid #1e3a60" }}
              title="Reset mock session data"
            >
              ↺ Reset Demo Data
            </button>
          </div>
        }
      />

      {/* Simulated Notice Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid #1e3a60",
          borderRadius: "6px",
          marginBottom: 20,
          fontSize: "0.8125rem",
          color: "#94a3b8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#38bdf8", fontSize: "1rem" }}>ℹ</span>
          <span>
            <strong style={{ color: "#e2e8f0" }}>BEL Defence Quality Assurance Workstation:</strong>{" "}
            All inspection actions and checklist assessments are simulated in-session frontend operations.
          </span>
        </div>
        <span className="meta-id" style={{ fontSize: "0.6875rem", color: "#64748b" }}>
          SESSION ACTIVE · {stats.total} TOTAL RECORDS
        </span>
      </div>

      {/* Summary Cards derived dynamically from mock data */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div
          onClick={() => { setFilterStatus("ALL"); setPage(1); }}
          style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
        >
          <StatCard
            label="Total Inspections"
            value={stats.total}
            sub="All active and archived records"
            accent="#e2e8f0"
            icon="📋"
          />
        </div>

        <div
          onClick={() => { setFilterStatus("SCHEDULED"); setPage(1); }}
          style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
        >
          <StatCard
            label="Pending / Scheduled"
            value={stats.scheduled}
            sub="Awaiting intake check"
            accent="#60a5fa"
            icon="◷"
          />
        </div>

        <div
          onClick={() => { setFilterStatus("IN_PROGRESS"); setPage(1); }}
          style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
        >
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            sub="Active technician workstation"
            accent="#38bdf8"
            icon="◐"
          />
        </div>

        <div
          onClick={() => { setFilterStatus("COMPLETED"); setPage(1); }}
          style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
        >
          <StatCard
            label="Completed"
            value={stats.completed}
            sub="100% Quality criteria verified"
            accent="#22c55e"
            icon="✓"
          />
        </div>

        <div
          onClick={() => { setFilterStatus("ATTENTION_REQUIRED"); setPage(1); }}
          style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
        >
          <StatCard
            label="Attention Required"
            value={stats.attentionRequired}
            sub="Failed checks / Escalations"
            accent="#f59e0b"
            icon="⚠"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="panel"
        style={{
          padding: "14px 16px",
          marginBottom: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 260px", minWidth: 220 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
              fontSize: "0.8125rem",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            className="input-field"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Inspection ID, Asset ID, Asset Name, or Technician…"
            style={{ paddingLeft: 34 }}
          />
        </div>

        {/* Status Filter Tabs / Select */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            Status:
          </span>
          {[
            { key: "ALL", label: "All" },
            { key: "SCHEDULED", label: "Scheduled" },
            { key: "IN_PROGRESS", label: "In Progress" },
            { key: "COMPLETED", label: "Completed" },
            { key: "ATTENTION_REQUIRED", label: "Attention Required" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setFilterStatus(s.key);
                setPage(1);
              }}
              style={{
                padding: "5px 10px",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "4px",
                border: "1px solid",
                borderColor: filterStatus === s.key ? "#2563eb" : "#1e3a60",
                background: filterStatus === s.key ? "rgba(37,99,235,0.2)" : "#0c1828",
                color: filterStatus === s.key ? "#e2e8f0" : "#94a3b8",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Priority & Sorting Dropdowns */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            className="input-field"
            value={filterPriority}
            onChange={(e) => {
              setFilterPriority(e.target.value);
              setPage(1);
            }}
            style={{ width: "auto", minWidth: 130, padding: "7px 10px", fontSize: "0.75rem" }}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="STANDARD">Standard Priority</option>
          </select>

          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ width: "auto", minWidth: 140, padding: "7px 10px", fontSize: "0.75rem" }}
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="priority">Priority (High to Low)</option>
            <option value="id">Inspection ID</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="btn-ghost"
              style={{ padding: "6px 12px", fontSize: "0.75rem", color: "#f87171" }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Responsive Inspections Table */}
      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a60", background: "#08131f" }}>
                {[
                  "Inspection ID",
                  "Asset & Batch",
                  "Inspection Type",
                  "Technician",
                  "Scheduled",
                  "Priority",
                  "Status",
                  "Action",
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: "12px 14px",
                      textAlign: "left",
                      fontSize: "0.6875rem",
                      color: "#64748b",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "#64748b" }}>
                    <div style={{ fontSize: "1.25rem", marginBottom: 6 }}>⏳</div>
                    Loading inspection records...
                  </td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 12, opacity: 0.5 }}>◌</div>
                    <div style={{ fontSize: "1rem", color: "#e2e8f0", fontWeight: 600, marginBottom: 4 }}>
                      No Inspection Records Found
                    </div>
                    <p style={{ margin: "0 0 16px", fontSize: "0.8125rem", color: "#64748b" }}>
                      No inspection items match the current search query and filters.
                    </p>
                    {hasActiveFilters && (
                      <button onClick={handleResetFilters} className="btn-secondary" style={{ fontSize: "0.75rem" }}>
                        Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                inspections.map((insp) => {
                  const passCount = insp.checklist.filter((c) => c.state === "Pass").length;
                  const totalChecks = insp.checklist.length;
                  const percentComplete = Math.round((passCount / totalChecks) * 100);

                  return (
                    <tr
                      key={insp.id}
                      className="table-row"
                      style={{
                        borderBottom: "1px solid #152b4a",
                        cursor: "pointer",
                      }}
                    >
                      {/* Inspection ID */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle" }}>
                        <Link
                          to={`/app/inspections/${insp.id}`}
                          style={{ textDecoration: "none" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span
                            className="meta-id"
                            style={{
                              color: "#60a5fa",
                              fontWeight: 600,
                              fontSize: "0.8125rem",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span>◌</span> {insp.id}
                          </span>
                        </Link>
                        <div style={{ fontSize: "0.6875rem", color: "#475569", marginTop: 2 }}>
                          {insp.location.split(" - ")[0]}
                        </div>
                      </td>

                      {/* Asset & Batch */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle" }}>
                        <Link
                          to={`/app/assets/${insp.assetId}`}
                          style={{
                            fontSize: "0.8125rem",
                            color: "#e2e8f0",
                            fontWeight: 600,
                            textDecoration: "none",
                            display: "block",
                          }}
                          className="hover:text-[#60a5fa]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {insp.assetName}
                        </Link>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                          <span className="meta-id" style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                            {insp.assetId}
                          </span>
                          <span style={{ color: "#1e3a60", fontSize: "0.6875rem" }}>•</span>
                          <span className="meta-id" style={{ fontSize: "0.6875rem", color: "#475569" }}>
                            {insp.batchId}
                          </span>
                        </div>
                      </td>

                      {/* Inspection Type & Progress */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle" }}>
                        <div style={{ fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 500 }}>
                          {insp.type}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <div
                            style={{
                              width: 60,
                              height: 4,
                              background: "#152b4a",
                              borderRadius: 2,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${percentComplete}%`,
                                height: "100%",
                                background: insp.status === "ATTENTION_REQUIRED" ? "#f59e0b" : "#22c55e",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                            {passCount}/{totalChecks} checks
                          </span>
                        </div>
                      </td>

                      {/* Technician */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "0.8125rem", color: "#e2e8f0" }}>
                          {insp.assignedTechnician}
                        </div>
                        <div className="meta-id" style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                          {insp.technicianDid}
                        </div>
                      </td>

                      {/* Scheduled Date */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                          {formatDate(insp.scheduledDate)}
                        </div>
                        <div style={{ fontSize: "0.6875rem", color: "#475569" }}>
                          Updated {formatDate(insp.updatedAt)}
                        </div>
                      </td>

                      {/* Priority */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle" }}>
                        <StatusBadge status={insp.priority} size="sm" />
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle" }}>
                        <StatusBadge status={insp.status} size="sm" />
                      </td>

                      {/* Action */}
                      <td style={{ padding: "14px 14px", verticalAlign: "middle" }}>
                        <Link
                          to={`/app/inspections/${insp.id}`}
                          className="btn-ghost"
                          style={{
                            padding: "5px 12px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: insp.status === "COMPLETED" ? "#94a3b8" : "#60a5fa",
                            border: "1px solid #1e3a60",
                            background: insp.status === "COMPLETED" ? "transparent" : "rgba(37,99,235,0.08)",
                          }}
                        >
                          {insp.status === "COMPLETED" ? "Review →" : "Inspect →"}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #152b4a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            fontSize: "0.75rem",
            color: "#64748b",
          }}
        >
          <div>
            Showing <strong style={{ color: "#e2e8f0" }}>{inspections.length}</strong> of{" "}
            <strong style={{ color: "#e2e8f0" }}>{total}</strong> inspection records
            {hasActiveFilters && " (Filtered)"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-ghost"
              style={{ padding: "4px 10px", fontSize: "0.75rem" }}
            >
              ← Previous
            </button>

            <span style={{ color: "#94a3b8", fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-ghost"
              style={{ padding: "4px 10px", fontSize: "0.75rem" }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
