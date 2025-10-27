

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  TextField,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { templateApi, Template } from "../../../../services/templateApi";

interface TemplatesPanelProps {
  onTemplateSelect: (templateData: Template) => void;
  onClose?: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ onTemplateSelect, onClose }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref for categories scroll
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await templateApi.getAllTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "All",
    ...Array.from(
      new Set(
        (templates || [])
          .map((t: any) => t?.category)
          .filter((c: any) => typeof c === "string" && c.trim().length > 0)
      )
    ),
  ];

  // Scroll left/right for categories
  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesRef.current) {
      const scrollAmount = 120;
      categoriesRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleSelect = (template: Template) => {
    onTemplateSelect(template);
    // Panel will NOT close here
  };

  const getThumbnailUrl = (thumbnail?: string) => {
    if (!thumbnail) return "/images/default-template.png";
    const t = thumbnail.trim();
    // If backend stored a base64 data URL, use it directly
    if (t.startsWith('data:')) return t;
    if (t.startsWith('http')) return t;
    if (t.startsWith('/')) return `${API_BASE_URL}${t}`;
    return `${API_BASE_URL}/${t}`;
  };

  // Recent used logic (first template as recent for demo)
  const recentTemplates = templates.length ? [templates[0]] : [];
  // const filteredTemplates = templates.filter((template) => {
  //   const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
  //   const tplCategory = (template as any)?.category;
  //   const matchesCategory = activeCategory === "All" || tplCategory === activeCategory;
  //   return matchesSearch && matchesCategory;

  // Exclude recentTemplates from "All results"
const filteredTemplates = templates.filter((template) => {
  const isRecent = recentTemplates.some((recent) => recent.id === template.id);
  if (isRecent) return false; // skip if in recent

  const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
  const tplCategory = (template as any)?.category;
  const matchesCategory = activeCategory === "All" || tplCategory === activeCategory;

  return matchesSearch && matchesCategory;
  });

  return (
    <Box
      sx={{
        position: "fixed",
        top: 64,
        left: 80,
        width: 400,
        height: "calc(100vh - 64px)",
        bgcolor: "#fff",
        boxShadow: "0 12px 40px rgba(0,0,0,0.16)",
        zIndex: 1400,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
          Templates
        </Typography>
        <IconButton onClick={() => onClose?.()}>
          <CloseIcon fontSize="medium" />
        </IconButton>
      </Box>

      {/* Search Bar */}
      <Box sx={{ px: 2, mb: 1 }}>
        <TextField
          fullWidth
          placeholder="Search templates..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#f9f9f9",
              "&:hover fieldset": { borderColor: "#d1d5db" },
            },
          }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ px: 2, display: "flex", alignItems: "center", gap: 4, mb: 0.5 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#222",
            pb: 0.5,
            borderBottom: "2px solid #a855f7",
            mr: 2,
          }}
        >
          Templates
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 500,
            fontSize: "1.1rem",
            color: "#555",
            pb: 0.5,
            opacity: 0.7,
          }}
        >
          Styles
        </Typography>
      </Box>
{/* Categories Box with arrows OUTSIDE the scroll container */}
<Box sx={{ px: 2, mb: 2, display: "flex", alignItems: "center" }}>
  {/* Left Arrow */}
  <IconButton
    size="small"
    sx={{
      p: 0,
      mr: 1,
      bgcolor: "transparent",
      boxShadow: "none",
      "&:hover": { bgcolor: "transparent" },
    }}
    onClick={() => scrollCategories("left")}
  >
    <ArrowBackIosNewIcon fontSize="small" sx={{ fontSize: 18 }} />
  </IconButton>

  {/* Scrollable Categories Container */}
 {/* Categories Box */}
<Box
  sx={{
    px: 2,
    mb: 2,
    display: "flex",
    gap: 1,
    overflowX: "auto",  // horizontal scroll
    overflowY: "hidden",
    pb: 1,
    pt: 1,
    whiteSpace: "nowrap", // prevent wrapping
    "&::-webkit-scrollbar": { display: "none" },
  }}
  ref={categoriesRef}
