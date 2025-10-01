"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Stack,
  TextField,
  Button,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface TemplateElement {
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  placeholder?: boolean;
  src?: string;
}

interface Template {
  id: string;
  name: string;
  src: string;
  size: { width: number; height: number };
  category: string;
  elements: TemplateElement[];
}

interface TemplatesPanelProps {
  onTemplateSelect: (templateData: Template) => void;
  onClose?: () => void;
}

// Mock templates with category
const mockTemplates: Template[] = [
  {
    id: "template_001",
    name: "Instagram Product Ad",
    src: "/images/templates/template1.png",
    category: "Social",
    size: { width: 1080, height: 1080 },
    elements: [
      { type: "image", x: 100, y: 100, width: 400, height: 400, src: "/images/templates/template1.png" },
      { type: "text", x: 120, y: 520, text: "Product Name", fontSize: 48 },
      { type: "button", x: 120, y: 600, text: "Shop Now" },
    ],
  },
  {
    id: "template_002",
    name: "Facebook Banner Ad",
    src: "/images/templates/template2.png",
    category: "Social",
    size: { width: 1200, height: 628 },
    elements: [
      { type: "image", x: 50, y: 50, width: 500, height: 400, src: "/images/templates/template2.png" },
      { type: "text", x: 600, y: 100, text: "Sale", fontSize: 36 },
      { type: "button", x: 120, y: 600, text: "Shop Now" },
    ],
  },
  {
    id: "template_003",
    name: "Jewellery Showcase",
    src: "/images/templates/template3.png",
    category: "Product",
    size: { width: 1080, height: 1350 },
    elements: [
      { type: "image", x: 150, y: 150, width: 400, height: 400, src: "/images/templates/template3.png" },
      { type: "text", x: 100, y: 600, text: "Elegant Necklace", fontSize: 48 },
      { type: "text", x: 100, y: 680, text: "Limited Edition", fontSize: 24 },
      { type: "button", x: 100, y: 760, text: "Shop Now" },
    ],
  },
  // Add more templates here with different categories
];

const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ onTemplateSelect, onClose }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Categories extracted dynamically from templates
  const categories = ["All", ...Array.from(new Set(mockTemplates.map((t) => t.category)))];

  useEffect(() => {
    setTemplates(mockTemplates);
  }, []);

  const handleSelect = (template: Template) => {
    onTemplateSelect(template);
    onClose?.();
  };

  // Filter templates by search query and category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box
      sx={{
        position: "fixed",
        top: 64,
        left: 80,
        width: 420,
        height: "calc(100vh - 64px)",
        bgcolor: "#fff",
        boxShadow: "0 12px 40px rgba(0,0,0,0.16)",
        borderRadius: "0 16px 16px 0",
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

      {/* Categories Toolbar */}
      <Box
        sx={{
          px: 2,
          mb: 2,
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 1,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            size="small"
            color={activeCategory === cat ? "primary" : "default"}
            onClick={() => setActiveCategory(cat)}
            sx={{
              cursor: "pointer",
              fontWeight: activeCategory === cat ? 600 : 500,
              px: 2,
              py: 0.5,
            }}
          />
        ))}
      </Box>

      {/* Template List */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 2 }}>
        <Stack spacing={2}>
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              sx={{
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "scale(1.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" },
              }}
            >
              <CardActionArea onClick={() => handleSelect(template)}>
                <CardMedia
                  component="img"
                  height={200} // bigger height for better view
                  image={template.src}
                  alt={template.name}
                  sx={{ objectFit: "cover", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}
                />
                <CardContent sx={{ pt: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {template.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {template.size.width} x {template.size.height}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
          {filteredTemplates.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
              No templates found.
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default TemplatesPanel;