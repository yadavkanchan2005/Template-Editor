import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  CircularProgress,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import StarsIcon from "@mui/icons-material/Stars";
import FormatSizeIcon from "@mui/icons-material/FormatSize";

interface TextStyle {
  id: string;
  text: string;
  fontSize: number;
  fontWeight: string | number;
  fontFamily?: string;
}

interface GoogleFont {
  family: string;
  variants: string[];
  category: string;
}

interface TextPanelProps {
  onAddText: (textConfig: {
    text: string;
    fontSize: number;
    fontWeight: string | number;
    fontFamily?: string;
  }) => void;
  onClose: () => void;
  canvas?: any; //  Add canvas prop to check selected text
}

const TextPanel: React.FC<TextPanelProps> = ({ onAddText, onClose, canvas }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFonts, setShowFonts] = useState(false);
  const [selectedText, setSelectedText] = useState<any>(null);

  // Default text styles matching Canva
  const defaultStyles: TextStyle[] = [
    {
      id: "heading",
      text: "Add a heading",
      fontSize: 64,
      fontWeight: "bold",
      fontFamily: "Inter",
    },
    {
      id: "subheading",
      text: "Add a subheading",
      fontSize: 40,
      fontWeight: 600,
      fontFamily: "Inter",
    },
    {
      id: "body",
      text: "Add a little bit of body text",
      fontSize: 20,
      fontWeight: "normal",
      fontFamily: "Inter",
    },
  ];

  // Dynamic text options
  const dynamicTextOptions = [
    {
      id: "page-numbers",
      name: "Page numbers",
      icon: "📄",
      gradient: "linear-gradient(135deg, #8B4513 0%, #FF6B35 100%)",
    },
  ];

  // Text apps
  const textApps = [
    {
      id: "type-gradient",
      name: "TypeGradient",
      gradient: "linear-gradient(135deg, #FF6B9D 0%, #FFA07A 100%)",
      verified: true,
    },
    {
      id: "type-extrude",
      name: "TypeExtrude",
      gradient: "linear-gradient(135deg, #00D9C0 0%, #00B8A9 100%)",
      verified: true,
    },
    {
      id: "type-craft",
      name: "TypeCraft",
      gradient: "linear-gradient(135deg, #6B5CE7 0%, #9D4EDD 100%)",
      verified: false,
    },
  ];

  // Track selected text object in canvas
  useEffect(() => {
    if (!canvas) return;

    const updateSelection = () => {
      const active = canvas.getActiveObject();
      if (active && (active.type === "textbox" || active.type === "text")) {
        setSelectedText(active);
      } else {
        setSelectedText(null);
      }
    };

    canvas.on("selection:created", updateSelection);
    canvas.on("selection:updated", updateSelection);
    canvas.on("selection:cleared", () => setSelectedText(null));

    // Initial check
    updateSelection();

    return () => {
      canvas.off("selection:created", updateSelection);
      canvas.off("selection:updated", updateSelection);
      canvas.off("selection:cleared");
    };
  }, [canvas]);

  // Fetch Google Fonts
  useEffect(() => {
    const fetchFonts = async () => {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`
        );
        const data = await response.json();
        setFonts(data.items.slice(0, 100)); 
      } catch (error) {
        console.error("Error fetching fonts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (showFonts && fonts.length === 0) {
      fetchFonts();
    }
  }, [showFonts]);

  // Load font dynamically
  const loadFont = (fontFamily: string) => {
    if (fontFamily === "Inter" || fontFamily === "Arial") return Promise.resolve();

    return new Promise<void>((resolve) => {
      const fontFamilyFormatted = fontFamily.replace(/ /g, "+");
      const existingLink = document.querySelector(`link[href*="${fontFamilyFormatted}"]`);
      
      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamilyFormatted}:wght@400;600;700;800&display=swap`;
      link.rel = "stylesheet";
      link.onload = () => resolve();
      link.onerror = () => resolve();
      document.head.appendChild(link);
    });
  };

  const handleAddText = (style: TextStyle) => {
    onAddText({
      text: style.text,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontFamily: style.fontFamily,
    });
  };

  //  FIXED: Handle font selection - check if text is selected first
  const handleFontSelect = async (fontFamily: string) => {
    await loadFont(fontFamily);

    //  If text is already selected, change its font
    if (selectedText && canvas) {
      setTimeout(() => {
        selectedText.set({ fontFamily: fontFamily });
        canvas.requestRenderAll();
        console.log("Font changed for selected text:", fontFamily);
      }, 300);
    } else {
      // If no text selected, add new text with selected font
      onAddText({
        text: "New Text",
        fontSize: 32,
        fontWeight: "normal",
        fontFamily: fontFamily,
      });
    }
    
    setShowFonts(false);
  };

  const filteredFonts = fonts.filter((font) =>
    font.family.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
        <Box sx={{ position: "fixed", left: 80, top: 64, width: 360, height: "calc(100vh - 64px)", background: "#fff", boxShadow: 3, zIndex: 1300, borderRadius: "0 16px 16px 0", p: 2, overflowY: "auto" }}>
    
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
            <FormatSizeIcon /> Text
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Show selected text info */}
        {selectedText && (
          <Box sx={{ 
            mb: 2, 
            p: 1.5, 
            backgroundColor: "#f0f4ff", 
            borderRadius: 1,
            border: "1px solid #7c3aed"
          }}>
            <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 600 }}>
              ✏️ Editing: {selectedText.text?.substring(0, 30) || "Text"}...
            </Typography>
          </Box>
        )}

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search fonts and combinations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Add Text Box Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() =>
            onAddText({
              text: "New Text",
              fontSize: 32,
              fontWeight: "normal",
              fontFamily: "Inter",
            })
          }
          sx={{
            background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
            color: "white",
            py: 1.5,
            mb: 1.5,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              background: "linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)",
            },
          }}
          startIcon={<Typography sx={{ fontSize: 20, fontWeight: "bold" }}>T</Typography>}
        >
          Add a text box
        </Button>

        {/* Magic Write Button */}
        <Button
          fullWidth
          variant="outlined"
          size="large"
          sx={{
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            borderColor: "#d1d5db",
            color: "#374151",
            "&:hover": {
              borderColor: "#9ca3af",
              backgroundColor: "#f9fafb",
            },
          }}
          startIcon={<AutoFixHighIcon />}
        >
          Magic Write
        </Button>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {/* Brand Kit Section */}
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: "#f9fafb",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 1,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0.3,
                  p: 0.5,
                }}
              >
                <Box sx={{ backgroundColor: "#7c3aed", borderRadius: 0.5 }} />
                <Box sx={{ backgroundColor: "#ec4899", borderRadius: 0.5 }} />
                <Box sx={{ backgroundColor: "#3b82f6", borderRadius: 0.5 }} />
                <Box sx={{ backgroundColor: "#10b981", borderRadius: 0.5 }} />
              </Box>
              <Typography sx={{ fontWeight: 600 }}>Brand Kit</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EditIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <StarsIcon sx={{ fontSize: 18, color: "#fbbf24" }} />
            </Box>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            sx={{
              mt: 1.5,
              py: 1,
              textTransform: "none",
              fontWeight: 500,
              borderColor: "#d1d5db",
              color: "#374151",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
              },
            }}
            onClick={() => setShowFonts(!showFonts)}
          >
            {showFonts ? "Hide brand fonts" : "Add your brand fonts"}
          </Button>

          {/* Google Fonts List */}
          {showFonts && (
            <Box sx={{ mt: 2, maxHeight: 300, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 2 }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {filteredFonts.map((font) => (
                    <ListItem key={font.family} disablePadding>
                      <ListItemButton
                        onClick={() => handleFontSelect(font.family)}
                        sx={{
                          py: 1.5,
                          "&:hover": {
                            backgroundColor: "#f3f4f6",
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: `'${font.family}', sans-serif`,
                            fontSize: 16,
                          }}
                        >
                          {font.family}
                        </Typography>
                        <Chip
                          label={font.category}
                          size="small"
                          sx={{ ml: "auto", fontSize: 10, height: 20 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </Box>

        {/* Default Text Styles */}
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography sx={{ fontWeight: 600, mb: 1.5, color: "#111827" }}>
            Default text styles
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {defaultStyles.map((style) => (
              <Box
                key={style.id}
                onClick={() => handleAddText(style)}
                sx={{
                  p: 2,
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#7c3aed",
                    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.15)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize:
                      style.id === "heading"
                        ? 28
                        : style.id === "subheading"
                        ? 20
                        : 14,
                    fontWeight: style.fontWeight,
                    fontFamily: style.fontFamily,
                    color: "#111827",
                  }}
                >
                  {style.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Dynamic Text */}
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography sx={{ fontWeight: 600, mb: 1.5, color: "#111827" }}>
            Dynamic text
          </Typography>
          {dynamicTextOptions.map((option) => (
            <Box
              key={option.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#7c3aed",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.15)",
                },
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  background: option.gradient,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    backgroundColor: "#dc2626",
                    color: "white",
                    fontSize: 10,
                    px: 0.8,
                    py: 0.3,
                    borderRadius: 0.5,
                    fontWeight: 600,
                  }}
                >
                  11
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    backgroundColor: "#ea580c",
                    color: "white",
                    fontSize: 10,
                    px: 0.8,
                    py: 0.3,
                    borderRadius: 0.5,
                    fontWeight: 600,
                  }}
                >
                  2
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 500, color: "#111827" }}>
                {option.name}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Apps Section */}
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography sx={{ fontWeight: 600, mb: 1.5, color: "#111827" }}>
            Apps
          </Typography>
          <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1 }}>
            {textApps.map((app) => (
              <Box
                key={app.id}
                sx={{
                  flexShrink: 0,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 90,
                    height: 90,
                    background: app.gradient,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                    position: "relative",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: app.id === "type-extrude" ? 48 : 16,
                  }}
                >
                  {app.id === "type-gradient" && "🎨"}
                  {app.id === "type-extrude" && "E"}
                  {app.id === "type-craft" && (
                    <Box sx={{ textAlign: "center", lineHeight: 1.2 }}>
                      <Box>hype</Box>
                      <Box sx={{ color: "#fbbf24" }}>CRAFT</Box>
                    </Box>
                  )}
                  {app.verified && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        backgroundColor: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          backgroundColor: "#7c3aed",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: 10,
                        }}
                      >
                        ✓
                      </Box>
                    </Box>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    textAlign: "center",
                    color: "#374151",
                  }}
                >
                  {app.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Recently Used */}
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography sx={{ fontWeight: 600, color: "#111827" }}>
              Recently used
            </Typography>
            <Button
              size="small"
              sx={{
                textTransform: "none",
                color: "#6b7280",
                fontWeight: 500,
                "&:hover": {
                  color: "#111827",
                },
              }}
            >
              See all
            </Button>
          </Box>
          <Box
            sx={{
              height: 80,
              backgroundColor: "#f9fafb",
              border: "2px dashed #d1d5db",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: 14, color: "#9ca3af" }}>
              No recently used items
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TextPanel;