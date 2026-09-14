import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import RoleBadge from "../../components/ui/RoleBadge";
import { USERS_LIST, formatDateTime } from "../../data/mockData";

export default function UsersPage() {
  return (
    <div className="page-fade">
      <PageHeader
        title="Users"
        subtitle="Manage platform users, identities, and role assignments"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Users" }]}
        actions={
          <button className="btn-primary">+ Invite User</button>
        }
      />

      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e3a60", background: "#08131f" }}>
                {["User", "DID", "Role", "Identity", "Status", "Last Active", "Action"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.6875rem", color: "#475569", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {USERS_LIST.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #152b4a" }} className="table-row">
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: "#1e3a60",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          color: "#60a5fa",
                          flexShrink: 0,
                        }}
                      >
                        {u.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#e2e8f0" }}>{u.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#475569" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="meta-id">{u.did}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}><RoleBadge role={u.role} size="sm" /></td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={u.identityStatus} size="sm" /></td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={u.status} size="sm" /></td>
                  <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "#64748b" }}>{u.lastActive === "—" ? "—" : formatDateTime(u.lastActive)}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 14px", borderTop: "1px solid #152b4a", fontSize: "0.75rem", color: "#475569" }}>
          {USERS_LIST.length} users registered
        </div>
      </div>
    </div>
  );
}
