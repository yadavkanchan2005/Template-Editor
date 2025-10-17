"use client";
import React, { useEffect, useState } from "react";
import * as fabric from "fabric";
import {
    Select, MenuItem, TextField, Tooltip, IconButton, Box, Typography,
    InputLabel, FormControl, Slider, Autocomplete, InputAdornment
} from "@mui/material";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import AnimationIcon from "@mui/icons-material/Animation";
import SpacingIcon from '@mui/icons-material/FormatLineSpacing';
import Popover from '@mui/material/Popover';
import { styled } from '@mui/material/styles';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import UppercaseIcon from '@mui/icons-material/ArrowUpward';
import LowercaseIcon from '@mui/icons-material/ArrowDownward';
import BlurOnIcon from "@mui/icons-material/BlurOn";
import AnimationPanel from "./AnimationSidebar/AnimationPanel";
import ColorPicker from "./data/ColorPicker";

const anchorIcons: Record<string, React.ReactNode> = {
    top: <VerticalAlignTopIcon />,
    middle: <VerticalAlignCenterIcon />,
    bottom: <VerticalAlignBottomIcon />,
};


const StyledIconButton = styled(IconButton)({
    backgroundColor: 'white',
    color: '#6b7280',
    '&:hover': { backgroundColor: '#f3f4f6' },
});

const ActionButton = styled(IconButton)({
  width: 42,
  height: 42,
  marginRight: 10,
  marginBottom:20,
  backgroundColor: "#f8fafc",
  borderRadius: "6px",
  border: "2px solid #e2e8f0",
  "&:hover": {
    backgroundColor: "#f1f5f9",
    borderColor: "#c084fc",
  },
});

const systemFonts = ["Arial", "Helvetica", "Times New Roman", "Courier New", "Verdana", "Georgia", "Poppins"];

const textEffects = [
    "None", "Shadow", "Lift", "Hollow", "Splice", "Outline",
    "Echo", "Glitch", "Neon", "Background"
];

interface TextPropertiesPanelProps {
    canvas: fabric.Canvas | null;
    manager?: any;
    selectedObject?: fabric.Textbox | null;
      onOpenColorPicker?: (type: 'fill' | 'stroke', color: string) => void;
      onOpenAnimation?: () => void;
    
}

