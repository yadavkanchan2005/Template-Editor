"use client";
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import Sidebar from "./Sidebar";
import MiniCanva from "./MiniCanva";
import RectanglePropertiesPanel from "./RectanglePropertiesPanel";
import TextPropertiesPanel from "./TextPropertiesPanel";
import DynamicElementsPanel from "./panal/DynamicElementsPanel";
import AnimationPanel from "./AnimationSidebar/AnimationPanel";
import CommandManager from "@/lib/CommandManager";
import TemplatePanel from "./panal/TemplatePanel";
import * as fabric from "fabric";

const CanvaHeader = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(135deg, #00c4cc 0%, #7b68ee 100%)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  zIndex: theme.zIndex.drawer + 1,
}));

const HeaderButton = styled(Button)(({ theme }) => ({
  color: "white",
  textTransform: "none",
  fontWeight: 500,
  marginRight: theme.spacing(1),
  padding: "6px 16px",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.1)",
    transform: "translateY(-1px)",
  },
}));

const CanvasContainer = styled(Box)(() => ({
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  padding: "20px",
  display: "inline-block",
}));

const PropertiesPanelWrapper = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: theme.spacing(1),
  display: "flex",
  gap: theme.spacing(1),
  alignItems: "center",
  zIndex: 20,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
}));

const CanvasEditor: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [action, setAction] = useState<{ type: string; payload?: any } | null>(null);
  const [canvasInstance, setCanvasInstance] = useState<fabric.Canvas | null>(null);
  const [manager, setManager] = useState<CommandManager | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [propertyTab, setPropertyTab] = useState("rectangle");
  const [drawMode, setDrawMode] = useState(false);
  const [resizeDialogOpen, setResizeDialogOpen] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [activePanel, setActivePanel] = useState<string | null>(null); 
  

  useEffect(() => setMounted(true), []);
