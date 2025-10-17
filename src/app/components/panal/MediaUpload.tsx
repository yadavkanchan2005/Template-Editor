"use client";
import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Alert,
  LinearProgress,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload,
  Close,
  Link as LinkIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  VideoLibrary as VideoIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { mediaApi, Media } from "../../../../services/mediaApi";

// ✅ Helper to get token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || "";
  }
  return "";
};

type MediaType = "image" | "svg" | "json" | "Stickers" | "VIDEO" | "shape" | "element";
type UploadMode = "file" | "url";

const ELEMENT_CATEGORIES = [
  "frames",
  "shapes",
  "backgrounds",
  "stickers",
  "icons",
  "others",
];

interface MediaUploadPanelProps {
  userId?: string;
  onUploadSuccess?: (media: Media) => void;
}

const MediaUploadPanel: React.FC<MediaUploadPanelProps> = ({
  userId = "demo-user-id",
  onUploadSuccess,
}) => {
  const [uploadMode, setUploadMode] = useState<UploadMode>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [category, setCategory] = useState<string>("");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🟡 Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("📂 File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    setSelectedFile(file);
    setError(null);

    // Auto-detect media type
    if (file.type.startsWith("image/")) {
      if (file.type === "image/svg+xml") {
        setMediaType("svg");
      } else {
        setMediaType("image");
      }
    } else if (file.type.startsWith("video/")) {
      setMediaType("VIDEO");
    } else if (file.type === "application/json") {
      setMediaType("json");
    }

    // Generate preview
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("🖼 Preview generated for:", file.name);
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // 🟡 Upload file
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }
    if (mediaType === "element" && !category) {
      setError("Please select a category for the element");
      return;
    }

    console.log("🚀 Starting upload for:", {
      file: selectedFile.name,
      type: mediaType,
      category,
      userId,
    });

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", mediaType === "element" ? "image" : mediaType);
      if (mediaType === "element") formData.append("category", category);
      formData.append("uploadedBy", userId);

      // 🔍 Log FormData content
      for (const [key, value] of formData.entries()) {
        console.log(`📦 FormData → ${key}:`, value);
      }

      const token = getAuthToken();
      console.log("🔐 Auth Token:", token ? "Found ✅" : "Missing ❌");

      const response = await mediaApi.uploadFile(
        {
          file: selectedFile,
          type: mediaType === "element" ? "image" : mediaType,
          uploadedBy: userId,
          category: mediaType === "element" ? category : undefined,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          onUploadProgress: (progressEvent: any) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            console.log(`📡 Upload progress: ${percentCompleted}%`);
            setUploadProgress(percentCompleted);
          },
        }
      );

      console.log("✅ Upload response:", response);

      setSuccess(` ${selectedFile.name} uploaded successfully!`);

      if (onUploadSuccess) {
        onUploadSuccess(response);
      }

      resetForm();
    } catch (err: any) {
      console.error("❌ Upload error (full):", err);
      setError(
        err.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 🟡 Upload URL
  const handleUrlUpload = async () => {
    if (!urlInput.trim()) {
      setError("Please enter a URL");
      return;
    }
    if (mediaType === "element" && !category) {
      setError("Please select a category for the element");
      return;
    }

    console.log("🌐 Uploading from URL:", urlInput, "type:", mediaType, "category:", category);

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      const response = await mediaApi.addMediaByUrl(
        {
          url: urlInput,
          type: mediaType === "element" ? "image" : mediaType,
          category: mediaType === "element" ? category : undefined,
          uploadedBy: userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      console.log("✅ URL upload response:", response);

      setSuccess(`✅ Media from URL added successfully!`);

      if (onUploadSuccess) {
        onUploadSuccess(response);
      }

      setUrlInput("");
    } catch (err: any) {
      console.error("❌ URL upload error (full):", err);
      setError(
        err.response?.data?.message || "Failed to add media from URL."
      );
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setUrlInput("");
    setCategory("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);


  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography
          variant="h5"
          sx={{ mb: 3, fontWeight: 600, color: "#1e293b" }}
        >
          Upload Media / Element
        </Typography>

        {/* Upload Mode Tabs */}
        <Tabs
          value={uploadMode}
          onChange={(_, newValue) => {
            setUploadMode(newValue);
            setError(null);
            resetForm();
          }}
          sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label="Upload File"
            value="file"
            icon={<CloudUpload />}
            iconPosition="start"
          />
          <Tab
            label="Add URL"
            value="url"
            icon={<LinkIcon />}
            iconPosition="start"
          />
        </Tabs>

        {/* Media Type Selector */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Media Type</InputLabel>
          <Select
            value={mediaType}
            label="Media Type"
            onChange={(e) => {
              setMediaType(e.target.value as MediaType);
              setCategory("");
            }}
          >
            <MenuItem value="image">
              <ImageIcon sx={{ mr: 1, fontSize: 20 }} />
              Image (JPG, PNG, GIF, WebP)
            </MenuItem>
            <MenuItem value="svg">
              <CodeIcon sx={{ mr: 1, fontSize: 20 }} />
              SVG Icon
            </MenuItem>
            <MenuItem value="json">
              <CodeIcon sx={{ mr: 1, fontSize: 20 }} />
              JSON Animation
            </MenuItem>
            <MenuItem value="VIDEO">
              <VideoIcon sx={{ mr: 1, fontSize: 20 }} />
              Video (MP4, WebM)
            </MenuItem>
            <MenuItem value="element">
              <CategoryIcon sx={{ mr: 1, fontSize: 20 }} />
              Element (Frames, Shapes, etc.)
            </MenuItem>
          </Select>
        </FormControl>

        {/* Category Selector for Elements */}
        {mediaType === "element" && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Element Category</InputLabel>
            <Select
              value={category}
              label="Element Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              {ELEMENT_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* File Upload Mode */}
        {uploadMode === "file" && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept={
                mediaType === "image"
                  ? "image/*"
                  : mediaType === "svg"
                  ? "image/svg+xml"
                  : mediaType === "VIDEO"
                  ? "video/*"
                  : mediaType === "json"
                  ? "application/json"
                  : "*"
              }
              style={{ display: "none" }}
            />

            <Button
              variant="outlined"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
              startIcon={<CloudUpload />}
              sx={{ mb: 2, py: 1.5 }}
            >
              {selectedFile ? selectedFile.name : "Choose File"}
            </Button>

            {/* Preview */}
            {preview && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  border: "2px dashed #e0e0e0",
                  borderRadius: 2,
                  position: "relative",
                }}
              >
                <IconButton
                  size="small"
                  onClick={resetForm}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "white",
                    "&:hover": { bgcolor: "#f5f5f5" },
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>

                {mediaType === "VIDEO" ? (
                  <video
                    src={preview}
                    controls
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: 300,
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                )}
              </Box>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading}
              sx={{ py: 1.5 }}
              startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
            >
              {uploading ? `Uploading ${uploadProgress}%` : "Upload File"}
            </Button>
          </>
        )}

        {/* URL Upload Mode */}
        {uploadMode === "url" && (
          <>
            <TextField
              fullWidth
              label="Media URL"
              placeholder="https://example.com/image.png"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handleUrlUpload}
              disabled={!urlInput.trim() || uploading}
              startIcon={<LinkIcon />}
              sx={{ py: 1.5 }}
            >
              {uploading ? "Adding..." : "Add from URL"}
            </Button>
          </>
        )}

        {/* Loading Progress */}
        {uploading && <LinearProgress sx={{ mt: 2 }} />}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        {/* Info */}
        <Box sx={{ mt: 3, p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
          <Typography variant="caption" color="textSecondary">
            <strong>File size limit:</strong> 10MB
            <br />
            <strong>Supported formats:</strong>
            <br />
            • Images: JPG, PNG, GIF, WebP
            <br />
            • SVG: Vector graphics
            <br />
            • Video: MP4, WebM
            <br />
            • JSON: Lottie animations
            <br />
            • Elements: Frames, Shapes, Backgrounds, etc.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default MediaUploadPanel;