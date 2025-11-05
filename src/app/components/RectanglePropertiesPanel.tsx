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
  Select,
  MenuItem,
  Popover,
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

  Animation as AnimationIcon,
  SquareRounded,
  Close as CloseIcon, 
} from "@mui/icons-material";
import ReplayIcon from "@mui/icons-material/Replay"; 
import CommandManager, { Command } from "@/lib/CommandManager";
import ColorPicker from "./data/ColorPicker";
import AnimationPanel from "./AnimationSidebar/AnimationPanel";


interface CustomIconProps {
  name: 'Rotate' | 'CornerRounding' | 'FillColor' | 'BorderColor' | 'FlipHorizontal' | 'FlipVertical' | 'ShadowEffect' | 'Animate';
  style?: React.CSSProperties;
}

const CustomIcon: React.FC<CustomIconProps> = ({ name, style }) => {
  let IconText = '';
  switch (name) {
    case 'Rotate': IconText = 'Rot'; break;
case 'CornerRounding':
  return (
    <svg
      width={30}      
      height={30}   
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 20C8 13.3726 13.3726 8 20 8"
        stroke={ 'currentColor'} 
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );


    case 'FillColor': IconText = 'Fill'; break;
    case 'BorderColor': IconText = 'Brdr'; break;
    case 'FlipHorizontal': return <FlipIcon sx={{ fontSize: 18, transform: "scaleX(-1)" }} />; 
    case 'FlipVertical': return <FlipIcon sx={{ fontSize: 18 }} />; 
    case 'ShadowEffect': IconText = 'Shdw'; break;
    case 'Animate': return <AnimationIcon sx={{ fontSize: 18 }} />; 
    default: IconText = '';
  }

  if (IconText) {
    return <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'inherit', ...style }}>{IconText}</Typography>;
  }
  return null;
};




const StyledInput = styled(TextField)({ 
  width: 55,
  marginRight: 4,
  "& .MuiOutlinedInput-root": {
    height: "28px",
    fontSize: "12px",
    borderRadius: "6px",
    backgroundColor: "white",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#a0aec0" },
    "&.Mui-focused fieldset": { borderColor: "#4338ca", borderWidth: '1px' },
  },
  "& input": {
    padding: "4px 8px",
    textAlign: "center",
  },
});


const CanvaIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive?: boolean }>(({ isActive }) => ({
  width: 30,
  height: 30,
  padding: 0,
  marginRight: 4,
  borderRadius: "6px",
  color: isActive ? '#4338ca' : '#6b7280',
  backgroundColor: isActive ? '#e0e7ff' : '#ffffff',
  border: isActive ? '1px solid #4338ca' : '1px solid #e2e8f0', 
  boxShadow: 'none',
  transition: 'all 0.15s ease-in-out',
  '&:hover': {
    backgroundColor: '#f3f4f6',
    color: '#4338ca',
    border: '1px solid #4338ca', 
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
}));

const PropertyGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  paddingRight: '12px',
  marginRight: '12px',
  borderRight: '1px solid #e5e7eb',
  height: '40px',
});


interface RectanglePropertiesPanelProps {
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
  manager: CommandManager | null;
  onOpenColorPicker?: (type: 'fill' | 'stroke' | 'shadow', color: string) => void;
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
  manager,
    onOpenColorPicker
}) => {
  const [propsState, setPropsState] = useState<any>({
    x: 0, y: 0, width: 0, height: 0,
    fill: "#BEF4FF", stroke: "#000000", strokeWidth: 1,
    opacity: 1, angle: 0, flipX: false, flipY: false,
    shadowColor: "#000000", shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0,
    strokeAlign: "center", radius: 0, sides: 3,
    strokeStyle: "solid",
  });
  const [radiusPopoverOpen, setRadiusPopoverOpen] = useState(false);
  const [radiusAnchorEl, setRadiusAnchorEl] = useState<HTMLElement | null>(null);
  const [clipboard, setClipboard] = useState<fabric.Object | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showAnimationPanel, setShowAnimationPanel] = useState(false);
  const [opacity, setOpacity] = useState(100);
  const [anchorOpacity, setAnchorOpacity] = useState<null | HTMLElement>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerColor, setColorPickerColor] = useState<string>('#000000');
