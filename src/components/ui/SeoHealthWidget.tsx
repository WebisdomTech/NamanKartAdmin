import React from "react";

interface SeoHealthWidgetProps {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  slug: string;
}

export const SeoHealthWidget: React.FC<SeoHealthWidgetProps> = ({
  metaTitle,
  metaDescription,
  focusKeyword,
  slug,
}) => {
  const kw = (focusKeyword || "").toLowerCase().trim();
  const titleKw = kw && (metaTitle || "").toLowerCase().includes(kw);
  const slugKw = kw && (slug || "").toLowerCase().includes(kw.replace(/\s+/g, "-"));

  const titleLen = (metaTitle || "").length;
  const descLen = (metaDescription || "").length;

  const titleScore = titleLen >= 30 && titleLen <= 60 ? 30 : titleLen > 0 ? 15 : 0;
  const descScore = descLen >= 100 && descLen <= 160 ? 30 : descLen > 0 ? 15 : 0;
  const kwScore = (titleKw ? 20 : 0) + (slugKw ? 20 : 0);

  const totalScore = titleScore + descScore + kwScore;

  const scoreColor = totalScore >= 80 ? "#10B981" : totalScore >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 8, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#F8FAFC" }}>SEO Health Audit</h4>
        <span style={{ fontSize: "1rem", fontWeight: 800, color: scoreColor }}>{totalScore}/100</span>
      </div>

      {/* Progress Bar */}
      <div style={{ background: "#1E293B", borderRadius: 4, height: 6, width: "100%", marginBottom: 14, overflow: "hidden" }}>
        <div style={{ background: scoreColor, width: `${totalScore}%`, height: "100%", transition: "width 0.3s" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.78rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: titleLen <= 60 ? "#34D399" : "#F59E0B" }}>
          <span>Meta Title Length</span>
          <span>{titleLen}/60 chars</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: descLen <= 160 ? "#34D399" : "#F59E0B" }}>
          <span>Meta Description Length</span>
          <span>{descLen}/160 chars</span>
        </div>
        {kw && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", color: titleKw ? "#34D399" : "#94A3B8" }}>
              <span>Keyword in Title</span>
              <span>{titleKw ? "✓ Present" : "✖ Missing"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: slugKw ? "#34D399" : "#94A3B8" }}>
              <span>Keyword in Slug</span>
              <span>{slugKw ? "✓ Present" : "✖ Missing"}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
