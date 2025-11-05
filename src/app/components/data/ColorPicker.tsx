"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Slider,
  InputAdornment,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChromePicker } from "react-color";
import { Search, Close, Add } from "@mui/icons-material";

// Styled Components
const ColorPickerPanel = styled(Paper)(({ theme }) => ({
  position: "fixed",
  top: 60,
  right: 0,
  width: "385px",
  height: "100vh",
  zIndex: 10000,
  backgroundColor: "#ffffff",
  borderLeft: "1px solid #e5e7eb",
  boxShadow: "-4px 0 16px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  padding: "16px 20px",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#ffffff",
}));

const PanelContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: "20px",
}));

const SearchInput = styled(TextField)(({ theme }) => ({
  marginBottom: "16px",
  "& .MuiOutlinedInput-root": {
    height: "44px",
    fontSize: "14px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    "& fieldset": { borderColor: "#e5e7eb" },
    "&:hover fieldset": { borderColor: "#8b5cf6" },
    "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
  },
}));

const ColorSection = styled(Box)(({ theme }) => ({
  marginBottom: "24px",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const ColorGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "10px",
}));

interface ColorSwatchProps extends React.ComponentProps<typeof Box> {
  selected?: boolean;
}
const ColorSwatch: React.FC<ColorSwatchProps> = styled(
  Box,
  { shouldForwardProp: (prop) => prop !== "selected" }
)(({ theme, selected }: { theme?: any; selected?: boolean }) => ({
  width: "40px",
  height: "40px",
  borderRadius: "50px",
  cursor: "pointer",
  border: selected ? "3px solid #7c3aed" : "1px solid #e5e7eb",
  position: "relative",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  "&::after": selected ? {
    content: '"✓"',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    textShadow: "0 0 3px rgba(0,0,0,0.5)",
  } : {},
}));

interface GradientSwatchProps extends React.ComponentProps<typeof Box> {
  selected?: boolean;
}
const GradientSwatch: React.FC<GradientSwatchProps> = styled(
  Box,
  { shouldForwardProp: (prop) => prop !== "selected" }
)(({ theme, selected }: { theme?: any; selected?: boolean }) => ({
  height: "56px",
  borderRadius: "10px",
  cursor: "pointer",
  border: selected ? "3px solid #7c3aed" : "1px solid #e5e7eb",
  marginBottom: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontWeight: 500,
  fontSize: "13px",
  textShadow: "0 1px 3px rgba(0,0,0,0.5)",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
  },
}));

const BrandColorButton = styled(Button)(({ theme }) => ({
  width: "100%",
  height: "44px",
  border: "2px dashed #d1d5db",
  borderRadius: "50px",
  color: "#6b7280",
  fontWeight: 500,
  fontSize: "13px",
  textTransform: "none",
  "&:hover": {
    borderColor: "#7c3aed",
    backgroundColor: "#f9fafb",
    color: "#7c3aed",
  },
}));

// Predefined Colors (Canva-style)
const DOCUMENT_COLORS = ["#000000", "#1a1a1a", "#4a4a4a", "#ff0000", "#ffffff"];

const SOLID_COLORS = [
  // Blacks and Grays
  "#000000", "#3f3f3f", "#5e5e5e", "#7d7d7d", "#9c9c9c", "#bbbbbb", "#e0e0e0",
  // Reds
  "#ff4136", "#ff6b6b", "#ff8787", "#ffa5a5", "#c92a2a", "#e03131", "#f03e3e",
  // Purples
  "#cc5de8", "#da77f2", "#e599f7", "#f3d9fa", "#9c36b5", "#ae3ec9", "#be4bdb",
  // Blues
  "#0099ff", "#339af0", "#4dabf7", "#74c0fc", "#1864ab", "#1971c2", "#1c7ed6",
  // Cyans
  "#00d9ff", "#22b8cf", "#3bc9db", "#66d9e8", "#0b7285", "#0c8599", "#1098ad",
  // Greens
  "#00ff88", "#51cf66", "#69db7c", "#8ce99a", "#2b8a3e", "#2f9e44", "#37b24d",
  // Yellows
  "#ffdd00", "#ffd43b", "#ffe066", "#ffec99", "#e67700", "#f59f00", "#fab005",
  // Oranges
  "#ff6b35", "#ff8c42", "#ffa94d", "#ffc078", "#d9480f", "#e8590c", "#f76707",
];

const GRADIENT_PRESETS = [
  {
    name: "Sunset",
    background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    colors: ["#ff9a9e", "#fecfef"],
    angle: 135,
  },
  {
    name: "Ocean Blue",
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    colors: ["#667eea", "#764ba2"],
    angle: 90,
  },
  {
    name: "Fresh Mint",
    background: "linear-gradient(180deg, #abecd6 0%, #fbed96 100%)",
    colors: ["#abecd6", "#fbed96"],
    angle: 180,
  },
  {
    name: "Purple Dream",
    background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    colors: ["#a8edea", "#fed6e3"],
    angle: 135,
  },
  {
    name: "Fire",
    background: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)",
    colors: ["#ff512f", "#dd2476"],
    angle: 135,
  },
  {
    name: "Juicy Orange",
    background: "linear-gradient(90deg, #ff9966 0%, #ff5e62 100%)",
    colors: ["#ff9966", "#ff5e62"],
    angle: 90,
  },
];

interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onColorChange: (color: string | any) => void;
  title?: string;
  allowGradients?: boolean;
    showPageBackgroundOption?: boolean;
  currentPageBackground?: string | any;
  onPageBackgroundChange?: (color: string | any) => void;
    documentColors?: string[]; 
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  isOpen,
  onClose,
  currentColor,
  onColorChange,
  title = "Color",
  allowGradients = true,
    showPageBackgroundOption = false,
  currentPageBackground = 'white',
  onPageBackgroundChange,
    documentColors = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [customColor, setCustomColor] = useState("#000000");
  const [tabValue, setTabValue] = useState(0);
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Gradient state
  const [gradientColor1, setGradientColor1] = useState("#ff9a9e");
  const [gradientColor2, setGradientColor2] = useState("#fecfef");
  const [gradientAngle, setGradientAngle] = useState(135);
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);

    const [isPageBackgroundMode, setIsPageBackgroundMode] = useState(false);
  
 useEffect(() => {
    setSelectedColor(currentColor);
    const saved = localStorage.getItem("recentColors");
    if (saved) {
      setRecentColors(JSON.parse(saved));
    }
  }, [currentColor, isOpen]);

  const handleColorSelect = (color: string) => {
    console.log("🎨 [ColorPicker] Selected color:", color, "Mode:", isPageBackgroundMode ? "Page BG" : "Object");
    
    if (isPageBackgroundMode && onPageBackgroundChange) {
      // Apply to page background
      onPageBackgroundChange(color);
    } else {
      // Apply to selected object
      setSelectedColor(color);
      onColorChange(color);
    }
    
    // Add to recent colors
    const updated = [color, ...recentColors.filter(c => c !== color)].slice(0, 14);
    setRecentColors(updated);
    localStorage.setItem("recentColors", JSON.stringify(updated));
  };

  const handleGradientSelect = (gradient: any) => {
    setSelectedGradient(gradient.name);
    setGradientColor1(gradient.colors[0]);
    setGradientColor2(gradient.colors[1]);
    setGradientAngle(gradient.angle);

    const gradientObj = {
      type: "linear",
      angle: gradient.angle,
      colorStops: [
        { offset: 0, color: gradient.colors[0] },
        { offset: 1, color: gradient.colors[1] },
      ],
      background: gradient.background,
    };
    
    if (isPageBackgroundMode && onPageBackgroundChange) {
      onPageBackgroundChange(gradientObj);
    } else {
      onColorChange(gradientObj);
    }
  };

  const handleCustomGradient = () => {
    const gradientObj = {
      type: "linear",
      angle: gradientAngle,
      colorStops: [
        { offset: 0, color: gradientColor1 },
        { offset: 1, color: gradientColor2 },
      ],
      background: `linear-gradient(${gradientAngle}deg, ${gradientColor1} 0%, ${gradientColor2} 100%)`,
    };
    
    if (isPageBackgroundMode && onPageBackgroundChange) {
      onPageBackgroundChange(gradientObj);
    } else {
      onColorChange(gradientObj);
    }
  };

  const handleAddBrandColor = () => {
    if (selectedColor && !brandColors.includes(selectedColor)) {
      const updated = [...brandColors, selectedColor].slice(0, 10);
      setBrandColors(updated);
      localStorage.setItem("brandColors", JSON.stringify(updated));
    }
  };

  const filteredColors = SOLID_COLORS.filter(color =>
    searchQuery ? color.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  if (!isOpen) return null;
 return (
    <ColorPickerPanel className="color-picker-panel">
      <PanelHeader>
        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </PanelHeader>

      <PanelContent>
        {/* ✅ NEW: Page Background Toggle */}
        {showPageBackgroundOption && (
          <Box sx={{ 
            mb: 2, 
            p: 2, 
            backgroundColor: '#f9fafb', 
            borderRadius: 2,
            border: '2px solid',
            borderColor: isPageBackgroundMode ? '#7c3aed' : '#e5e7eb',
            transition: 'all 0.2s'
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isPageBackgroundMode}
                  onChange={(e) => setIsPageBackgroundMode(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#7c3aed',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#7c3aed',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                    {isPageBackgroundMode ? '📄 Page Background Mode' : '🎨 Object Color Mode'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    {isPageBackgroundMode 
                      ? 'Colors will be applied to page background' 
                      : 'Colors will be applied to selected object'}
                  </Typography>
                </Box>
              }
            />
          </Box>
        )}

        {/* Search */}
        <SearchInput
          fullWidth
          placeholder='Try "blue" or "#00c4cc"'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#9ca3af" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Tabs for Solid/Gradient */}
        {allowGradients && (
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            sx={{
              mb: 2,
              borderBottom: 1,
              borderColor: "divider",
              minHeight: 40,
              "& .MuiTab-root": {
                minHeight: 40,
                textTransform: "none",
                fontSize: 13,
                fontWeight: 500,
              }
            }}
          >
            <Tab label="Solid" />
            <Tab label="Gradient" />
          </Tabs>
        )}

        {tabValue === 0 ? (
          <>
            {/* Document Colors */}
            <ColorSection>
              <SectionTitle>
                Document Colours
              </SectionTitle>
              <ColorGrid sx={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                {DOCUMENT_COLORS.map((color, index) => (
                  <ColorSwatch
                    key={index}
                    sx={{ backgroundColor: color }}
                    selected={selectedColor === color}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </ColorGrid>
            </ColorSection>

            {/* Brand Kit */}
            {brandColors.length > 0 && (
              <ColorSection>
                <SectionTitle>
                  Brand Kit
                  <Typography
                    variant="caption"
                    sx={{ color: "#7c3aed", cursor: "pointer", fontSize: 12 }}
                    onClick={() => setBrandColors([])}
                  >
                    Clear
                  </Typography>
                </SectionTitle>
                <ColorGrid sx={{ gridTemplateColumns: "repeat(5, 1fr)", mb: 1 }}>
                  {brandColors.map((color, index) => (
                    <ColorSwatch
                      key={index}
                      sx={{ backgroundColor: color }}
                      selected={selectedColor === color}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </ColorGrid>
              </ColorSection>
            )}

            <BrandColorButton
              startIcon={<Add />}
              onClick={handleAddBrandColor}
            >
              Add your brand colours
            </BrandColorButton>

            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <ColorSection sx={{ mt: 3 }}>
                <SectionTitle>Recent</SectionTitle>
                <ColorGrid>
                  {recentColors.map((color, index) => (
                    <ColorSwatch
                      key={index}
                      sx={{ backgroundColor: color }}
                      selected={selectedColor === color}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </ColorGrid>
              </ColorSection>
            )}

            {/* Color Picker */}
            <ColorSection>
              <SectionTitle>Custom Color</SectionTitle>
              <ChromePicker
                color={customColor}
                onChange={(color: { hex: string }) => setCustomColor(color.hex)}
                onChangeComplete={(color: { hex: string }) => handleColorSelect(color.hex)}
                width="100%"
                disableAlpha
              />
            </ColorSection>

            {/* Default Solid Colors */}
            <ColorSection>
              <SectionTitle>
                Default solid colours
                <Typography
                  variant="caption"
                  sx={{ color: "#7c3aed", cursor: "pointer", fontSize: 12 }}
                >
                  See all
                </Typography>
              </SectionTitle>
              <ColorGrid>
                {filteredColors.map((color, index) => (
                  <ColorSwatch
                    key={index}
                    sx={{ backgroundColor: color }}
                    selected={selectedColor === color}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </ColorGrid>
            </ColorSection>
          </>
        ) : (
          <>
            {/* Gradient Presets */}
            <ColorSection>
              <SectionTitle>Gradient Presets</SectionTitle>
              {GRADIENT_PRESETS.map((gradient, index) => (
                <GradientSwatch
                  key={index}
                  sx={{ background: gradient.background }}
                  selected={selectedGradient === gradient.name}
                  onClick={() => handleGradientSelect(gradient)}
                >
                  {gradient.name}
                </GradientSwatch>
              ))}
            </ColorSection>

            {/* Custom Gradient Builder */}
            <ColorSection>
              <SectionTitle>Custom Gradient</SectionTitle>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: "#6b7280", mb: 1, display: "block" }}>
                  Start Color
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <ColorSwatch
                    sx={{ backgroundColor: gradientColor1, width: 50, height: 50 }}
                    onClick={() => setCustomColor(gradientColor1)}
                  />
                  <TextField
                    size="small"
                    value={gradientColor1}
                    onChange={(e) => setGradientColor1(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: "#6b7280", mb: 1, display: "block" }}>
                  End Color
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <ColorSwatch
                    sx={{ backgroundColor: gradientColor2, width: 50, height: 50 }}
                    onClick={() => setCustomColor(gradientColor2)}
                  />
                  <TextField
                    size="small"
                    value={gradientColor2}
                    onChange={(e) => setGradientColor2(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: "#6b7280", mb: 1, display: "block" }}>
                  Angle: {gradientAngle}°
                </Typography>
                <Slider
                  value={gradientAngle}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(_, v) => setGradientAngle(v as number)}
                  sx={{ color: "#7c3aed" }}
                />
              </Box>

              {/* Preview */}
              <Box
                sx={{
                  height: 80,
                  borderRadius: 2,
                  background: `linear-gradient(${gradientAngle}deg, ${gradientColor1} 0%, ${gradientColor2} 100%)`,
                  border: "1px solid #e5e7eb",
                  mb: 2,
                }}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleCustomGradient}
                sx={{
                  backgroundColor: "#7c3aed",
                  "&:hover": { backgroundColor: "#6d28d9" }
                }}
              >
                Apply Gradient
              </Button>
            </ColorSection>
          </>
        )}
      </PanelContent>
    </ColorPickerPanel>
  );
};

export default ColorPicker;