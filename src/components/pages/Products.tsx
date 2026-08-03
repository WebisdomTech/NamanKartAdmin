import React, { useEffect, useState } from "react";
import { Edit2, Plus, Search, Trash2, X, FileArchive } from "lucide-react";
import { adminApi } from "@/src/services/api";
import type { Category, Product } from "@/src/types";
import { ImageUploader } from "@/src/components/ImageUploader";
import { BulkImportWizard } from "@/src/components/BulkImportWizard";

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [folderIdentifier, setFolderIdentifier] = useState<string>("");
  const [newlyUploadedPublicIds, setNewlyUploadedPublicIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    categorySlug: "tulsi-malas",
    basePrice: 999,
    salePrice: 799,
    stock: 30,
    shortDescription: "",
    description: "",
    images: [] as string[],
    imageAlt: [] as string[],
    isFeatured: false,
    isBestSeller: false,
    isNewProduct: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        adminApi.getProducts({ limit: "100" }),
        adminApi.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    const sessionUuid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;
    setFolderIdentifier(sessionUuid);
    setNewlyUploadedPublicIds([]);
    setFormData({
      name: "",
      slug: "",
      categorySlug: categories[0]?.slug || "tulsi-malas",
      basePrice: 999,
      salePrice: 799,
      stock: 30,
      shortDescription: "",
      description: "",
      images: [],
      imageAlt: [],
      isFeatured: false,
      isBestSeller: false,
      isNewProduct: false,
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFolderIdentifier(product._id);
    setNewlyUploadedPublicIds([]);
    setFormData({
      name: product.name,
      slug: product.slug,
      categorySlug: product.categorySlug,
      basePrice: product.basePrice,
      salePrice: product.salePrice || product.basePrice,
      stock: product.stock,
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      images: product.images || [],
      imageAlt: product.imageAlt || [],
      isFeatured: !!product.isFeatured,
      isBestSeller: !!product.isBestSeller,
      isNewProduct: !!product.isNewProduct,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from MongoDB?`)) {
      try {
        await adminApi.deleteProduct(id);
        await loadData();
      } catch (err: any) {
        alert(err.message || "Could not delete product.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetCat = categories.find((c) => c.slug === formData.categorySlug);
      const payload: Partial<Product> = {
        ...formData,
        category: targetCat ? targetCat._id : undefined,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct._id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      // Rollback newly uploaded public IDs if Mongo DB creation/update fails
      if (newlyUploadedPublicIds.length > 0) {
        for (const pubId of newlyUploadedPublicIds) {
          try {
            await adminApi.deleteUploadImage(pubId);
          } catch (rErr) {
            console.error("Rollback execution error:", rErr);
          }
        }
      }
      alert(err.message || "Failed to save product. Newly uploaded images rolled back.");
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.slug || "").includes(search.toLowerCase());
    const matchesCat = selectedCat === "all" || p.categorySlug === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Products Inventory</h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
            Manage catalog items stored in MongoDB database
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setShowImportWizard(true)}>
            <FileArchive size={18} />
            <span>Bulk Import (ZIP)</span>
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar" style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: 12, color: "#64748B" }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: 42 }}
            placeholder="Search products by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 220 }}
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
        >
          <option value="all">All Categories ({categories.length})</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.slug}>
              {cat.emoji || "📿"} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Base Price</th>
                <th>Sale Price</th>
                <th>Stock</th>
                <th>Flags</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#94A3B8", padding: 30 }}>
                    Loading products from MongoDB...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#64748B", padding: 30 }}>
                    No products found matching your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                          src={prod.images?.[0] || "https://images.pexels.com/photos/9271144/pexels-photo-9271144.jpeg"}
                          alt={prod.name}
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }}
                        />
                        <div>
                          <div style={{ fontWeight: 700 }}>{prod.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{prod.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-purple">{prod.categorySlug}</span>
                    </td>
                    <td style={{ textDecoration: prod.salePrice ? "line-through" : "none", color: prod.salePrice ? "#64748B" : "inherit" }}>
                      ₹{prod.basePrice}
                    </td>
                    <td style={{ fontWeight: 700, color: "#10B981" }}>
                      ₹{prod.salePrice || prod.basePrice}
                    </td>
                    <td>
                      <span className={`badge ${prod.stock < 15 ? "badge-danger" : "badge-success"}`}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {prod.isFeatured && <span className="badge badge-warning">Featured</span>}
                        {prod.isBestSeller && <span className="badge badge-info">Best</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => openEditModal(prod)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon"
                          style={{ color: "#EF4444" }}
                          onClick={() => handleDelete(prod._id, prod.name)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                {editingProduct ? "Edit Product" : "Create New Product"}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label>Product Name</label>
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
                      placeholder="auto-generated-if-empty"
                    />
                  </div>

                  <div className="input-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={formData.categorySlug}
                      onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div className="input-group">
                    <label>Base Price (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Sale Price (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Stock Count</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Short Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  />
                </div>

                <ImageUploader
                  images={formData.images}
                  imageAlt={formData.imageAlt}
                  folderIdentifier={folderIdentifier}
                  onChange={(newImages, newAlt, newPublicIds) => {
                    setFormData((prev) => ({ ...prev, images: newImages, imageAlt: newAlt }));
                    if (newPublicIds) setNewlyUploadedPublicIds(newPublicIds);
                  }}
                />

                <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <span>Featured Product</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    />
                    <span>Best Seller</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product to Mongo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Wizard Modal */}
      <BulkImportWizard
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

