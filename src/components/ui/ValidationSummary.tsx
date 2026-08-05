import React from "react";
import { Download, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface ValidationSummaryProps {
  title?: string;
  errors: any[];
  warnings: any[];
  info: any[];
  onScrollToField?: (field: string) => void;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  title = "Validation Summary",
  errors,
  warnings,
  info,
  onScrollToField,
}) => {
  const hasIssues = errors.length > 0 || warnings.length > 0;

  const downloadReport = (format: "json" | "csv") => {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        errorCount: errors.length,
        warningCount: warnings.length,
        infoCount: info.length,
      },
      errors,
      warnings,
      info,
    };

    if (format === "json") {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `validation-report-${Date.now()}.json`;
      a.click();
    } else {
      let csv = "Severity,Field,Error Code,Value,Expected,Message\n";
      [...errors, ...warnings, ...info].forEach((item) => {
        csv += `"${item.severity || "ERROR"}","${item.field}","${item.code || ""}","${item.value || ""}","${item.expected || ""}","${item.message}"\n`;
      });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `validation-report-${Date.now()}.csv`;
      a.click();
    }
  };

  if (!hasIssues) {
    return (
      <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10B981", borderRadius: 8, padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <CheckCircle2 color="#10B981" size={20} />
        <span style={{ color: "#34D399", fontSize: "0.85rem", fontWeight: 600 }}>All validation rules passed! Ready to publish.</span>
      </div>
    );
  }

  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle color="#F59E0B" size={20} />
          <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#F8FAFC" }}>{title}</h4>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => downloadReport("json")}
            style={{ background: "#0F172A", border: "1px solid #334155", color: "#94A3B8", borderRadius: 4, padding: "4px 8px", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <Download size={12} /> JSON
          </button>
          <button
            type="button"
            onClick={() => downloadReport("csv")}
            style={{ background: "#0F172A", border: "1px solid #334155", color: "#94A3B8", borderRadius: 4, padding: "4px 8px", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <Download size={12} /> CSV
          </button>
        </div>
      </div>

      <div style={{ fontSize: "0.82rem", color: "#CBD5E1", marginBottom: 10, display: "flex", gap: 16 }}>
        <span style={{ color: "#EF4444", fontWeight: 700 }}>✖ {errors.length} Errors</span>
        <span style={{ color: "#F59E0B", fontWeight: 700 }}>⚠ {warnings.length} Warnings</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "150px", overflowY: "auto" }}>
        {errors.map((err, idx) => (
          <div
            key={`err-${idx}`}
            onClick={() => onScrollToField && onScrollToField(err.field)}
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#FCA5A5", cursor: onScrollToField ? "pointer" : "default" }}
          >
            <XCircle size={14} color="#EF4444" />
            <span><strong>{err.field}</strong>: {err.message}</span>
          </div>
        ))}
        {warnings.map((warn, idx) => (
          <div
            key={`warn-${idx}`}
            onClick={() => onScrollToField && onScrollToField(warn.field)}
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#FDE68A", cursor: onScrollToField ? "pointer" : "default" }}
          >
            <AlertTriangle size={14} color="#F59E0B" />
            <span><strong>{warn.field}</strong>: {warn.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
