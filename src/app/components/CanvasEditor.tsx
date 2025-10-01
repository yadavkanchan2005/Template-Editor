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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    console.log("Selected object changed:", selectedObject?.type || "null");

    if (!selectedObject) {
      setPropertyTab("rectangle");
      return;
    }

    let panelType = "rectangle";

    switch (selectedObject.type) {
      case "textbox":
      case "text":
      case "i-text":
        panelType = "text";
        console.log("Opening Text Panel");
        break;
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

  useEffect(() => {
    if (!canvasInstance || !manager) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        manager.undo();
      }
      if ((e.ctrlKey && e.key.toLowerCase() === "y") || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z")) {
        e.preventDefault();
        manager.redo();
      }
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

 const handleDrawMode = () => {
  setDrawMode((prev) => !prev);
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

  const playAnimation = (obj: fabric.Object, animationId: string, speed: number) => {
    if (!canvasInstance) return;

    const duration = 1000 / speed;
    const originalLeft = obj.left || 0;
    const originalTop = obj.top || 0;
    const originalScaleX = obj.scaleX || 1;
    const originalScaleY = obj.scaleY || 1;
    const originalOpacity = obj.opacity || 1;
    const originalAngle = obj.angle || 0;

 // Clear previous animation interval if exists
  if ((obj as any)._animationInterval) {
    clearInterval((obj as any)._animationInterval);
    (obj as any)._animationInterval = null;
  }


    switch (animationId) {
      case "fadeIn":
        obj.set({ opacity: 0 });
        obj.animate({ opacity: originalOpacity }, {
          duration,
          onChange: () => canvasInstance.renderAll()
        });
        break;

      case "slideLeft":
        obj.set({ left: originalLeft + 300 });
        obj.animate({ left: originalLeft }, {
          duration,
          onChange: () => canvasInstance.renderAll(),
          easing: (t) => t * (2 - t)
        });
        break;

      case "slideRight": {
        const originalLeft = obj.left || 0;
        obj.set({ left: originalLeft - 200 });
        canvasInstance.renderAll();
        obj.animate(
          { left: originalLeft },
          {
            duration,
            onChange: () => canvasInstance.renderAll(),
            easing: fabric.util.ease.easeOutCubic,
          }
        );
        break;
      }
      case "ascend": {
        const originalTop = obj.top || 0;
        const originalOpacity = obj.opacity ?? 1;
        obj.set({ top: originalTop + 100, opacity: 0 });
        canvasInstance.renderAll();
        obj.animate(
          { top: originalTop, opacity: originalOpacity },
          {
            duration,
            onChange: () => canvasInstance.renderAll(),
            easing: fabric.util.ease.easeOutCubic,
          }
        );
        break;
      }


      case "shift":
        obj.set({ left: originalLeft - 100, opacity: 0 });
        obj.animate({ left: originalLeft, opacity: originalOpacity }, {
          duration,
          onChange: () => canvasInstance.renderAll()
        });
        break;

      case "zoomIn": {
        const originalScaleX = obj.scaleX || 1;
        const originalScaleY = obj.scaleY || 1;
        const originalOpacity = obj.opacity ?? 1;

        // Reset first
        obj.set({ scaleX: 0, scaleY: 0, opacity: 0 });
        canvasInstance.renderAll();

        // Animate to original
        obj.animate(
          { scaleX: originalScaleX, scaleY: originalScaleY, opacity: originalOpacity },
          {
            duration,
            easing: fabric.util.ease.easeOutCubic,
            onChange: () => canvasInstance.renderAll(),
          }
        );
        break;
      }


      case "bounce":
        obj.set({ top: originalTop - 200, opacity: 0 });
        obj.animate({ top: originalTop, opacity: originalOpacity }, {
          duration: duration * 1.5,
          easing: (t: number) => {
            const c = 1.70158;
            return --t * t * ((c + 1) * t + c) + 1;
          },
          onChange: () => canvasInstance.renderAll(),
        });
        break;

      case "rotate":
        obj.set({ angle: -360, opacity: 0 });
        obj.animate(
          { angle: originalAngle, opacity: originalOpacity },
          {
            duration: 3000,
            onChange: () => canvasInstance.renderAll(),
            easing: fabric.util.ease.easeOutCubic,
          }
        );
        break;


      case "merge":
        obj.set({ scaleX: 0.1, opacity: 0 });
        obj.animate({ scaleX: originalScaleX, opacity: originalOpacity }, {
          duration,
          onChange: () => canvasInstance.renderAll()
        });
        break;

      case "block":
        obj.set({ scaleY: 0, opacity: 0 });
        obj.animate({ scaleY: originalScaleY, opacity: originalOpacity }, {
          duration,
          onChange: () => canvasInstance.renderAll()
        });
        break;
      case "burst":
        obj.set({ scaleX: 2, scaleY: 2, opacity: 0 });
        obj.animate(
          { scaleX: originalScaleX, scaleY: originalScaleY, opacity: originalOpacity },
          {
            duration,
            onChange: () => canvasInstance.renderAll(),
            easing: fabric.util.ease.easeOutCubic
          }
        );
        break;


      case "roll":
        obj.set({ left: originalLeft - 300, angle: -360 });
        obj.animate({ left: originalLeft, angle: originalAngle }, {
          duration: duration * 1.5,
          onChange: () => canvasInstance.renderAll()
        });
        break;

      case "skate":
        obj.set({ left: originalLeft - 200, top: originalTop - 80, opacity: 0 });
        obj.animate({ left: originalLeft, top: originalTop, opacity: originalOpacity }, {
          duration,
          onChange: () => canvasInstance.renderAll()
        });
        break;

      case "typewriter":
        if (obj.type === "textbox" || obj.type === "text") {
          const textObj = obj as fabric.Textbox;
          const fullText = textObj.text || "";
          textObj.set({ text: "" });
          let charIndex = 0;
          const charDuration = duration / fullText.length;
          const interval = setInterval(() => {
            if (charIndex < fullText.length) {
              textObj.set({ text: fullText.substring(0, charIndex + 1) });
              canvasInstance.renderAll();
              charIndex++;
            } else {
              clearInterval(interval);
            }
          }, charDuration);
        }
        break;

    case "flipH":
      obj.set({ scaleX: 0 });
      obj.animate({ scaleX: originalScaleX }, { duration, onChange: () => canvasInstance.renderAll() });
      break;

    case "flipV":
      obj.set({ scaleY: 0 });
      obj.animate({ scaleY: originalScaleY }, { duration, onChange: () => canvasInstance.renderAll() });
      break;

    case "swing":
      let swingCount = 0;
      const swingInterval = setInterval(() => {
        obj.set({ angle: originalAngle + (swingCount % 2 === 0 ? 10 : -10) });
        canvasInstance.renderAll();
        swingCount++;
        if (swingCount > 6) { obj.set({ angle: originalAngle }); clearInterval(swingInterval); }
      }, 100);
      break;

    case "pop":
      obj.set({ scaleX: 0, scaleY: 0, opacity: 0 });
      obj.animate(
        { scaleX: originalScaleX, scaleY: originalScaleY, opacity: originalOpacity },
        { duration, onChange: () => canvasInstance.renderAll() }
      );
      break;

    case "shake":
      let shakeCount = 0;
      const shakeInterval = setInterval(() => {
        obj.set({ left: originalLeft + (shakeCount % 2 === 0 ? 10 : -10) });
        canvasInstance.renderAll();
        shakeCount++;
        if (shakeCount > 6) { obj.set({ left: originalLeft }); clearInterval(shakeInterval); }
      }, 80);
      break;

    case "wobble":
      let wobbleCount = 0;
      const wobbleInterval = setInterval(() => {
        obj.set({ angle: originalAngle + (wobbleCount % 2 === 0 ? 10 : -10) });
        canvasInstance.renderAll();
        wobbleCount++;
        if (wobbleCount > 6) { obj.set({ angle: originalAngle }); clearInterval(wobbleInterval); }
      }, 100);
      break;

    case "pulse":
      obj.set({ scaleX: 0.8, scaleY: 0.8 });
      obj.animate({ scaleX: originalScaleX, scaleY: originalScaleY }, { duration, onChange: () => canvasInstance.renderAll() });
      break;

    case "drop":
      obj.set({ top: originalTop - 100, opacity: 0 });
      obj.animate(
        { top: originalTop, opacity: originalOpacity },
        { duration, easing: (t) => t * t, onChange: () => canvasInstance.renderAll() }
      );
      break;

    case "expandWidth":
      obj.set({ scaleX: 0, opacity: 0 });
      obj.animate({ scaleX: originalScaleX, opacity: originalOpacity }, { duration, onChange: () => canvasInstance.renderAll() });
      break;

    case "colorFlash":
      const originalFill = (obj as any).fill || "#000";
      let flashCount = 0;
      const flashInterval = setInterval(() => {
        (obj as any).set({ fill: flashCount % 2 === 0 ? "#8b5cf6" : originalFill });
        canvasInstance.renderAll();
        flashCount++;
        if (flashCount > 5) { (obj as any).set({ fill: originalFill }); clearInterval(flashInterval); }
      }, 150);
      break;

    case "bounceUp":
      obj.set({ top: originalTop + 50, opacity: 0 });
      obj.animate(
        { top: originalTop, opacity: originalOpacity },
        { duration, easing: (t) => 1 - Math.pow(1 - t, 3), onChange: () => canvasInstance.renderAll() }
      );
      break;

  case "blink":
      let visible = true;
      const interval = setInterval(() => {
        obj.set({ opacity: visible ? 0 : originalOpacity });
        canvasInstance.renderAll();
        visible = !visible;
      }, 300); // change every 300ms
      (obj as any)._animationInterval = interval; // store interval ID
      break;

    }
  };

  const playAllAnimations = () => {
    if (!canvasInstance) return;

    setIsPreviewMode(true);

    const originalStates = new Map();
    const objects = canvasInstance.getObjects();

    objects.forEach((obj: any) => {
      originalStates.set(obj, {
        left: obj.left,
        top: obj.top,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        opacity: obj.opacity,
        angle: obj.angle,
        visible: obj.visible,
      });

      if (obj.animationId && obj.animationId !== "none") {
        obj.set({ visible: false });
      }
    });

    canvasInstance.requestRenderAll();

    let delay = 0;

    objects.forEach((obj: any) => {
      const animId = obj.animationId;
      const animSpeed = obj.animationSpeed || 1;
      const appearOnClick = obj.appearOnClick;

      if (animId && animId !== "none" && !appearOnClick) {
        setTimeout(() => {
          obj.set({ visible: true });
          playAnimation(obj, animId, animSpeed);
        }, delay);

        delay += 500;
      }
    });

    setTimeout(() => {
      setIsPreviewMode(false);
      objects.forEach((obj: any) => {
        const original = originalStates.get(obj);
        if (original) {
          obj.set(original);
        }
      });
      canvasInstance.requestRenderAll();
    }, delay + 3000);
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
  drawMode: drawMode  
  };

  const handleTemplateSelect = (templateData: any) => {
    if (!canvasInstance) return;

    console.log("Template selected:", templateData);

    const snapshot = canvasInstance.toJSON();
    const prevSize = { width: canvasInstance.width, height: canvasInstance.height };
    const prevBg = canvasInstance.backgroundColor;

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
  };

  if (!mounted) return null;

  const renderPropertyPanel = () => {
    switch (propertyTab) {
      case "rectangle":
        return <RectanglePropertiesPanel canvas={canvasInstance} selectedObject={selectedObject as fabric.Rect | null} manager={manager} />;
      case "text":
        return <TextPropertiesPanel canvas={canvasInstance} manager={manager} selectedObject={selectedObject as fabric.Textbox | null} />;
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

            <HeaderButton
              variant="contained"
              disabled={isPreviewMode}
              sx={{
                backgroundColor: isPreviewMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
                "&.Mui-disabled": { color: "rgba(255,255,255,0.5)" }
              }}
              onClick={playAllAnimations}
            >
              {isPreviewMode ? "Playing..." : "Preview"}
            </HeaderButton>

            <HeaderButton startIcon={<AspectRatioIcon />} onClick={() => setResizeDialogOpen(true)}>Resize</HeaderButton>
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

      <PropertiesPanelWrapper>{renderPropertyPanel()}</PropertiesPanelWrapper>

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

          {activePanel === "elements" && (
            <Box sx={{ position: "absolute", top: 0, left: 0, zIndex: 50 }}>
              <DynamicElementsPanel
                onAddElement={(actionData: any) => {
                  console.log("Element action received:", actionData);
                  setAction(actionData);
                  setTimeout(() => setActivePanel(null), 100);
                }}
                onClose={() => setActivePanel(null)}
              />
            </Box>
          )}

          {activePanel === "animation" && selectedObject && (
            <AnimationPanel
              canvas={canvasInstance}
              selectedObject={selectedObject}
              onClose={() => setActivePanel(null)}
            />
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