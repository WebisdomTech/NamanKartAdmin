import React, { useEffect, useState } from "react";
import { Edit2, Plus, Search, Trash2, X, FileArchive, Trash } from "lucide-react";
import { adminApi } from "@/src/services/api";
import type { Category, Product } from "@/src/types";
import { ImageUploader } from "@/src/components/ImageUploader";
import { BulkImportWizard } from "@/src/components/BulkImportWizard";
import { ValidatedInput } from "@/src/components/ui/ValidatedInput";
import { ValidationSummary } from "@/src/components/ui/ValidationSummary";
import { SeoHealthWidget } from "@/src/components/ui/SeoHealthWidget";
import { useAsyncUniqueCheck } from "@/src/hooks/useAsyncUniqueCheck";
import { runValidationPipeline, productDraftProfile, productPublishProfile } from "@/src/shared/validation";

type ModalTab =
  | "basic"
  | "pricing"
  | "media"
  | "content"
  | "specs"
  | "seo"
  | "recs"
  | "shipping"
  | "publishing";

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>("basic");
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [folderIdentifier, setFolderIdentifier] = useState<string>("");
  const [newlyUploadedPublicIds, setNewlyUploadedPublicIds] = useState<string[]>([]);

  // Validation State
  const [valErrors, setValErrors] = useState<any[]>([]);
  const [valWarnings, setValWarnings] = useState<any[]>([]);
  const [valInfo, setValInfo] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    categorySlug: "tulsi-malas",
    brand: "",
    sku: "",
    hsnCode: "",
    gstRate: 0,

    basePrice: 999,
    salePrice: 799,
    costPrice: 0,
    stock: 30,
    lowStockThreshold: 5,
    weight: "",
    dimensions: "",

    images: [] as string[],
    imageAlt: [] as string[],
    videoUrl: "",

    shortDescription: "",
    description: "",
    overview: "",
    benefits: "",
    howToUse: "",
    careInstructions: "",
    spiritualSignificance: "",
    packageContents: "",

    specificationsTable: [] as Array<{ key: string; value: string }>,

    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    canonical: "",
    ogTitle: "",
    ogDescription: "",

    relatedProductsStr: "",
    frequentlyBoughtTogetherStr: "",
    crossSellProductsStr: "",
    upsellProductsStr: "",

    deliveryTimeline: "",
    shippingDescription: "",
    shippingPointsStr: "",
    freeShipping: true,

    reviewHeading: "",
    reviewDescription: "",
    reviewHighlightsStr: "",

    isFeatured: false,
    isBestSeller: false,
    isNewProduct: false,
    isTrending: false,
    isFestivalSpecial: false,
    isHandcrafted: false,
    isExclusive: false,
    isActive: true,
  });

  // Async Unique Checks
  const slugCheck = useAsyncUniqueCheck("/products", "slug", formData.slug, editingProduct?._id);
  const skuCheck = useAsyncUniqueCheck("/products", "sku", formData.sku, editingProduct?._id);

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
    setValErrors([]);
    setValWarnings([]);
    setValInfo([]);
    setActiveTab("basic");
    const sessionUuid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `session-${Date.now()}`;
    setFolderIdentifier(sessionUuid);
    setNewlyUploadedPublicIds([]);
    setFormData({
      name: "",
      slug: "",
      categorySlug: categories[0]?.slug || "tulsi-malas",
      brand: "NamanKart",
      sku: "",
      hsnCode: "",
      gstRate: 3,

      basePrice: 999,
      salePrice: 799,
      costPrice: 400,
      stock: 30,
      lowStockThreshold: 5,
      weight: "150g",
      dimensions: "10 x 5 x 2 cm",

      images: [],
      imageAlt: [],
      videoUrl: "",

      shortDescription: "",
      description: "",
      overview: "",
      benefits: "",
      howToUse: "",
      careInstructions: "",
      spiritualSignificance: "",
      packageContents: "",

      specificationsTable: [
        { key: "Material", value: "Pure Sacred Tulsi Wood" },
        { key: "Country of Origin", value: "India" },
      ],

      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
      canonical: "",
      ogTitle: "",
      ogDescription: "",

      relatedProductsStr: "",
      frequentlyBoughtTogetherStr: "",
      crossSellProductsStr: "",
      upsellProductsStr: "",

      deliveryTimeline: "Dispatch in 24-48 Hours",
      shippingDescription: "Free Express Shipping on Orders Above ₹999",
      shippingPointsStr: "Dispatch within 24-48 hours\n7-day easy returns\nCOD available across India",
      freeShipping: true,

      reviewHeading: "Devotee Reviews & Verification",
      reviewDescription: "Loved by 500+ Devotees across India",
      reviewHighlightsStr: "100% Authentic Wood\nFast Dispatch\nTemple Blessed",

      isFeatured: false,
      isBestSeller: false,
      isNewProduct: true,
      isTrending: false,
      isFestivalSpecial: false,
      isHandcrafted: true,
      isExclusive: false,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setValErrors([]);
    setValWarnings([]);
    setValInfo([]);
    setActiveTab("basic");
    setFolderIdentifier(product._id);
    setNewlyUploadedPublicIds([]);

    const specTable = Array.isArray(product.specificationsTable)
      ? product.specificationsTable.map((row: any) => ({
          key: row.key || row.attribute || "",
          value: row.value || row.detail || "",
        }))
      : [];

    setFormData({
      name: product.name || "",
      slug: product.slug || "",
      categorySlug: product.categorySlug || categories[0]?.slug || "tulsi-malas",
      brand: product.brand || "",
      sku: product.sku || "",
      hsnCode: product.hsnCode || "",
      gstRate: product.gstRate || 0,

      basePrice: product.basePrice || 0,
      salePrice: product.salePrice || product.basePrice || 0,
      costPrice: product.costPrice || 0,
      stock: product.stock || 0,
      lowStockThreshold: product.lowStockThreshold || 5,
      weight: product.weight || "",
      dimensions: product.dimensions || "",

      images: product.images || [],
      imageAlt: product.imageAlt || [],
      videoUrl: product.videoUrl || "",

      shortDescription: product.shortDescription || "",
      description: product.description || "",
      overview: product.overview || "",
      benefits: product.benefits || "",
      howToUse: product.howToUse || "",
      careInstructions: product.careInstructions || "",
      spiritualSignificance: product.spiritualSignificance || "",
      packageContents: product.packageContents || "",

      specificationsTable: specTable.length > 0 ? specTable : [{ key: "Country of Origin", value: "India" }],

      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      focusKeyword: product.focusKeyword || "",
      canonical: product.canonical || "",
      ogTitle: product.ogTitle || "",
      ogDescription: product.ogDescription || "",

      relatedProductsStr: Array.isArray(product.relatedProducts) ? product.relatedProducts.join(", ") : "",
      frequentlyBoughtTogetherStr: Array.isArray(product.frequentlyBoughtTogether) ? product.frequentlyBoughtTogether.join(", ") : "",
      crossSellProductsStr: Array.isArray(product.crossSellProducts) ? product.crossSellProducts.join(", ") : "",
      upsellProductsStr: Array.isArray(product.upsellProducts) ? product.upsellProducts.join(", ") : "",

      deliveryTimeline: product.deliveryTimeline || "",
      shippingDescription: product.shippingDescription || "",
      shippingPointsStr: Array.isArray(product.shippingPoints) ? product.shippingPoints.join("\n") : "",
      freeShipping: product.freeShipping !== false,

      reviewHeading: product.reviewHeading || "",
      reviewDescription: product.reviewDescription || "",
      reviewHighlightsStr: Array.isArray(product.reviewHighlights) ? product.reviewHighlights.join("\n") : "",

      isFeatured: !!product.isFeatured,
      isBestSeller: !!product.isBestSeller,
      isNewProduct: !!product.isNewProduct,
      isTrending: !!product.isTrending,
      isFestivalSpecial: !!product.isFestivalSpecial,
      isHandcrafted: !!product.isHandcrafted,
      isExclusive: !!product.isExclusive,
      isActive: product.isActive !== false,
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

  const addSpecRow = () => {
    setFormData((prev) => ({
      ...prev,
      specificationsTable: [...prev.specificationsTable, { key: "", value: "" }],
    }));
  };

  const removeSpecRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specificationsTable: prev.specificationsTable.filter((_, i) => i !== index),
    }));
  };

  const updateSpecRow = (index: number, key: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.specificationsTable];
      updated[index] = { key, value };
      return { ...prev, specificationsTable: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValErrors([]);
    setValWarnings([]);
    setValInfo([]);

    try {
      const targetCat = categories.find((c) => c.slug === formData.categorySlug);

      const splitCsv = (str: string) =>
        str
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

      const splitLines = (str: string) =>
        str
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);

      const profile = formData.isActive ? productPublishProfile : productDraftProfile;
      const pipelineRes = await runValidationPipeline(
        {
          ...formData,
          category: targetCat?._id,
        },
        profile
      );

      setValErrors(pipelineRes.errors);
      setValWarnings(pipelineRes.warnings);
      setValInfo(pipelineRes.info);

      if (!pipelineRes.valid) {
        return; // Block save on validation error
      }

      const payload: Partial<Product> = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: targetCat ? targetCat._id : undefined,
        categorySlug: formData.categorySlug,
        brand: formData.brand,
        sku: formData.sku,
        hsnCode: formData.hsnCode,
        gstRate: Number(formData.gstRate),

        basePrice: Number(formData.basePrice),
        salePrice: Number(formData.salePrice || formData.basePrice),
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        weight: formData.weight,
        dimensions: formData.dimensions,

        images: formData.images,
        imageAlt: formData.imageAlt,
        videoUrl: formData.videoUrl,

        shortDescription: formData.shortDescription,
        description: formData.description,
        overview: formData.overview,
        benefits: formData.benefits,
        howToUse: formData.howToUse,
        careInstructions: formData.careInstructions,
        spiritualSignificance: formData.spiritualSignificance,
        packageContents: formData.packageContents,

        specificationsTable: formData.specificationsTable.filter((r) => r.key.trim() !== ""),

        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        focusKeyword: formData.focusKeyword,
        canonical: formData.canonical,
        ogTitle: formData.ogTitle,
        ogDescription: formData.ogDescription,

        relatedProducts: splitCsv(formData.relatedProductsStr),
        frequentlyBoughtTogether: splitCsv(formData.frequentlyBoughtTogetherStr),
        crossSellProducts: splitCsv(formData.crossSellProductsStr),
        upsellProducts: splitCsv(formData.upsellProductsStr),

        deliveryTimeline: formData.deliveryTimeline,
        shippingDescription: formData.shippingDescription,
        shippingPoints: splitLines(formData.shippingPointsStr),
        freeShipping: formData.freeShipping,

        reviewHeading: formData.reviewHeading,
        reviewDescription: formData.reviewDescription,
        reviewHighlights: splitLines(formData.reviewHighlightsStr),

        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        isNewProduct: formData.isNewProduct,
        isTrending: formData.isTrending,
        isFestivalSpecial: formData.isFestivalSpecial,
        isHandcrafted: formData.isHandcrafted,
        isExclusive: formData.isExclusive,
        isActive: formData.isActive,
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct._id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      if (newlyUploadedPublicIds.length > 0) {
        for (const pubId of newlyUploadedPublicIds) {
          try {
            await adminApi.deleteUploadImage(pubId);
          } catch (rErr) {
            console.error("Rollback execution error:", rErr);
          }
        }
      }

      if (err.errors && Array.isArray(err.errors)) {
        setValErrors(err.errors);
      } else {
        alert(err.message || "Failed to save product to MongoDB.");
      }
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
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Enterprise Products Inventory</h1>
          <p style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
            9-Module Enterprise Product Management System (MongoDB)
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
                <th>Badges</th>
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
                      <span className={`badge ${prod.stock < (prod.lowStockThreshold || 15) ? "badge-danger" : "badge-success"}`}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {prod.isFeatured && <span className="badge badge-warning">Featured</span>}
                        {prod.isBestSeller && <span className="badge badge-info">Best</span>}
                        {prod.isHandcrafted && <span className="badge badge-purple">Handcrafted</span>}
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

      {/* Add / Edit 9-Tab Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: 880, width: "95vw" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                  {editingProduct ? `Edit: ${editingProduct.name}` : "Create Enterprise Product"}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                  9-Module Modular Architecture
                </span>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* 9 Tab Navigation Header */}
            <div style={{ display: "flex", borderBottom: "1px solid #334155", overflowX: "auto", background: "#0F172A" }}>
              {(
                [
                  ["basic", "1. Basic"],
                  ["pricing", "2. Pricing"],
                  ["media", "3. Media"],
                  ["content", "4. Content"],
                  ["specs", "5. Specs"],
                  ["seo", "6. SEO"],
                  ["recs", "7. Recs"],
                  ["shipping", "8. Shipping"],
                  ["publishing", "9. Badges"],
                ] as const
              ).map(([tabKey, label]) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  style={{
                    padding: "10px 14px",
                    fontSize: "0.82rem",
                    fontWeight: activeTab === tabKey ? 700 : 500,
                    borderBottom: activeTab === tabKey ? "2px solid #F59E0B" : "2px solid transparent",
                    color: activeTab === tabKey ? "#F59E0B" : "#94A3B8",
                    background: "none",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: "65vh", overflowY: "auto", padding: "20px" }}>
                <ValidationSummary
                  errors={valErrors}
                  warnings={valWarnings}
                  info={valInfo}
                />

                {/* 1. BASIC INFORMATION */}
                {activeTab === "basic" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <ValidatedInput
                      id="name"
                      label="Product Name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Sacred Tulsi Kanthi Mala 108 Beads"
                      helperText="Enter full product display title"
                      error={valErrors.find((e) => e.field === "name")?.message}
                      warning={valWarnings.find((w) => w.field === "name")?.message}
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <ValidatedInput
                        id="slug"
                        label="Slug"
                        required={formData.isActive}
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="auto-generated-if-empty"
                        helperText="URL-friendly identifier"
                        checking={slugCheck.checking}
                        asyncAvailable={slugCheck.available}
                        suggestions={slugCheck.suggestions}
                        onSelectSuggestion={(sug) => setFormData({ ...formData, slug: sug })}
                        error={valErrors.find((e) => e.field === "slug")?.message}
                        warning={valWarnings.find((w) => w.field === "slug")?.message}
                      />
                      <div className="input-group">
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#E2E8F0" }}>Category *</label>
                        <select
                          className="form-control"
                          value={formData.categorySlug}
                          onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                          style={{
                            background: "#0F172A",
                            border: "1px solid #334155",
                            borderRadius: "6px",
                            color: "#F8FAFC",
                            padding: "8px 12px",
                            fontSize: "0.88rem",
                          }}
                        >
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat.slug}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                      <div className="input-group">
                        <label>Brand</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label>SKU</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label>HSN Code</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.hsnCode}
                          onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label>GST Rate (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.gstRate}
                          onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PRICING & INVENTORY */}
                {activeTab === "pricing" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      <div className="input-group">
                        <label>Base Price (₹) *</label>
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
                        <label>Cost Price (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.costPrice}
                          onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div className="input-group">
                        <label>Stock Count *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>Low Stock Alert Threshold</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.lowStockThreshold}
                          onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div className="input-group">
                        <label>Weight (e.g. 150g)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label>Dimensions (L x W x H)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.dimensions}
                          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. MEDIA */}
                {activeTab === "media" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <ImageUploader
                      images={formData.images}
                      imageAlt={formData.imageAlt}
                      folderIdentifier={folderIdentifier}
                      onChange={(newImages, newAlt, newPublicIds) => {
                        setFormData((prev) => ({ ...prev, images: newImages, imageAlt: newAlt }));
                        if (newPublicIds) setNewlyUploadedPublicIds(newPublicIds);
                      }}
                    />
                    <div className="input-group">
                      <label>Product Video URL (YouTube / Vimeo / MP4)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </div>
                )}

                {/* 4. PRODUCT CONTENT */}
                {activeTab === "content" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="input-group">
                      <label>Short Description (Card Summary)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label>Detailed Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label>Product Overview</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.overview}
                        onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div className="input-group">
                        <label>Benefits</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={formData.benefits}
                          onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label>How To Use</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={formData.howToUse}
                          onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div className="input-group">
                        <label>Care Instructions</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={formData.careInstructions}
                          onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label>Spiritual Significance</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={formData.spiritualSignificance}
                          onChange={(e) => setFormData({ ...formData, spiritualSignificance: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Package Contents</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.packageContents}
                        onChange={(e) => setFormData({ ...formData, packageContents: e.target.value })}
                        placeholder="1x Tulsi Mala, 1x Sacred Cloth Bag, 1x Authenticity Card"
                      />
                    </div>
                  </div>
                )}

                {/* 5. DYNAMIC SPECIFICATIONS */}
                {activeTab === "specs" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Dynamic Specifications Table</h4>
                        <p style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                          Add custom attribute key-value pairs for any product category.
                        </p>
                      </div>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={addSpecRow}>
                        <Plus size={14} /> Add Row
                      </button>
                    </div>

                    {formData.specificationsTable.map((row, idx) => (
                      <div key={idx} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Key (e.g. Material)"
                          value={row.key}
                          onChange={(e) => updateSpecRow(idx, e.target.value, row.value)}
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Value (e.g. Pure Tulsi Wood)"
                          value={row.value}
                          onChange={(e) => updateSpecRow(idx, row.key, e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          style={{ color: "#EF4444" }}
                          onClick={() => removeSpecRow(idx)}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 6. SEO METADATA */}
                {activeTab === "seo" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="input-group">
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <label>Meta Title</label>
                        <span style={{ fontSize: "0.75rem", color: formData.metaTitle.length > 60 ? "#EF4444" : "#94A3B8" }}>
                          {formData.metaTitle.length}/60 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder="Buy Original Vrindavan Tulsi Mala Online - NamanKart"
                      />
                    </div>

                    <div className="input-group">
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <label>Meta Description</label>
                        <span style={{ fontSize: "0.75rem", color: formData.metaDescription.length > 160 ? "#EF4444" : "#94A3B8" }}>
                          {formData.metaDescription.length}/160 chars
                        </span>
                      </div>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div className="input-group">
                        <label>Focus Keyword</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.focusKeyword}
                          onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label>Canonical URL</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.canonical}
                          onChange={(e) => setFormData({ ...formData, canonical: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div className="input-group">
                        <label>OpenGraph Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.ogTitle}
                          onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label>OpenGraph Description</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.ogDescription}
                          onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. RECOMMENDATIONS ENGINE */}
                {activeTab === "recs" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="input-group">
                      <label>Related Products (Comma Separated Slugs)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.relatedProductsStr}
                        onChange={(e) => setFormData({ ...formData, relatedProductsStr: e.target.value })}
                        placeholder="vrindavan-tulsi-mala, original-iskcon-mala"
                      />
                    </div>
                    <div className="input-group">
                      <label>Frequently Bought Together (Comma Separated Slugs)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.frequentlyBoughtTogetherStr}
                        onChange={(e) => setFormData({ ...formData, frequentlyBoughtTogetherStr: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>Cross-Sell Products (Comma Separated Slugs)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.crossSellProductsStr}
                        onChange={(e) => setFormData({ ...formData, crossSellProductsStr: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>Upsell Products (Comma Separated Slugs)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.upsellProductsStr}
                        onChange={(e) => setFormData({ ...formData, upsellProductsStr: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* 8. SHIPPING & REVIEWS */}
                {activeTab === "shipping" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Product Shipping Overrides</h4>
                    <div className="input-group">
                      <label>Delivery Timeline Override</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.deliveryTimeline}
                        onChange={(e) => setFormData({ ...formData, deliveryTimeline: e.target.value })}
                        placeholder="Dispatch within 24 hours"
                      />
                    </div>

                    <div className="input-group">
                      <label>Custom Shipping Description</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.shippingDescription}
                        onChange={(e) => setFormData({ ...formData, shippingDescription: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label>Custom Shipping Bullet Points (1 per line)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.shippingPointsStr}
                        onChange={(e) => setFormData({ ...formData, shippingPointsStr: e.target.value })}
                      />
                    </div>

                    <hr style={{ borderColor: "#334155" }} />

                    <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Marketing Review Highlights</h4>
                    <div className="input-group">
                      <label>Review Heading</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.reviewHeading}
                        onChange={(e) => setFormData({ ...formData, reviewHeading: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>Review Description</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.reviewDescription}
                        onChange={(e) => setFormData({ ...formData, reviewDescription: e.target.value })}
                      />
                    </div>
                    <div className="input-group">
                      <label>Review Highlights (1 per line)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.reviewHighlightsStr}
                        onChange={(e) => setFormData({ ...formData, reviewHighlightsStr: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* 9. VISIBILITY & MERCHANDISING BADGES */}
                {activeTab === "publishing" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Publishing Status</h4>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <span>Active / Published on Storefront</span>
                    </label>

                    <hr style={{ borderColor: "#334155" }} />

                    <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Merchandising Badges</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
                        <span>Bestseller Badge</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={formData.isNewProduct}
                          onChange={(e) => setFormData({ ...formData, isNewProduct: e.target.checked })}
                        />
                        <span>New Arrival</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={formData.isTrending}
                          onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                        />
                        <span>Trending Item</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={formData.isHandcrafted}
                          onChange={(e) => setFormData({ ...formData, isHandcrafted: e.target.checked })}
                        />
                        <span>Handcrafted Badge</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={formData.isFestivalSpecial}
                          onChange={(e) => setFormData({ ...formData, isFestivalSpecial: e.target.checked })}
                        />
                        <span>Festival Special</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={formData.isExclusive}
                          onChange={(e) => setFormData({ ...formData, isExclusive: e.target.checked })}
                        />
                        <span>Exclusive Edition</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ padding: "16px 20px" }}>
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