>
  {categories.map((cat, idx) => (
    <Box
      key={cat}
      sx={{
        flex: "0 0 auto", // important: prevent box from shrinking
        border: "1px solid #222",
        borderRadius: "10px",
        background: "#fff",
        px: 2,
        py: 1,
        minWidth: 80,
        maxWidth: 140, // adjust max width
        fontSize: 15,
        display: "flex",
        alignItems: "center",
        fontWeight: activeCategory === cat ? 600 : 500,
        color: activeCategory === cat ? "#a855f7" : "#222",
        cursor: "pointer",
        boxShadow: activeCategory === cat ? "0 2px 8px #a855f733" : "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textTransform: "none", // fix small caps
      }}
      onClick={() => setActiveCategory(cat)}
    >
      {cat}
    </Box>
  ))}
</Box>

  {/* Right Arrow */}
  <IconButton
    size="small"
    sx={{
      p: 0,
      ml: 1,
      bgcolor: "transparent",
      boxShadow: "none",
      "&:hover": { bgcolor: "transparent" },
    }}
    onClick={() => scrollCategories("right")}
  >
    <ArrowForwardIosIcon fontSize="small" sx={{ fontSize: 18 }} />
  </IconButton>
</Box>


      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ px: 2, mb: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      Template List
      {!loading && !error && (
        <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 2 }}>
          {/* Recently used */}
        {/* Recently used */}
{recentTemplates.length > 0 && (
  <>
    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
      Recently used
    </Typography>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
      {recentTemplates.map((template) => (
        <Box
          key={template.id}
          sx={{
            width: "calc(50% - 8px)", // two per row
            mb: 2,
          }}
        >
          <Card
            sx={{
              height: 240, // uniform card height
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "0px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
              },
              bgcolor: "#f9f6ff",
            }}
          >
            <CardActionArea onClick={() => handleSelect(template)}>
              <CardMedia
                component="img"
                height={160} // fixed image height
                image={getThumbnailUrl(template.thumbnail)}
                alt={template.name}
                sx={{
                  objectFit: "cover",
                  borderTopLeftRadius: "0px",
                  borderTopRightRadius: "0px",
                  backgroundColor: "#f5f5f5",
                }}
              />
              <CardContent sx={{ pt: 1, pb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 15 }}>
                  {template.name}
                </Typography>
                {template.size && (
                  <Typography variant="caption" color="text.secondary">
                    {template.size.width} x {template.size.height}
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
      ))}
    </Box>
  </>
)}
          {/* All results */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            All results
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {filteredTemplates.map((template) => (
              <Box
                key={template.id}
                sx={{
                  width: "calc(50% - 8px)",
                  mb: 2,
                }}
              >
                <Card
                  sx={{
                    borderRadius: "0px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": { transform: "scale(1.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" },
                    bgcolor: "#f9f6ff"
                  }}
                >
                  <CardActionArea onClick={() => handleSelect(template)}>
                    <CardMedia
                      component="img"
                      height={200}
                      image={getThumbnailUrl(template.thumbnail)}
                      alt={template.name}
                      sx={{
                        objectFit: "cover",
                        borderTopLeftRadius: "0px",
                        borderTopRightRadius: "0px",
                        backgroundColor: "#f5f5f5"
                      }}
                    />
                    <CardContent sx={{ pt: 1, pb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 15 }}>
                        {template.name}
                      </Typography>
                      {template.size && (
                        <Typography variant="caption" color="text.secondary">
                          {template.size.width} x {template.size.height}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            ))}
            {/* Empty State */}
            {filteredTemplates.length === 0 && (
              <Box sx={{ width: "100%" }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                  {searchQuery ? `No templates found for "${searchQuery}"` : "No templates available"}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TemplatesPanel;