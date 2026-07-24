import React, { useEffect, useState } from "react";
import { Plus, Tag, Trash2, X } from "lucide-react";
import { adminApi } from "@/src/services/api";
import type { Coupon } from "@/src/types";

export const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "BHAKTI10",
    description: "10% discount on devotional malas",
    type: "percentage" as "percentage" | "flat",
    value: 10,
    minOrderAmount: 499,
    maxDiscount: 200,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
    usageLimit: 100,
    isActive: true,
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleDelete = async (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      try {
        await adminApi.deleteCoupon(id);
        await loadCoupons();
      } catch (err: any) {
        alert(err.message || "Failed to delete coupon.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createCoupon(formData);
      setShowModal(false);
      await loadCoupons();
    } catch (err: any) {
      alert(err.message || "Failed to create coupon.");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Coupons & Promotions</h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
            Create discount codes, set usage limits, and expire promotion rules
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Max Discount</th>
                <th>Expires</th>
                <th>Usage</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "#94A3B8", padding: 30 }}>
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "#64748B", padding: 30 }}>
                    No promotion coupons created yet.
                  </td>
                </tr>
              ) : (
                coupons.map((cp) => (
                  <tr key={cp._id}>
                    <td style={{ fontWeight: 800, color: "#C8102E", letterSpacing: "0.05em" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Tag size={16} />
                        <span>{cp.code}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {cp.type === "percentage" ? `${cp.value}% OFF` : `₹${cp.value} OFF`}
                    </td>
                    <td>₹{cp.minOrderAmount}</td>
                    <td>{cp.maxDiscount ? `₹${cp.maxDiscount}` : "Unlimited"}</td>
                    <td style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                      {new Date(cp.expiresAt).toLocaleDateString()}
                    </td>
                    <td>
                      {cp.usedCount} / {cp.usageLimit}
                    </td>
                    <td>
                      <span className={`badge ${cp.isActive ? "badge-success" : "badge-danger"}`}>
                        {cp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        style={{ color: "#EF4444" }}
                        onClick={() => handleDelete(cp._id, cp.code)}
                        title="Delete coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Create New Coupon</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label>Coupon Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FESTIVE20"
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="input-group">
                    <label>Discount Type</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Discount Value</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="input-group">
                    <label>Min Order Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    />
                  </div>

                  <div className="input-group">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

