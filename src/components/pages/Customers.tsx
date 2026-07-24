import React, { useEffect, useState } from "react";
import { Mail, Search, ShoppingBag, User as UserIcon } from "lucide-react";
import { adminApi } from "@/src/services/api";
import type { User } from "@/src/types";

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCustomers(search);
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Customer Directory</h1>
        <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
          Registered store customers, order history counts, and lifetime spending
        </p>
      </div>

      <div style={{ marginBottom: 24, maxWidth: 400, position: "relative" }}>
        <Search size={18} style={{ position: "absolute", left: 14, top: 12, color: "#64748B" }} />
        <input
          type="text"
          className="form-control"
          style={{ paddingLeft: 42 }}
          placeholder="Search by customer name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Orders</th>
                <th>Lifetime Spent</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#94A3B8", padding: 30 }}>
                    Loading customers from MongoDB...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#64748B", padding: 30 }}>
                    No customer accounts registered yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "rgba(200,16,46,0.15)",
                          color: "#C8102E",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700
                        }}>
                          <UserIcon size={18} />
                        </div>
                        <div style={{ fontWeight: 700 }}>{c.fullName}</div>
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone || "—"}</td>
                    <td>
                      <span className="badge badge-purple">{c.orderCount || 0} orders</span>
                    </td>
                    <td style={{ fontWeight: 800, color: "#10B981" }}>
                      ₹{(c.totalSpent || 0).toLocaleString()}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
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

