
"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import FolderMoveIcon from "@mui/icons-material/DriveFileMove";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import api from "../../lib/utils/axios";

interface UploadItem {
  id: string;
  url: string;
  filename: string;
  type: string;
  uploadedAt: string;
}

interface UploadsPanelProps {
  onAddUpload: (data: any) => void;
  onClose: () => void;
}

const uploadSources = [
  { name: "Upload folder", icon: <img src="/uploadIcons/uploadicon.png" alt="Upload folder" width={40} /> },
  { name: "Google Drive", icon: <img src="/uploadIcons/googledrive.png" alt="Google Drive" width={40} /> },
  { name: "Klaviyo", icon: <img src="/uploadIcons/klaviyo.png" alt="Klaviyo" width={40} /> },
];

// ✅ Helper to get token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
};

const UploadsPanel: React.FC<UploadsPanelProps> = ({ onAddUpload, onClose }) => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIdx, setMenuIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(0);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserUploads();
  }, []);

  const fetchUserUploads = async () => {
    try {
      setLoading(true);
      const res = await api.get("/uploads/me");
      console.log("✅ Fetched uploads:", res.data);
      
      const token = getAuthToken();
      
      setUploads(res.data.map((item: any) => ({
        id: item.id,
        url: `${item.url}?token=${token}`, // ✅ Add token to URL
        filename: item.filename,
        type: item.type,
        uploadedAt: new Date(item.createdAt).toLocaleDateString(),
      })));
    } catch (error) {
      console.error("❌ Error fetching uploads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setLoading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        await api.post("/uploads", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
          },
        });
      }
      await fetchUserUploads();
    } catch (error) {
      console.error("❌ Error uploading files:", error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  
  const handleImageClick = (item: UploadItem) => {
    console.log("🖼️ Adding image to canvas:", item.url);
    onAddUpload({ type: "ADD_IMAGE", src: item.url });
  };

  const handleImageError = (itemId: string) => {
    console.error("❌ Failed to load image:", itemId);
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const handleImageLoad = (itemId: string) => {
    console.log("✅ Image loaded successfully:", itemId);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, idx: number) => {
    setAnchorEl(event.currentTarget);
    setMenuIdx(idx);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIdx(null);
  };

  const handleDownload = (item: UploadItem) => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.filename;
    link.click();
    handleMenuClose();
  };

  const handleDelete = async (item: UploadItem) => {
    try {
      await api.delete(`/uploads/${item.id}`);
      await fetchUserUploads();
    } catch (error) {
      console.error("❌ Error deleting file:", error);
    }
    handleMenuClose();
  };

  const filteredUploads = uploads.filter(u =>
    u.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ position: "fixed", left: 80, top: 64, width: 360, height: "calc(100vh - 64px)", background: "#fff", boxShadow: 3, zIndex: 1300, borderRadius: "0 16px 16px 0", p: 2, overflowY: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => { if (showUploadOptions) setShowUploadOptions(false); else onClose(); }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1, ml: 1 }}>
          {showUploadOptions ? "Upload options" : "Uploads"}
        </Typography>
      </Box>

      {showUploadOptions ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {uploadSources.map((src, idx) => (
            <Box 
              key={idx} 
              sx={{ width: "22%", minWidth: 70, textAlign: "center", cursor: "pointer", mb: 2 }}
              onClick={() => { 
                if (src.name === "Upload folder") handleUploadClick(); 
                else alert(`"${src.name}" integration coming soon!`); 
              }}
            >
              {src.icon}
              <Typography variant="body2" sx={{ mt: 1, fontSize: 13 }}>{src.name}</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <>
          <TextField
            size="small"
            fullWidth
            placeholder="Search keywords, tags, colour"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              onClick={handleUploadClick}
              disabled={loading}
              sx={{ flex: 1, width: "100%", background: "#8b5cf6", color: "#fff", fontWeight: 600, fontSize: 16, boxShadow: "none", borderRadius: "8px", textTransform: "none", "&:hover": { background: "#7c3aed" } }}
            >
              {loading ? `Uploading ${uploadProgress}%` : 'Upload files'}
            </Button>
            <Button 
              variant="contained" 
              onClick={() => setShowUploadOptions(true)} 
              sx={{ minWidth: 40, px: 0, background: "#8b5cf6", color: "#fff", borderRadius: "8px", boxShadow: "none", "&:hover": { background: "#7c3aed" } }}
            >
              <MoreVertIcon />
            </Button>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Images" />
            <Tab label="Folders" />
          </Tabs>

          {tab === 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {loading && !uploads.length && (
                <Typography color="text.secondary" sx={{ mt: 2 }}>Loading...</Typography>
              )}
              {!loading && filteredUploads.length === 0 && (
                <Typography color="text.secondary" sx={{ mt: 2 }}>No uploads found.</Typography>
              )}
              {filteredUploads.map((item, idx) => (
                <Box 
                  key={item.id} 
                  sx={{ 
                    width: "46%", 
                    minWidth: 120, 
                    position: "relative", 
                    mb: 2, 
                    borderRadius: 2, 
                    border: "1px solid #e2e8f0", 
                    overflow: "hidden", 
                    background: "#f9fafb",
                    cursor: "pointer"
                  }}
                  onClick={() => handleImageClick(item)}
                >
                  {imageErrors[item.id] ? (
                    <Box 
                      sx={{ 
                        width: "100%", 
                        height: 80, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        background: "#f3f4f6",
                        borderRadius: 2
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 40, color: "#9ca3af" }} />
                    </Box>
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.filename} 
                      style={{ 
                        width: "100%", 
                        height: 80, 
                        objectFit: "cover", 
                        borderRadius: 8
                      }} 
                      onError={() => handleImageError(item.id)}
                      onLoad={() => handleImageLoad(item.id)}
                    />
                  )}
                  <IconButton 
                    size="small" 
                    sx={{ position: "absolute", top: 4, right: 4, background: "#fff" }} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, idx);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: "absolute", 
                      bottom: 4, 
                      left: 4, 
                      background: "rgba(0,0,0,0.6)", 
                      color: "#fff", 
                      padding: "2px 6px", 
                      borderRadius: 1,
                      fontSize: 10
                    }}
                  >
                    {item.filename.length > 15 ? item.filename.substring(0, 15) + '...' : item.filename}
                  </Typography>
                  {menuIdx === idx && (
                    <Menu 
                      anchorEl={anchorEl} 
                      open={Boolean(anchorEl)} 
                      onClose={handleMenuClose} 
                      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    >
                      <MenuItem disabled>
                        <Typography variant="subtitle2">{item.filename}</Typography>
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose}>
                        <InfoIcon fontSize="small" sx={{ mr: 1 }} /> Details
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose}>
                        <FolderMoveIcon fontSize="small" sx={{ mr: 1 }} /> Move
                      </MenuItem>
                      <MenuItem onClick={() => handleDownload(item)}>
                        <DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Download
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose}>
                        <SelectAllIcon fontSize="small" sx={{ mr: 1 }} /> Select items
                      </MenuItem>
                      <MenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Move to Trash
                      </MenuItem>
                    </Menu>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography color="text.secondary">Folders feature coming soon.</Typography>
            </Box>
          )}

          <input 
            type="file" 
            multiple 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: "none" }} 
            onChange={handleFileChange} 
          />
        </>
      )}
    </Box>
  );
};

export default UploadsPanel;