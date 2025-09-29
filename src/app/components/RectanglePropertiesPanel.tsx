"use client";
import React, { useEffect, useState } from "react";
import * as fabric from "fabric";
import {
  Box,
  Slider,
  TextField,
  IconButton,
  Tooltip,
  Button,
  Typography,
  ButtonGroup,
  Paper,
   Popover,
  Select, MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChromePicker } from "react-color";
import {
  ContentCopy,
  ContentPaste,
  ControlPointDuplicate as DuplicateIcon,
  Delete,
  Opacity as OpacityIcon,
  RotateRight as RotateRightIcon,
  FormatColorFill as FormatColorFillIcon,
  BorderColor as BorderColorIcon,
  Flip as FlipIcon,
  Replay as ReplayIcon,
  BorderStyle as BorderStyleIcon,
    Animation as AnimationIcon,
     Lock,
  LockOpen,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import CommandManager, { Command } from "@/lib/CommandManager";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AnimationPanel from "./AnimationSidebar/AnimationPanel";

// Styled components (same as circle panel)
const StyledInput = styled(TextField)({
  width: 60,
  marginRight: 8,
  "& .MuiOutlinedInput-root": {
    height: "32px",
    fontSize: "12px",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#c084fc" },
    "&.Mui-focused fieldset": { borderColor: "#9333ea" },
    backgroundColor: "white",
    borderRadius: "6px",
  },
  "& input": {
    padding: "6px 8px",
    textAlign: "center",
  },
});

const StyledSlider = styled(Slider)({
  width: 80,
  color: "#9333ea",
  marginRight: 8,
  "& .MuiSlider-thumb": {
    width: 16,
    height: 16,
    backgroundColor: "#ffffff",
    border: "2px solid #9333ea",
    "&:hover, &.Mui-focusVisible": {
      boxShadow: "0 0 0 8px rgba(147, 51, 234, 0.16)",
    },
  },
  "& .MuiSlider-track": {
    height: 4,
    borderRadius: 2,
  },
  "& .MuiSlider-rail": {
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
  },
});

const ColorIconButton = styled(IconButton)({
  width: 32,
  height: 32,
  marginRight: 8,
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  "&:hover": {
    borderColor: "#9333ea",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
});

const ActionButton = styled(IconButton)({
  width: 32,
  height: 32,
  marginRight: 8,
  backgroundColor: "#f8fafc",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
  "&:hover": {
    backgroundColor: "#f1f5f9",
    borderColor: "#c084fc",
  },
});


const ColorPickerPanel = styled(Paper)({
  position: 'fixed',
  zIndex: 9999,
  padding: "8px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
});

const GradientPanel = styled(Paper)({
  position: 'fixed',
  zIndex: 10000,
  padding: "12px",
  marginLeft: "80",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  minWidth: "200px",
});


interface RectanglePropertiesPanelProps {
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
  manager: CommandManager | null;
}


const strokeStyles = [
  { key: "solid", dash: [] },
  { key: "dashed", dash: [10, 5] },
  { key: "dotted", dash: [2, 5] },
  { key: "dash-dot", dash: [15, 5, 2, 5] },
  { key: "double", dash: [2, 2, 10, 2] },
  { key: "wavy", dash: [] },
];


const RectanglePropertiesPanel: React.FC<RectanglePropertiesPanelProps> = ({
  canvas,
  selectedObject,
  manager
}) => {
  const [propsState, setPropsState] = useState<any>({
    x: 0, y: 0, width: 0, height: 0,
    fill: "#BEF4FF", stroke: "#000000", strokeWidth: 1,
    opacity: 1, angle: 0, flipX: false, flipY: false,
    shadowColor: "#000000", shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0,
    strokeAlign: "center", radius: 0, sides: 3,
    strokeStyle: "solid",
  });

  const [clipboard, setClipboard] = useState<fabric.Object | null>(null);
  const [fillPickerOpen, setFillPickerOpen] = useState(false);
  const [strokePickerOpen, setStrokePickerOpen] = useState(false);
  const [shadowPickerOpen, setShadowPickerOpen] = useState(false);
  const [gradientPanelOpen, setGradientPanelOpen] = useState(false);
const [showAnimationPanel, setShowAnimationPanel] = useState(false);


  useEffect(() => {
    if (!selectedObject) return;
    const shadow = selectedObject.shadow as fabric.Shadow | undefined;
    let width = (selectedObject.width ?? 0) * (selectedObject.scaleX ?? 1);
    let height = (selectedObject.height ?? 0) * (selectedObject.scaleY ?? 1);
    let radius = 0, sides = 3;

    const dashArray = selectedObject.strokeDashArray || [];
    let style = "solid";
    if (!dashArray.length) style = "solid";
    else if (dashArray[0] === 10 && dashArray[1] === 5) style = "dashed";
    else if (dashArray[0] === 2 && dashArray[1] === 5) style = "dotted";
    else if (dashArray[0] === 15 && dashArray[1] === 5 && dashArray[2] === 2 && dashArray[3] === 5) style = "dash-dot";
    setPropsState((prev: any) => ({ ...prev, strokeStyle: style, stroke: selectedObject.stroke ?? "#000000", strokeWidth: selectedObject.strokeWidth ?? 1 }));


    if (selectedObject.type === "circle") radius = (selectedObject as fabric.Circle).radius ?? 0;
    if (selectedObject.type === "polygon") sides = (selectedObject as any).points?.length ?? 3;
    if (selectedObject.type === "triangle") sides = 3;

    setPropsState({
      x: selectedObject.left ?? 0,
      y: selectedObject.top ?? 0,
      width, height,
      fill: (selectedObject.fill as string) ?? "#BEF4FF",
      stroke: (selectedObject.stroke as string) ?? "#000000",
      strokeWidth: selectedObject.strokeWidth ?? 1,
      opacity: selectedObject.opacity ?? 1,
      angle: selectedObject.angle ?? 0,
      flipX: selectedObject.flipX ?? false,
      flipY: selectedObject.flipY ?? false,
      shadowColor: shadow?.color ?? "#000000",
      shadowBlur: shadow?.blur ?? 0,
      shadowOffsetX: shadow?.offsetX ?? 0,
      shadowOffsetY: shadow?.offsetY ?? 0,
      strokeAlign: (selectedObject as any).strokeAlign ?? "center",
      radius,
      sides,
      strokeStyle: style,
    });
  }, [selectedObject]);

  // Change handler
  const handleChange = (prop: string, value: any) => {
    if (!selectedObject || !canvas || !manager) return;
    const prevValue = propsState[prop];
    const command: Command = {
      do: () => { applyProp(selectedObject, prop, value); canvas.requestRenderAll(); setPropsState((prev: any) => ({ ...prev, [prop]: value })); },
      undo: () => { applyProp(selectedObject, prop, prevValue); canvas.requestRenderAll(); setPropsState((prev: any) => ({ ...prev, [prop]: prevValue })); },
    };
    manager.execute(command);
  };

  const applyProp = (obj: fabric.Object, prop: string, value: any) => {
    if (!obj) return;

    switch (prop) {
      case "x": obj.set("left", value); break;
      case "y": obj.set("top", value); break;
      case "width":
        if (obj.type === "image") {
          (obj as fabric.Image).scaleToWidth(value);
        } else {
          obj.set("width", value / (obj.scaleX ?? 1));
        }
        break;
      case "height":
        if (obj.type === "image") {
          (obj as fabric.Image).scaleToHeight(value);
        } else {
          obj.set("height", value / (obj.scaleY ?? 1));
        }
        break;

      case "fill": obj.set("fill", value); break;
      case "stroke": obj.set("stroke", value); break;
      case "strokeWidth": obj.set("strokeWidth", value); break;
      case "strokeAlign": obj.set("strokeAlign", value); break;
      case "opacity": obj.set("opacity", value); break;
      case "angle": obj.set("angle", value); break;
      case "flipX":
      case "flipY": obj.set(prop, value); break;
      case "shadowColor":
      case "shadowBlur":
      case "shadowOffsetX":
      case "shadowOffsetY":
        const shadow = obj.shadow ? new fabric.Shadow(obj.shadow) : new fabric.Shadow({ color: '#000000', blur: 0, offsetX: 0, offsetY: 0 });
        if (prop === "shadowColor") shadow.color = value;
        if (prop === "shadowBlur") shadow.blur = value;
        if (prop === "shadowOffsetX") shadow.offsetX = value;
        if (prop === "shadowOffsetY") shadow.offsetY = value;
        obj.set("shadow", shadow);
        break;
      case "radius":
        if (obj.type === "rect") (obj as fabric.Rect).set({ rx: value, ry: value });
        if (obj.type === "circle") (obj as fabric.Circle).set({ radius: value });
        if (obj.type === "triangle") {
          const t = obj as fabric.Triangle;
          const w = t.width ?? 50;
          const h = t.height ?? 50;
          t.set({ width: w + value, height: h + value });
        }
        break;
      case "sides":
        if (obj.type === "polygon") {
          const poly = obj as fabric.Polygon;
          const r = Math.min(poly.width ?? 50, poly.height ?? 50) / 2;
          const points = Array.from({ length: value }, (_, i) => {
            const angle = (i * 2 * Math.PI) / value - Math.PI / 2;
            return { x: r + r * Math.cos(angle), y: r + r * Math.sin(angle) };
          });
          poly.set({ points });
        }
        break;

     case "strokeStyle":
        const styleMap: Record<string, number[]> = {
          solid: [], dashed: [10, 5], dotted: [2, 5], "dash-dot": [15, 5, 2, 5], double: [2, 2, 10, 2], wavy: [4, 2, 1, 2],
        };
        obj.set("strokeDashArray", styleMap[value] ?? []);
        break;
    }
    obj.setCoords();
  };

  // Clipboard & actions (same as existing)
  const handleDuplicate = async () => { if (!canvas || !selectedObject) return; const clone = await selectedObject.clone(); clone.set({ left: (selectedObject.left ?? 0) + 20, top: (selectedObject.top ?? 0) + 20 }); canvas.add(clone); canvas.setActiveObject(clone); canvas.requestRenderAll(); };
  const handleCopy = async () => { if (!selectedObject) return; const clone = await selectedObject.clone(); setClipboard(clone); };
  const handlePaste = async () => { if (!canvas || !clipboard) return; const clone = await clipboard.clone(); clone.set({ left: (clipboard.left ?? 0) + 30, top: (clipboard.top ?? 0) + 30 }); canvas.add(clone); canvas.setActiveObject(clone); canvas.requestRenderAll(); };
  const handleDelete = () => { if (!canvas || !selectedObject) return; canvas.remove(selectedObject); canvas.requestRenderAll(); };

  const createGradient = (type: 'linear' | 'radial') => {
    if (!canvas || !selectedObject) return;
    const gradient = new fabric.Gradient({ type, gradientUnits: 'percentage', coords: { x1: 0, y1: 0, x2: 1, y2: 1 }, colorStops: [{ offset: 0, color: '#ff6b6b' }, { offset: 0.5, color: '#4ecdc4' }, { offset: 1, color: '#45b7d1' }] });
    handleChange('fill', gradient);
    setGradientPanelOpen(false);
  };

  if (!selectedObject) return null;
return (
    <>
      <Box sx={{ width: '100%', overflowX: 'auto', bgcolor: '#ffffff', padding: 2, display: 'flex', gap: 1.5, alignItems: 'center' }}>
        {/* Radius */}
        {(selectedObject.type === 'rect' || selectedObject.type === 'circle' || selectedObject.type === 'triangle') && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ mb: 0.5, fontSize: '10px', color: '#6b7280' }}>Radius</Typography>
            <StyledInput type="number" value={propsState.radius} onChange={e => handleChange("radius", Number(e.target.value))} />
          </Box>
        )}

        {/* Sides */}
        {(selectedObject.type === 'polygon' || selectedObject.type === 'triangle') && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ mb: 0.5, fontSize: '10px', color: '#6b7280' }}>
              {selectedObject.type === 'polygon' ? 'Sides' : 'Triangle Corners'}
            </Typography>
            <StyledInput type="number" value={propsState.sides} onChange={e => handleChange("sides", Math.max(3, Number(e.target.value)))} inputProps={{ min: 3 }} />
          </Box>
        )}

        {/* Position */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ mb: 0.5, fontSize: '10px', color: '#6b7280' }}>Position</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <StyledInput type="number" value={Math.round(propsState.x)} onChange={e => handleChange("x", Number(e.target.value))} />
            <StyledInput type="number" value={Math.round(propsState.y)} onChange={e => handleChange("y", Number(e.target.value))} />
          </Box>
        </Box>

        {/* Size */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ mb: 0.5, fontSize: '10px', color: '#6b7280' }}>Size</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <StyledInput type="number" value={Math.round(propsState.width)} onChange={e => handleChange("width", Number(e.target.value))} />
            <StyledInput type="number" value={Math.round(propsState.height)} onChange={e => handleChange("height", Number(e.target.value))} />
          </Box>
        </Box>

        {/* Rotation */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RotateRightIcon sx={{ fontSize: 14, color: '#6b7280', mb: 0.5 }} />
          <StyledInput type="number" value={Math.round(propsState.angle)} onChange={e => handleChange("angle", Number(e.target.value))} />
        </Box>

        {/* Opacity */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <OpacityIcon sx={{ fontSize: 14, color: '#6b7280', mb: 0.5 }} />
          <StyledSlider value={propsState.opacity} min={0} max={1} step={0.01} onChange={(_, v) => handleChange("opacity", v)} />
        </Box>

        {/* Fill */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <Typography variant="caption" sx={{ mb: 0.5, fontSize: '10px', color: '#6b7280' }}>Fill</Typography>
          <Tooltip title="Fill Color">
            <ColorIconButton onClick={() => setFillPickerOpen(!fillPickerOpen)} sx={{ backgroundColor: typeof propsState.fill === 'string' ? propsState.fill : 'linear-gradient(45deg,#ff6b6b,#4ecdc4)' }}>
              <FormatColorFillIcon sx={{ fontSize: 16 }} />
            </ColorIconButton>
          </Tooltip>
          {fillPickerOpen && (
            <ColorPickerPanel>
              <ChromePicker color={typeof propsState.fill === 'string' ? propsState.fill : '#BEF4FF'} onChangeComplete={(color: { hex: string }) => { handleChange('fill', color.hex); setFillPickerOpen(false) }} disableAlpha />
              <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #e2e8f0' }}>
                <Button size="small" fullWidth onClick={() => { setGradientPanelOpen(true); setFillPickerOpen(false); }}>Gradient Options</Button>
              </Box>
            </ColorPickerPanel>
          )}
          {gradientPanelOpen && (
            <GradientPanel>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Gradient Types</Typography>
              <ButtonGroup size="small" orientation="vertical" fullWidth>
                <Button onClick={() => createGradient('linear')}>Linear Gradient</Button>
                <Button onClick={() => createGradient('radial')}>Radial Gradient</Button>
              </ButtonGroup>
            </GradientPanel>
          )}
        </Box>

        {/* Stroke */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <Typography variant="caption" sx={{ mb: 0.5, fontSize: '10px', color: '#6b7280' }}>Stroke</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Stroke Color">
              <ColorIconButton onClick={() => setStrokePickerOpen(!strokePickerOpen)} sx={{ backgroundColor: propsState.stroke }}>
                <BorderColorIcon sx={{ fontSize: 16 }} />
              </ColorIconButton>
            </Tooltip>
            <StyledInput type="number" value={propsState.strokeWidth} onChange={e => handleChange("strokeWidth", Number(e.target.value))} />
          </Box>
          {strokePickerOpen && (
            <ColorPickerPanel>
              <ChromePicker color={propsState.stroke} onChangeComplete={(color: { hex: string }) => { handleChange('stroke', color.hex); setStrokePickerOpen(false) }} disableAlpha />
            </ColorPickerPanel>
          )}
        </Box>

        {/* Stroke Style */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="caption" sx={{ mb: 0.5, fontSize: 10, color: "#6b7280" }}>Stroke Style</Typography>
          <Select value={propsState.strokeStyle ?? "solid"} size="small" onChange={(e) => handleChange("strokeStyle", e.target.value)} sx={{ width: 100 }}>
            {strokeStyles.map((style) => (
              <MenuItem key={style.key} value={style.key}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <svg width="60" height="10">
                    {style.key === "wavy" ? (
                      <path d="M0 5 Q2 0, 4 5 T8 5 T12 5 T16 5 T20 5 T24 5 T28 5 T32 5 T36 5 T40 5 T44 5 T48 5 T52 5 T56 5 T60 5" stroke="black" strokeWidth="2" fill="none" />
                    ) : (
                      <line x1={0} y1={5} x2={60} y2={5} stroke="black" strokeWidth={2} strokeDasharray={style.dash.join(",")} />
                    )}
                  </svg>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Flip */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ mb: 0.5, fontSize: '10px', color: '#6b7280' }}>Flip</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Flip Horizontal">
              <ActionButton onClick={() => handleChange("flipX", !propsState.flipX)} sx={{ backgroundColor: propsState.flipX ? '#e0e7ff' : '#f8fafc', color: propsState.flipX ? '#4338ca' : '#6b7280' }}><FlipIcon sx={{ transform: "scaleX(-1)", fontSize: 16 }} /></ActionButton>
            </Tooltip>
            <Tooltip title="Flip Vertical">
              <ActionButton onClick={() => handleChange("flipY", !propsState.flipY)} sx={{ backgroundColor: propsState.flipY ? '#e0e7ff' : '#f8fafc', color: propsState.flipY ? '#4338ca' : '#6b7280' }}><FlipIcon sx={{ fontSize: 16 }} /></ActionButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Animation Button */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ mb: 0.5, fontSize: '10px', color: '#6b7280' }}>Animate</Typography>
          <Tooltip title="Add Animation">
            <ActionButton 
              onClick={() => setShowAnimationPanel(!showAnimationPanel)}
              sx={{ 
                backgroundColor: showAnimationPanel ? '#f0f4ff' : '#f8fafc',
                color: showAnimationPanel ? '#7b68ee' : '#6b7280',
                borderColor: showAnimationPanel ? '#7b68ee' : '#e2e8f0',
              }}
            >
              <AnimationIcon sx={{ fontSize: 16 }} />
            </ActionButton>
          </Tooltip>
        </Box>

        {/* Shadow */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <Typography variant="caption" sx={{ mb: 0.5, fontSize: '10px', color: '#6b7280' }}>Shadow</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Shadow Color">
              <ColorIconButton onClick={() => setShadowPickerOpen(!shadowPickerOpen)} sx={{ backgroundColor: propsState.shadowColor, opacity: propsState.shadowBlur > 0 ? 1 : 0.5 }}>
                <ReplayIcon sx={{ fontSize: 16 }} />
              </ColorIconButton>
            </Tooltip>
            <StyledSlider value={propsState.shadowBlur} min={0} max={20} step={1} onChange={(_, v) => handleChange("shadowBlur", v)} />
          </Box>
          {shadowPickerOpen && (
            <ColorPickerPanel>
              <ChromePicker color={propsState.shadowColor} onChangeComplete={(color: { hex: string }) => { handleChange('shadowColor', color.hex); setShadowPickerOpen(false) }} disableAlpha />
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Shadow Offset</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ fontSize: '10px' }}>X</Typography>
                    <StyledSlider value={propsState.shadowOffsetX} min={-20} max={20} step={1} onChange={(_, v) => handleChange("shadowOffsetX", v)} sx={{ width: 80 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ fontSize: '10px' }}>Y</Typography>
                    <StyledSlider value={propsState.shadowOffsetY} min={-20} max={20} step={1} onChange={(_, v) => handleChange("shadowOffsetY", v)} sx={{ width: 80 }} />
                  </Box>
                </Box>
              </Box>
            </ColorPickerPanel>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ mb: 0.5, fontSize: '10px', color: '#6b7280' }}>Actions</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Copy"><ActionButton onClick={handleCopy}><ContentCopy sx={{ fontSize: 16 }} /></ActionButton></Tooltip>
            <Tooltip title="Paste"><ActionButton onClick={handlePaste}><ContentPaste sx={{ fontSize: 16 }} /></ActionButton></Tooltip>
            <Tooltip title="Duplicate"><ActionButton onClick={handleDuplicate}><DuplicateIcon sx={{ fontSize: 16 }} /></ActionButton></Tooltip>
            <Tooltip title="Delete"><ActionButton onClick={handleDelete} sx={{ color: '#dc2626' }}><Delete sx={{ fontSize: 16 }} /></ActionButton></Tooltip>
          </Box>
        </Box>

        {/* Reset Shadow */}
        {(propsState.shadowBlur > 0 || propsState.shadowOffsetX !== 0 || propsState.shadowOffsetY !== 0) && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ mb: 0.5, fontSize: '10px', color: '#6b7280' }}>Reset</Typography>
            <Tooltip title="Reset Shadow">
              <ActionButton onClick={() => { handleChange("shadowBlur", 0); handleChange("shadowOffsetX", 0); handleChange("shadowOffsetY", 0); }}>
                <ReplayIcon sx={{ fontSize: 16 }} />
              </ActionButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Animation Panel */}
      {showAnimationPanel && (
        <AnimationPanel
          onClose={() => setShowAnimationPanel(false)}
          canvas={canvas}
          selectedObject={selectedObject}
        />
      )}
    </>
  );
};

export default RectanglePropertiesPanel;