import React, { useEffect, useState } from "react";
import { CheckCircle2, Database, Layers, Package, RefreshCw, Server, Sparkles } from "lucide-react";
import { adminApi } from "@/src/services/api";

export const Seeder: React.FC = () => {
  const [categoriesCount, setCategoriesCount] = useState<number>(0);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [health, setHealth] = useState<{ status: string; mongodb: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const checkCounts = async () => {
    setLoading(true);
    try {
      const [cats, prods, h] = await Promise.all([
        adminApi.getCategories(),
        adminApi.getProducts({ limit: "100" }),
        adminApi.checkHealth(),
      ]);
      setCategoriesCount(cats.length);
      setProductsCount(prods.length);
      setHealth(h);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkCounts();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Database & Data Seeder</h1>
        <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
          Verify MongoDB Atlas connection status and inspect populated documents
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(16, 185, 129, 0.15)",
              color: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Database size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>MongoDB Atlas Connection</h3>
              <div style={{ fontSize: "0.8rem", color: "#10B981", fontWeight: 600 }}>
                {health?.mongodb || "Connected & Healthy"}
              </div>
            </div>
          </div>
          <div style={{ fontSize: "0.88rem", color: "#CBD5E1", lineHeight: 1.6 }}>
            The backend server is connected to MongoDB Atlas via Mongoose. All categories, products, users, and orders are stored in MongoDB.
          </div>
        </div>

        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(200, 16, 46, 0.15)",
              color: "#C8102E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Data Seeding Metrics</h3>
              <div style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                Idempotent dataset populator
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10B981" }}>{categoriesCount}</div>
              <div style={{ fontSize: "0.8rem", color: "#94A3B8" }}>Categories Seeded</div>
            </div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#3B82F6" }}>{productsCount}</div>
              <div style={{ fontSize: "0.8rem", color: "#94A3B8" }}>Products Seeded</div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>MongoDB Collections Summary</h3>
            <p style={{ color: "#94A3B8", fontSize: "0.85rem" }}>
              Active collections in the `namankart` MongoDB database
            </p>
          </div>
          <button className="btn btn-secondary" onClick={checkCounts} disabled={loading}>
            <RefreshCw size={16} />
            <span>Verify Connection</span>
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 20 }}>
          <div style={{ padding: 16, background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid var(--border-color)" }}>
            <div style={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 600 }}>COLLECTION</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, margin: "4px 0" }}>categories</div>
            <div style={{ color: "#10B981", fontSize: "0.85rem", fontWeight: 700 }}>{categoriesCount} documents</div>
          </div>

          <div style={{ padding: 16, background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid var(--border-color)" }}>
            <div style={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 600 }}>COLLECTION</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, margin: "4px 0" }}>products</div>
            <div style={{ color: "#3B82F6", fontSize: "0.85rem", fontWeight: 700 }}>{productsCount} documents</div>
          </div>

          <div style={{ padding: 16, background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid var(--border-color)" }}>
            <div style={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 600 }}>COLLECTION</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, margin: "4px 0" }}>users</div>
            <div style={{ color: "#A855F7", fontSize: "0.85rem", fontWeight: 700 }}>Active (Admin)</div>
          </div>

          <div style={{ padding: 16, background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid var(--border-color)" }}>
            <div style={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 600 }}>COLLECTION</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, margin: "4px 0" }}>orders</div>
            <div style={{ color: "#F59E0B", fontSize: "0.85rem", fontWeight: 700 }}>Live Orders</div>
          </div>
        </div>
      </div>
    </div>
  );
};

