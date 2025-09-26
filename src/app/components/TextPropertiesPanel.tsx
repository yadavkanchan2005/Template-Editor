"use client";
import React, { useEffect, useState } from "react";
import * as fabric from "fabric";
import { Select, MenuItem, TextField, Tooltip, IconButton, InputLabel, FormControl, Slider, Autocomplete,InputAdornment} from "@mui/material";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { styled } from '@mui/material/styles';
import ReplayIcon from "@mui/icons-material/Replay";
import { Tabs, Tab, Box } from "@mui/material";
import PropertyChangeCommand from "@/lib/commands/PropertyChangeCommand";


declare global {
    interface Window {
        WebFont: any;
    }
}




// ---------- Styled Components ----------
const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#e2e8f0' },
        '&:hover fieldset': { borderColor: '#c084fc' },
        '&.Mui-focused fieldset': { borderColor: '#9333ea' },
        backgroundColor: 'white',
        borderRadius: '8px',
    },
});

const StyledSelect = styled(Select)({
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c084fc' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9333ea' },
    backgroundColor: 'white',
    borderRadius: '8px',
});

const StyledIconButton = styled(IconButton)({
    backgroundColor: 'white',
    color: '#9333ea',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
        backgroundColor: 'white',
        color: '#7e22ce',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    },
});

