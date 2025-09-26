"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardMedia, CardActionArea } from "@mui/material";

interface Template {
  id: string;
  name: string;
  thumbnail_url: string;
  template_data: any;
}

interface TemplatePanelProps {
  onTemplateSelect: (templateData: any) => void;
}

const TemplatePanel: React.FC<TemplatePanelProps> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchTemplates = async () => {
    try {
      const response = await fetch('https://api.apitemplate.io/v1/templates');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };
  fetchTemplates();
}, []);


  if (loading) return <Typography sx={{ p: 2 }}>Loading templates...</Typography>;
  if (error) return <Typography sx={{ p: 2, color: "red" }}>Error: {error}</Typography>;

  return (
    <Box sx={{ p: 2, overflowY: "auto", height: "100%" }}>
      {templates.map((tpl) => (
        <Card key={tpl.id} sx={{ mb: 2 }}>
          <CardActionArea onClick={() => onTemplateSelect(tpl.template_data)}>
            <CardMedia
              component="img"
              height="140"
              image={tpl.thumbnail_url}
              alt={tpl.name}
            />
            <Typography sx={{ p: 1 }} variant="body2">{tpl.name}</Typography>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
};

export default TemplatePanel;
