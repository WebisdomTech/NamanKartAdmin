import React, { useEffect, useState } from "react";
import { Edit2, FolderPlus, Plus, Trash2, X } from "lucide-react";
import { adminApi } from "@/src/services/api";
import type { Category } from "@/src/types";
import { ValidatedInput } from "@/src/components/ui/ValidatedInput";
import { ValidationSummary } from "@/src/components/ui/ValidationSummary";
import { useAsyncUniqueCheck } from "@/src/hooks/useAsyncUniqueCheck";
import { runValidationPipeline, categoryPublishProfile } from "@/src/shared/validation";

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "hero" | "about" | "seo">("basic");

  // Validation State
  const [valErrors, setValErrors] = useState<any[]>([]);
  const [valWarnings, setValWarnings] = useState<any[]>([]);
  const [valInfo, setValInfo] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    emoji: "📿",
    isFeatured: true,
    h1: "",
    heroSubtitle: "",
    aboutSection: "",
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
  });

  // Async Unique Check
  const slugCheck = useAsyncUniqueCheck("/categories", "slug", formData?.slug || "", editingCategory?._id);

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

  const openCreateModal = () => {
    setEditingCategory(null);
    setValErrors([]);
    setValWarnings([]);
    setValInfo([]);
    setFormData({
      name: "",
      slug: "",
      description: "",
      emoji: "📿",
      isFeatured: true,
      h1: "",
      heroSubtitle: "",
      aboutSection: "",
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
    });
    setActiveTab("basic");
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setValErrors([]);
    setValWarnings([]);
    setValInfo([]);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      emoji: cat.emoji || "📿",
      isFeatured: !!cat.isFeatured,
      h1: cat.h1 || "",
      heroSubtitle: cat.heroSubtitle || "",
      aboutSection: cat.aboutSection || "",
      metaTitle: cat.metaTitle || "",
      metaDescription: cat.metaDescription || "",
      focusKeyword: cat.focusKeyword || "",
    });
    setActiveTab("basic");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValErrors([]);
    setValWarnings([]);
    setValInfo([]);

    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const pipelineRes = await runValidationPipeline({ ...formData, slug }, categoryPublishProfile);

      setValErrors(pipelineRes.errors);
      setValWarnings(pipelineRes.warnings);
      setValInfo(pipelineRes.info);

      if (!pipelineRes.valid) return;

      if (editingCategory) {
        await adminApi.updateCategory(editingCategory._id, { ...formData, slug });
      } else {
        await adminApi.createCategory({ ...formData, slug });
      }
      setShowModal(false);
      await loadCategories();
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        setValErrors(err.errors);
      } else {
        alert(err.message || `Failed to ${editingCategory ? "update" : "create"} category.`);
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Category CMS & Landing Page Editor</h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
            Manage category taxonomy, hero sections, about text, buying guides & SEO
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
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
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: "2rem" }}>{cat.emoji || "📿"}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {cat.isFeatured && <span className="badge badge-gold">Featured</span>}
                    <button
                      className="btn btn-secondary btn-icon"
                      onClick={() => openEditModal(cat)}
                      title="Edit category"
                    >
                      <Edit2 size={16} />
                    </button>
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
          <div className="modal-content" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create Category Landing Page"}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: "flex", gap: 8, padding: "0 24px", borderBottom: "1px solid var(--border-color)", background: "var(--bg-elevated)" }}>
              {(["basic", "hero", "about", "seo"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === tab ? "2px solid #C8102E" : "2px solid transparent",
                    color: activeTab === tab ? "#C8102E" : "#94A3B8",
                    fontWeight: activeTab === tab ? 700 : 500,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {tab === "basic" ? "1. Basic Info" : tab === "hero" ? "2. Hero Section" : tab === "about" ? "3. About 250w" : "4. SEO Meta"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                <ValidationSummary errors={valErrors} warnings={valWarnings} info={valInfo} />
                {activeTab === "basic" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <ValidatedInput
                      id="cat-name"
                      label="Category Name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Tulsi Malas & Necklaces"
                      error={valErrors.find((e) => e.field === "name")?.message}
                      warning={valWarnings.find((w) => w.field === "name")?.message}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <ValidatedInput
                        id="cat-slug"
                        label="Category Slug"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="tulsi-malas"
                        checking={slugCheck.checking}
                        asyncAvailable={slugCheck.available}
                        suggestions={slugCheck.suggestions}
                        onSelectSuggestion={(sug) => setFormData({ ...formData, slug: sug })}
                        error={valErrors.find((e) => e.field === "slug")?.message}
                        warning={valWarnings.find((w) => w.field === "slug")?.message}
                      />
                      <ValidatedInput
                        id="cat-emoji"
                        label="Emoji Icon"
                        value={formData.emoji}
                        onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                        placeholder="📿"
                      />
                    </div>
                    <div className="input-group">
                      <label>Short Category Overview</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      />
                      <span>Feature on Store Homepage</span>
                    </label>
                  </div>
                )}

                {activeTab === "hero" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="input-group">
                      <label>H1 On-Page Banner Heading</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.h1}
                        placeholder={formData.name || "e.g. Shop Authentic Tulsi Malas"}
                        onChange={(e) => setFormData({ ...formData, h1: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>Hero Subtitle & Introduction Copy</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.heroSubtitle}
                        placeholder="Hero paragraph copy for Category Landing Page..."
                        onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "about" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="input-group">
                      <label>About Category (200-250 words Spiritual & Material History)</label>
                      <textarea
                        className="form-control"
                        rows={6}
                        value={formData.aboutSection}
                        placeholder="Detailed background section about sacred wood sourcing, history, and spiritual benefits..."
                        onChange={(e) => setFormData({ ...formData, aboutSection: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "seo" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="input-group">
                      <label>SEO Meta Title ({formData.metaTitle.length}/60 chars)</label>
                      <input
                        type="text"
                        className="form-control"
                        maxLength={70}
                        value={formData.metaTitle}
                        placeholder="e.g. Authentic Tulsi Malas & Kanthi Online | NamanKart"
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>SEO Meta Description ({formData.metaDescription.length}/160 chars)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        maxLength={180}
                        value={formData.metaDescription}
                        placeholder="Shop temple-sourced tulsi malas, kanthi malas, and japa malas online..."
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>Focus Keyword</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.focusKeyword}
                        placeholder="e.g. tulsi mala online"
                        onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? "Update Category Landing Page" : "Save Category Landing Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