// RectanglePropertiesPanel.tsx me colorPickerType type update karo
const [colorPickerType, setColorPickerType] = useState<'fill' | 'stroke' | 'shadow' | 'svgFill' | null>(null);
  const [layerPopoverOpen, setLayerPopoverOpen] = useState(false);
const [layerAnchorEl, setLayerAnchorEl] = useState<HTMLElement | null>(null);
const [svgColors, setSvgColors] = useState<Array<{
  index: number;
  color: string;
  label: string;
}>>([]);
const [isSVG, setIsSVG] = useState(false);



useEffect(() => {
  if (!selectedObject) {
    setSvgColors([]);
    setIsSVG(false);
    return;
  }

  // ✅ FORCE SVG DETECTION on every selection change
  const ensureEditableSVGFromGroup = () => {
    const anySel: any = selectedObject as any;
    const grp: any = anySel?.group;
    if (grp && Array.isArray(grp._objects)) {
      const isPathLike = (o: any) => ['path','path-group','polygon','polyline','object'].includes(o?.type);
      const pathChildren = grp._objects.filter((c: any) => isPathLike(c));
      if (pathChildren.length) {
        grp.isEditableSVG = true;
        grp.svgPaths = pathChildren;
        pathChildren.forEach((child: any) => {
          child.isEditableSVG = true;
          child.svgPaths = pathChildren;
        });
        anySel.isEditableSVG = true;
        anySel.svgPaths = pathChildren;
        return true;
      }
    }
    return false;
  };

  // ✅ ALWAYS check for SVG, even if flag exists
  ensureEditableSVGFromGroup();

  // ✅ RE-DETECT SVG colors on EVERY selection
  if ((selectedObject as any).isEditableSVG) {
    setIsSVG(true);
    const paths = (selectedObject as any).svgPaths || [];

    const colorMap = new Map<string, number>();
    paths.forEach((path: any, index: number) => {
      const candidate = (path as any).editableFill || path.fill || path.stroke;
      if (candidate && typeof candidate === 'string' && candidate !== 'none') {
        if (!colorMap.has(candidate)) {
          colorMap.set(candidate, index);
        }
      }
    });

    const colors = Array.from(colorMap.entries()).map(([color, index], i) => ({
      index,
      color,
      label: `Color ${i + 1}`
    }));

    setSvgColors(colors);
    
    // ✅ AUTO-SELECT first color when new SVG selected
    if (colors.length > 0 && colorPickerColor !== colors[0].color) {
      setColorPickerColor(colors[0].color);
    }
  } else {
    setIsSVG(false);
    setSvgColors([]);
  }

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
    
    if (selectedObject.type === "rect") radius = (selectedObject as fabric.Rect).rx ?? 0;
    if (selectedObject.type === "circle") radius = (selectedObject as fabric.Circle).radius ?? 0;
    if (selectedObject.type === "polygon") sides = (selectedObject as any).points?.length ?? 3;
    if (selectedObject.type === "triangle") sides = 3;


    

    setPropsState({
      x: selectedObject.left ?? 0,
      y: selectedObject.top ?? 0,
      width, height, fill: (selectedObject.fill as string) ?? "#BEF4FF",
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
    setOpacity(Math.round((selectedObject.opacity ?? 1) * 100));
  }, [selectedObject]);


  
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
        case "flipX": obj.set(prop, value); break
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

  const handleDuplicate = async () => { if (!canvas || !selectedObject) return; const clone = await selectedObject.clone(); clone.set({ left: (selectedObject.left ?? 0) + 20, top: (selectedObject.top ?? 0) + 20 }); canvas.add(clone); canvas.setActiveObject(clone); canvas.requestRenderAll(); };
  const handleCopy = async () => { if (!selectedObject) return; const clone = await selectedObject.clone(); setClipboard(clone); };
  const handlePaste = async () => { if (!canvas || !clipboard) return; const clone = await clipboard.clone(); clone.set({ left: (clipboard.left ?? 0) + 30, top: (clipboard.top ?? 0) + 30 }); canvas.add(clone); canvas.setActiveObject(clone); canvas.requestRenderAll(); };
  const handleDelete = () => { if (!canvas || !selectedObject) return; canvas.remove(selectedObject); canvas.requestRenderAll(); };

  const openColorPicker = (type: 'fill' | 'stroke' | 'shadow') => {
    setColorPickerType(type);
    setColorPickerOpen(true);
  };
  
// ---------------- SVG Color Change ----------------
  // const handleColorChange = (color: string | any) => {
  //   if (!colorPickerType || !selectedObject) return;
    
  //   const newColor = typeof color === 'object' ? (color.hex || color) : color;
  //   console.log('Color Change:', { colorPickerType, isSVG, oldColor: colorPickerColor, newColor });

  //   // SVG color change - check both 'fill' and 'svgFill'
  //   if (isSVG && (colorPickerType === 'fill' || colorPickerType === 'svgFill')) {
  //     const paths = (selectedObject as any).svgPaths || [];
  //     const oldColor = colorPickerColor;

  //     console.log('SVG Paths:', paths.length, 'Old Color:', oldColor);

  //     if (manager && canvas) {
  //       manager.execute({
  //         do: () => {
  //           let changedCount = 0;
  //           paths.forEach((p: any) => {
  //             const currentFill = p.fill;
  //             console.log('Checking path:', currentFill, 'vs', oldColor);
              
  //             // Flexible color matching (case-insensitive, with/without #)
  //             if (
  //               currentFill === oldColor ||
  //               currentFill?.toLowerCase() === oldColor?.toLowerCase() ||
  //               currentFill?.replace('#', '') === oldColor?.replace('#', '')
  //             ) {
  //               p.set('fill', newColor);
  //               (p as any).editableFill = newColor;
  //               changedCount++;
  //               console.log('Changed path color to:', newColor);
  //             }
  //           });
            
  //           console.log('Total paths changed:', changedCount);
  //           setSvgColors(prev => prev.map(c => 
  //             c.color === oldColor || c.color?.toLowerCase() === oldColor?.toLowerCase()
  //               ? { ...c, color: newColor } 
  //               : c
  //           ));
  //           setPropsState((prev: any) => ({ ...prev, fill: newColor }));
  //           canvas.requestRenderAll();
  //         },
  //         undo: () => {
  //           paths.forEach((p: any) => {
  //             if (
  //               p.fill === newColor ||
  //               p.fill?.toLowerCase() === newColor?.toLowerCase()
  //             ) {
  //               p.set('fill', oldColor);
  //               (p as any).editableFill = oldColor;
  //             }
  //           });
  //           setSvgColors(prev => prev.map(c => 
  //             c.color === newColor || c.color?.toLowerCase() === newColor?.toLowerCase()
  //               ? { ...c, color: oldColor } 
  //               : c
  //           ));
  //           setPropsState((prev: any) => ({ ...prev, fill: oldColor }));
  //           canvas.requestRenderAll();
  //         }
  //       });
  //     }
  //     return;
  //   }

  //   // Regular color / gradient (non-SVG objects)
  //   if (typeof color === 'object' && color.type) {
  //     if (colorPickerType === 'fill') {
  //       const objWidth = (selectedObject?.width ?? 100) * (selectedObject?.scaleX ?? 1);
  //       const objHeight = (selectedObject?.height ?? 100) * (selectedObject?.scaleY ?? 1);
  //       const gradient = new fabric.Gradient({
  //         type: color.type || 'linear',
  //         coords: color.type === 'radial'
  //           ? { x1: objWidth / 2, y1: objHeight / 2, x2: objWidth / 2, y2: objHeight / 2, r1: 0, r2: Math.min(objWidth, objHeight) / 2 }
  //           : { x1: 0, y1: 0, x2: objWidth, y2: 0 },
  //         colorStops: color.colorStops || [{ offset: 0, color: '#ff6b6b' }, { offset: 1, color: '#4ecdc4' }]
  //       });
  //       handleChange('fill', gradient);
  //     }
  //   } else {
  //     // Simple color change for non-SVG
  //     if (colorPickerType === 'shadow') {
  //       handleChange('shadowColor', newColor);
  //     } else {
  //       handleChange(colorPickerType, newColor);
  //     }
  //   }
  // };




const handleColorChange = (color: string | any) => {
  if (!colorPickerType || !selectedObject) return;
  
  console.log('🎨 Color Change:', { 
    colorPickerType, 
    isSVG, 
    isGradient: typeof color === 'object' && color.type,
    color 
  });

  // ========== SVG GRADIENT - CORRECT IMPLEMENTATION ==========
  if (isSVG && (colorPickerType === 'fill' || colorPickerType === 'svgFill')) {
    const paths = (selectedObject as any).svgPaths || [];
    const oldColor = colorPickerColor;

    if (!paths || paths.length === 0) {
      console.error('❌ No SVG paths found');
      return;
    }

    // GRADIENT APPLICATION
    if (typeof color === 'object' && color.type) {
      console.log('🌈 Applying gradient to SVG...');
      
      if (manager && canvas) {
        manager.execute({
          do: () => {
            paths.forEach((path: any, idx: number) => {
              try {
                // Get SVG GROUP dimensions (not individual path)
                const group = selectedObject as fabric.Group;
                const groupWidth = (group.width || 100) * (group.scaleX || 1);
                const groupHeight = (group.height || 100) * (group.scaleY || 1);
                
                console.log(`SVG Group size: ${groupWidth}x${groupHeight}`);
                
                // Create gradient with GROUP coordinates
                const gradient = new fabric.Gradient({
                  type: color.type || 'linear',
                  coords: color.type === 'radial'
                    ? { 
                        x1: groupWidth / 2, 
                        y1: groupHeight / 2, 
                        x2: groupWidth / 2, 
                        y2: groupHeight / 2, 
                        r1: 0, 
                        r2: Math.min(groupWidth, groupHeight) / 2 
                      }
                    : { 
                        x1: 0, 
                        y1: 0, 
                        x2: groupWidth, 
                        y2: 0 
                      },
                  colorStops: color.colorStops || [
                    { offset: 0, color: '#ff9a9e' }, 
                    { offset: 1, color: '#fecfef' }
                  ],
                  // ✅ CRITICAL: Use offsetX/offsetY for correct positioning
                  offsetX: -groupWidth / 2,
                  offsetY: -groupHeight / 2
                });
                
                path.set('fill', gradient);
                (path as any).editableFill = 'gradient';
                
                console.log(`✅ Path ${idx} gradient applied`);
              } catch (err) {
                console.error(`❌ Path ${idx} failed:`, err);
              }
            });
            
            canvas.requestRenderAll();
          },
          undo: () => {
            paths.forEach((path: any) => {
              if ((path as any).editableFill === 'gradient') {
                path.set('fill', oldColor);
                (path as any).editableFill = oldColor;
              }
            });
            canvas.requestRenderAll();
          }
        });
      }
      return;
    }

    // SOLID COLOR APPLICATION
    const newColor = typeof color === 'object' ? (color.hex || color) : color;

    if (manager && canvas) {
      manager.execute({
        do: () => {
          let changedCount = 0;
          paths.forEach((path: any) => {
            const currentFill = path.fill;
            const currentStr = String(currentFill).toLowerCase();
            const oldStr = String(oldColor).toLowerCase();

            if (
              currentStr === oldStr ||
              currentStr.replace(/#/g, '') === oldStr.replace(/#/g, '')
            ) {
              path.set('fill', newColor);
              (path as any).editableFill = newColor;
              changedCount++;
            }
          });
          
          console.log(`✅ Colored ${changedCount} paths`);
          setSvgColors(prev => prev.map(c => 
            c.color.toLowerCase() === oldColor.toLowerCase()
              ? { ...c, color: newColor } 
              : c
          ));
          canvas.requestRenderAll();
        },
        undo: () => {
          paths.forEach((path: any) => {
            if (String(path.fill).toLowerCase() === String(newColor).toLowerCase()) {
              path.set('fill', oldColor);
              (path as any).editableFill = oldColor;
            }
          });
          canvas.requestRenderAll();
        }
      });
    }
    return;
  }

  // ========== REGULAR SHAPES - GRADIENT ==========
  if (typeof color === 'object' && color.type && colorPickerType === 'fill' && !isSVG) {
    const objWidth = (selectedObject?.width ?? 100) * (selectedObject?.scaleX ?? 1);
    const objHeight = (selectedObject?.height ?? 100) * (selectedObject?.scaleY ?? 1);
    
    const gradient = new fabric.Gradient({
      type: color.type || 'linear',
      coords: color.type === 'radial'
        ? { 
            x1: objWidth / 2, 
            y1: objHeight / 2, 
            x2: objWidth / 2, 
            y2: objHeight / 2, 
            r1: 0, 
            r2: Math.min(objWidth, objHeight) / 2 
          }
        : { x1: 0, y1: 0, x2: objWidth, y2: 0 },
      colorStops: color.colorStops || [
        { offset: 0, color: '#ff6b6b' }, 
        { offset: 1, color: '#4ecdc4' }
      ]
    });
    
    handleChange('fill', gradient);
    return;
  }

  // ========== SOLID COLORS ==========
  const newColor = typeof color === 'object' ? (color.hex || color) : color;
  
  if (colorPickerType === 'shadow') {
    handleChange('shadowColor', newColor);
  } else {
    handleChange(colorPickerType, newColor);
  }
};

  const applyOpacity = (value: number) => {
    if (!selectedObject) return;
    const opacityValue = value / 100;
    if (selectedObject.type === "activeSelection") {
      const objects = (selectedObject as fabric.ActiveSelection)._objects;
      objects.forEach((obj) => obj.set("opacity", opacityValue));
    } else {
      selectedObject.set("opacity", opacityValue);
    }
    (canvas as fabric.Canvas).renderAll();
  };


  // 2. Layer handlers (Canvas object layer methods)
const handleBringForward = () => {
  if (!canvas || !selectedObject) return;
  canvas.bringForward(selectedObject);
  canvas.requestRenderAll();
};
const handleSendBackward = () => {
  if (!canvas || !selectedObject) return;
  canvas.sendBackwards(selectedObject);
  canvas.requestRenderAll();
};
const handleBringToFront = () => {
  if (!canvas || !selectedObject) return;
  canvas.bringToFront(selectedObject);
  canvas.requestRenderAll();
};
const handleSendToBack = () => {
  if (!canvas || !selectedObject) return;
  canvas.sendToBack(selectedObject);
  canvas.requestRenderAll();
};

  // ------------------------------------------------------------------------------------------------

  if (!selectedObject) return null;
  return (
    <>
      <Box 
        sx={{ 
         display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 10px",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    flexWrap: "nowrap",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    height: "60px",
        }}
      >

        {/* 1. Size & Position Group */}
        <PropertyGroup>
          {/* Size (W/H) */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* W */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontSize: '10px', color: '#6b7280', mb: 0.2 }}>W</Typography>
              <StyledInput
                type="number"
                value={Math.round(propsState.width)}
                onChange={e => handleChange("width", Number(e.target.value))}
                inputProps={{ min: 1 }}
              />
            </Box>
            {/* H */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontSize: '10px', color: '#6b7280', mb: 0.2 }}>H</Typography>
              <StyledInput
                type="number"
                value={Math.round(propsState.height)}
                onChange={e => handleChange("height", Number(e.target.value))}
                inputProps={{ min: 1 }}
              />
            </Box>
          </Box>
        </PropertyGroup>


        {/* 2. Rotation, Opacity, Sides, Radius Group */}
        <PropertyGroup>

          {/* Rotation */}
          <Tooltip title="Rotate">
            <CanvaIconButton>
              {/* CUSTOM ICON IMPORT: Rotate */}
              <CustomIcon name="Rotate" />
            </CanvaIconButton>
          </Tooltip>  
          <StyledInput type="number" value={Math.round(propsState.angle)} onChange={e => handleChange("angle", Number(e.target.value))} />

          {/* Opacity */}
          <Tooltip title={`Transparency: ${opacity}%`}>
            <CanvaIconButton onClick={(e) => setAnchorOpacity(e.currentTarget)} sx={{ ml: 1 }}>
              <OpacityIcon sx={{ fontSize: 20 }} />
            </CanvaIconButton>
          </Tooltip>

          {/* Radius/Sides */}
          {(selectedObject.type === 'rect' || selectedObject.type === 'circle' || selectedObject.type === 'polygon' || selectedObject.type === 'triangle') && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 0.5 }}>
              <Tooltip title={selectedObject.type === 'polygon' ? 'Sides' : 'Corner Rounding'}>
                <CanvaIconButton
                  isActive={radiusPopoverOpen || propsState.radius > 0}
                  onClick={(e) => {
                    setRadiusPopoverOpen(!radiusPopoverOpen);
                    setRadiusAnchorEl(e.currentTarget);
                  }}
                >
                  <CustomIcon name="CornerRounding" />
                </CanvaIconButton>
              </Tooltip>

              {(selectedObject.type === 'polygon' || selectedObject.type === 'triangle') && (
                <StyledInput 
                  type="number" 
                  value={propsState.sides} 
                  onChange={e => handleChange("sides", Math.max(3, Number(e.target.value)))} 
                  inputProps={{ min: 3 }} 
                />
              )}
            </Box>
          )}
        </PropertyGroup>


        {/* 3. Color & Border Group */}
        <PropertyGroup>
          {/* Fill */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 1 }}>
            <Tooltip title="Fill Color">
              <CanvaIconButton
              onClick={() => onOpenColorPicker?.('fill', propsState.fill)}
                isActive={typeof propsState.fill !== 'string' || propsState.fill !== '#BEF4FF'} // Simple active check
                sx={{
                  backgroundColor: typeof propsState.fill === 'string' ? propsState.fill : '#f3f4f6', 
                  border: "2px solid #e2e8f0",
                  "&:hover": { borderColor: "#9333ea" }
                }}
              >
                {/* CUSTOM ICON IMPORT: FillColor */}
                <CustomIcon name="FillColor" style={{ color: typeof propsState.fill === 'string' ? 'white' : '#6b7280', mixBlendMode: 'difference' }} />
              </CanvaIconButton>
            </Tooltip>
          </Box>
          
          {/* Stroke/Border */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Border Color">
              <CanvaIconButton
               onClick={() => onOpenColorPicker?.('stroke', propsState.stroke)}
                isActive={propsState.strokeWidth > 0}
                sx={{
                  backgroundColor: propsState.stroke,
                  border: "2px solid #e2e8f0",
                  "&:hover": { borderColor: "#9333ea" }
                }}
              >
                {/* CUSTOM ICON IMPORT: BorderColor */}
                <CustomIcon name="BorderColor" style={{ color: 'white', mixBlendMode: 'difference' }} />
              </CanvaIconButton>
            </Tooltip>
            
            <StyledInput
              type="number"
              value={propsState.strokeWidth}
              onChange={e => handleChange("strokeWidth", Number(e.target.value))}
              sx={{ width: 40 }}
            />
          </Box>

          {/* Stroke Style */}
          <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
            <Tooltip title="Border Style">
              <Select 
                value={propsState.strokeStyle ?? "solid"} 
                size="small" 
                onChange={(e) => handleChange("strokeStyle", e.target.value)} 
                sx={{ 
                  width: 80, 
                  height: 30,
                  fontSize: 12,
                  '.MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#a0aec0' },
                  '.MuiSelect-select': { py: 0.5, px: 1 },
                }}
              >
                {strokeStyles.map((style) => (
                  <MenuItem key={style.key} value={style.key}>
                    <Box sx={{ display: "flex", alignItems: "center", height: '10px' }}>
                      <svg width="100" height="10">
                        {style.key === "wavy" ? (
                          <path d="M0 5 Q3 2, 6 5 T12 5 T18 5 T24 5 T30 5 T36 5 T42 5 T48 5 T54 5 T60 5" stroke="black" strokeWidth="1.5" fill="none" />
                        ) : (
                          <line x1={0} y1={5} x2={60} y2={5} stroke="black" strokeWidth={2} strokeDasharray={style.dash.join(",")} />
                        )}
                      </svg>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Tooltip>
          </Box>
        </PropertyGroup>


{/*  SVG COLORS GROUP - SELECTED OUTLINE */}
{isSVG && svgColors.length > 0 && (
  <PropertyGroup>
    <Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto', maxWidth: 300 }}>
      {svgColors.map((colorInfo, idx) => {
        const isSelected = colorInfo.color.toLowerCase() === colorPickerColor.toLowerCase();
        return (
          <Tooltip key={idx} title={`Change ${colorInfo.label}`}>
            <CanvaIconButton
              onClick={() => {
                console.log('🎨 SVG Color Button Clicked:', colorInfo.color); // Debug
                setColorPickerColor(colorInfo.color); 
                // ✅ IMMEDIATE color picker open
                if (onOpenColorPicker) {
                  onOpenColorPicker('fill', colorInfo.color);
                }
              }}
              sx={{
                backgroundColor: colorInfo.color,
                border: isSelected ? '3px solid #9333ea' : '2px solid #e2e8f0',
                width: 28,
                height: 28,
                minWidth: 28,
                borderRadius: '50%',
                transition: 'all 0.15s',
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
  </PropertyGroup>
)}

        {/* 4. Effects (Shadow, Flip, Animate) Group */}
        <PropertyGroup>
          {/* Flip */}
          <Tooltip title="Flip Horizontal">
            <CanvaIconButton isActive={propsState.flipX} onClick={() => handleChange("flipX", !propsState.flipX)}>
              {/* CUSTOM ICON IMPORT: FlipHorizontal (using MUI FlipIcon as placeholder) */}
              <CustomIcon name="FlipHorizontal" />
            </CanvaIconButton>
          </Tooltip>
          <Tooltip title="Flip Vertical">
            <CanvaIconButton isActive={propsState.flipY} onClick={() => handleChange("flipY", !propsState.flipY)}>
              {/* CUSTOM ICON IMPORT: FlipVertical (using MUI FlipIcon as placeholder) */}
              <CustomIcon name="FlipVertical" />
            </CanvaIconButton>
          </Tooltip>

          {/* Shadow Button */}
          <Tooltip title="Shadow">
            <CanvaIconButton 
              onClick={(e) => setAnchorEl(e.currentTarget)}
              isActive={propsState.shadowBlur > 0 || propsState.shadowOffsetX !== 0 || propsState.shadowOffsetY !== 0}
            >
              {/* CUSTOM ICON IMPORT: ShadowEffect */}
              <CustomIcon name="ShadowEffect" />
            </CanvaIconButton>
          </Tooltip>

          {/* Animate */}
          <Tooltip title="Animate">
            <CanvaIconButton
              onClick={() => setShowAnimationPanel(!showAnimationPanel)}
              isActive={showAnimationPanel}
            >
              {/* CUSTOM ICON IMPORT: Animate (using MUI AnimationIcon as placeholder) */}
              <CustomIcon name="Animate" />
            </CanvaIconButton>
          </Tooltip>
        </PropertyGroup>


        {/* 5. Actions Group (Copy, Paste, Duplicate, Delete) */}
        <PropertyGroup sx={{ borderRight: 'none', marginRight: 0 }}>
          <Tooltip title="Duplicate">
            <CanvaIconButton onClick={handleDuplicate}>
              <DuplicateIcon sx={{ fontSize: 16 }} />
            </CanvaIconButton>
          </Tooltip>
          
          <Tooltip title="Copy">
            <CanvaIconButton onClick={handleCopy}><ContentCopy sx={{ fontSize: 16 }} /></CanvaIconButton>
          </Tooltip>
          <Tooltip title="Paste">
            <CanvaIconButton onClick={handlePaste}><ContentPaste sx={{ fontSize: 16 }} /></CanvaIconButton>
          </Tooltip>
          
          <Tooltip title="Delete">
            <CanvaIconButton onClick={handleDelete} sx={{ color: '#dc2626', '&:hover': { color: '#dc2626' } }}>
              <Delete sx={{ fontSize: 16 }} />
            </CanvaIconButton>
          </Tooltip>

        </PropertyGroup>

      </Box>


      {/* Opacity Popover */}
      <Popover
        open={Boolean(anchorOpacity)}
        anchorEl={anchorOpacity}
        onClose={() => setAnchorOpacity(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: 1 }}
      >
        <Box sx={{ p: 2, width: 200, borderRadius: 2, boxShadow: 3, bgcolor: "background.paper", }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, mb: 1 }}>Opacity</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Slider
              value={opacity}
              min={0} max={100} step={1}
              onChange={(_, val) => {
                const value = val as number;
                setOpacity(value);
                applyOpacity(value);
              }}
              sx={{ flex: 1, color: '#9333ea' }}
            />
            <StyledInput
              value={opacity}
              onChange={(e) => {
                let value = Number(e.target.value);
                if (value > 100) value = 100;
                if (value < 0) value = 0;
                setOpacity(value);
                applyOpacity(value);
              }}
              inputProps={{ min: 0, max: 100, type: "number", style: { width: 30, fontSize: 12, textAlign: "center" } }}
              size="small"
              sx={{ width: 40 }}
            />
          </Box>
        </Box>
      </Popover>

      {/* Radius Popover */}
      <Popover
        open={radiusPopoverOpen}
        anchorEl={radiusAnchorEl}
        onClose={() => setRadiusPopoverOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 1 }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 200, borderRadius: 2, boxShadow: 3, bgcolor: "background.paper" }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>Corner Rounding</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Slider
              value={propsState.radius}
              min={0} max={50} step={1}
              onChange={(_, v) => handleChange("radius", v)}
              sx={{ flex: 1, color: '#9333ea' }}
            />
            <StyledInput
              type="number"
              value={propsState.radius}
              onChange={e => handleChange("radius", Number(e.target.value))}
              inputProps={{ min: 0, max: 50 }}
              sx={{ width: 40 }}
            />
          </Box>
        </Box>
      </Popover>

      {/* Shadow Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{ mt: 1 }}
      >
        <Box sx={{ p: 2 }}>
          <ChromePicker
            color={propsState.shadowColor}
            onChangeComplete={(color: { hex: string }) => {
              handleChange('shadowColor', color.hex);
            }}
            disableAlpha
          />
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, mb: 1 }}>Shadow Blur</Typography>
            <Slider
              value={propsState.shadowBlur}
              min={0} max={20} step={1}
              onChange={(_, v) => handleChange("shadowBlur", v)}
              sx={{ flex: 1, color: '#9333ea' }}
            />

            <Typography variant="caption" sx={{ fontWeight: 600, mt: 1 }}>Shadow Offset (X/Y)</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontSize: '10px' }}>X</Typography>
                <Slider
                  value={propsState.shadowOffsetX}
                  min={-20} max={20} step={1}
                  onChange={(_, v) => handleChange("shadowOffsetX", v)}
                  sx={{ width: 80, color: '#9333ea' }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontSize: '10px' }}>Y</Typography>
                <Slider
                  value={propsState.shadowOffsetY}
                  min={-20} max={20} step={1}
                  onChange={(_, v) => handleChange("shadowOffsetY", v)}
                  sx={{ width: 80, color: '#9333ea' }}
                />
              </Box>
            </Box>
          </Box>

          {/* Reset Shadow Button */}
          {(propsState.shadowBlur > 0 || propsState.shadowOffsetX !== 0 || propsState.shadowOffsetY !== 0) && (
            <Button
              onClick={() => { handleChange("shadowBlur", 0); handleChange("shadowOffsetX", 0); handleChange("shadowOffsetY", 0); setAnchorEl(null); }}
              size="small"
              startIcon={<ReplayIcon />}
              sx={{ mt: 2, color: '#4338ca' }}
            >
              Remove Shadow
            </Button>
          )}
        </Box>
      </Popover>


      {/* Canva Color Picker */}
     <ColorPicker
  isOpen={colorPickerOpen}
  onClose={() => {
    setColorPickerOpen(false);
    setColorPickerType(null);
  }}
  currentColor={
    colorPickerType === 'fill' && isSVG ? colorPickerColor :
    colorPickerType === 'fill' ? propsState.fill :
    colorPickerType === 'stroke' ? propsState.stroke :
    colorPickerType === 'svgFill' ? colorPickerColor :
    propsState.shadowColor
  }
  onColorChange={handleColorChange}
  title={
    colorPickerType === 'fill' ? 'Fill Color' :
    colorPickerType === 'stroke' ? 'Stroke Color' :
    colorPickerType === 'svgFill' ? 'SVG Color' :
    'Shadow Color'
  }
  allowGradients={colorPickerType === 'fill'}
/>

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