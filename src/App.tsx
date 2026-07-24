import React, { useEffect, useState } from "react";
import {
  Boxes,
  Database,
  FileSpreadsheet,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";
import { adminApi } from "./services/api";
import type { User } from "./types";
import { Login } from "./components/pages/Login";
import { Dashboard } from "./components/pages/Dashboard";
import { Products } from "./components/pages/Products";
import { Categories } from "./components/pages/Categories";
import { Orders } from "./components/pages/Orders";
import { Inventory } from "./components/pages/Inventory";
import { Customers } from "./components/pages/Customers";
import { Coupons } from "./components/pages/Coupons";
import { AuditLogs } from "./components/pages/AuditLogs";
import { Reports } from "./components/pages/Reports";
import { Seeder } from "./components/pages/Seeder";

type Tab =
  | "dashboard"
  | "products"
  | "categories"
  | "orders"
  | "inventory"
  | "customers"
  | "coupons"
  | "audit"
  | "reports"
  | "seeder";

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await adminApi.getProfile();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleLogout = () => {
    adminApi.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0F19",
          color: "#94A3B8",
        }}
      >
        Loading NamanKart Enterprise Console...
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-badge">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="logo-title">NamanKart</div>
            <div style={{ fontSize: "0.72rem", color: "#C8102E", fontWeight: 700, letterSpacing: "0.05em" }}>
              ENTERPRISE CONSOLE
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>

          <div
            className={`nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Package size={18} />
            <span>Products</span>
          </div>

          <div
            className={`nav-item ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            <Boxes size={18} />
            <span>Inventory Logs</span>
          </div>

          <div
            className={`nav-item ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            <FolderTree size={18} />
            <span>Categories</span>
          </div>

          <div
            className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
          </div>

          <div
            className={`nav-item ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            <Users size={18} />
            <span>Customers</span>
          </div>

          <div
            className={`nav-item ${activeTab === "coupons" ? "active" : ""}`}
            onClick={() => setActiveTab("coupons")}
          >
            <Tag size={18} />
            <span>Coupons</span>
          </div>

          <div
            className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <FileSpreadsheet size={18} />
            <span>Reports Export</span>
          </div>

          <div
            className={`nav-item ${activeTab === "audit" ? "active" : ""}`}
            onClick={() => setActiveTab("audit")}
          >
            <ShieldCheck size={18} />
            <span>Audit Trail</span>
          </div>

          <div
            className={`nav-item ${activeTab === "seeder" ? "active" : ""}`}
            onClick={() => setActiveTab("seeder")}
          >
            <Database size={18} />
            <span>MongoDB Status</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#F1F5F9" }}>{user.fullName}</div>
              <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{user.role}</div>
            </div>
            <button
              className="btn btn-secondary btn-icon"
              style={{ width: 32, height: 32, color: "#EF4444" }}
              onClick={handleLogout}
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="top-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 10px #10B981",
              }}
            />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#CBD5E1" }}>
              MongoDB Atlas Active
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a
              href="http://localhost:8080"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              View Storefront ↗
            </a>
          </div>
        </header>

        <main className="content-container">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "products" && <Products />}
          {activeTab === "inventory" && <Inventory />}
          {activeTab === "categories" && <Categories />}
          {activeTab === "orders" && <Orders />}
          {activeTab === "customers" && <Customers />}
          {activeTab === "coupons" && <Coupons />}
          {activeTab === "reports" && <Reports />}
          {activeTab === "audit" && <AuditLogs />}
          {activeTab === "seeder" && <Seeder />}
        </main>
      </div>
    </div>
  );
};
export default App;
