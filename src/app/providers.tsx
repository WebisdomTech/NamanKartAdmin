"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  Database,
  FileSpreadsheet,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";
import { adminApi } from "@/src/services/api";
import type { User } from "@/src/types";
import { Login } from "@/src/components/pages/Login";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/inventory", label: "Inventory Logs", icon: Boxes },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/coupons", label: "Coupons", icon: Tag },
  { href: "/reports", label: "Reports Export", icon: FileSpreadsheet },
  { href: "/audit", label: "Audit Trail", icon: ShieldCheck },
  { href: "/seeder", label: "MongoDB Status", icon: Database },
];

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await adminApi.getProfile();
        if (!["admin", "manager", "super_admin"].includes(currentUser.role)) {
          adminApi.logout();
          setUser(null);
        } else {
          setUser(currentUser);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  // Auto-close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Redirect logged in user from /login to /
  useEffect(() => {
    if (!loading && user && pathname === "/login") {
      router.push("/");
    }
  }, [user, loading, pathname, router]);

  const handleLogout = () => {
    adminApi.logout();
    setUser(null);
    router.push("/login");
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

  if (!user && pathname !== "/login") {
    return (
      <Login
        onLoginSuccess={(u) => {
          setUser(u);
          router.push("/");
        }}
      />
    );
  }

  if (pathname === "/login") {
    if (user) {
      return null;
    }
    return (
      <Login
        onLoginSuccess={(u) => {
          setUser(u);
          router.push("/");
        }}
      />
    );
  }

  return (
    <div className="app-layout">
      {/* Mobile Backdrop Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
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
          <button
            className="btn btn-secondary btn-icon mobile-close-btn"
            style={{ display: "none" }}
            onClick={() => setIsSidebarOpen(false)}
            title="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#2D1F12" }}>{user?.fullName}</div>
              <div style={{ fontSize: "0.72rem", color: "#5A4633" }}>{user?.role}</div>
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="btn btn-secondary btn-icon mobile-menu-btn"
              onClick={() => setIsSidebarOpen(true)}
              title="Open navigation menu"
            >
              <Menu size={20} />
            </button>
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
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#5A4633" }}>
              MongoDB Atlas Active
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a
              href={process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:8080"}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              View Storefront ↗
            </a>
          </div>
        </header>

        <main className="content-container">{children}</main>
      </div>
    </div>
  );
}
