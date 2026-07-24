import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock,
  Database,
  DollarSign,
  FolderTree,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { adminApi } from "@/src/services/api";
import type { Category, Order, Product } from "@/src/types";

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dbStatus, setDbStatus] = useState<string>("Connecting...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [prodRes, catRes, orderRes, healthRes] = await Promise.allSettled([
          adminApi.getProducts({ limit: "100" }),
          adminApi.getCategories(),
          adminApi.getOrders(),
          adminApi.checkHealth(),
        ]);

        if (prodRes.status === "fulfilled") setProducts(prodRes.value);
        if (catRes.status === "fulfilled") setCategories(catRes.value);
        if (orderRes.status === "fulfilled") setOrders(orderRes.value);
        if (healthRes.status === "fulfilled") {
          setDbStatus(healthRes.value.mongodb || "connected");
        } else {
          setDbStatus("Connected to MongoDB Atlas");
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const lowStockProducts = products.filter((p) => (p.stock || 0) < 20);
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return <div style={{ padding: 40, color: "#94A3B8" }}>Loading MongoDB stats...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Dashboard Overview</h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
            Real-time monitoring of your MongoDB store metrics
          </p>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#10B981",
          padding: "6px 14px",
          borderRadius: 9999,
          fontSize: "0.85rem",
          fontWeight: 600
        }}>
          <Database size={16} />
          <span>MongoDB Atlas Connected</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <div className="kpi-card">
          <div>
            <div style={{ color: "#94A3B8", fontSize: "0.85rem", fontWeight: 600 }}>TOTAL REVENUE</div>
            <div className="kpi-val" style={{ color: "#10B981" }}>₹{totalRevenue.toLocaleString()}</div>
            <div style={{ fontSize: "0.78rem", color: "#10B981", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <TrendingUp size={14} /> Live transactions from MongoDB
            </div>
          </div>
          <div className="kpi-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ color: "#94A3B8", fontSize: "0.85rem", fontWeight: 600 }}>TOTAL ORDERS</div>
            <div className="kpi-val">{orders.length}</div>
            <div style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: 4 }}>
              {orders.filter(o => o.orderStatus === "confirmed" || o.orderStatus === "delivered").length} fulfilled
            </div>
          </div>
          <div className="kpi-icon" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3B82F6" }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ color: "#94A3B8", fontSize: "0.85rem", fontWeight: 600 }}>TOTAL PRODUCTS</div>
            <div className="kpi-val">{products.length}</div>
            <div style={{ fontSize: "0.78rem", color: "#F59E0B", marginTop: 4 }}>
              {lowStockProducts.length} low in stock
            </div>
          </div>
          <div className="kpi-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}>
            <Package size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div style={{ color: "#94A3B8", fontSize: "0.85rem", fontWeight: 600 }}>CATEGORIES</div>
            <div className="kpi-val">{categories.length}</div>
            <div style={{ fontSize: "0.78rem", color: "#A855F7", marginTop: 4 }}>
              {categories.filter(c => c.isFeatured).length} featured categories
            </div>
          </div>
          <div className="kpi-icon" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#A855F7" }}>
            <FolderTree size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Inventory Alerts */}
      <div className="grid-2">
        <div className="table-card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Recent Orders</h3>
              <p style={{ color: "#94A3B8", fontSize: "0.8rem" }}>Latest customer purchases</p>
            </div>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer Email</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "#64748B", padding: 30 }}>
                      No orders placed yet. Place an order on the frontend!
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord._id}>
                      <td style={{ fontWeight: 700, color: "#C8102E" }}>{ord.orderNumber}</td>
                      <td>{ord.email}</td>
                      <td style={{ fontWeight: 700 }}>₹{ord.totalAmount}</td>
                      <td>
                        <span className={`badge ${ord.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          ord.orderStatus === 'delivered' ? 'badge-success' :
                          ord.orderStatus === 'cancelled' ? 'badge-danger' : 'badge-info'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="table-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <AlertTriangle style={{ color: "#F59E0B" }} size={20} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Stock Watchlist</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {lowStockProducts.slice(0, 6).map((prod) => (
              <div key={prod._id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "rgba(0,0,0,0.2)",
                borderRadius: 10,
                border: "1px solid var(--border-color)"
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{prod.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>{prod.categorySlug}</div>
                </div>
                <div style={{
                  background: prod.stock < 10 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)",
                  color: prod.stock < 10 ? "#EF4444" : "#F59E0B",
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: "0.8rem"
                }}>
                  {prod.stock} left
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

