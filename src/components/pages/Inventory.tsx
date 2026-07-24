import React, { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Boxes, Plus, RefreshCw, Truck, X } from "lucide-react";
import { adminApi } from "@/src/services/api";
import type { InventoryLog, Product } from "@/src/types";

export const Inventory: React.FC = () => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qtyChange, setQtyChange] = useState(10);
  const [reason, setReason] = useState("Stock restock adjustment");

  const loadData = async () => {
    setLoading(true);
    try {
      const [lRes, pRes] = await Promise.all([
        adminApi.getInventoryLogs(),
        adminApi.getProducts({ limit: "100" }),
      ]);
      setLogs(lRes);
      setProducts(pRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return alert("Select a product");
    try {
      await adminApi.adjustStock(selectedProduct, Number(qtyChange), reason);
      setShowAdjustModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to adjust stock");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Inventory & Stock Movements</h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
            Track stock entries, adjustments, sales deductions, and movement audit trail
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-secondary" onClick={loadData}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdjustModal(true)}>
            <Plus size={18} />
            <span>Stock Adjustment / Purchase Entry</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="table-card">
        <div className="card-header">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Stock Movement Logs</h3>
        </div>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Movement Type</th>
                <th>Qty Change</th>
                <th>Stock (Before → After)</th>
                <th>Reason</th>
                <th>Log Author</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#94A3B8", padding: 30 }}>
                    Loading stock logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#64748B", padding: 30 }}>
                    No stock movement logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700 }}>{log.productName}</td>
                    <td>
                      <span
                        className={`badge ${
                          log.type === "purchase"
                            ? "badge-success"
                            : log.type === "sale"
                            ? "badge-danger"
                            : "badge-info"
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: log.qtyChange >= 0 ? "#10B981" : "#EF4444" }}>
                      {log.qtyChange > 0 ? `+${log.qtyChange}` : log.qtyChange}
                    </td>
                    <td>
                      {log.previousStock} → <strong>{log.newStock}</strong>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "#CBD5E1" }}>{log.reason}</td>
                    <td style={{ fontSize: "0.8rem", color: "#94A3B8" }}>{log.createdByEmail || "system"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Adjust Product Stock</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowAdjustModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdjust}>
              <div className="modal-body">
                <div className="input-group">
                  <label>Select Product</label>
                  <select
                    className="form-control"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    required
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Current Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Quantity Change (+ or -)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={qtyChange}
                    onChange={(e) => setQtyChange(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Reason / Supplier Notes</label>
                  <input
                    type="text"
                    className="form-control"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Purchase order PO-881 from Vrindavan supplier"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

