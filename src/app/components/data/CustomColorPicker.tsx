"use client";
import React from "react";
import { Box, Typography, Paper, IconButton, TextField, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChromePicker } from "react-color";
import  fabric  from "fabric";


// ----------------- Mock Data -----------------
const DOCUMENT_COLORS: string[] = ["#000000", "#384d3c", "#f38a3d", "#fae7a0", "#ffffff", "#ebe9d3", "#455a64"];
const DEFAULT_SOLID_COLORS: string[] = [
  "#000000", "#555555", "#888888", "#aaaaaa", "#cccccc", "#ffffff",
  "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3",
  "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39",
  "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#607d8b",
];

interface SimpleGradient {
  key: string;
  colors: string[];
  angle: number;
}

const DEFAULT_GRADIENT_COLORS: SimpleGradient[] = [
  { key: "Sunset", colors: ['#ff6b6b', '#f9d423'], angle: 90 },
  { key: "Ocean", colors: ['#00c6ff', '#0072ff'], angle: 135 },
  { key: "Violet", colors: ['#6a11cb', '#2575fc'], angle: 45 },
  { key: "Mint", colors: ['#2af598', '#009efd'], angle: 0 },
  { key: "Black/White", colors: ['#000000', '#ffffff'], angle: 90 },
];

// ----------------- Styled Components -----------------
const ColorSwatch = styled(Box)(({ theme }) => ({
  width: 24,
  height: 24,
  borderRadius: 6,
  cursor: 'pointer',
  border: '1px solid #e2e8f0',
  transition: 'transform 0.1s, box-shadow 0.1s',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
}));

const PickerContainer = styled(Paper)(({ theme }) => ({
  width: 300,
  maxHeight: '80vh',
  overflowY: 'auto',
  padding: 16,
  borderRadius: 12,
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
}));

// ----------------- Component -----------------
interface ColorPalettePickerProps {
  currentColor: string | any; // fabric.Gradient is typed as any
  onChange: (color: string | any) => void;
  onClose: () => void;
}

const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({ currentColor, onChange, onClose }) => {
  const [hexInput, setHexInput] = React.useState<string>(
    typeof currentColor === 'string' ? currentColor : '#BEF4FF'
  );
  const [activeTab, setActiveTab] = React.useState<'solid' | 'gradient'>('solid');

  // ----------------- Helper Functions -----------------
  const createFabricGradient = (grad: SimpleGradient): any => {
    const angleRad = (grad.angle * Math.PI) / 180;
    const half = 0.5;
    const cosA = Math.cos(angleRad) * half;
    const sinA = Math.sin(angleRad) * half;

    return new fabric.Gradient({
      type: 'linear',
      gradientUnits: 'percentage',
      coords: { x1: half - cosA, y1: half - sinA, x2: half + cosA, y2: half + sinA },
      colorStops: [
        { offset: 0, color: grad.colors[0] },
        { offset: 1, color: grad.colors[1] },
      ],
    });
  };

  const handleSolidColorSelect = (color: string) => {
    onChange(color);
  };

  const handleGradientSelect = (grad: SimpleGradient) => {
    const fabricGradient = createFabricGradient(grad);
    onChange(fabricGradient);
  };

  const handleChromePickerChange = (color: any) => {
    const hex = color.hex;
    setHexInput(hex);
    onChange(hex);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexInput(newHex);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newHex)) {
      onChange(newHex);
    }
  };

  // ----------------- UI -----------------
  return (
    <PickerContainer>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>Colour</Typography>
        <IconButton onClick={onClose} size="small">
          <Box sx={{ width: 16, height: 16, '&:hover': { color: '#dc2626' } }}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
        </IconButton>
      </Box>

      {/* Hex Input and ChromePicker */}
      <Box sx={{ mb: 3, border: '1px solid #e2e8f0', p: 1, borderRadius: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Try 'blue' or '#00c4cc'"
          value={hexInput}
          onChange={handleHexInputChange}
          sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { height: 36, fontSize: '14px' } }}
        />
        <ChromePicker
          color={hexInput}
          onChange={handleChromePickerChange}
          disableAlpha
          styles={{ default: { picker: { boxShadow: 'none', width: '100%', padding: 0 } } }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 2, display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
        <Typography
          onClick={() => setActiveTab('solid')}
          sx={{
            cursor: 'pointer', mr: 2, pb: 1, fontWeight: 600, fontSize: '14px',
            color: activeTab === 'solid' ? '#9333ea' : '#6b7280',
            borderBottom: activeTab === 'solid' ? '2px solid #9333ea' : 'none',
          }}
        >
          Solid
        </Typography>
        <Typography
          onClick={() => setActiveTab('gradient')}
          sx={{
            cursor: 'pointer', pb: 1, fontWeight: 600, fontSize: '14px',
            color: activeTab === 'gradient' ? '#9333ea' : '#6b7280',
            borderBottom: activeTab === 'gradient' ? '2px solid #9333ea' : 'none',
          }}
        >
          Gradient
        </Typography>
      </Box>

      {/* Solid Colors */}
      {activeTab === 'solid' && (
        <>
          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', mb: 1 }}>Document Colours</Typography>
          <Grid container spacing={1} sx={{ mb: 3 }}>
            {DOCUMENT_COLORS.map(color => (
              <Box item key={color}>
                <ColorSwatch sx={{ backgroundColor: color }} onClick={() => handleSolidColorSelect(color)} />
              </Box>
            ))}
          </Grid>

          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', mb: 1 }}>Default Solid Colours</Typography>
          <Grid container spacing={1}>
            {DEFAULT_SOLID_COLORS.map(color => (
              <Grid item key={color}>
                <ColorSwatch sx={{ backgroundColor: color }} onClick={() => handleSolidColorSelect(color)} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Gradient Colors */}
      {activeTab === 'gradient' && (
        <>
          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', mb: 1 }}>Default Gradient Colours</Typography>
          <Grid container spacing={1}>
            {DEFAULT_GRADIENT_COLORS.map(grad => (
              <Grid item key={grad.key}>
                <ColorSwatch
                  sx={{
                    background: `linear-gradient(${grad.angle}deg, ${grad.colors[0]}, ${grad.colors[1]})`,
                    width: 48,
                    height: 24,
                  }}
                  onClick={() => handleGradientSelect(grad)}
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 3, p: 1, bgcolor: '#f3f4f6', borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Note: Gradient properties (angle, stops) can be edited after selecting a default gradient.
            </Typography>
          </Box>
        </>
      )}
    </PickerContainer>
  );
};

export default ColorPalettePicker;