useEffect(() => {
  console.log("🔄 Selected object changed:", selectedObject?.type || "null");
  
  if (!selectedObject) {
    setPropertyTab("rectangle"); // default
    return;
  }

  // Determine which panel to show based on object type
  let panelType = "rectangle"; // default
  
  switch (selectedObject.type) {
    case "textbox":
    case "text":
    case "i-text":
      panelType = "text";
      console.log(" Opening Text Panel");
      break;
      
    // All shape types -> Rectangle panel
    case "rect":
    case "rectangle":
    case "circle":
    case "polygon":
    case "path":
    case "triangle":
    case "image":
    case "group":
    default:
      panelType = "rectangle";
      console.log("Opening Rectangle Panel");
      break;
  }
  
  setPropertyTab(panelType);
}, [selectedObject]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!canvasInstance || !manager) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "z") { e.preventDefault(); manager.undo(); }
      if ((e.ctrlKey && e.key.toLowerCase() === "y") || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z")) { e.preventDefault(); manager.redo(); }
      if (e.ctrlKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        canvasInstance.discardActiveObject();
        const sel = new fabric.ActiveSelection(canvasInstance.getObjects(), { canvas: canvasInstance });
        canvasInstance.setActiveObject(sel);
        canvasInstance.requestRenderAll();
      }
      if (e.ctrlKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        const active = canvasInstance.getActiveObject();
        if (active) active.clone().then((cloned: fabric.Object) => (window as any)._clipboard = cloned);
      }
      if (e.ctrlKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        const clipboard = (window as any)._clipboard;
        if (clipboard) {
          clipboard.clone().then((clonedObj: fabric.Object) => {
            clonedObj.set({ left: (clonedObj.left ?? 0) + 20, top: (clonedObj.top ?? 0) + 20 });
            canvasInstance.add(clonedObj);
            canvasInstance.setActiveObject(clonedObj);
            canvasInstance.requestRenderAll();
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvasInstance, manager]);

  // Handlers
  const handleDrawMode = () => {
    setDrawMode((prev) => !prev);
    setAction({ type: "TOGGLE_DRAW", payload: !drawMode });
  };

  const handleResize = (width: number, height: number) => {
    setCanvasSize({ width, height });
    setAction({ type: "RESIZE", payload: { width, height } });
    setResizeDialogOpen(false);
  };

  const handlers = {
   onAddText: () => {
    if (!canvasInstance) return;
    const textbox = new fabric.Textbox("New Text", { 
      left: 100, top: 100, fontSize: 24, fill: "#7c3aed" 
    });
    canvasInstance.add(textbox);
    canvasInstance.setActiveObject(textbox);
    canvasInstance.requestRenderAll();
    setSelectedObject(textbox); 
    setPropertyTab("text");
  },
  onAddShape: (payload: any) => {
    // Check if it's a template load
    if (payload && payload.type === "LOAD_TEMPLATE") {
      const snapshot = canvasInstance?.toJSON();
      const prevSize = canvasInstance ? { width: canvasInstance.width, height: canvasInstance.height } : null;
      const prevBg = canvasInstance?.backgroundColor;
      
      setAction({ 
        type: "LOAD_TEMPLATE", 
        payload: {
          template: payload.template,
          snapshot,
          prevSize,
          prevBg
        }
      });
    } else {
      // Normal shape add
setAction({ type: "ADD_SHAPE", payload });
    }
  },
  onDelete: () => setAction({ type: "DELETE" }),
  onUndo: () => setAction({ type: "UNDO" }),
  onRedo: () => setAction({ type: "REDO" }),
  onClear: () => setAction({ type: "CLEAR" }),
  onBringForward: () => setAction({ type: "BRING_FORWARD" }),
  onSendBackward: () => setAction({ type: "SEND_BACKWARD" }),
  onBringToFront: () => setAction({ type: "BRING_TO_FRONT" }),
  onSendToBack: () => setAction({ type: "SEND_TO_BACK" }),
  onUpload: (file: File) => setAction({ type: "UPLOAD", payload: file }),
  onExport: (format: string) => setAction({ type: "EXPORT", payload: format }),
  setActiveCategory,
  handleDrawMode,
};

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handlers.onUpload(e.target.files[0]);
  };

  const handleSave = () => console.log("Save functionality - implement logic here");

  const sidebarHandlers = {
    onAddText: handlers.onAddText,
    onAddShape: handlers.onAddShape,
    onDelete: handlers.onDelete,
    onBringForward: handlers.onBringForward,
    onSendBackward: handlers.onSendBackward,
    onBringToFront: handlers.onBringToFront,
    onSendToBack: handlers.onSendToBack,
    onSelectCategory: handlers.setActiveCategory,
    onDrawMode: handlers.handleDrawMode,
    setActivePanel, 
  };


const handleTemplateSelect = (templateData: any) => {
  if (!canvasInstance) return;
  
  console.log("Template selected:", templateData); 
  
  // Current canvas state store karo (for undo)
  const snapshot = canvasInstance.toJSON();
  const prevSize = { width: canvasInstance.width, height: canvasInstance.height };
  const prevBg = canvasInstance.backgroundColor;
  
  // MiniCanva ko proper action send karo
  setAction({
    type: "LOAD_TEMPLATE",
    payload: {
      template: templateData,
      snapshot: snapshot,
      prevSize: prevSize,
      prevBg: prevBg
    }
  });
  
  setActiveCategory(null);
}

  if (!mounted) return null;

  const renderPropertyPanel = () => {
    switch (propertyTab) {
      case "rectangle":
        return <RectanglePropertiesPanel canvas={canvasInstance} selectedObject={selectedObject as fabric.Rect | null} manager={manager} />;
      case "text":
        return <TextPropertiesPanel canvas={canvasInstance} manager={manager} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <CanvaHeader position="fixed">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>Template</Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <HeaderButton startIcon={<UndoIcon />} onClick={handlers.onUndo}>Undo</HeaderButton>
            <HeaderButton startIcon={<RedoIcon />} onClick={handlers.onRedo}>Redo</HeaderButton>
            <HeaderButton startIcon={<AspectRatioIcon />} onClick={() => setResizeDialogOpen(true)}>
              Resize
            </HeaderButton>
            <HeaderButton startIcon={<SaveIcon />} onClick={handleSave}>Save</HeaderButton>
            <Button startIcon={<UploadFileIcon />} component="label">
              Upload
              <input type="file" accept="image/*" hidden onChange={handleUpload} />
            </Button>
            <HeaderButton onClick={() => handlers.onExport("png")}>Export PNG</HeaderButton>
            <HeaderButton onClick={() => handlers.onExport("jpg")}>Export JPG</HeaderButton>
            <HeaderButton onClick={() => handlers.onExport("svg")}>Export SVG</HeaderButton>
            <HeaderButton onClick={() => handlers.onExport("pdf")}>Export PDF</HeaderButton>
            <HeaderButton startIcon={<ClearAllIcon />} onClick={handlers.onClear}>Clear</HeaderButton>
          </Box>
        </Toolbar>
      </CanvaHeader>

      {/* Resize Dialog */}
      <Dialog open={resizeDialogOpen} onClose={() => setResizeDialogOpen(false)}>
        <DialogTitle>Canvas Size</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: 300 }}>
            <TextField label="Width" type="number" defaultValue={canvasSize.width} id="canvas-width" fullWidth inputProps={{ min: 100, max: 5000 }} />
            <TextField label="Height" type="number" defaultValue={canvasSize.height} id="canvas-height" fullWidth inputProps={{ min: 100, max: 5000 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button size="small" variant="outlined" onClick={() => { (document.getElementById('canvas-width') as HTMLInputElement).value = '1920'; (document.getElementById('canvas-height') as HTMLInputElement).value = '1080'; }}>1920×1080</Button>
              <Button size="small" variant="outlined" onClick={() => { (document.getElementById('canvas-width') as HTMLInputElement).value = '1080'; (document.getElementById('canvas-height') as HTMLInputElement).value = '1080'; }}>1080×1080</Button>
              <Button size="small" variant="outlined" onClick={() => { (document.getElementById('canvas-width') as HTMLInputElement).value = '1080'; (document.getElementById('canvas-height') as HTMLInputElement).value = '1920'; }}>1080×1920</Button>
              <Button size="small" variant="outlined" onClick={() => { (document.getElementById('canvas-width') as HTMLInputElement).value = '800'; (document.getElementById('canvas-height') as HTMLInputElement).value = '600'; }}>800×600</Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResizeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            const w = parseInt((document.getElementById('canvas-width') as HTMLInputElement).value);
            const h = parseInt((document.getElementById('canvas-height') as HTMLInputElement).value);
            if (w >= 100 && h >= 100 && w <= 5000 && h <= 5000) handleResize(w, h);
            else alert("Please enter valid dimensions (100-5000)");
          }}>Apply</Button>
        </DialogActions>
      </Dialog>

      {/* Property Panel */}
      <PropertiesPanelWrapper>{renderPropertyPanel()}</PropertiesPanelWrapper>

      {/* Main Content */}
      <Box sx={{ display: "flex", flex: 1, pt: "64px", mt: "72px", overflow: "hidden" }}>
        <Sidebar {...sidebarHandlers} />

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f1f5f9", overflow: "auto", position: "relative" }}>
          <CanvasContainer>
            <MiniCanva
              action={action}
              onCanvasReady={(canvas: fabric.Canvas) => { setCanvasInstance(canvas); setManager(new CommandManager(canvas)); }}
              onObjectSelected={setSelectedObject}
               setSelectedObject={setSelectedObject}
            />
          </CanvasContainer>

          {/* Overlay Panels */}
          {activePanel === "elements" && (
  <Box sx={{ position: "absolute", top: 0, left: 0, zIndex: 50 }}>
    <DynamicElementsPanel
      onAddElement={(actionData: any) => {
        console.log(" Element action received:", actionData);
        setAction(actionData);
        setTimeout(() => {
          setActivePanel(null);
        }, 100);
      }}
      onClose={() => setActivePanel(null)}
    />
  </Box>
)}
          
          {activePanel === "animation" && selectedObject && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                zIndex: 50,
              }}
            >
              <AnimationPanel
                canvas={canvasInstance}
                selectedObject={selectedObject}
                onClose={() => setActivePanel(null)}
              />
            </Box>
          )}
        </Box>

        {activeCategory === "templates" && (
          <Box sx={{ width: 320, minWidth: 320, borderLeft: "1px solid #ddd" }}>
            <TemplatePanel onTemplateSelect={handleTemplateSelect} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CanvasEditor;
