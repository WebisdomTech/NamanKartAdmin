import React from "react";

interface ValidatedInputProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  helperText?: string;
  example?: string;
  error?: string;
  warning?: string;
  autoFix?: string | number | null;
  onApplyAutoFix?: (fixedVal: any) => void;
  suggestions?: string[];
  onSelectSuggestion?: (sug: string) => void;
  checking?: boolean;
  asyncAvailable?: boolean | null;
  required?: boolean;
  rows?: number;
  disabled?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  helperText,
  example,
  error,
  warning,
  autoFix,
  onApplyAutoFix,
  suggestions = [],
  onSelectSuggestion,
  checking,
  asyncAvailable,
  required,
  rows,
  disabled,
}) => {
  const isInvalid = !!error || asyncAvailable === false;
  const isWarning = !isInvalid && !!warning;
  const isValid = !isInvalid && !isWarning && asyncAvailable === true;

  const borderColor = isInvalid
    ? "#EF4444"
    : isWarning
    ? "#F59E0B"
    : isValid
    ? "#10B981"
    : "#334155";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label htmlFor={id} style={{ fontSize: "0.85rem", fontWeight: 600, color: "#E2E8F0" }}>
          {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
        </label>
        {checking && <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>Checking...</span>}
        {isValid && <span style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 600 }}>✓ Available</span>}
      </div>

      {rows ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={`${id}-msg`}
          style={{
            background: "#0F172A",
            border: `1px solid ${borderColor}`,
            borderRadius: "6px",
            color: "#F8FAFC",
            padding: "8px 12px",
            fontSize: "0.88rem",
            outline: "none",
          }}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={`${id}-msg`}
          style={{
            background: "#0F172A",
            border: `1px solid ${borderColor}`,
            borderRadius: "6px",
            color: "#F8FAFC",
            padding: "8px 12px",
            fontSize: "0.88rem",
            outline: "none",
          }}
        />
      )}

      {/* Error / Warning Messages */}
      {error && (
        <span id={`${id}-msg`} role="alert" style={{ fontSize: "0.78rem", color: "#EF4444" }}>
          ✖ {error}
        </span>
      )}
      {!error && warning && (
        <span id={`${id}-msg`} style={{ fontSize: "0.78rem", color: "#F59E0B" }}>
          ⚠ {warning}
        </span>
      )}

      {/* Helper text & examples */}
      {!error && !warning && helperText && (
        <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
          {helperText} {example && <span style={{ color: "#64748B" }}>(e.g., {example})</span>}
        </span>
      )}

      {/* Auto-Fix Proposal Badge */}
      {autoFix !== undefined && autoFix !== null && onApplyAutoFix && (
        <div style={{ marginTop: 2 }}>
          <button
            type="button"
            onClick={() => onApplyAutoFix(autoFix)}
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid #10B981",
              color: "#34D399",
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            Fix → {String(autoFix)}
          </button>
        </div>
      )}

      {/* Smart Slug Suggestions */}
      {suggestions.length > 0 && onSelectSuggestion && (
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>Suggestions:</span>
          {suggestions.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => onSelectSuggestion(sug)}
              style={{
                background: "#1E293B",
                border: "1px solid #334155",
                color: "#F59E0B",
                borderRadius: "4px",
                padding: "2px 8px",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              {sug}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
