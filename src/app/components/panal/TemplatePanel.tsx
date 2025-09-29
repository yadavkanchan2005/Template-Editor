"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Card, CardActionArea, CardMedia, CardContent, Stack } from "@mui/material";
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
}

interface Template {
  id: string;
  name: string;
  thumbnail: string;
  size: { width: number; height: number };
  elements: TemplateElement[];
}

interface TemplatesPanelProps {
  onTemplateSelect: (templateData: any) => void;
  onClose?: () => void;
}

const mockTemplates: Template[] = [
  {
    id: "template_001",
    name: "Instagram Product Ad",
    thumbnail: "/images/templates/template1.png",
    size: { width: 1080, height: 1080 },
    elements: [
      { type: "image", x: 100, y: 100, width: 400, height: 400, placeholder: true },
      { type: "text", x: 120, y: 520, text: "Product Name", fontSize: 48 },
      { type: "button", x: 120, y: 600, text: "Shop Now" },
    ],
  },
  {
    id: "template_002",
    name: "Facebook Banner Ad",
    thumbnail: "images/templates/template2.png",
    size: { width: 1200, height: 628 },
    elements: [
      { type: "image", x: 50, y: 50, width: 500, height: 400, placeholder: true },
      { type: "text", x: 600, y: 100, text: "Summer Sale", fontSize: 36 },
    ],
  },
];

const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ onTemplateSelect, onClose }) => {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    setTemplates(mockTemplates);
  }, []);


const handleSelect = (template: Template) => {
  onTemplateSelect(template);
  onClose?.();
};



  return (
    <Box
      sx={{
        position: "fixed",
        top: 64,
        left: 80,
        width: 400,
        height: "calc(100vh - 64px)",
        bgcolor: "#fff",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        borderRadius: "0 12px 12px 0",
        zIndex: 1300,
        overflowY: "auto",
        p: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Templates
        </Typography>
        <IconButton onClick={() => onClose?.()}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Template List */}
      <Stack spacing={2}>
        {templates.map((template) => (
          <Card key={template.id}>
            <CardActionArea onClick={() => handleSelect(template)}>
              <CardMedia
                component="img"
                height={140}
                image={template.thumbnail}
                alt={template.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {template.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {template.size.width} x {template.size.height}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default TemplatesPanel;
