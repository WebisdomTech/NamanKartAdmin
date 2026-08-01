import React from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { adminApi } from "../../services/api";

export const Reports: React.FC = () => {
  const downloadReport = (endpoint: string, filename: string) => {
    adminApi.downloadReport(endpoint, filename).catch((err) => {
      alert("Failed to download report: " + err.message);
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Reports & Data Export Engine</h1>
        <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
          Export store datasets in CSV and JSON formats for accounting and business intelligence
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        {/* Orders Report */}
        <div className="table-card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(16, 185, 129, 0.15)",
              color: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Orders Dataset</h3>
              <p style={{ color: "#94A3B8", fontSize: "0.85rem" }}>
                Complete order transaction history, line items, and totals
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => downloadReport("/reports/orders/export?format=csv", "orders_report.csv")}
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => downloadReport("/reports/orders/export?format=json", "orders_report.json")}
            >
              <FileText size={16} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Products Report */}
        <div className="table-card" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(59, 130, 246, 0.15)",
              color: "#3B82F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Products Catalog</h3>
              <p style={{ color: "#94A3B8", fontSize: "0.85rem" }}>
                Full product catalog inventory, pricing, and stock status
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => downloadReport("/reports/products/export?format=csv", "products_report.csv")}
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => downloadReport("/reports/products/export?format=json", "products_report.json")}
            >
              <FileText size={16} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