const StyledSlider = styled(Slider)({
    color: '#9333ea',
    '& .MuiSlider-thumb': { boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
});

interface TextPropertiesPanelProps {
    canvas: fabric.Canvas | null;
    manager?: any;
}


// ---------- Constants ----------
const systemFonts = ["Arial", "Poppins", "Times New Roman", "Courier New", "Verdana"];
const fontWeights = ["normal", "bold"];
const fontStyles = ["normal", "italic"];
const textDecorations = ["none", "underline", "line-through"];
const textAligns = ["left", "center", "right"];
const textEffects = ["None", "Shadow", "Lift", "Hollow", "Splice", "Outline", "Echo", "Glitch", "Neon", "Background"];


// ---------- Main Component ----------
const TextPropertiesPanel: React.FC<TextPropertiesPanelProps> = ({ canvas, manager }) => {
    const [selectedText, setSelectedText] = useState<fabric.Textbox | null>(null);
    const [availableFonts, setAvailableFonts] = useState<string[]>(systemFonts);
    const [propsState, setPropsState] = useState<any>({
        text: "",
        fontFamily: "Arial",
        fontSize: 24,
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        fill: "#7c3aed",
        stroke: "#7c3aed",
        strokeWidth: 0,
        textAlign: "left",
        charSpacing: 0,
        lineHeight: 1.2,
        opacity: 1,
    });
    const [shadowProps, setShadowProps] = useState({
        blur: 0,
        offsetX: 0,
        offsetY: 0,
        color: '#000000',
    });

    const [effect, setEffect] = useState("None");


        // ---------- Tabs ----------
    const [activeTab, setActiveTab] = useState(0);
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // ---------- Color Helpers ----------
    const formatHexColor = (color: string | fabric.Color | null | undefined): string => {
        if (!color) return "#000000";
        let hex = typeof color === 'string' ? color.startsWith("#") ? color.slice(1) : color : color.toHex();
        const colorNames: { [key: string]: string } = {
            'black': '#000000', 'white': '#ffffff', 'red': '#ff0000',
            'blue': '#0000ff', 'green': '#00ff00',
        };
        if (colorNames[hex.toLowerCase()]) hex = colorNames[hex.toLowerCase()].slice(1);
        if (hex.length === 3) return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
        if (hex.length === 6) return `#${hex}`;
        return "#000000";
    };

    const getColorString = (color: any): string => {
        if (!color) return "#000000";
        if (typeof color === "string" || color instanceof fabric.Color) return formatHexColor(color);
        return "#000000"; 
    };

    // ---------- Fetch Google Fonts ----------
    const fetchGoogleFonts = async () => {
        if (availableFonts.length > systemFonts.length) return;
        const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
        try {
            const res = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`);
            const data = await res.json();
            const googleFonts = data.items.map((f: any) => f.family);
            setAvailableFonts(prev => Array.from(new Set([...prev, ...googleFonts])));
        } catch (err) { console.error("Failed to load Google Fonts", err); }
    };

    // ---------- Update selection ----------
    useEffect(() => {
        if (!canvas) return;
        const updateSelection = () => {
            const active = canvas.getActiveObject();
            if (active && active.type === "textbox") {
                const txt = active as fabric.Textbox;
                setSelectedText(txt);
                
                setPropsState({
                    text: txt.text || "",
                    fontFamily: txt.fontFamily || "Arial",
                    fontSize: txt.fontSize || 24,
                    fontWeight: txt.fontWeight as any || "normal",
                    fontStyle: txt.fontStyle as any || "normal",
                    textDecoration: (txt as any).textDecoration || "none",
                    fill: getColorString(txt.fill),
                    stroke: getColorString(txt.stroke),
                    strokeWidth: txt.strokeWidth || 0,
                    textAlign: txt.textAlign || "left",
                    charSpacing: (txt as any).charSpacing || 0,
                    lineHeight: txt.lineHeight || 1.2,
                    opacity: txt.opacity || 1,
                });
                const shadow = txt.shadow as fabric.Shadow;
                setShadowProps({
                    blur: shadow ? shadow.blur || 0 : 0,
                    offsetX: shadow ? shadow.offsetX || 0 : 0,
                    offsetY: shadow ? shadow.offsetY || 0 : 0,
                    color: shadow ? shadow.color || '#000000' : '#000000',
                });

            } else setSelectedText(null);
        };
        canvas.on("selection:created", updateSelection);
        canvas.on("selection:updated", updateSelection);
        canvas.on("selection:cleared", () => setSelectedText(null));
        return () => {
            canvas.off("selection:created", updateSelection);
            canvas.off("selection:updated", updateSelection);
            canvas.off("selection:cleared", () => setSelectedText(null));
        };
    }, [canvas]);

    // ---------- Change handler ----------
const handleChange = (prop: string, value: any) => {
  if (!canvas || !selectedText || !manager) return;

  const active = selectedText as any;

  // Skip undo/redo while typing
  if (active.type === "textbox" && active.isEditing && prop === "text") return;

  const oldValue = active[prop];

  if (prop === "fontFamily") {
    import("webfontloader").then(({ default: WebFont }) => {
      WebFont.load({
        google: { families: [value] },
        active: () => {
manager.execute(PropertyChangeCommand(canvas, active, prop, oldValue, value));
          setPropsState((prev: any) => ({ ...prev, [prop]: value }));
        },
      });
    });
  } else {
manager.execute(PropertyChangeCommand(canvas, active, prop, oldValue, value));
    setPropsState((prev: any) => ({ ...prev, [prop]: value }));
  }
};

    // ---------- Color Handlers ----------
    const handleFillChange = (color: string) => handleChange("fill", color);
    const handleStrokeChange = (color: string) => handleChange("stroke", color);


    const handleShadowChange = (prop: keyof typeof shadowProps, value: number | string) => {
        setShadowProps(prev => ({ ...prev, [prop]: value }));
        if (selectedText && canvas) {
            const currentShadow = selectedText.shadow as fabric.Shadow;
            const newShadow = new fabric.Shadow({
                color: prop === 'color' ? value as string : currentShadow?.color || '#000000',
                blur: prop === 'blur' ? value as number : currentShadow?.blur || 0,
                offsetX: prop === 'offsetX' ? value as number : currentShadow?.offsetX || 0,
                offsetY: prop === 'offsetY' ? value as number : currentShadow?.offsetY || 0,
            });
            selectedText.set({ shadow: newShadow });
            canvas.requestRenderAll();
        }
    };

    const resetShadowProp = (prop: keyof typeof shadowProps) => {
        if (prop === 'color') {
            handleShadowChange(prop, '#000000');
        } else {
            handleShadowChange(prop, 0);
        }
    };

    const cleanupEffectClones = () => {
        if (!canvas) return;
        canvas.getObjects().forEach(obj => {
            if (obj.get('isEffectClone')) {
                canvas.remove(obj);
            }
        });
    };

    if (!selectedText) return <div className="p-4 text-purple-700"></div>

    const applyEffect = (effect: string) => {
        if (!selectedText || !canvas) return;

        // Reset
        selectedText.set({
            shadow: null,
            stroke: propsState.stroke,
            strokeWidth: propsState.strokeWidth || 0,
            fill: propsState.fill,
            fontWeight: propsState.fontWeight,
            backgroundColor: ''
        });

        switch (effect) {
            case "None":
                setShadowProps({ blur: 0, offsetX: 0, offsetY: 0, color: '#000000' });
                break;

            case "Shadow":
                selectedText.set({
                    shadow: new fabric.Shadow({
                        color: shadowProps.color,
                        blur: shadowProps.blur,
                        offsetX: shadowProps.offsetX,
                        offsetY: shadowProps.offsetY
                    })
                });
                break;

            case "Lift":
                selectedText.set({
                    shadow: new fabric.Shadow({
                        color: shadowProps.color,
                        blur: shadowProps.blur,
                        offsetX: shadowProps.offsetX,
                        offsetY: shadowProps.offsetY
                    })
                });
                break;

            case "Hollow":
                selectedText.set({
                    fill: 'transparent',
                    stroke: propsState.fill,
                    strokeWidth: 2
                });
                break;

            case "Outline":
                selectedText.set({
                    stroke: propsState.fill,
                    strokeWidth: 3
                });
                break;

            case "Splice":
                selectedText.set({
                    stroke: 'rgba(0,0,0,0.4)',
                    strokeWidth: 2
                });
                break;

            case "Echo":
                selectedText.set({
                    shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.2)', blur: 10, offsetX: 5, offsetY: 5 })
                });
                break;

            case "Glitch":
                // @ts-ignore
                selectedText.clone((clone1: fabric.Textbox) => {
                    clone1.set({ left: selectedText.left! + 2, fill: 'cyan', selectable: false, opacity: 0.5, isEffectClone: true });
                    canvas.add(clone1);
                    canvas.sendToBack(clone1); // <-- Use this instead of clone1.sendToBack()

                    // @ts-ignore
                    selectedText.clone((clone2: fabric.Textbox) => {
                        clone2.set({ left: selectedText.left! - 2, fill: 'magenta', selectable: false, opacity: 0.5, isEffectClone: true });
                        canvas.add(clone2);
                        canvas.sendToBack(clone2); // <-- Use this instead of clone2.sendToBack()
                        canvas.requestRenderAll();
                    });
                });
                break;

            case "Neon":
                selectedText.set({
                    shadow: new fabric.Shadow({ color: propsState.fill, blur: 15, offsetX: 0, offsetY: 0 })
                });
                break;

            case "Background":
                selectedText.set({
                    backgroundColor: propsState.fill
                });
                break;
        }

        selectedText.setCoords();
        canvas.requestRenderAll();
    };
    if (!selectedText) return (
        <div className="p-4 text-center text-purple-700 font-medium">
          
        </div>
    );

    return (
        <div className="w-[320px] p-4 bg-zinc-50 border-l-2 border-zinc-200 flex flex-col gap-4 overflow-y-auto font-sans shadow-inner-xl text-zinc-700">
            <h3 className="text-xl font-bold text-purple-700 mb-2">Text Properties</h3>

            {/* ---------- Tabs ---------- */}
            <Box sx={{ width: '100%' }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                    <Tab label="General" />
                    <Tab label="Effects" />
                </Tabs>

                {/* ---------- General Tab ---------- */}
                {activeTab === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {/* Text */}
                        <StyledTextField
                            label="Text"
                            value={propsState.text}
                            onChange={(e) => handleChange("text", e.target.value)}
                            fullWidth size="small"
                        />
                        {/* Font Family */}
                        <Autocomplete
                            options={availableFonts}
                            value={propsState.fontFamily}
                            onOpen={fetchGoogleFonts}
                            onChange={(e, newValue) => { if (!newValue) return; handleChange("fontFamily", newValue); }}
                            renderInput={(params) => (
                                <TextField {...params} label="Font Family" size="small" style={{ backgroundColor: "#ede9fe", borderRadius: 4 }} />
                            )}
                            renderOption={(props, option) => (<li {...props} key={option} style={{ fontFamily: option }}>{option}</li>)}
                        />
                        {/* Font Size */}
                        <StyledTextField
                            type="number"
                            label="Font Size"
                            value={propsState.fontSize}
                            onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                            inputProps={{ min: 8, max: 200 }}
                            fullWidth size="small"
                        />
                        {/* Font Weight */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Font Weight</InputLabel>
                            <StyledSelect
                                value={propsState.fontWeight}
                                onChange={(e) => handleChange("fontWeight", e.target.value)}
                                label="Font Weight"
                            >
                                {fontWeights.map(w => <MenuItem key={w} value={w}>{w}</MenuItem>)}
                            </StyledSelect>
                        </FormControl>
                        {/* Font Style */}
                        <StyledTextField
                            select label="Font Style"
                            value={propsState.fontStyle}
                            onChange={(e) => handleChange("fontStyle", e.target.value)}
                            fullWidth size="small"
                        >
                            {fontStyles.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </StyledTextField>
                        {/* Text Decoration */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Text Decoration</InputLabel>
                            <StyledSelect
                                value={propsState.textDecoration}
                                onChange={e => handleChange("textDecoration", e.target.value)}
                                label="Text Decoration"
                            >
                                {textDecorations.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                            </StyledSelect>
                        </FormControl>
                        {/* Colors + Stroke */}
                        <div className="flex items-center gap-4 mt-2">
                            <Tooltip title="Fill Color">
                                <label className="relative">
                                    <StyledIconButton><FormatColorFillIcon /></StyledIconButton>
                                    <input
                                        type="color"
                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                        value={propsState.fill}
                                        onChange={(e) => handleFillChange(e.target.value)}
                                    />
                                </label>
                            </Tooltip>
                            <Tooltip title="Stroke Color">
                                <label className="relative">
                                    <StyledIconButton><BorderColorIcon /></StyledIconButton>
                                    <input
                                        type="color"
                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                        value={propsState.stroke}
                                        onChange={(e) => handleStrokeChange(e.target.value)}
                                    />
                                </label>
                            </Tooltip>
                            <StyledTextField
                                type="number"
                                label="Stroke"
                                size="small"
                                value={propsState.strokeWidth}
                                onChange={e => handleChange("strokeWidth", Number(e.target.value))}
                                className="w-20"
                            />
                        </div>
                        {/* Text Align */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Text Align</InputLabel>
                            <StyledSelect
                                value={propsState.textAlign}
                                onChange={(e) => handleChange("textAlign", e.target.value)}
                                label="Text Align"
                            >
                                {textAligns.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                            </StyledSelect>
                        </FormControl>
                        {/* Letter Spacing */}
                        <StyledTextField
                            type="number"
                            label="Letter Spacing"
                            value={propsState.charSpacing}
                            onChange={(e) => handleChange("charSpacing", Number(e.target.value))}
                            fullWidth size="small"
                        />
                        {/* Line Height */}
                        <StyledTextField
                            type="number"
                            label="Line Height"
                            value={propsState.lineHeight}
                            onChange={(e) => handleChange("lineHeight", Number(e.target.value))}
                            fullWidth size="small"
                        />
                        {/* Opacity */}
                        <div className="flex flex-col mt-2">
                            <label className="text-sm text-zinc-500 mb-1">Opacity</label>
                            <StyledSlider
                                value={propsState.opacity}
                                min={0} max={1} step={0.01}
                                onChange={(e, value) => handleChange("opacity", value)}
                            />
                        </div>
                    </Box>
                )}

                {/* ---------- Effects/Shadow Tab ---------- */}
                {activeTab === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Text Effect</InputLabel>
                            <StyledSelect
                                value={effect}
                                onChange={(e) => {
                                    const val = e.target.value as string;
                                    setEffect(val);
                                    applyEffect(val);
                                }}
                                label="Text Effect"
                            >
                                {textEffects.map(te => <MenuItem key={te} value={te}>{te}</MenuItem>)}
                            </StyledSelect>
                        </FormControl>

                        {(effect === "Shadow" || effect === "Lift" || effect === "Neon") && (
                            <FormControl fullWidth size="small" className="rounded-xl bg-zinc-100 mt-4 p-4">
                                <h4 className="text-md font-semibold text-purple-700 mb-2">Shadow Properties</h4>
                                {/* Shadow Color */}
                                <StyledTextField
                                    label="Shadow Color"
                                    size="small"
                                    value={shadowProps.color}
                                    onChange={(e) => handleShadowChange("color", e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <input
                                                    type="color"
                                                    className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
                                                    value={shadowProps.color}
                                                    onChange={(e) => handleShadowChange("color", e.target.value)}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    className="mb-2"
                                />
                                <IconButton size="small" onClick={() => resetShadowProp("color")}>
                                    <ReplayIcon fontSize="inherit" />
                                </IconButton>

                                {/* Blur */}
                                <FormControl fullWidth size="small" className="mb-2">
                                    <InputLabel shrink>Blur</InputLabel>
                                    <StyledSlider
                                        value={shadowProps.blur}
                                        min={0} max={20} step={0.5}
                                        onChange={(e, value) => handleShadowChange("blur", value as number)}
                                    />
                                    <IconButton size="small" onClick={() => resetShadowProp("blur")}>
                                        <ReplayIcon fontSize="inherit" />
                                    </IconButton>
                                </FormControl>

                                {/* Offset X */}
                                <FormControl fullWidth size="small" className="mb-2">
                                    <InputLabel shrink>Offset X</InputLabel>
                                    <StyledSlider
                                        value={shadowProps.offsetX}
                                        min={-10} max={10} step={0.1}
                                        onChange={(e, value) => handleShadowChange("offsetX", value as number)}
                                    />
                                    <IconButton size="small" onClick={() => resetShadowProp("offsetX")}>
                                        <ReplayIcon fontSize="inherit" />
                                    </IconButton>
                                </FormControl>

                                {/* Offset Y */}
                                <FormControl fullWidth size="small">
                                    <InputLabel shrink>Offset Y</InputLabel>
                                    <StyledSlider
                                        value={shadowProps.offsetY}
                                        min={-10} max={10} step={0.1}
                                        onChange={(e, value) => handleShadowChange("offsetY", value as number)}
                                    />
                                    <IconButton size="small" onClick={() => resetShadowProp("offsetY")}>
                                        <ReplayIcon fontSize="inherit" />
                                    </IconButton>
                                </FormControl>
                            </FormControl>
                        )}
                    </Box>
                )}
            </Box>
        </div>
    );
};

export default TextPropertiesPanel;