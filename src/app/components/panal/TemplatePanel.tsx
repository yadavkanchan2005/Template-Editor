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
       src?: string;  
}

interface Template {
  id: string;
  name: string;
 src: string;
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
    src: "/images/templates/template1.png",
    size: { width: 1080, height: 1080 },
    elements: [
      { 
        type: "image", 
        x: 100, 
        y: 100, 
        width: 400, 
        height: 400, 
        src: "/images/templates/template1.png",
      },
      { 
        type: "text", 
        x: 120, 
        y: 520, 
        text: "Product Name", 
        fontSize: 48 
      },
      { 
        type: "button", 
        x: 120, 
        y: 600, 
        text: "Shop Now" 
      },
    ],
  },
  {
    id: "template_002",
    name: "Facebook Banner Ad",
    src: "/images/templates/template2.png",  
    size: { width: 1200, height: 628 },
    elements: [
      { 
        type: "image", 
        x: 50, 
        y: 50, 
        width: 500, 
        height: 400, 
        src: "/images/templates/template2.png"  
      },
      { 
        type: "text", 
        x: 600, 
        y: 100, 
        text: "Sale", 
        fontSize: 36 
      },
       { 
        type: "button", 
        x: 120, 
        y: 600, 
        text: "Shop Now" 
      },
    ],
  },
   {
    id: "template_003",
    name: "Jewellery Showcase",
    src: "/images/templates/template3.png",
    size: { width: 1080, height: 1350 },
    elements: [
      { type: "image", x: 150, y: 150, width: 400, height: 400, src: "/images/templates/template3.png" },
      { type: "text", x: 100, y: 600, text: "Elegant Necklace", fontSize: 48 },
      { type: "text", x: 100, y: 680, text: "Limited Edition", fontSize: 24 },
      { type: "button", x: 100, y: 760, text: "Shop Now" },
    ],
  },
  {
    id: "template_004",
    name: "Big Sale Poster",
    src: "/images/templates/template4.png",
    size: { width: 1080, height: 1080 },
    elements: [
      { type: "text", x: 100, y: 100, text: "Mega Sale", fontSize: 72 },
      { type: "image", x: 100, y: 300, width: 500, height: 500, src: "/images/templates/template4.png" },
      { type: "button", x: 100, y: 820, text: "Grab Now" },
    ],
  },
  {
    id: "template_005",
    name: "Luxury Watch Ad",
    src: "/images/templates/template5.png",
    size: { width: 1080, height: 1080 },
    elements: [
      { type: "image", x: 150, y: 150, width: 500, height: 500, src: "/images/templates/template5.png" },
      { type: "text", x: 120, y: 700, text: "Luxury Watch", fontSize: 48 },
      { type: "button", x: 120, y: 780, text: "Buy Now" },
    ],
  },
  {
    id: "template_006",
    name: "Facebook Event Banner",
    src: "/images/templates/template6.png",
    size: { width: 1200, height: 628 },
    elements: [
      { type: "text", x: 100, y: 100, text: "Live Event", fontSize: 48 },
      { type: "image", x: 400, y: 200, width: 600, height: 400, src: "/images/templates/template6.png" },
      { type: "button", x: 100, y: 550, text: "Join Now" },
    ],
  },
  {
    id: "template_007",
    name: "Jewellery Discount Ad",
    src: "/images/templates/template7.png",
    size: { width: 1080, height: 1080 },
    elements: [
      { type: "text", x: 100, y: 100, text: "20% OFF", fontSize: 72 },
      { type: "image", x: 150, y: 300, width: 400, height: 400, src: "/images/templates/template7.png" },
      { type: "button", x: 100, y: 750, text: "Shop Now" },
    ],
  },
  {
    id: "template_008",
    name: "Instagram Story Sale",
    src: "/images/templates/template8.png",
    size: { width: 1080, height: 1920 },
    elements: [
      { type: "image", x: 100, y: 200, width: 500, height: 800, src: "/images/templates/template8.png" },
      { type: "text", x: 100, y: 1100, text: "Flash Sale", fontSize: 60 },
      { type: "button", x: 100, y: 1200, text: "Shop Now" },
    ],
  },
  {
    id: "template_009",
    name: "Product Launch Poster",
    src: "/images/templates/template9.png",
    size: { width: 1080, height: 1080 },
    elements: [
      { type: "text", x: 100, y: 100, text: "New Arrival", fontSize: 60 },
      { type: "image", x: 100, y: 300, width: 500, height: 500, src: "/images/templates/template9.png" },
      { type: "button", x: 100, y: 820, text: "Buy Now" },
    ],
  },
  {
    id: "template_010",
    name: "Jewellery Collection Showcase",
    src: "/images/templates/template10.png",
    size: { width: 1080, height: 1350 },
    elements: [
      { type: "image", x: 150, y: 150, width: 400, height: 400, src: "/images/templates/template10.png" },
      { type: "text", x: 120, y: 600, text: "Exclusive Collection", fontSize: 48 },
      { type: "text", x: 120, y: 680, text: "Limited Edition", fontSize: 24 },
      { type: "button", x: 120, y: 760, text: "Shop Now" },
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
                image={template.src}
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
