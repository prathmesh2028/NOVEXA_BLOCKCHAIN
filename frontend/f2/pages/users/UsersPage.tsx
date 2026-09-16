import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import RoleBadge from "../../components/ui/RoleBadge";
import { formatDateTime } from "../../data/mockData";
import { usersService, UserResponse } from "../../services/users";

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await usersService.listUsers({ page_size: 100 });
        setUsers(res.items);
        setTotal(res.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#475569" }}>No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
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
                      <span className="meta-id">{u.did || "—"}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}><RoleBadge role={u.roles[0]?.toLowerCase().replace('_', '-') as any} size="sm" /></td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={u.identity_status || "PENDING"} size="sm" /></td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={u.status} size="sm" /></td>
                    <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: "#64748b" }}>{formatDateTime(u.last_active)}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
                        Manage →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 14px", borderTop: "1px solid #152b4a", fontSize: "0.75rem", color: "#475569" }}>
          Showing {users.length} of {total} users (Powered by Backend API)
        </div>
      </div>
    </div>
  );
}
