import React, { useState } from "react";
import {
  Upload,
  X,
  Loader2,
  FileArchive,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
} from "lucide-react";
import { adminApi } from "../services/api";
import type { BulkImportStagedData } from "../types";

interface BulkImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkImportWizard: React.FC<BulkImportWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Staged Job & Report Data
  const [stagedData, setStagedData] = useState<BulkImportStagedData | null>(null);

  // Configuration Policies
  const [categoryPolicy, setCategoryPolicy] = useState<"strict" | "auto-create">("strict");
  const [imagePolicy, setImagePolicy] = useState<"replace" | "preserve">("replace");
  const [showDiffModal, setShowDiffModal] = useState(false);

  // Progress & Execution State
  const [commitResult, setCommitResult] = useState<any | null>(null);
  const [rollingBack, setRollingBack] = useState(false);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    try {
      await adminApi.downloadImportTemplate();
    } catch (err: any) {
      alert("Failed to download template: " + err.message);
    }
  };

  const handleFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);
    setError(null);

    try {
      const res = await adminApi.uploadBulkImportZip(selectedFile);
      setStagedData(res);
      setStep(2);
    } catch (err: any) {
      console.error("Validation error:", err);
      setError(err.message || "Failed to validate catalog file.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteCommit = async () => {
    if (!stagedData?.importJob?.importId) return;

    setLoading(true);
    setStep(3);
    setError(null);

    try {
      const result = await adminApi.commitBulkImport(stagedData.importJob.importId, {
        categoryPolicy,
        imagePolicy,
      });

      setCommitResult(result);
      setStep(4);
      onSuccess();
    } catch (err: any) {
      console.error("Commit error:", err);
      setError(err.message || "Failed to execute bulk import commit.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    const importId = commitResult?.importId || stagedData?.importJob?.importId;
    if (!importId) return;

    if (!window.confirm("Are you sure you want to ROLL BACK this import? This will restore updated products and remove newly created items.")) {
      return;
    }

    setRollingBack(true);
    try {
      await adminApi.rollbackBulkImport(importId);
      alert("Import rollback executed successfully! Pre-import state restored.");
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Rollback failed: " + err.message);
    } finally {
      setRollingBack(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 740, width: "90%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={20} color="#F59E0B" />
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              Bulk Catalog Import Wizard
            </h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Step Indicator */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 24,
              borderBottom: "1px solid #334155",
              paddingBottom: 12,
            }}
          >
            <span style={{ fontWeight: step === 1 ? 700 : 400, color: step === 1 ? "#38BDF8" : "#94A3B8" }}>
              1. Upload Archive
            </span>
            <span style={{ fontWeight: step === 2 ? 700 : 400, color: step === 2 ? "#38BDF8" : "#94A3B8" }}>
              2. Validate & Preview
            </span>
            <span style={{ fontWeight: step === 3 ? 700 : 400, color: step === 3 ? "#38BDF8" : "#94A3B8" }}>
              3. Processing
            </span>
            <span style={{ fontWeight: step === 4 ? 700 : 400, color: step === 4 ? "#10B981" : "#94A3B8" }}>
              4. Summary
            </span>
          </div>

          {/* Step 1: Upload Archive & Template Download */}
          {step === 1 && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#1E293B",
                  padding: 14,
                  borderRadius: 10,
                  marginBottom: 20,
                  border: "1px solid #334155",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#F8FAFC" }}>
                    Need a starter catalog file?
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                    Download our versioned JSON schema template with sample products
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleDownloadTemplate}>
                  <Download size={14} />
                  <span>Download Starter Template</span>
                </button>
              </div>

              <div
                style={{
                  border: "2px dashed #475569",
                  borderRadius: 12,
                  padding: 32,
                  textAlign: "center",
                  background: "#0F172A",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <input
                  type="file"
                  id="bulk-zip-input"
                  accept=".docx,.zip,.json"
                  onChange={handleFileDrop}
                  disabled={loading}
                  style={{ display: "none" }}
                />
                <label htmlFor="bulk-zip-input" style={{ cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#38BDF8" }}>
                      <Loader2 className="animate-spin" size={32} />
                      <span>Parsing and validating catalog document...</span>
                    </div>
                  ) : (
                    <div>
                      <FileArchive size={36} style={{ margin: "0 auto 12px auto", color: "#38BDF8" }} />
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: "#F8FAFC" }}>
                        Drop Word catalog (.docx) or archive (.zip, .json) here
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#94A3B8", marginTop: 6 }}>
                        Supports Word documents (.docx with embedded images) or catalog archives (.zip, .json)
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {error && (
                <div style={{ color: "#EF4444", fontSize: "0.85rem", marginTop: 12, fontWeight: 500 }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Validation Preview & Policy Settings */}
          {step === 2 && stagedData && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div style={{ background: "#1E293B", padding: 14, borderRadius: 8, border: "1px solid #334155" }}>
                  <div style={{ color: "#94A3B8", fontSize: "0.75rem", fontWeight: 600 }}>TOTAL PRODUCTS</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#F8FAFC" }}>
                    {stagedData.importJob.summary.totalProducts}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#10B981" }}>
                    {stagedData.importJob.summary.newProducts} New · {stagedData.importJob.summary.updatedProducts} Update
                  </div>
                </div>

                <div style={{ background: "#1E293B", padding: 14, borderRadius: 8, border: "1px solid #334155" }}>
                  <div style={{ color: "#94A3B8", fontSize: "0.75rem", fontWeight: 600 }}>MATCHED IMAGES</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#38BDF8" }}>
                    {stagedData.importJob.summary.matchedImages}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                    {stagedData.importJob.summary.missingImages} Missing References
                  </div>
                </div>

                <div style={{ background: "#1E293B", padding: 14, borderRadius: 8, border: "1px solid #334155" }}>
                  <div style={{ color: "#94A3B8", fontSize: "0.75rem", fontWeight: 600 }}>DUPLICATES DETECTED</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: stagedData.importJob.summary.duplicateSlugCount > 0 ? "#F59E0B" : "#10B981" }}>
                    {stagedData.importJob.summary.duplicateSlugCount}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>Slug Conflict Check</div>
                </div>
              </div>

              {/* Policy Selectors */}
              <div style={{ background: "#0F172A", padding: 16, borderRadius: 10, border: "1px solid #334155", marginBottom: 20 }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 12, color: "#E2E8F0" }}>
                  Import Policies & Settings
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#CBD5E1", marginBottom: 6 }}>Category Resolution Policy</label>
                    <select
                      className="form-control"
                      value={categoryPolicy}
                      onChange={(e: any) => setCategoryPolicy(e.target.value)}
                    >
                      <option value="strict">Strict Mode (Fail on missing category)</option>
                      <option value="auto-create">Auto-Create Missing Categories</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#CBD5E1", marginBottom: 6 }}>Image Handling Policy</label>
                    <select
                      className="form-control"
                      value={imagePolicy}
                      onChange={(e: any) => setImagePolicy(e.target.value)}
                    >
                      <option value="replace">Replace Existing Images</option>
                      <option value="preserve">Keep & Append Images</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Warnings / Error List */}
              {stagedData.errorReport.length > 0 && (
                <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#F59E0B", fontWeight: 700, fontSize: "0.85rem", marginBottom: 6 }}>
                    <AlertTriangle size={16} />
                    <span>Pre-Flight Validation Notices ({stagedData.errorReport.length})</span>
                  </div>
                  <ul style={{ fontSize: "0.78rem", color: "#CBD5E1", paddingLeft: 20, margin: 0 }}>
                    {stagedData.errorReport.slice(0, 4).map((err, i) => (
                      <li key={i}>{err.product}: {err.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Loader2 className="animate-spin" size={48} style={{ margin: "0 auto 16px auto", color: "#38BDF8" }} />
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Executing Bulk Import...</h3>
              <p style={{ color: "#94A3B8", fontSize: "0.9rem", marginTop: 8 }}>
                Uploading images to Cloudinary in parallel chunks & updating MongoDB Atlas
              </p>
            </div>
          )}

          {/* Step 4: Summary & Rollback */}
          {step === 4 && (
            <div style={{ textAlign: "center", padding: "20px 10px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Catalog Import Completed!</h3>
              <p style={{ color: "#94A3B8", fontSize: "0.9rem", marginTop: 4 }}>
                Products successfully saved to MongoDB and synced with Cloudinary
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24 }}>
                <button className="btn btn-secondary" onClick={handleRollback} disabled={rollingBack}>
                  {rollingBack ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                  <span>Roll Back This Import (30-Day Window)</span>
                </button>
                <button className="btn btn-primary" onClick={onClose}>
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-footer">
          {step === 1 && (
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          )}

          {step === 2 && (
            <>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={handleExecuteCommit} disabled={loading}>
                <span>Execute Bulk Import</span>
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
