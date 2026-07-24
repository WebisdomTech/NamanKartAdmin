import React, { useEffect, useState } from "react";
import { RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { adminApi } from "@/src/services/api";
import type { AuditLog } from "@/src/types";

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Security & Audit Trail</h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
            Immutable record of admin actions, product modifications, and stock adjustments
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadLogs}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Target ID</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#94A3B8", padding: 30 }}>
                    Loading audit trail logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#64748B", padding: 30 }}>
                    No audit log entries recorded yet. Perform admin actions to generate logs.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.userEmail}</td>
                    <td>
                      <span className="badge badge-purple">{log.action}</span>
                    </td>
                    <td>
                      <span className="badge badge-info">{log.resource}</span>
                    </td>
                    <td style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                      {log.resourceId || "—"}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#64748B" }}>
                      {log.ipAddress || "::1"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
