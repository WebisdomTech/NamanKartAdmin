import React, { useState, useRef } from "react";
import { Upload, X, ArrowLeft, ArrowRight, Star, AlertCircle, Loader2 } from "lucide-react";
import { adminApi } from "@/src/services/api";

interface ImageUploaderProps {
  images: string[];
  imageAlt: string[];
  onChange: (images: string[], imageAlt: string[], newlyUploadedPublicIds?: string[]) => void;
  onQueueDeletion?: (urlOrPublicId: string) => void;
  folderIdentifier?: string;
  maxFiles?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images = [],
  imageAlt = [],
  onChange,
  onQueueDeletion,
  folderIdentifier,
  maxFiles = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newlyUploadedIds, setNewlyUploadedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setError(null);

    const files = Array.from(filesList);

    // Validate total count
    if (images.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed in total. You currently have ${images.length}.`);
      return;
    }

    // Validate file sizes and types
    const allowedMime = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    for (const file of files) {
      if (!allowedMime.includes(file.type)) {
        setError(`Invalid file type "${file.type}". Only JPG, PNG, WebP, and AVIF are allowed.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds maximum allowed size of 5 MB.`);
        return;
      }
    }

    setUploading(true);
    try {
      const uploaded = await adminApi.uploadImages(files, folderIdentifier);
      const newUrls = uploaded.map((u) => u.url);
      const newPublicIds = uploaded.map((u) => u.publicId);

      const updatedImages = [...images, ...newUrls];
      // Synchronize Alt array: populate with filename or empty string up to new length
      const updatedAlt = [...imageAlt, ...files.map((f) => f.name.replace(/\.[^/.]+$/, ""))];
      // Trim alt to images length if needed
      const trimmedAlt = updatedAlt.slice(0, updatedImages.length);

      const allNewPublicIds = [...newlyUploadedIds, ...newPublicIds];
      setNewlyUploadedIds(allNewPublicIds);

      onChange(updatedImages, trimmedAlt, allNewPublicIds);
    } catch (err: any) {
      setError(err.message || "Failed to upload images to Cloudinary.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const targetUrl = images[index];
    if (onQueueDeletion && targetUrl) {
      onQueueDeletion(targetUrl);
    }

    const updatedImages = images.filter((_, i) => i !== index);
    const updatedAlt = imageAlt.filter((_, i) => i !== index);
    onChange(updatedImages, updatedAlt, newlyUploadedIds);
  };

  const handleAltChange = (index: number, val: string) => {
    const truncated = val.slice(0, 255);
    const updatedAlt = [...imageAlt];
    // Ensure array is padded up to index
    while (updatedAlt.length < images.length) {
      updatedAlt.push("");
    }
    updatedAlt[index] = truncated;
    onChange(images, updatedAlt, newlyUploadedIds);
  };

  // Synchronized positional swap for both images[] and imageAlt[]
  const movePosition = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const newAlt = [...imageAlt];

    // Pad alt array if needed
    while (newAlt.length < newImages.length) {
      newAlt.push("");
    }

    // Swap elements
    const tempImg = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = tempImg;

    const tempAlt = newAlt[index];
    newAlt[index] = newAlt[targetIndex];
    newAlt[targetIndex] = tempAlt;

    onChange(newImages, newAlt, newlyUploadedIds);
  };

  return (
    <div style={{ marginTop: 12, marginBottom: 20 }}>
      <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", marginBottom: 8 }}>
        Product Gallery Images ({images.length}/{maxFiles})
      </label>

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            backgroundColor: "#FEF2F2",
            color: "#DC2626",
            borderRadius: 8,
            fontSize: "0.85rem",
            marginBottom: 12,
            border: "1px solid #FCA5A5",
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Upload Box */}
      {images.length < maxFiles && (
        <div
          style={{
            border: "2px dashed #CBD5E1",
            borderRadius: 12,
            padding: "24px 16px",
            textAlign: "center",
            backgroundColor: uploading ? "#F8FAFC" : "#FFFFFF",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            marginBottom: 16,
          }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!uploading) handleFileSelect(e.dataTransfer.files);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            style={{ display: "none" }}
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          {uploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "#4F46E5" }} />
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#4F46E5" }}>
                Streaming signed upload to Cloudinary...
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Upload size={28} style={{ color: "#64748B" }} />
              <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                Click to browse or drag & drop product photos
              </div>
              <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                JPEG, PNG, WebP, or AVIF up to 5 MB per file (Max {maxFiles} images)
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thumbnail Grid & Alt Text Management */}
      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                padding: 10,
                backgroundColor: "#F8FAFC",
                position: "relative",
              }}
            >
              {/* Cover Badge */}
              {idx === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    backgroundColor: "#10B981",
                    color: "#FFF",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    zIndex: 2,
                  }}
                >
                  <Star size={11} fill="#FFF" /> Primary Cover
                </div>
              )}

              {/* Action Toolbar */}
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  display: "flex",
                  gap: 4,
                  zIndex: 2,
                }}
              >
                {idx > 0 && (
                  <button
                    type="button"
                    title="Move left"
                    onClick={() => movePosition(idx, "left")}
                    style={{
                      padding: 4,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "1px solid #CBD5E1",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    <ArrowLeft size={14} />
                  </button>
                )}
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    title="Move right"
                    onClick={() => movePosition(idx, "right")}
                    style={{
                      padding: 4,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "1px solid #CBD5E1",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    <ArrowRight size={14} />
                  </button>
                )}
                <button
                  type="button"
                  title="Remove image"
                  onClick={() => handleRemove(idx)}
                  style={{
                    padding: 4,
                    backgroundColor: "#EF4444",
                    color: "#FFF",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Thumbnail Image */}
              <div
                style={{
                  height: 120,
                  borderRadius: 6,
                  overflow: "hidden",
                  marginBottom: 8,
                  backgroundColor: "#E2E8F0",
                }}
              >
                <img
                  src={url}
                  alt={imageAlt[idx] || `Product image ${idx + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Alt Text Input */}
              <div>
                <label style={{ fontSize: "0.75rem", color: "#64748B", display: "block", marginBottom: 2 }}>
                  SEO Alt Text
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: "0.78rem", padding: "4px 8px" }}
                  placeholder="Alt text description..."
                  value={imageAlt[idx] || ""}
                  maxLength={255}
                  onChange={(e) => handleAltChange(idx, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
