"use client";
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";
import Sidebar from "./Sidebar";
import MiniCanva from "./MiniCanva";
import RectanglePropertiesPanel from "./RectanglePropertiesPanel";
import TextPropertiesPanel from "./TextPropertiesPanel";
import CommandManager from "@/lib/CommandManager";
import TemplatePanel from "./TemplatePanel";
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
  maxWidth: 960,
  width: "100%",
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

  useEffect(() => setMounted(true), []);

  // Update property panel when object selected
  useEffect(() => {
    if (!selectedObject) return;

    switch (selectedObject.type) {
      case "rect":
      case "circle":
      case "polygon":
         case "path": 
        setPropertyTab("rectangle");
        break;
      case "textbox":
      case "text":
        setPropertyTab("text");
        break;
      default:
        setPropertyTab("rectangle");
        break;
    }
  }, [selectedObject]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!canvasInstance || !manager) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo - Ctrl+Z
      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        manager.undo();
      }
      // Redo - Ctrl+Y / Ctrl+Shift+Z
      if ((e.ctrlKey && e.key.toLowerCase() === "y") ||
          (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z")) {
        e.preventDefault();
        manager.redo();
      }
      // Select All - Ctrl+A
      if (e.ctrlKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        canvasInstance.discardActiveObject();
        const sel = new fabric.ActiveSelection(canvasInstance.getObjects(), { canvas: canvasInstance });
        canvasInstance.setActiveObject(sel);
        canvasInstance.requestRenderAll();
      }
      // Copy - Ctrl+C
      if (e.ctrlKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        const active = canvasInstance.getActiveObject();
        if (active) active.clone().then((cloned: fabric.Object) => (window as any)._clipboard = cloned);
      }
      // Paste - Ctrl+V
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

  const handlers = {
    onAddText: () => {
      if (!canvasInstance) return;
      const textbox = new fabric.Textbox("New Text", { left: 100, top: 100, fontSize: 24, fill: "#7c3aed" });
      canvasInstance.add(textbox);
      canvasInstance.setActiveObject(textbox);
      canvasInstance.requestRenderAll();
      setSelectedObject(textbox);
      setPropertyTab("text");
    },
    onAddShape: (payload: any) => setAction({ type: "ADD_SHAPE", payload }),
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
    
  };

  const handleTemplateSelect = (templateData: any) => {
    if (!canvasInstance) return;
    canvasInstance.loadFromJSON(templateData, () => canvasInstance.renderAll());
    setActiveCategory(null);
  };

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

      {/* Property Panel */}
      <PropertiesPanelWrapper>{renderPropertyPanel()}</PropertiesPanelWrapper>

      {/* Main Content */}
      <Box sx={{ display: "flex", flex: 1, pt: "64px", mt: "72px", overflow: "hidden" }}>
        <Sidebar {...sidebarHandlers} />

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f1f5f9", overflow: "auto", position: "relative" }}>
          <CanvasContainer>
            <MiniCanva
              action={action}
              onCanvasReady={(canvas: fabric.Canvas) => {
                setCanvasInstance(canvas);
                setManager(new CommandManager(canvas));
              }}
              onObjectSelected={setSelectedObject}
            />
          </CanvasContainer>
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
