import React, { useEffect, useState } from "react";
import { Eye, Filter, RefreshCw, ShoppingBag, X } from "lucide-react";
import { adminApi } from "@/src/services/api";
import type { Order } from "@/src/types";

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, orderStatus: string, paymentStatus?: string) => {
    setUpdating(true);
    try {
      const updated = await adminApi.updateOrderStatus(orderId, orderStatus, paymentStatus);
      setSelectedOrder(updated);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || "Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter((o) => selectedStatus === "all" || o.orderStatus === selectedStatus);

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Customer Orders</h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
            Track and process customer orders stored in MongoDB
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadOrders}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, overflowX: "auto", paddingBottom: 6 }}>
        {["all", "confirmed", "reserved", "processing", "shipped", "delivered", "cancelled"].map((st) => (
          <button
            key={st}
            className={`btn btn-sm ${selectedStatus === st ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setSelectedStatus(st)}
            style={{ textTransform: "capitalize" }}
          >
            {st} ({st === "all" ? orders.length : orders.filter((o) => o.orderStatus === st).length})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "#94A3B8", padding: 30 }}>
                    Fetching orders from MongoDB...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "#64748B", padding: 30 }}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord._id}>
                    <td style={{ fontWeight: 800, color: "#C8102E" }}>{ord.orderNumber}</td>
                    <td style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ord.shippingAddress?.fullName || "Guest"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{ord.email}</div>
                    </td>
                    <td>{ord.items?.length || 0} items</td>
                    <td style={{ fontWeight: 800 }}>₹{ord.totalAmount}</td>
                    <td>
                      <span className={`badge ${ord.paymentStatus === "paid" ? "badge-success" : "badge-warning"}`}>
                        {ord.paymentMethod?.toUpperCase()} ({ord.paymentStatus})
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          ord.orderStatus === "delivered"
                            ? "badge-success"
                            : ord.orderStatus === "cancelled"
                            ? "badge-danger"
                            : "badge-info"
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => setSelectedOrder(ord)}
                        title="View order details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Order #{selectedOrder.orderNumber}</h3>
                <div style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Customer & Address */}
              <div style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ fontSize: "0.9rem", color: "#94A3B8", marginBottom: 6 }}>Shipping Address</h4>
                <div style={{ fontWeight: 700 }}>{selectedOrder.shippingAddress?.fullName}</div>
                <div style={{ fontSize: "0.85rem", color: "#CBD5E1" }}>
                  {selectedOrder.shippingAddress?.line1}, {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#94A3B8", marginTop: 4 }}>
                  Phone: {selectedOrder.shippingAddress?.phone} | Email: {selectedOrder.email}
                </div>
              </div>

              {/* Items List */}
              <h4 style={{ fontSize: "0.9rem", color: "#94A3B8", marginBottom: 10 }}>Order Items</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {selectedOrder.items.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 8,
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{it.name}</div>
                      {it.variantName && (
                        <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>Variant: {it.variantName}</div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700 }}>₹{it.price} × {it.qty}</div>
                      <div style={{ fontSize: "0.8rem", color: "#10B981" }}>₹{it.price * it.qty}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Update Order Status */}
              <div style={{ background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.3)", padding: 16, borderRadius: 12 }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 10 }}>Update Processing Status</h4>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["confirmed", "processing", "shipped", "delivered", "cancelled"].map((st) => (
                    <button
                      key={st}
                      className={`btn btn-sm ${selectedOrder.orderStatus === st ? "btn-primary" : "btn-secondary"}`}
                      disabled={updating}
                      onClick={() => handleUpdateStatus(selectedOrder._id, st)}
                      style={{ textTransform: "capitalize" }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