const TextPropertiesPanel: React.FC<TextPropertiesPanelProps> = ({
    canvas,
    manager,
    selectedObject,
     onOpenColorPicker,
       onOpenAnimation
    
}) => {
    
    const [opacity, setOpacity] = useState(100);
    const [anchorOpacity, setAnchorOpacity] = useState<null | HTMLElement>(null);
    const [availableFonts, setAvailableFonts] = useState<string[]>(systemFonts);
    const [showAnimationPanel, setShowAnimationPanel] = useState(false);
    const [textSpacing, setTextSpacing] = useState({
        letterSpacing: 0,
        lineHeight: 1.2,
    });
    const [textAnchor, setTextAnchor] = useState<'top' | 'middle' | 'bottom'>('top');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [textProps, setTextProps] = useState({
        text: "",
        fontFamily: "Arial",
        fontSize: 24,
        fontWeight: "normal",
        fontStyle: "normal",
        underline: false,
        fill: "#000000",
        stroke: "#000000",
        strokeWidth: 0,
        textAlign: "left",
        effect: "None",
    });

    const [shadowProps, setShadowProps] = useState({
        blur: 0,
        offsetX: 0,
        offsetY: 0,
        color: '#000000',
    });

     // Load Google Font dynamically
    const loadGoogleFont = (fontFamily: string) => {
        // Don't load system fonts
        if (systemFonts.includes(fontFamily)) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            const fontFamilyFormatted = fontFamily.replace(/ /g, "+");
            
            // Check if already loaded
            const existingLink = document.querySelector(`link[href*="${fontFamilyFormatted}"]`);
            if (existingLink) {
                resolve();
                return;
            }

            // Create link element
            const link = document.createElement("link");
            link.href = `https://fonts.googleapis.com/css2?family=${fontFamilyFormatted}:wght@400;600;700;800&display=swap`;
            link.rel = "stylesheet";
            
            link.onload = () => resolve();
            link.onerror = () => resolve(); // Resolve even on error
            
            document.head.appendChild(link);
        });
    };

    // Fetch Google Fonts
    const fetchGoogleFonts = async () => {
        if (availableFonts.length > systemFonts.length) return;
        const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
        try {
            const res = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`);
            const data = await res.json();
            const googleFonts = data.items.slice(0, 100).map((f: any) => f.family);
            setAvailableFonts(prev => Array.from(new Set([...prev, ...googleFonts])));
        } catch (err) {
            console.error("Failed to load Google Fonts", err);
        }
    };


    // Apply opacity to text
    const applyOpacity = (value: number) => {
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (!active || (active.type !== "textbox" && active.type !== "text")) return;

        (active as any).set({ opacity: value / 100 });
        canvas.requestRenderAll();
    };


    // Open color picker
// Open color picker - NOW USES CALLBACK
const openColorPicker = (type: 'fill' | 'stroke') => {
    const color = type === 'fill' ? textProps.fill : textProps.stroke;
    onOpenColorPicker?.(type, color); // ✅ Call parent callback
};


    useEffect(() => {
        if (!canvas) return;

        const updateSelection = () => {
            const active = canvas.getActiveObject();
            if (active && (active.type === "textbox" || active.type === "text")) {
                const txt = active as any;
                setTextProps({
                    text: txt.text || "",
                    fontFamily: txt.fontFamily || "Arial",
                    fontSize: txt.fontSize || 24,
                    fontWeight: txt.fontWeight || "normal",
                    fontStyle: txt.fontStyle || "normal",
                    underline: txt.underline || false,
                     fill: typeof txt.fill === "string" ? txt.fill : "#8947d4ff",
                    stroke: typeof txt.stroke === "string" ? txt.stroke : "#a661adff",
                    strokeWidth: txt.strokeWidth || 0,
                    textAlign: txt.textAlign || "left",
                    effect: txt.textEffect || "None",
                });

                const shadow = txt.shadow as fabric.Shadow;
                setShadowProps({
                    blur: shadow?.blur || 0,
                    offsetX: shadow?.offsetX || 0,
                    offsetY: shadow?.offsetY || 0,
                    color: shadow?.color || '#000000',
                });
            }
        };




        canvas.on("selection:created", updateSelection);
        canvas.on("selection:updated", updateSelection);
        canvas.on("selection:cleared", updateSelection);

        return () => {
            canvas.off("selection:created", updateSelection);
            canvas.off("selection:updated", updateSelection);
            canvas.off("selection:cleared", updateSelection);
        };
    }, [canvas]);


    useEffect(() => {
        if (!canvas) return;

        const active = canvas.getActiveObject();
        if (active && (active.type === "textbox" || active.type === "text")) {
            const txt = active as any;
            setTextSpacing({
                letterSpacing: (txt.charSpacing || 0) / 10,
                lineHeight: txt.lineHeight || 1.2,
            });
            setTextAnchor(
                txt.originY === "center" ? "middle" :
                    txt.originY === "bottom" ? "bottom" : "top"
            );
        }
    }, [canvas, selectedObject]);


    const handleChange = (prop: string, value: any) => {
        if (!canvas || !manager) return;

        const active = canvas.getActiveObject();
        if (!active || (active.type !== "textbox" && active.type !== "text")) return;

        const oldValue = (active as any)[prop];

        if (prop === "fontFamily") {
            import("webfontloader").then(({ default: WebFont }) => {
                WebFont.load({
                    google: { families: [value] },
                    active: () => {
                        (active as any).set({ [prop]: value });
                        canvas.requestRenderAll();
                        setTextProps(prev => ({ ...prev, [prop]: value }));
                    },
                });
            });
        } else {
            (active as any).set({ [prop]: value });
            canvas.requestRenderAll();
            setTextProps(prev => ({ ...prev, [prop]: value }));
        }

        if (manager?.execute) {
            manager.execute({
                do: () => {
                    (active as any).set({ [prop]: value });
                    canvas.requestRenderAll();
                },
                undo: () => {
                    (active as any).set({ [prop]: oldValue });
                    canvas.requestRenderAll();
                },
            });
        }
    };




    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!canvas) return;
            const active = canvas.getActiveObject();
            if (!active) return;

            // Ctrl + B => Bold toggle
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                handleChange("fontWeight", textProps.fontWeight === "bold" ? "normal" : "bold");
            }
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                handleChange("fontWeight", textProps.fontWeight === "underline" ? "normal" : "underline");
            }

            // Ctrl + I => Italic toggle
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                handleChange("fontStyle", textProps.fontStyle === "italic" ? "normal" : "italic");
            }

            // Delete key => Delete object
            if (e.key === 'Delete') {
                canvas.remove(active);
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            }

            // Ctrl + C => Copy
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                (manager as any)?.executeCopy?.(active);
            }

            // Ctrl + V => Paste
            if (e.ctrlKey && e.key === 'v') {
                e.preventDefault();
                (manager as any)?.executePaste?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [canvas, textProps, manager]);




    const handleShadowChange = (prop: keyof typeof shadowProps, value: number | string) => {
        setShadowProps(prev => ({ ...prev, [prop]: value }));

        if (canvas) {
            const active = canvas.getActiveObject();
            if (active && (active.type === "textbox" || active.type === "text")) {
                const currentShadow = (active as any).shadow as fabric.Shadow;
                const newShadow = new fabric.Shadow({
                    color: prop === 'color' ? value as string : currentShadow?.color || '#000000',
                    blur: prop === 'blur' ? value as number : currentShadow?.blur || 0,
                    offsetX: prop === 'offsetX' ? value as number : currentShadow?.offsetX || 0,
                    offsetY: prop === 'offsetY' ? value as number : currentShadow?.offsetY || 0,
                });
                (active as any).set({ shadow: newShadow });
                canvas.requestRenderAll();
            }
        }
    };

    const applyEffect = (effect: string) => {
        if (!canvas) return;

        const active = canvas.getActiveObject();
        if (!active || (active.type !== "textbox" && active.type !== "text")) return;

        // Reset
        (active as any).set({
            shadow: null,
            stroke: textProps.stroke,
            strokeWidth: textProps.strokeWidth || 0,
            fill: textProps.fill,
            backgroundColor: '',
            textEffect: effect,
        });

        switch (effect) {
            case "Shadow":
            case "Lift":
                (active as any).set({
                    shadow: new fabric.Shadow({
                        color: shadowProps.color,
                        blur: shadowProps.blur,
                        offsetX: shadowProps.offsetX,
                        offsetY: shadowProps.offsetY
                    })
                });
                break;

            case "Hollow":
                (active as any).set({
                    fill: 'transparent',
                    stroke: textProps.fill,
                    strokeWidth: 2
                });
                break;

            case "Outline":
                (active as any).set({
                    stroke: textProps.fill,
                    strokeWidth: 3
                });
                break;

            case "Neon":
                (active as any).set({
                    shadow: new fabric.Shadow({
                        color: textProps.fill,
                        blur: 15,
                        offsetX: 0,
                        offsetY: 0
                    })
                });
                break;

            case "Background":
                (active as any).set({
                    backgroundColor: textProps.fill
                });
                break;
        }

        (active as any).setCoords();
        canvas.requestRenderAll();
        setTextProps(prev => ({ ...prev, effect }));
    };

    return (
        <>
            <div
                style={{
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
                {/* Text Input */}
                <TextField
                    size="small"
                    value={textProps.text}
                    onChange={(e) => handleChange("text", e.target.value)}
                    placeholder="Text"
                    sx={{ width: 150 }}
                />

                {/* Font Family with Google Fonts */}
                <Autocomplete
                    options={availableFonts}
                    value={textProps.fontFamily}
                    onOpen={fetchGoogleFonts}
                    onChange={(e, newValue) => {
                        if (newValue) handleChange("fontFamily", newValue);
                    }}
                    renderInput={(params) => (
                        <TextField {...params} size="small" sx={{ width: 150 }} />
                    )}
                    renderOption={(props, option) => (
                        <li {...props} key={option} style={{ fontFamily: option }}>
                            {option}
                        </li>
                    )}
                />

                {/* Font Size */}
                <TextField
                    type="number"
                    size="small"
                    value={textProps.fontSize}
                    onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                    inputProps={{ min: 8, max: 200 }}
                    sx={{ width: 70 }}
                />

                {/* Bold */}
                <Tooltip title="Bold">
                    <StyledIconButton
                        size="small"
                        onClick={() => handleChange("fontWeight",
                            textProps.fontWeight === "bold" ? "normal" : "bold"
                        )}
                        sx={{
                            backgroundColor: textProps.fontWeight === "bold" ? "#e0e7ff" : "white",
                            color: textProps.fontWeight === "bold" ? "#4f46e5" : "#6b7280",
                        }}
                    >
                        <FormatBoldIcon />
                    </StyledIconButton>
                </Tooltip>

                {/* Italic */}
                <Tooltip title="Italic">
                    <StyledIconButton
                        size="small"
                        onClick={() => handleChange("fontStyle",
                            textProps.fontStyle === "italic" ? "normal" : "italic"
                        )}
                        sx={{
                            backgroundColor: textProps.fontStyle === "italic" ? "#e0e7ff" : "white",
                            color: textProps.fontStyle === "italic" ? "#4f46e5" : "#6b7280",
                        }}
                    >
                        <FormatItalicIcon />
                    </StyledIconButton>
                </Tooltip>

                {/* Underline */}
                <Tooltip title="Underline">
                    <StyledIconButton
                        size="small"
                        onClick={() => handleChange("underline", !textProps.underline)}
                        sx={{
                            backgroundColor: textProps.underline ? "#e0e7ff" : "white",
                            color: textProps.underline ? "#4f46e5" : "#6b7280",
                        }}
                    >
                        <FormatUnderlinedIcon />
                    </StyledIconButton>
                </Tooltip>

                {/* Divider */}
                <div style={{ width: "1px", height: "24px", backgroundColor: "#e5e7eb" }} />

                {/* Uppercase Button */}
                <Tooltip
                    title={
                        <>
                            Uppercase <br />
                            <small style={{ fontSize: 10, opacity: 0.7 }}>
                                Ctrl + Shift + K
                            </small>
                        </>
                    }
                    arrow
                >
                    <IconButton
                        size="small"
                        onClick={() => {
                            const active = canvas?.getActiveObject();
                            if (active && (active.type === 'textbox' || active.type === 'text')) {
                                const text = (active as any).text || '';
                                (active as any).set({ text: text.toUpperCase() });
                                canvas?.requestRenderAll();
                            }
                        }}
                    >
                        <UppercaseIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                {/* Lowercase Button */}
                <Tooltip
                    title={
                        <>
                            Lowercase <br />
                            <small style={{ fontSize: 10, opacity: 0.7 }}>
                                Ctrl + Shift + L
                            </small>
                        </>
                    }
                    arrow
                >
                    <IconButton
                        size="small"
                        onClick={() => {
                            const active = canvas?.getActiveObject();
                            if (active && (active.type === 'textbox' || active.type === 'text')) {
                                const text = (active as any).text || '';
                                (active as any).set({ text: text.toLowerCase() });
                                canvas?.requestRenderAll();
                            }
                        }}
                    >
                        <LowercaseIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                {/* Align Buttons */}
                <Tooltip title="Align Left">
                    <StyledIconButton
                        size="small"
                        onClick={() => handleChange("textAlign", "left")}
                        sx={{
                            backgroundColor: textProps.textAlign === "left" ? "#e0e7ff" : "white",
                        }}
                    >
                        <FormatAlignLeftIcon />
                    </StyledIconButton>
                </Tooltip>

                <Tooltip title="Align Center">
                    <StyledIconButton
                        size="small"
                        onClick={() => handleChange("textAlign", "center")}
                        sx={{
                            backgroundColor: textProps.textAlign === "center" ? "#e0e7ff" : "white",
                        }}
                    >
                        <FormatAlignCenterIcon />
                    </StyledIconButton>
                </Tooltip>

                <Tooltip title="Align Right">
                    <StyledIconButton
                        size="small"
                        onClick={() => handleChange("textAlign", "right")}
                        sx={{
                            backgroundColor: textProps.textAlign === "right" ? "#e0e7ff" : "white",
                        }}
                    >
                        <FormatAlignRightIcon />
                    </StyledIconButton>
                </Tooltip>

                {/* Spacing Button */}
                <Tooltip title="Spacing">
                    <StyledIconButton
                        size="small"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                        <SpacingIcon />
                    </StyledIconButton>
                </Tooltip>

                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    sx={{ mt: 1 }}
                >
                    <div style={{ padding: 16, width: 250 }}>
                        {/* Letter Spacing */}
                        <InputLabel shrink>Letter Spacing</InputLabel>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={textSpacing.letterSpacing}
                                onChange={(e, val) => {
                                    const value = val as number;
                                    setTextSpacing(prev => ({ ...prev, letterSpacing: value }));
                                    const active = canvas?.getActiveObject();
                                    if (active && (active.type === 'textbox' || active.type === 'text')) {
                                        (active as any).set({ charSpacing: value * 10 });
                                        canvas?.requestRenderAll();
                                    }
                                }}
                                style={{ flex: 1 }}
                            />
                            <TextField
                                size="small"
                                type="number"
                                value={textSpacing.letterSpacing}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setTextSpacing(prev => ({ ...prev, letterSpacing: value }));
                                    const active = canvas?.getActiveObject();
                                    if (active && (active.type === 'textbox' || active.type === 'text')) {
                                        (active as any).set({ charSpacing: value * 10 });
                                        canvas?.requestRenderAll();
                                    }
                                }}
                                inputProps={{ min: 0, max: 100, step: 1 }}
                                sx={{ width: 60 }}
                            />
                        </div>

                        <InputLabel shrink style={{ marginTop: 16 }}>Line Spacing</InputLabel>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Slider
                                min={0.5}
                                max={3}
                                step={0.1}
                                value={textSpacing.lineHeight}
                                onChange={(e, val) => {
                                    const value = val as number;
                                    setTextSpacing(prev => ({ ...prev, lineHeight: value }));
                                    const active = canvas?.getActiveObject();
                                    if (active && (active.type === 'textbox' || active.type === 'text')) {
                                        (active as any).set({ lineHeight: value });
                                        canvas?.requestRenderAll();
                                    }
                                }}
                                style={{ flex: 1 }}
                            />
                            <TextField
                                size="small"
                                type="number"
                                value={textSpacing.lineHeight}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setTextSpacing(prev => ({ ...prev, lineHeight: value }));
                                    const active = canvas?.getActiveObject();
                                    if (active && (active.type === 'textbox' || active.type === 'text')) {
                                        (active as any).set({ lineHeight: value });
                                        canvas?.requestRenderAll();
                                    }
                                }}
                                inputProps={{ min: 0.5, max: 3, step: 0.1 }}
                                sx={{ width: 60 }}
                            />
                        </div>

                        {/* Anchor (Top / Middle / Bottom) */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 1,
                                marginTop: 2,
                                padding: '6px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                width: 'fit-content',
                                mx: 'auto', // centers the group inside Popover
                            }}
                        >
                            {['top', 'middle', 'bottom'].map((anchor) => (
                                <Tooltip key={anchor} title={`Align ${anchor}`}>
                                    <StyledIconButton
                                        size="small"
                                        onClick={() => {
                                            setTextAnchor(anchor as any);
                                            const active = canvas?.getActiveObject();
                                            if (active && (active.type === 'textbox' || active.type === 'text')) {
                                                (active as any).set({ originY: anchor === 'middle' ? 'center' : anchor });
                                                canvas?.requestRenderAll();
                                            }
                                        }}
                                        sx={{
                                            backgroundColor: textAnchor === anchor ? '#e0e7ff' : 'transparent',
                                            color: textAnchor === anchor ? '#4f46e5' : '#6b7280',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: '#e0e7ff',
                                                color: '#4f46e5',
                                            },
                                        }}
                                    >
                                        {anchorIcons[anchor]}
                                    </StyledIconButton>
                                </Tooltip>
                            ))}
                        </Box>
                    </div>
                </Popover>
                {/* 
{/* Transparency Button */}
                <Tooltip title="Transparency">
                    <IconButton size="small" onClick={(e) => setAnchorOpacity(e.currentTarget)}>
                        <BlurOnIcon />
                    </IconButton>
                </Tooltip>

                <Popover
                    open={Boolean(anchorOpacity)}
                    anchorEl={anchorOpacity}
                    onClose={() => setAnchorOpacity(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    transformOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <div style={{ padding: "24px", width: "250px" }}>
                        <label style={{ fontSize: 16, marginBottom: 8, display: "block" }}>Transparency</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                            <Slider
                                value={opacity}
                                min={0}
                                max={100}
                                step={1}
                                onChange={(_, val) => {
                                    const value = val as number;
                                    setOpacity(value);
                                    applyOpacity(value);
                                }}
                                style={{ flex: 1 }}
                            />
                            <TextField
                                value={opacity}
                                onChange={(e) => {
                                    let value = Number(e.target.value);
                                    if (value > 100) value = 100;
                                    if (value < 0) value = 0;
                                    setOpacity(value);
                                    applyOpacity(value);
                                }}
                                inputProps={{ min: 0, max: 100, type: "number", style: { width: 30, fontSize: 12 } }}
                                size="small"
                            />
                        </div>
                    </div>
                </Popover>
                {/* Divider */}
                <div style={{ width: "1px", height: "24px", backgroundColor: "#e5e7eb" }} />


                 {/* Fill Color - Opens Canva Color Picker */}
                <Tooltip title="Text Color">
                    <StyledIconButton 
                        size="small"
                        onClick={() => openColorPicker('fill')}
                        data-color-button="fill"
                        sx={{
                            backgroundColor: textProps.fill,
                            border: "2px solid #e5e7eb",
                            "&:hover": {
                                borderColor: "#7c3aed",
                            }
                        }}
                    >
                        <FormatColorFillIcon sx={{ color: "white", mixBlendMode: "difference" }} />
                    </StyledIconButton>
                </Tooltip>

                {/* Stroke Color - Opens Canva Color Picker */}
                <Tooltip title="Stroke Color">
                    <StyledIconButton 
                        size="small"
                        onClick={() => openColorPicker('stroke')}
                        data-color-button="stroke"
                        sx={{
                            backgroundColor: textProps.stroke,
                            border: "2px solid #e5e7eb",
                            "&:hover": {
                                borderColor: "#7c3aed",
                            }
                        }}
                    >
                        <BorderColorIcon sx={{ color: "white", mixBlendMode: "difference" }} />
                    </StyledIconButton>
                </Tooltip>

                {/* Stroke Width */}
                <TextField
                    type="number"
                    size="small"
                    value={textProps.strokeWidth}
                    onChange={(e) => handleChange("strokeWidth", Number(e.target.value))}
                    inputProps={{ min: 0, max: 20 }}
                    placeholder="Stroke"
                    sx={{ width: 70 }}
                />

                {/* Divider */}
                <div style={{ width: "1px", height: "24px", backgroundColor: "#e5e7eb" }} />

                {/* Text Effects */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={textProps.effect}
                        onChange={(e) => applyEffect(e.target.value)}
                    >
                        {textEffects.map((effect) => (
                            <MenuItem key={effect} value={effect}>
                                {effect}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Shadow Controls (if effect needs it) */}
                {(textProps.effect === "Shadow" || textProps.effect === "Lift") && (
                    <>
                        <TextField
                            size="small"
                            label="Blur"
                            type="number"
                            value={shadowProps.blur}
                            onChange={(e) => handleShadowChange("blur", Number(e.target.value))}
                            inputProps={{ min: 0, max: 20, step: 0.5 }}
                            sx={{ width: 70 }}
                        />
                        <TextField
                            size="small"
                            label="X"
                            type="number"
                            value={shadowProps.offsetX}
                            onChange={(e) => handleShadowChange("offsetX", Number(e.target.value))}
                            inputProps={{ min: -10, max: 10, step: 0.1 }}
                            sx={{ width: 60 }}
                        />
                        <TextField
                            size="small"
                            label="Y"
                            type="number"
                            value={shadowProps.offsetY}
                            onChange={(e) => handleShadowChange("offsetY", Number(e.target.value))}
                            inputProps={{ min: -10, max: 10, step: 0.1 }}
                            sx={{ width: 60 }}
                        />
                    </>
                )}

                {/* Divider */}
                <div style={{ width: "1px", height: "24px", backgroundColor: "#e5e7eb" }} />

           
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
            </div>
    {/* Animation Panel */}
      {showAnimationPanel && (
        <AnimationPanel
          onClose={() => setShowAnimationPanel(false)}
          canvas={canvas}
         selectedObject={selectedObject as fabric.FabricObject | null}
        />
      )}

         {/* Canva Color Picker Component */}
            {/* <ColorPicker
                isOpen={colorPickerOpen}
                onClose={() => {
                    setColorPickerOpen(false);
                    setColorPickerType(null);
                }}
                currentColor={colorPickerType === 'fill' ? textProps.fill : textProps.stroke}
                onColorChange={handleColorChange}
                title={colorPickerType === 'fill' ? 'Text colour' : 'Stroke colour'}
                allowGradients={false} // Text doesn't support gradients typically
            /> */}
        </>
       
    );
};

export default TextPropertiesPanel;