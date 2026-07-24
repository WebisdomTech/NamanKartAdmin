import React, { useEffect, useState } from "react";
import { FolderPlus, Plus, Trash2, X } from "lucide-react";
import { adminApi } from "@/src/services/api";
import type { Category } from "@/src/types";

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    emoji: "📿",
    isFeatured: true,
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete category "${name}" from MongoDB?`)) {
      try {
        await adminApi.deleteCategory(id);
        await loadCategories();
      } catch (err: any) {
        alert(err.message || "Failed to delete category.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await adminApi.createCategory({ ...formData, slug });
      setShowModal(false);
      await loadCategories();
    } catch (err: any) {
      alert(err.message || "Failed to create category.");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Category Taxonomy</h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
            Organize catalog categories in MongoDB Atlas
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Add New Category</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {loading ? (
          <div style={{ color: "#94A3B8" }}>Loading categories...</div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat._id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: "2rem" }}>{cat.emoji || "📿"}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {cat.isFeatured && <span className="badge badge-gold">Featured</span>}
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ color: "#EF4444" }}
                      onClick={() => handleDelete(cat._id, cat.name)}
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{cat.name}</h3>
                <div style={{ fontSize: "0.78rem", color: "#C8102E", fontWeight: 600, marginBottom: 8 }}>
                  /{cat.slug}
                </div>
                <p style={{ color: "#94A3B8", fontSize: "0.85rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {cat.description || "No description provided."}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Create New Category</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="input-group">
                    <label>Slug</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="auto-generated"
                    />
                  </div>
                  <div className="input-group">
                    <label>Emoji Icon</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 12 }}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span>Feature on Store Homepage</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Category to Mongo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

