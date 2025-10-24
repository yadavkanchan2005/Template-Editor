
"use client";
import React, { useState, useEffect, useRef } from "react";
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
  Snackbar,
  Alert,
  IconButton,
  Popover,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import SaveIcon from "@mui/icons-material/Save";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import LayersIcon from "@mui/icons-material/Layers";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import GroupIcon from "@mui/icons-material/Group";
import GroupOffIcon from "@mui/icons-material/GroupOff";
import AlignHorizontalLeftIcon from "@mui/icons-material/AlignHorizontalLeft";
import AlignHorizontalCenterIcon from "@mui/icons-material/AlignHorizontalCenter";
import AlignHorizontalRightIcon from "@mui/icons-material/AlignHorizontalRight";
import AlignVerticalTopIcon from "@mui/icons-material/AlignVerticalTop";
import AlignVerticalCenterIcon from "@mui/icons-material/AlignVerticalCenter";
import AlignVerticalBottomIcon from "@mui/icons-material/AlignVerticalBottom";
import LinkIcon from "@mui/icons-material/Link";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CommentIcon from "@mui/icons-material/Comment";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import TranslateIcon from "@mui/icons-material/Translate";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Sidebar from "./Sidebar";
import MiniCanva from "./MiniCanva";
import RectanglePropertiesPanel from "./RectanglePropertiesPanel";
import TextPropertiesPanel from "./TextPropertiesPanel";
import DynamicElementsPanel from "./panal/DynamicElementsPanel";
import AnimationPanel from "./AnimationSidebar/AnimationPanel";
import CommandManager from "@/lib/CommandManager";
import { useAuth } from "../../hooks/context/AuthContext";
import TemplatePanel from "./panal/TemplatePanel";
import { templateApi } from "../../../services/templateApi";
import ColorPicker from "./data/ColorPicker"; 
import MyProjectsPanel from "./panal/MyProjectsPanel";

import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";

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
  backgroundColor: "transparent",
  borderRadius: "8px",
  boxShadow: "none",
  padding: "0",
  display: "inline-block",
  margin: "0",
  overflow: "hidden",
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

type PageItem = {
  id: string;
  name: string;
  fabricJSON: any | null;
  thumbnail: string | null;
  locked?: boolean;
};

const CanvasEditor: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
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
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    object: fabric.Object | null;
  } | null>(null);
  const [alignMenuAnchor, setAlignMenuAnchor] = useState<null | HTMLElement>(null);

  // Save functionality states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [baseAdminTemplateId, setBaseAdminTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  // After existing states, add:
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerType, setColorPickerType] = useState<'fill' | 'stroke' | 'shadow' | null>(null);
  const [colorPickerColor, setColorPickerColor] = useState('#000000');

  // Multi-page state
  const [pages, setPages] = useState<PageItem[]>([{ id: uuidv4(), name: "Page 1", fabricJSON: null, thumbnail: null, locked: false },]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const userId = user?.id || null;
  const pageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  useEffect(() => setMounted(true), []);


  //  Auto-save before page refresh/close
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (canvasInstance) {
        await saveCurrentCanvasToPage(currentPage);
        console.log(' Auto-saved before window close');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [canvasInstance, currentPage]);

  // Context menu setup
  useEffect(() => {
    if (!canvasInstance) return;

    const handleContextMenu = (e: MouseEvent) => {
      const target = canvasInstance.findTarget(e);

      if (target) {
        e.preventDefault();
        setSelectedObject(target);
        setContextMenu({
          mouseX: e.clientX - 2,
          mouseY: e.clientY - 4,
          object: target,
        });
      } else {
        setContextMenu(null);
      }
    };

    canvasInstance.upperCanvasEl.addEventListener("contextmenu", handleContextMenu);
    return () => {
      canvasInstance.upperCanvasEl.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [canvasInstance]);

  const handleCloseContextMenu = () => setContextMenu(null);

  // Context menu actions
  const handleMenuAction = (action: string) => {
    if (!selectedObject || !canvasInstance) return;

    switch (action) {
      case "copy":
        selectedObject.clone().then((cloned: fabric.Object) => (window as any)._clipboard = cloned);
        break;
      case "paste":
        const clipboard = (window as any)._clipboard;
        if (clipboard) {
          clipboard.clone().then((clonedObj: fabric.Object) => {
            clonedObj.set({ left: (clonedObj.left ?? 0) + 20, top: (clonedObj.top ?? 0) + 20 });
            canvasInstance.add(clonedObj);
            canvasInstance.setActiveObject(clonedObj);
            canvasInstance.requestRenderAll();
          });
        }
        break;
      case "duplicate":
        selectedObject.clone().then((cloned: fabric.Object) => {
          cloned.set({ left: (selectedObject.left ?? 0) + 30, top: (selectedObject.top ?? 0) + 30 });
          canvasInstance.add(cloned);
          canvasInstance.setActiveObject(cloned);
          canvasInstance.requestRenderAll();
        });
        break;
      case "delete":
        canvasInstance.remove(selectedObject);
        setSelectedObject(null);
        break;
      case "ungroup":
        if (selectedObject.type === "group") {
          const group = selectedObject as fabric.Group;
          const items = group.getObjects();
          const groupLeft = group.left || 0;
          const groupTop = group.top || 0;
          const groupScaleX = group.scaleX || 1;
          const groupScaleY = group.scaleY || 1;
          const groupAngle = group.angle || 0;

          canvasInstance.remove(group);

          items.forEach(item => {
            // Set position and scale relative to group (no size change)
            item.set({
              left: groupLeft + (item.left || 0) * groupScaleX,
              top: groupTop + (item.top || 0) * groupScaleY,
              scaleX: (item.scaleX || 1) * groupScaleX,
              scaleY: (item.scaleY || 1) * groupScaleY,
              angle: (item.angle || 0) + groupAngle,
            });
            canvasInstance.add(item);
          });

          if (items.length > 0) {
            canvasInstance.setActiveObject(items[0]);
            setSelectedObject(items[0]);
          } else {
            setSelectedObject(null);
          }
          canvasInstance.requestRenderAll();
        }
        break;

      case "group":
        const activeObjects = canvasInstance.getActiveObjects();
        if (activeObjects.length > 1) {
          // Restore objects to canvas coordinates before grouping
          const minLeft = Math.min(...activeObjects.map(obj => obj.left || 0));
          const minTop = Math.min(...activeObjects.map(obj => obj.top || 0));
          activeObjects.forEach(obj => {
            obj.set({
              left: (obj.left || 0) - minLeft,
              top: (obj.top || 0) - minTop,
            });
          });
          const group = new fabric.Group(activeObjects, {
            left: minLeft,
            top: minTop,
            canvas: canvasInstance,
          });
          activeObjects.forEach(obj => canvasInstance.remove(obj));
          canvasInstance.add(group);
          canvasInstance.setActiveObject(group);
          setSelectedObject(group);
          canvasInstance.requestRenderAll();
        }
        break;
      case "lock":
        selectedObject.set({
          selectable: true,
          evented: true,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
          hoverCursor: "not-allowed",
        });
        (selectedObject as any).locked = true;
        canvasInstance.setActiveObject(selectedObject);
        setSelectedObject(selectedObject);
        canvasInstance.requestRenderAll();
        break;
      case "unlock":
        selectedObject.set({
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
          lockScalingX: false,
          lockScalingY: false,
          lockRotation: false,
          hoverCursor: "move",
        });
        (selectedObject as any).locked = false;
        canvasInstance.setActiveObject(selectedObject);
        setSelectedObject(selectedObject);
        canvasInstance.requestRenderAll();
        break;
      case "bringForward":
        setAction({ type: "BRING_FORWARD", payload: selectedObject });
        break;
      case "bringToFront":
        setAction({ type: "BRING_TO_FRONT", payload: selectedObject });
        break;
      case "sendBackward":
        setAction({ type: "SEND_BACKWARD", payload: selectedObject });
        break;
      case "sendToBack":
        setAction({ type: "SEND_TO_BACK", payload: selectedObject });
        break;
    }
    handleCloseContextMenu();
  };

  const handleOpenAlignMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAlignMenuAnchor(event.currentTarget);
  };

  const handleCloseAlignMenu = () => {
    setAlignMenuAnchor(null);
  };

  const handleAlignAction = (align: string) => {
    if (!canvasInstance || !selectedObject) return;
    const canvasWidth = canvasInstance.getWidth();
    const canvasHeight = canvasInstance.getHeight();
    const objWidth = selectedObject.getScaledWidth();
    const objHeight = selectedObject.getScaledHeight();

    switch (align) {
      case "left":
        selectedObject.set({ left: 0 });
        break;
      case "center":
        selectedObject.set({ left: (canvasWidth - objWidth) / 2 });
        break;
      case "right":
        selectedObject.set({ left: canvasWidth - objWidth });
        break;
      case "top":
        selectedObject.set({ top: 0 });
        break;
      case "middle":
        selectedObject.set({ top: (canvasHeight - objHeight) / 2 });
        break;
      case "bottom":
        selectedObject.set({ top: canvasHeight - objHeight });
        break;
    }
    canvasInstance.requestRenderAll();
    handleCloseAlignMenu();
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const exportOpen = Boolean(exportAnchorEl);

  useEffect(() => {
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
        break;
      default:
        panelType = "rectangle";
        break;
    }
    setPropertyTab(panelType);
  }, [selectedObject]);

  useEffect(() => {
    if (!canvasInstance || !manager) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo - Ctrl+Z
      if (e.ctrlKey && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        manager.undo();
        return;
      }
      // Redo - Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey && e.key.toLowerCase() === "y") ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z")) {
        e.preventDefault();
        manager.redo();
        return;
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

  // Save current canvas to page
  const saveCurrentCanvasToPage = async (index: number) => {
    if (!canvasInstance) return;
    try {
      const json = canvasInstance.toJSON();
      const thumbnail = await generateThumbnailFromCanvas(canvasInstance);
      setPages((prev) =>
        prev.map((p, i) => (i === index ? { ...p, fabricJSON: json, thumbnail } : p))
      );
    } catch (err) {
      console.warn("Thumbnail / save for page failed", err);
      setPages((prev) =>
        prev.map((p, i) => (i === index ? { ...p, fabricJSON: canvasInstance?.toJSON() || null } : p))
      );
    }
  };

  // FIXED: Load page into canvas with proper state restoration
  // const loadPageToCanvas = (index: number) => {
  //   const page = pages[index];
  //   if (!canvasInstance) return;

  //   // Save current page before switching
  //   saveCurrentCanvasToPage(currentPage);

  //   const locked = page?.locked || false;
  //   canvasInstance.selection = !locked;
  //   canvasInstance.skipTargetFind = locked;

  //   // Clear canvas
  //   canvasInstance.clear();
  //    canvasInstance.backgroundColor = 'white'; // Reset background
  //   canvasInstance.renderAll();

  //   if (page && page.fabricJSON) {
  //     try {
  //       canvasInstance.loadFromJSON(page.fabricJSON, () => {
  //         //  Restore canvas size from saved state
  //         if (page.fabricJSON.width) {
  //           canvasInstance.setWidth(page.fabricJSON.width);
  //         }
  //         if (page.fabricJSON.height) {
  //           canvasInstance.setHeight(page.fabricJSON.height);
  //         }

  //         // Restore background
  //         if (page.fabricJSON.background) {
  //           canvasInstance.backgroundColor = page.fabricJSON.background;
  //         }

  //         // Apply lock state to objects
  //         canvasInstance.getObjects().forEach((obj) => {
  //           (obj as any).selectable = !locked;
  //           (obj as any).evented = !locked;
  //         });

  //         canvasInstance.renderAll();
  //         console.log(`Page ${index + 1} loaded with ${canvasInstance.getObjects().length} objects`);
  //       });
  //     } catch (err) {
  //       console.error(' Failed to load page JSON:', err);
  //       canvasInstance.backgroundColor = 'white';
  //       canvasInstance.renderAll();
  //     }
  //   } else {
  //     // Empty page
  //     canvasInstance.backgroundColor = 'white';
  //     canvasInstance.renderAll();
  //   }

  //   setCurrentPage(index);
  //   setSelectedObject(null);
  // };


  // ✅ FIXED: Simplified load with better error handling
  const loadPageToCanvas = (index: number) => {
    if (!canvasInstance) {
      console.warn('Canvas not ready yet, skipping load');
      return;
    }

    const page = pages[index];
    if (!page) {
      console.error(`Page ${index} not found`);
      return;
    }

    console.log(`Loading page ${index + 1}/${pages.length}`);

    // Save current page before switching (only if different page)
    if (index !== currentPage) {
      saveCurrentCanvasToPage(currentPage);
    }

    const locked = page?.locked || false;
    canvasInstance.selection = !locked;
    canvasInstance.skipTargetFind = locked;

    // CRITICAL: Clear canvas completely first
    canvasInstance.clear();
    canvasInstance.backgroundColor = 'white';
    canvasInstance.renderAll();

    if (page && page.fabricJSON) {
      try {
        // Parse fabricJSON if it's a string
        let jsonData = page.fabricJSON;
        if (typeof jsonData === 'string') {
          try {
            jsonData = JSON.parse(jsonData);
          } catch (e) {
            console.error('Failed to parse fabricJSON string:', e);
            jsonData = { version: "5.3.0", objects: [], background: "white" };
          }
        }

        //  Ensure we have valid JSON data
        if (!jsonData || typeof jsonData !== 'object') {
          console.error('Invalid fabricJSON data');
          canvasInstance.backgroundColor = 'white';
          canvasInstance.renderAll();
          setCurrentPage(index);
          setSelectedObject(null);
          return;
        }

        // Load JSON into canvas
        canvasInstance.loadFromJSON(jsonData, () => {
          // Restore canvas size from saved state
          if (jsonData.width && jsonData.height) {
            canvasInstance.setWidth(jsonData.width);
            canvasInstance.setHeight(jsonData.height);
            setCanvasSize({ width: jsonData.width, height: jsonData.height });
          }

          // Restore background
          if (jsonData.background) {
            canvasInstance.backgroundColor = jsonData.background;
          }

          // Apply lock state to objects
          canvasInstance.getObjects().forEach((obj) => {
            (obj as any).selectable = !locked;
            (obj as any).evented = !locked;
          });

          canvasInstance.renderAll();
          console.log(`Page ${index + 1} loaded: ${canvasInstance.getObjects().length} objects, size: ${canvasInstance.width}x${canvasInstance.height}`);
        });
      } catch (err) {
        console.error('Failed to load page JSON:', err);
        canvasInstance.backgroundColor = 'white';
        canvasInstance.renderAll();
      }
    } else {
      // Empty page
      console.log(`Loading empty page ${index + 1}`);
      canvasInstance.backgroundColor = 'white';
      canvasInstance.renderAll();
    }

    setCurrentPage(index);
    setSelectedObject(null);
  };
  // Generate thumbnail
  const generateThumbnailFromCanvas = async (canvas: fabric.Canvas) => {
    try {
      const data = canvas.toDataURL({ format: "png", quality: 0.8, multiplier: 0.25 });
      return data;
    } catch (err) {
      console.warn("thumbnail generation failed", err);
      return null;
    }
  };

  // FIXED: Add new page with proper state handling
  // const handleAddPage = async (insertAtIndex?: number) => {
  //   console.log('Adding new page...', {
  //     currentPage: currentPage + 1,
  //     totalPages: pages.length,
  //     insertAtIndex: insertAtIndex !== undefined ? insertAtIndex + 1 : 'end'
  //   });

  //   // STEP 1: Save current page first
  //   if (canvasInstance) {
  //     await saveCurrentCanvasToPage(currentPage);
  //     console.log(`Saved page ${currentPage + 1} before adding new page`);
  //   }

  //   //  STEP 2: Create new blank page
  //   const newPage: PageItem = {
  //     id: uuidv4(),
  //     name: `Page ${pages.length + 1}`,
  //     fabricJSON: {
  //       version: "5.3.0",
  //       objects: [],
  //       background: "white",
  //       width: canvasInstance?.width || 800,
  //       height: canvasInstance?.height || 600,
  //     },
  //     thumbnail: null,
  //     locked: false,
  //   };

  //   // STEP 3: Calculate new page index
  //   const newIndex = typeof insertAtIndex === "number" ? insertAtIndex + 1 : pages.length;

  //   // STEP 4: Update pages array
  //   setPages((prev) => {
  //     const copy = [...prev];
  //     if (typeof insertAtIndex === "number") {
  //       copy.splice(insertAtIndex + 1, 0, newPage);
  //     } else {
  //       copy.push(newPage);
  //     }
  //     console.log(`New page added at index ${newIndex}, total pages: ${copy.length}`);
  //     return copy;
  //   });

  //   // STEP 5: Wait for state update, then switch to new page
  //   setTimeout(() => {
  //     if (!canvasInstance) {
  //       console.error(' Canvas not available');
  //       return;
  //     }

  //     // Set current page index
  //     setCurrentPage(newIndex);

  //     // Clear canvas for new blank page
  //     canvasInstance.clear();
  //     canvasInstance.backgroundColor = 'white';
  //     canvasInstance.renderAll();

  //     console.log(` New blank page ${newIndex + 1} ready`);

  //     //  STEP 6: Scroll to new page
  //     setTimeout(() => {
  //       pageRefs.current[newPage.id]?.scrollIntoView({
  //         behavior: "smooth",
  //         block: "nearest",
  //         inline: "center"
  //       });
  //     }, 100);
  //   }, 200);
  // };



  const handleAddPage = async (insertAtIndex?: number) => {
    console.log('Adding new page...', {
      currentPage: currentPage + 1,
      totalPages: pages.length,
      insertPosition: 'below current page'
    });

    // STEP 1: Save current page first
    if (canvasInstance) {
      await saveCurrentCanvasToPage(currentPage);
      console.log(`Saved page ${currentPage + 1} before adding new page`);
    }

    // STEP 2: Create new blank page
    const newPage: PageItem = {
      id: uuidv4(),
      name: `Page ${pages.length + 1}`,
      fabricJSON: {
        version: "5.3.0",
        objects: [],
        background: "white",
        width: canvasInstance?.width || 800,
        height: canvasInstance?.height || 600,
      },
      thumbnail: null,
      locked: false,
    };

    // STEP 3: ALWAYS add below current page (Canva style)
    const newIndex = currentPage + 1;

    // STEP 4: Update pages array
    setPages((prev) => {
      const copy = [...prev];
      copy.splice(newIndex, 0, newPage);
      console.log(`New page added at index ${newIndex}, total pages: ${copy.length}`);
      return copy;
    });

    // STEP 5: Wait for state update, then switch to new page
    setTimeout(() => {
      if (!canvasInstance) {
        console.error('Canvas not available');
        return;
      }

      // Set current page index
      setCurrentPage(newIndex);

      // Clear canvas for new blank page
      canvasInstance.clear();
      canvasInstance.backgroundColor = 'white';
      canvasInstance.renderAll();

      console.log(`New blank page ${newIndex + 1} ready for editing`);
    }, 200);
  };
  const handleDuplicatePage = async () => {
    if (!canvasInstance) return;
    await saveCurrentCanvasToPage(currentPage);

    const source = pages[currentPage];
    const copyPage: PageItem = {
      id: uuidv4(),
      name: `${source.name} (copy)`,
      fabricJSON: source.fabricJSON ? JSON.parse(JSON.stringify(source.fabricJSON)) : null,
      thumbnail: source.thumbnail,
      locked: source.locked || false,
    };
    setPages((prev) => {
      const copy = [...prev];
      copy.splice(currentPage + 1, 0, copyPage);
      return copy;
    });
    setTimeout(() => {
      loadPageToCanvas(currentPage + 1);
      pageRefs.current[copyPage.id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  };

  const handleDeletePage = async (index?: number) => {
    const idx = typeof index === "number" ? index : currentPage;
    if (pages.length === 1) {
      if (!confirm("Delete this page? Your canvas will become blank.")) return;
      canvasInstance?.clear();
      setPages([{ id: uuidv4(), name: "Page 1", fabricJSON: null, thumbnail: null, locked: false }]);
      setCurrentPage(0);
      return;
    }
    if (!confirm("Delete this page? This action cannot be undone.")) return;

    await saveCurrentCanvasToPage(currentPage);

    setPages((prev) => prev.filter((_, i) => i !== idx));
    const nextIndex = Math.max(0, idx - 1);
    setTimeout(() => loadPageToCanvas(nextIndex), 50);
  };

  const handleToggleLockPage = async (index?: number) => {
    const idx = typeof index === "number" ? index : currentPage;
    if (canvasInstance) await saveCurrentCanvasToPage(currentPage);
    setPages((prev) => prev.map((p, i) => (i === idx ? { ...p, locked: !p.locked } : p)));
    if (idx === currentPage && canvasInstance) {
      const locked = !pages[idx].locked;
      canvasInstance.selection = !locked;
      canvasInstance.getObjects().forEach((obj) => {
        (obj as any).selectable = !locked;
        (obj as any).evented = !locked;
      });
      canvasInstance.requestRenderAll();
    }
  };

  // const handleSwitchToPage = async (index: number) => {
  //   if (index === currentPage) return;

  //   // ✅ Save current page before switching
  //   if (canvasInstance) {
  //     await saveCurrentCanvasToPage(currentPage);
  //     console.log(`💾 Auto-saved page ${currentPage + 1} before switching`);
  //   }

  //   const pageId = pages[index].id;
  //   pageRefs.current[pageId]?.scrollIntoView({
  //     behavior: "smooth",
  //     block: "center",
  //   });

  //   loadPageToCanvas(index);
  // };


  const handleSwitchToPage = async (index: number) => {
    if (index === currentPage) return;

    // ✅ Save current page before switching
    if (canvasInstance) {
      await saveCurrentCanvasToPage(currentPage);
      console.log(`💾 Auto-saved page ${currentPage + 1} before switching`);
    }

    // ✅ NO SCROLL - Direct edit in place (Canva style)
    loadPageToCanvas(index);
  };
  // Save handler
  const handleSave = async () => {
    if (!canvasInstance || !user) return;

    if (!templateName.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a template name",
        severity: "error",
      });
      return;
    }

    setSaving(true);

    try {
      // ✅ CRITICAL: Save current canvas to current page FIRST
      await saveCurrentCanvasToPage(currentPage);
      console.log(`💾 Saved current page ${currentPage + 1} before saving project`);

      // ✅ Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // ✅ Now generate payload with ALL pages (using updated state)
      const pagesPayload = await Promise.all(
        pages.map(async (p, idx) => {
          let fabricJSON = p.fabricJSON;
          let thumbnail = p.thumbnail;

          // ✅ If this is current page, get fresh data from canvas
          if (idx === currentPage && canvasInstance) {
            fabricJSON = canvasInstance.toJSON();
            try {
              thumbnail = await generateThumbnailFromCanvas(canvasInstance);
            } catch (err) {
              console.warn(`Failed to generate thumbnail for page ${idx + 1}`);
            }
          }

          // ✅ Ensure fabricJSON has proper structure
          if (!fabricJSON || typeof fabricJSON !== 'object') {
            fabricJSON = {
              version: "5.3.0",
              objects: [],
              background: "white",
              width: canvasInstance?.width || 800,
              height: canvasInstance?.height || 600,
            };
          }

          // ✅ Ensure width/height in fabricJSON
          if (!fabricJSON.width) fabricJSON.width = canvasInstance?.width || 800;
          if (!fabricJSON.height) fabricJSON.height = canvasInstance?.height || 600;

          return {
            id: p.id,
            name: p.name,
            fabricJSON: fabricJSON,
            thumbnail: thumbnail,
            locked: p.locked || false,
          };
        })
      );

      console.log(`📦 Saving ${pagesPayload.length} pages:`, pagesPayload.map((p, i) =>
        `Page ${i + 1}: ${p.fabricJSON?.objects?.length || 0} objects, has thumbnail: ${!!p.thumbnail}`
      ));

      const canvasJSON = canvasInstance.toJSON();
      let thumbnail: string | null | undefined;
      try {
        thumbnail = await generateThumbnailFromCanvas(canvasInstance);
      } catch { }

      const canvasData: any = {
        name: templateName,
        category: (user && (user as any).role === "ADMIN") ? (templateCategory || undefined) : undefined,
        size: { width: canvasInstance.width, height: canvasInstance.height },
        elements: canvasJSON.objects,
        objects: canvasJSON.objects,
        background: (canvasJSON as any).background,
        fabricJSON: canvasJSON,
        json: canvasJSON,
        thumbnail,
        pages: pagesPayload, // ✅ All pages with fabricJSON
      };

      if (isAdmin) {
        if (currentTemplateId && isEditingTemplate) {
          await templateApi.updateTemplate(currentTemplateId, canvasData);
          setSnackbar({
            open: true,
            message: "Template updated successfully!",
            severity: "success"
          });
        } else {
          const response = await templateApi.createTemplate(canvasData);
          setCurrentTemplateId(response.id);
          setIsEditingTemplate(true);
          setSnackbar({
            open: true,
            message: "Template created successfully!",
            severity: "success"
          });
        }
      } else {
        if (baseAdminTemplateId && !isEditingTemplate) {
          const copiedTemplate = await templateApi.copyTemplateToMyProjects(baseAdminTemplateId);
          const updatedTemplate = await templateApi.updateUserTemplate(copiedTemplate.id, canvasData);
          setCurrentTemplateId(updatedTemplate.id);
          setIsEditingTemplate(true);
          setBaseAdminTemplateId(null);
          setSnackbar({
            open: true,
            message: "Template copied to your projects and saved!",
            severity: "success"
          });
        } else if (currentTemplateId && isEditingTemplate) {
          await templateApi.updateUserTemplate(currentTemplateId, canvasData);
          setSnackbar({
            open: true,
            message: "Your project updated successfully!",
            severity: "success"
          });
        } else {
          const response = await templateApi.createUserTemplate({
            ...canvasData,
            baseTemplateId: undefined,
          });
          setCurrentTemplateId(response.id);
          setIsEditingTemplate(true);
          setSnackbar({
            open: true,
            message: "New project saved successfully!",
            severity: "success"
          });
        }
      }

      setSaveDialogOpen(false);

      // ✅ Trigger refresh for MyProjectsPanel
      window.dispatchEvent(new Event('refreshProjects'));

    } catch (error: any) {
      console.error('❌ Save error:', error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || `Save failed. Check server logs.`,
        severity: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: "Please login to save templates",
        severity: "error",
      });
      return;
    }

    if (!canvasInstance) {
      setSnackbar({
        open: true,
        message: "Canvas not ready",
        severity: "error",
      });
      return;
    }
    setSaveDialogOpen(true);
  };

  const handleNewTemplate = () => {
    if (!canvasInstance) return;

    if (confirm("Create a new blank template? Unsaved changes will be lost.")) {
      canvasInstance.clear();
      setCurrentTemplateId(null);
      setTemplateName("");
      setIsEditingTemplate(false);
      setPages([{ id: uuidv4(), name: "Page 1", fabricJSON: null, thumbnail: null, locked: false }]);
      setCurrentPage(0);
      setSnackbar({
        open: true,
        message: "New blank canvas created",
        severity: "success",
      });
    }
  };

  // ✅ FIXED: Handlers with SVG double-click and background image support
  const handlers = {
    onAddText: (textConfig?: {
      text: string;
      fontSize: number;
      fontWeight: string | number;
      fontFamily?: string;
    }) => {
      if (!canvasInstance) return;

      const config = textConfig || {
        text: "New Text",
        fontSize: 32,
        fontWeight: "normal",
        fontFamily: "Inter",
      };

      if (config.fontFamily && config.fontFamily !== "Inter") {
        const fontFamily = config.fontFamily.replace(/ /g, "+");
        const existingLink = document.querySelector(`link[href*="${fontFamily}"]`);
        if (!existingLink) {
          const link = document.createElement("link");
          link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;600;700;800&display=swap`;
          link.rel = "stylesheet";
          document.head.appendChild(link);
        }
      }

      setTimeout(() => {
        const textbox = new fabric.Textbox(config.text, {
          left: 100,
          top: 100,
          fontSize: config.fontSize,
          fontWeight: config.fontWeight,
          fontFamily: config.fontFamily || "Inter",
          fill: "#000000",
          width: 400,
        });

        canvasInstance.add(textbox);
        canvasInstance.setActiveObject(textbox);
        canvasInstance.requestRenderAll();
        setSelectedObject(textbox);
        setPropertyTab("text");
      }, config.fontFamily && config.fontFamily !== "Inter" ? 300 : 0);
    },


    // onAddUpload: (data: any) => {
    //   if (!canvasInstance) return;

    //   //  Handle SVG
    //   if (data.type === "svg") {
    //     fabric.loadSVGFromString(data.data).then(({ objects, options }) => {
    //       //  Filter out null values
    //       const validObjects = objects.filter((obj): obj is fabric.FabricObject => obj !== null);

    //       if (validObjects.length === 0) {
    //         console.error(' No valid SVG objects found');
    //         return;
    //       }

    //       const svgGroup = fabric.util.groupSVGElements(validObjects, options);

    //       // Scale if too large
    //       const maxWidth = canvasInstance.width! * 0.5;
    //       const maxHeight = canvasInstance.height! * 0.5;

    //       if (svgGroup.width! > maxWidth || svgGroup.height! > maxHeight) {
    //         const scale = Math.min(maxWidth / svgGroup.width!, maxHeight / svgGroup.height!);
    //         svgGroup.scale(scale);
    //       }

    //       // Center
    //       svgGroup.set({
    //         left: (canvasInstance.width! - svgGroup.getScaledWidth()) / 2,
    //         top: (canvasInstance.height! - svgGroup.getScaledHeight()) / 2,
    //       });

    //       canvasInstance.add(svgGroup);
    //       canvasInstance.setActiveObject(svgGroup);
    //       canvasInstance.requestRenderAll();
    //       setSelectedObject(svgGroup);
    //     }).catch((error) => {
    //       console.error('❌ Failed to load SVG:', error);
    //       setSnackbar({
    //         open: true,
    //         message: "Failed to load SVG element",
    //         severity: "error"
    //       });
    //     });
    //     return;
    //   }

    onAddUpload: (data: any) => {
      if (!canvasInstance) return;

      // ✅ FIXED SVG UPLOAD
      if (data.type === "svg") {
        fabric.loadSVGFromString(data.data).then(({ objects, options }) => {
          const validObjects = objects.filter((obj): obj is fabric.FabricObject => obj !== null);

          if (validObjects.length === 0) {
            console.error('❌ No valid SVG objects found');
            setSnackbar({
              open: true,
              message: "SVG ke andar koi objects nahi hain",
              severity: "error"
            });
            return;
          }

          // ✅ KEY FIX: Store original colors before grouping
          const colorMap = new Map<string, number>();
          validObjects.forEach((obj, idx) => {
            const fill = obj.fill;
            if (fill && typeof fill === 'string' && fill !== 'none' && fill !== 'transparent') {
              if (!colorMap.has(fill)) {
                colorMap.set(fill, idx);
              }
              console.log(`Path ${idx}: Original Color = ${fill}`);
            }
          });

          const svgGroup = fabric.util.groupSVGElements(validObjects, options);

          // ✅ KEY FIX: Mark as editable SVG and store all info
          (svgGroup as any).isEditableSVG = true;
          (svgGroup as any).svgPaths = validObjects;
          (svgGroup as any).svgColorMap = colorMap;
          (svgGroup as any).originalColors = new Map(colorMap);

          console.log('✅ SVG Group Setup:', {
            isEditableSVG: true,
            pathCount: validObjects.length,
            uniqueColors: colorMap.size,
            colors: Array.from(colorMap.keys())
          });

          // Scale if too large
          const maxWidth = canvasInstance.width! * 0.5;
          const maxHeight = canvasInstance.height! * 0.5;

          if (svgGroup.width! > maxWidth || svgGroup.height! > maxHeight) {
            const scale = Math.min(maxWidth / svgGroup.width!, maxHeight / svgGroup.height!);
            svgGroup.scale(scale);
          }

          // Center on canvas
          svgGroup.set({
            left: (canvasInstance.width! - svgGroup.getScaledWidth()) / 2,
            top: (canvasInstance.height! - svgGroup.getScaledHeight()) / 2,
          });

          canvasInstance.add(svgGroup);
          canvasInstance.setActiveObject(svgGroup);
          canvasInstance.requestRenderAll();
          setSelectedObject(svgGroup);

        }).catch((error) => {
          console.error('❌ Failed to load SVG:', error);
          setSnackbar({
            open: true,
            message: "SVG load nahi hua",
            severity: "error"
          });
        });
        return;
      }

      // ✅ Handle images (background and regular)
      if (data.type === "ADD_IMAGE") {
        fabric.Image.fromURL(data.src, { crossOrigin: 'anonymous' }).then((img) => {
          const canvasWidth = canvasInstance.width!;
          const canvasHeight = canvasInstance.height!;

          if (data.isBackground) {
            // Scale image to exactly fit canvas (no crop, no blank space)
            const scaleX = canvasWidth / img.width!;
            const scaleY = canvasHeight / img.height!;
            img.set({
              scaleX,
              scaleY,
              left: 0,
              top: 0,
              selectable: true,
              evented: true,
              hasControls: false,
              hasBorders: false,
              lockMovementX: true,
              lockMovementY: true,
              lockScalingX: true,
              lockScalingY: true,
              lockRotation: true,
            });
            (img as any).isBackground = true;

            // Always add to bottom layer
            canvasInstance.add(img);
            // Move to bottom (type-safe)
            const objs = canvasInstance.getObjects();
            const imgIndex = objs.indexOf(img);
            if (imgIndex > -1) {
              objs.splice(imgIndex, 1);
              objs.unshift(img);
              canvasInstance.renderAll();
            }
            setSelectedObject(null);
          } else {
            // Regular image: scale and center
            const maxWidth = canvasWidth * 0.5;
            const maxHeight = canvasHeight * 0.5;
            if (img.width! > maxWidth || img.height! > maxHeight) {
              const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
              img.scale(scale);
            }
            img.set({
              left: (canvasWidth - img.getScaledWidth()) / 2,
              top: (canvasHeight - img.getScaledHeight()) / 2,
              selectable: true,
              evented: true,
            });
            canvasInstance.add(img);
            canvasInstance.setActiveObject(img);
            setSelectedObject(img);
          }
          canvasInstance.requestRenderAll();
        }).catch((error) => {
          setSnackbar({
            open: true,
            message: "Failed to load image",
            severity: "error"
          });
        });
      }
    },
    onAddShape: (payload: any) => {
      if (payload && payload.type === "LOAD_TEMPLATE") {
        const snapshot = canvasInstance?.toJSON();
        const prevSize = canvasInstance ? {
          width: canvasInstance.width,
          height: canvasInstance.height
        } : null;
        const prevBg = canvasInstance?.backgroundColor;

        if (payload.template) {
          const template = payload.template;

          // ✅ CRITICAL FIX: Set canvas size from template FIRST
          if (canvasInstance && template.size) {
            canvasInstance.setWidth(template.size.width || 800);
            canvasInstance.setHeight(template.size.height || 600);
            setCanvasSize({
              width: template.size.width || 800,
              height: template.size.height || 600
            });
          }

          // If template contains pages array, load into pages state
          if (template.pages && Array.isArray(template.pages) && template.pages.length > 0) {
            const loadedPages: PageItem[] = template.pages.map((pg: any, i: number) => ({
              id: pg.id || uuidv4(),
              name: pg.name || `Page ${i + 1}`,
              fabricJSON: pg.fabricJSON || pg.json || null,
              thumbnail: pg.thumbnail || null,
              locked: !!pg.locked,
            }));

            setPages(loadedPages);
            setTimeout(() => {
              loadPageToCanvas(0);
            }, 50);

            // set metadata
            setBaseAdminTemplateId(template.createdBy && !template.userId ? template.id : null);
            setCurrentTemplateId(template.userId ? template.id : null);
            setTemplateName(template.name || "");
            setIsEditingTemplate(!!template.userId);
          }
          else if (template.fabricJSON || template.json) {
            // fallback: single page template
            const single = {
              id: template.id || uuidv4(),
              name: template.name || "Page 1",
              fabricJSON: template.fabricJSON || template.json || null,
              thumbnail: template.thumbnail || null,
              locked: false,
            } as PageItem;
            setPages([single]);
            setTimeout(() => {
              loadPageToCanvas(0);
            }, 50);

            setBaseAdminTemplateId(template.createdBy && !template.userId ? template.id : null);
            setCurrentTemplateId(template.userId ? template.id : null);
            setTemplateName(template.name || "");
            setIsEditingTemplate(!!template.userId);
          }
        }

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



  const handleColorChange = (type: 'fill' | 'stroke' | 'shadow', color: string | any) => {
    if (!canvasInstance || !manager || !selectedObject) return;

    const isEditableSVG = (selectedObject as any).isEditableSVG;
    console.log('🎨 handleColorChange Called:', {
      type,
      color: typeof color === 'object' ? color.type : color,
      isEditableSVG,
      selectedObjectType: selectedObject.type
    });

    // ========== SVG COLOR CHANGE ==========
    if (isEditableSVG && type === 'fill') {
      const newColor = typeof color === 'object' ? (color.hex || color) : color;
      const oldColor = colorPickerColor;
      const svgPaths = (selectedObject as any).svgPaths || [];

      console.log('🎨 SVG Color Update:', {
        oldColor,
        newColor,
        pathCount: svgPaths.length
      });

      if (!svgPaths || svgPaths.length === 0) {
        console.error('❌ No SVG paths found');
        return;
      }

      // Execute with undo/redo
      manager.execute({
        do: () => {
          let changedCount = 0;
          let debugLog: string[] = [];

          svgPaths.forEach((path: any, idx: number) => {
            const pathFill = path.fill;
            const pathFillStr = String(pathFill).toLowerCase();
            const oldColorStr = String(oldColor).toLowerCase();

            // Flexible color matching
            const isMatch =
              pathFillStr === oldColorStr ||
              pathFillStr.replace(/#/g, '') === oldColorStr.replace(/#/g, '');

            if (isMatch) {
              path.set('fill', newColor);
              (path as any).editableFill = newColor;
              changedCount++;
              debugLog.push(`✅ Path ${idx}: ${pathFill} -> ${newColor}`);
            } else {
              debugLog.push(`❌ Path ${idx}: ${pathFill} (no match)`);
            }
          });

          console.log('🎨 SVG Update Results:', debugLog);
          console.log(`✅ Total paths changed: ${changedCount}`);

          canvasInstance.requestRenderAll();
        },
        undo: () => {
          svgPaths.forEach((path: any) => {
            if (path.fill === newColor || String(path.fill).toLowerCase() === String(newColor).toLowerCase()) {
              path.set('fill', oldColor);
              (path as any).editableFill = oldColor;
            }
          });
          canvasInstance.requestRenderAll();
        }
      });

      return;
    }

    // ========== GRADIENT FILL ==========
    if (typeof color === 'object' && color.type && type === 'fill' && !isEditableSVG) {
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

      const oldFill = (selectedObject as any).fill;

      manager.execute({
        do: () => {
          (selectedObject as any).set('fill', gradient);
          canvasInstance.requestRenderAll();
        },
        undo: () => {
          (selectedObject as any).set('fill', oldFill);
          canvasInstance.requestRenderAll();
        }
      });
      return;
    }

    // ========== SOLID COLORS ==========
    const newColor = typeof color === 'object' ? (color.hex || color) : color;

    if (type === 'shadow') {
      const oldShadow = (selectedObject as any).shadow;
      const oldShadowColor = oldShadow?.color || '#000000';

      manager.execute({
        do: () => {
          const shadow = (selectedObject as any).shadow
            ? new fabric.Shadow((selectedObject as any).shadow)
            : new fabric.Shadow({ color: '#000000', blur: 0, offsetX: 0, offsetY: 0 });
          shadow.color = newColor;
          (selectedObject as any).set('shadow', shadow);
          canvasInstance.requestRenderAll();
        },
        undo: () => {
          const shadow = (selectedObject as any).shadow
            ? new fabric.Shadow((selectedObject as any).shadow)
            : new fabric.Shadow({ color: '#000000', blur: 0, offsetX: 0, offsetY: 0 });
          shadow.color = oldShadowColor;
          (selectedObject as any).set('shadow', shadow);
          canvasInstance.requestRenderAll();
        }
      });
    } else {
      const oldColor = (selectedObject as any)[type];

      manager.execute({
        do: () => {
          (selectedObject as any).set(type, newColor);
          canvasInstance.requestRenderAll();
        },
        undo: () => {
          (selectedObject as any).set(type, oldColor);
          canvasInstance.requestRenderAll();
        }
      });
    }
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

      case "slideRight":
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

      case "ascend":
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

      case "shift":
        obj.set({ left: originalLeft - 100, opacity: 0 });
        obj.animate({ left: originalLeft, opacity: originalOpacity }, {
          duration,
          onChange: () => canvasInstance.renderAll()
        });
        break;

      case "zoomIn":
        obj.set({ scaleX: 0, scaleY: 0, opacity: 0 });
        canvasInstance.renderAll();
        obj.animate(
          { scaleX: originalScaleX, scaleY: originalScaleY, opacity: originalOpacity },
          {
            duration,
            easing: fabric.util.ease.easeOutCubic,
            onChange: () => canvasInstance.renderAll(),
          }
        );
        break;

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
        obj.animate({ scaleX: originalScaleX }, {
          duration,
          onChange: () => canvasInstance.renderAll()
        });
        break;

      case "flipV":
        obj.set({ scaleY: 0 });
        obj.animate({ scaleY: originalScaleY }, {
          duration,
          onChange: () => canvasInstance.renderAll()
        });
        break;

      case "swing":
        let swingCount = 0;
        const swingInterval = setInterval(() => {
          obj.set({ angle: originalAngle + (swingCount % 2 === 0 ? 10 : -10) });
          canvasInstance.renderAll();
          swingCount++;
          if (swingCount > 6) {
            obj.set({ angle: originalAngle });
            clearInterval(swingInterval);
          }
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
          if (shakeCount > 6) {
            obj.set({ left: originalLeft });
            clearInterval(shakeInterval);
          }
        }, 80);
        break;

      case "wobble":
        let wobbleCount = 0;
        const wobbleInterval = setInterval(() => {
          obj.set({ angle: originalAngle + (wobbleCount % 2 === 0 ? 10 : -10) });
          canvasInstance.renderAll();
          wobbleCount++;
          if (wobbleCount > 6) {
            obj.set({ angle: originalAngle });
            clearInterval(wobbleInterval);
          }
        }, 100);
        break;

      case "pulse":
        obj.set({ scaleX: 0.8, scaleY: 0.8 });
        obj.animate({ scaleX: originalScaleX, scaleY: originalScaleY }, {
          duration,
          onChange: () => canvasInstance.renderAll()
        });
        break;

      case "drop":
        obj.set({ top: originalTop - 100, opacity: 0 });
        obj.animate(
          { top: originalTop, opacity: originalOpacity },
          {
            duration,
            easing: (t) => t * t,
            onChange: () => canvasInstance.renderAll()
          }
        );
        break;

      case "expandWidth":
        obj.set({ scaleX: 0, opacity: 0 });
        obj.animate({ scaleX: originalScaleX, opacity: originalOpacity }, {
          duration,
          onChange: () => canvasInstance.renderAll()
        });
        break;

      case "colorFlash":
        const originalFill = (obj as any).fill || "#000";
        let flashCount = 0;
        const flashInterval = setInterval(() => {
          (obj as any).set({ fill: flashCount % 2 === 0 ? "#8b5cf6" : originalFill });
          canvasInstance.renderAll();
          flashCount++;
          if (flashCount > 5) {
            (obj as any).set({ fill: originalFill });
            clearInterval(flashInterval);
          }
        }, 150);
        break;

      case "bounceUp":
        obj.set({ top: originalTop + 50, opacity: 0 });
        obj.animate(
          { top: originalTop, opacity: originalOpacity },
          {
            duration,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            onChange: () => canvasInstance.renderAll()
          }
        );
        break;

      case "blink":
        let visible = true;
        const interval = setInterval(() => {
          obj.set({ opacity: visible ? 0 : originalOpacity });
          canvasInstance.renderAll();
          visible = !visible;
        }, 300);
        (obj as any)._animationInterval = interval;
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

  const sidebarHandlers = {
    onAddText: handlers.onAddText,
    onAddShape: handlers.onAddShape,
    onAddUpload: handlers.onAddUpload,
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

  if (!mounted) return null;

  const renderPropertyPanel = () => {
    switch (propertyTab) {
      case "rectangle":
        return (
          <RectanglePropertiesPanel
            canvas={canvasInstance}
            selectedObject={selectedObject as fabric.Rect | null}
            manager={manager}
            onOpenColorPicker={(type, color) => {
              setColorPickerType(type as 'fill' | 'stroke' | 'shadow');
              setColorPickerColor(color);
              setColorPickerOpen(true);
            }}
          />
        );
      case "text":
        return (
          <TextPropertiesPanel
            canvas={canvasInstance}
            manager={manager}
            selectedObject={selectedObject as fabric.Textbox | null}
            onOpenColorPicker={(type, color) => {
              setColorPickerType(type);
              setColorPickerColor(color);
              setColorPickerOpen(true);
            }}
          />
        );
      default:
        return null;
    }
  };
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <CanvaHeader position="fixed">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
              {isAdmin ? "Template Editor" : "Canvas Editor"}
            </Typography>
            {currentTemplateId && (
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                Editing: {templateName}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* New Button */}
            <HeaderButton onClick={handleNewTemplate}>New</HeaderButton>

            {/* Undo/Redo */}
            <HeaderButton
              startIcon={<UndoIcon />}
              onClick={handlers.onUndo}
              disabled={!manager?.canUndo()}
              sx={{
                mr: 0,
                opacity: manager?.canUndo() ? 1 : 0.5
              }}
            />
            <HeaderButton
              startIcon={<RedoIcon />}
              onClick={handlers.onRedo}
              disabled={!manager?.canRedo()}
              sx={{
                ml: 0,
                opacity: manager?.canRedo() ? 1 : 0.5
              }}
            />
            {/* Preview */}
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

            {/* Resize */}
            <HeaderButton
              startIcon={<AspectRatioIcon />}
              onClick={() => setResizeDialogOpen(true)}
            >
              Resize
            </HeaderButton>

            {/* Save Button */}
            <HeaderButton
              startIcon={<SaveIcon />}
              onClick={handleSaveClick}
              disabled={!isAuthenticated}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
              }}
            >
              {isEditingTemplate ? "Update" : "Save"}
            </HeaderButton>



            {/* Export Popover Button */}
            <HeaderButton

              onClick={handleExportClick}
              sx={{
                // backgroundColor: "rgba(255,255,255,0.2)",
                // "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
              }}
            >
              Export
            </HeaderButton>
            <Popover
              open={exportOpen}
              anchorEl={exportAnchorEl}
              onClose={handleExportClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{
                sx: { p: 1, minWidth: 160, borderRadius: 2 }
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  fullWidth
                  onClick={() => { handlers.onExport("png"); handleExportClose(); }}
                  sx={{ justifyContent: "flex-start", color: "#7c3aed" }}
                >
                  Export PNG
                </Button>
                <Button
                  fullWidth
                  onClick={() => { handlers.onExport("jpg"); handleExportClose(); }}
                  sx={{ justifyContent: "flex-start", color: "#7c3aed" }}
                >
                  Export JPG
                </Button>
                <Button
                  fullWidth
                  onClick={() => { handlers.onExport("svg"); handleExportClose(); }}
                  sx={{ justifyContent: "flex-start", color: "#7c3aed" }}
                >
                  Export SVG
                </Button>
                <Button
                  fullWidth
                  onClick={() => { handlers.onExport("pdf"); handleExportClose(); }}
                  sx={{ justifyContent: "flex-start", color: "#7c3aed" }}
                >
                  Export PDF
                </Button>
              </Box>
            </Popover>

            {/* Clear */}
            <HeaderButton startIcon={<ClearAllIcon />} onClick={handlers.onClear}>
              Clear
            </HeaderButton>

            {/* User Info & Logout */}
            {isAuthenticated && (
              <Box sx={{ ml: 2, display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ color: "white", fontSize: "14px" }}>
                  {user?.name || user?.email}
                  {isAdmin && (
                    <Typography
                      variant="caption"
                      sx={{
                        ml: 1,
                        color: "#fbbf24",
                        backgroundColor: "rgba(251, 191, 36, 0.2)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: 600
                      }}
                    >
                      ADMIN
                    </Typography>
                  )}
                </Box>
                <HeaderButton
                  startIcon={<LogoutIcon />}
                  onClick={() => {
                    if (confirm("Are you sure you want to logout? Unsaved changes will be lost.")) {
                      logout();
                    }
                  }}
                >
                  Logout
                </HeaderButton>
              </Box>
            )}
          </Box>
        </Toolbar>
      </CanvaHeader>
      <Toolbar />

      <Dialog open={resizeDialogOpen} onClose={() => setResizeDialogOpen(false)}>
        <DialogTitle>Canvas Size</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1, minWidth: 300 }}>
            <TextField
              label="Width"
              type="number"
              defaultValue={canvasSize.width}
              id="canvas-width"
              fullWidth
              inputProps={{ min: 100, max: 5000 }}
            />
            <TextField
              label="Height"
              type="number"
              defaultValue={canvasSize.height}
              id="canvas-height"
              fullWidth
              inputProps={{ min: 100, max: 5000 }}
            />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  (document.getElementById("canvas-width") as HTMLInputElement).value = "1920";
                  (document.getElementById("canvas-height") as HTMLInputElement).value = "1080";
                }}
              >
                1920×1080
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  (document.getElementById("canvas-width") as HTMLInputElement).value = "1080";
                  (document.getElementById("canvas-height") as HTMLInputElement).value = "1080";
                }}
              >
                1080×1080
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  (document.getElementById("canvas-width") as HTMLInputElement).value = "1080";
                  (document.getElementById("canvas-height") as HTMLInputElement).value = "1920";
                }}
              >
                1080×1920
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  (document.getElementById("canvas-width") as HTMLInputElement).value = "800";
                  (document.getElementById("canvas-height") as HTMLInputElement).value = "600";
                }}
              >
                800×600
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResizeDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const w = parseInt((document.getElementById("canvas-width") as HTMLInputElement).value);
              const h = parseInt((document.getElementById("canvas-height") as HTMLInputElement).value);
              if (w >= 100 && h >= 100 && w <= 5000 && h <= 5000) {
                handleResize(w, h);
                setResizeDialogOpen(false);
              } else {
                alert("Please enter valid dimensions (100-5000)");
              }
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save / Update Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>{isEditingTemplate ? "Update Template" : "Save Template"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1, minWidth: 360 }}>
            <TextField
              label="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              fullWidth
            />
            {(user && (user as any).role === "ADMIN") && (
              <TextField
                label="Category"
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
                fullWidth
                placeholder="e.g. Social, Product, Banner"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : (isEditingTemplate ? "Update" : "Save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <PropertiesPanelWrapper>{renderPropertyPanel()}</PropertiesPanelWrapper>
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          {...sidebarHandlers}
          onSelectProject={async (projectData: any) => {
            console.log('🎯 CanvasEditor: onSelectProject called from Sidebar', {
              isLoading: isLoadingProject,
              hasCanvas: !!canvasInstance,
              projectName: projectData.name,
              pages: projectData.pages?.length
            });

            if (!canvasInstance) {
              console.error('❌ Canvas not ready');
              return;
            }

            if (isLoadingProject) {
              console.warn('⚠️ Already loading, ignoring duplicate call');
              return;
            }

            // ✅ Set loading flag IMMEDIATELY
            setIsLoadingProject(true);

            console.log('🔄 Starting project load:', projectData.name);

            try {
              // ✅ STEP 1: Save current state
              await saveCurrentCanvasToPage(currentPage);

              // ✅ STEP 2: Reset all states
              setSelectedObject(null);
              setPropertyTab("rectangle");
              setAction(null);

              // ✅ STEP 3: Clear canvas completely
              canvasInstance.clear();
              canvasInstance.backgroundColor = 'white';
              canvasInstance.renderAll();

              // ✅ STEP 4: Wait for clear to complete
              await new Promise(resolve => setTimeout(resolve, 200));

              // ✅ STEP 5: Set canvas size FIRST
              const newWidth = projectData.size?.width || 800;
              const newHeight = projectData.size?.height || 600;

              console.log('📐 Setting canvas size:', { width: newWidth, height: newHeight });

              canvasInstance.setWidth(newWidth);
              canvasInstance.setHeight(newHeight);
              setCanvasSize({ width: newWidth, height: newHeight });

              // ✅ STEP 6: Parse and validate pages
              if (!projectData.pages || !Array.isArray(projectData.pages) || projectData.pages.length === 0) {
                console.error('❌ Invalid pages data');
                setIsLoadingProject(false);
                return;
              }

              const loadedPages: PageItem[] = projectData.pages.map((pg: any, i: number) => {
                let fabricJSON = pg.fabricJSON;

                // Parse if string
                if (typeof fabricJSON === 'string') {
                  try {
                    fabricJSON = JSON.parse(fabricJSON);
                  } catch (e) {
                    console.error(`❌ Parse error page ${i}:`, e);
                    fabricJSON = {
                      version: "5.3.0",
                      objects: [],
                      background: "white",
                      width: newWidth,
                      height: newHeight
                    };
                  }
                }

                // Deep clone to prevent reference issues
                fabricJSON = JSON.parse(JSON.stringify(fabricJSON));

                // Ensure canvas size in fabricJSON
                if (fabricJSON) {
                  fabricJSON.width = newWidth;
                  fabricJSON.height = newHeight;
                }

                return {
                  id: pg.id || uuidv4(),
                  name: pg.name || `Page ${i + 1}`,
                  fabricJSON: fabricJSON,
                  thumbnail: pg.thumbnail || null,
                  locked: !!pg.locked,
                };
              });

              console.log('📦 Parsed pages:', loadedPages.map((p, i) =>
                `Page ${i + 1}: ${p.fabricJSON?.objects?.length || 0} objects`
              ));

              // ✅ CRITICAL FIX: Load first page DIRECTLY into canvas
              const firstPage = loadedPages[0];
              if (firstPage?.fabricJSON) {
                let jsonData = firstPage.fabricJSON;

                if (typeof jsonData === 'string') {
                  jsonData = JSON.parse(jsonData);
                }

                console.log('📄 Loading first page with', jsonData.objects?.length || 0, 'objects');

                // ✅ Load synchronously using Promise with proper timing
                await new Promise<void>((resolve) => {
                  canvasInstance.loadFromJSON(jsonData, () => {
                    // ✅ Set dimensions first
                    canvasInstance.setWidth(newWidth);
                    canvasInstance.setHeight(newHeight);

                    // ✅ Set background
                    if (jsonData.background) {
                      canvasInstance.backgroundColor = jsonData.background;
                    }

                    // ✅ CRITICAL: Wait for objects to render before counting
                    canvasInstance.requestRenderAll();

                    // ✅ Use setTimeout to ensure objects are fully loaded
                    setTimeout(() => {
                      const objectCount = canvasInstance.getObjects().length;
                      console.log(`✅ Canvas loaded: ${objectCount} objects visible`);
                      resolve();
                    }, 50);
                  });
                });
              }

              // ✅ Wait a bit before setting state
              await new Promise(resolve => setTimeout(resolve, 100));

              // ✅ NOW set pages state AFTER canvas is completely loaded
              console.log('📝 Setting pages state');
              setPages(loadedPages);
              setCurrentPage(0);

              // ✅ Set metadata
              setCurrentTemplateId(projectData.id);
              setTemplateName(projectData.name || "");
              setIsEditingTemplate(true);
              setBaseAdminTemplateId(null);

              console.log('✅ Project load complete:', {
                pagesSet: loadedPages.length,
                currentPage: 0,
                canvasObjects: canvasInstance.getObjects().length
              });

            } catch (error) {
              console.error('❌ Error loading project:', error);
            } finally {
              // ✅ Release loading flag after delay
              setTimeout(() => {
                setIsLoadingProject(false);
                console.log('🔓 Loading flag released');
              }, 500);
            }
          }}
        />

        <Box sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#f1f5f9",
          overflow: "auto",
          position: "relative",
        }}>
          {/* Top page controls */}
          <Box sx={{
            position: "sticky",
            top: 90,
            zIndex: 120,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            mb: 10
          }}>
            <Box sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              background: "rgba(255,255,255,0.95)",
              padding: "6px 8px",
              borderRadius: 8,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
            }}>
              <Typography variant="body2">Page {currentPage + 1} of {pages.length}</Typography>
              <IconButton size="small" onClick={handleDuplicatePage} title="Duplicate page"><ContentCopyIcon /></IconButton>
              <IconButton size="small" onClick={() => handleAddPage(currentPage)} title="Add page"><AddIcon /></IconButton>
              <IconButton size="small" onClick={() => handleToggleLockPage(currentPage)} title={pages[currentPage]?.locked ? "Unlock page" : "Lock page"}>
                {pages[currentPage]?.locked ? <LockIcon /> : <LockOpenIcon />}
              </IconButton>
              <IconButton size="small" onClick={() => handleDeletePage(currentPage)} title="Delete page"><DeleteIcon /></IconButton>
            </Box>
          </Box>

          {/* ✅ VERTICAL PAGES CONTAINER (CANVA STYLE) */}
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            gap: 2,
            py: 2
          }}>
            {/* Active Canvas */}
            <Box
              ref={(el: HTMLDivElement | null) => {
                if (pages[currentPage]) {
                  pageRefs.current[pages[currentPage].id] = el;
                }
              }}
              sx={{
                position: "relative",
                border: "3px solid #7c3aed",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease"
              }}
            >
              <CanvasContainer>
                <MiniCanva
                  action={action}
                  onCanvasReady={(canvas: fabric.Canvas) => {
                    console.log('🎨 Canvas initialized');
                    setCanvasInstance(canvas);
                    const mgr = new CommandManager(canvas);
                    setManager(mgr);

                    canvas.on('selection:created', (e) => {
                      if (e.selected && e.selected[0]) {
                        (e.selected[0] as any)._previousState = e.selected[0].toJSON();
                      }
                    });

                    canvas.on('selection:updated', (e) => {
                      if (e.selected && e.selected[0]) {
                        (e.selected[0] as any)._previousState = e.selected[0].toJSON();
                      }
                    });

                    // ✅ Load initial page after canvas is ready
                    setTimeout(() => {
                      console.log('🎨 Loading initial page');
                      if (pages[currentPage]?.fabricJSON) {
                        try {
                          let jsonData = pages[currentPage].fabricJSON;
                          if (typeof jsonData === 'string') {
                            jsonData = JSON.parse(jsonData);
                          }
                          canvas.loadFromJSON(jsonData, () => {
                            if (jsonData.width && jsonData.height) {
                              canvas.setWidth(jsonData.width);
                              canvas.setHeight(jsonData.height);
                              setCanvasSize({ width: jsonData.width, height: jsonData.height });
                            }
                            if (jsonData.background) {
                              canvas.backgroundColor = jsonData.background;
                            }
                            canvas.renderAll();
                            console.log('✅ Initial page loaded');
                          });
                        } catch (err) {
                          console.error('❌ Failed to load initial page:', err);
                          canvas.backgroundColor = 'white';
                          canvas.renderAll();
                        }
                      } else {
                        canvas.backgroundColor = 'white';
                        canvas.renderAll();
                      }
                    }, 100);
                  }}
                  onObjectSelected={setSelectedObject}
                  setSelectedObject={setSelectedObject}
                />
              </CanvasContainer>

              <Box sx={{
                position: "absolute",
                top: 8,
                left: 8,
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "4px 12px",
                borderRadius: 1,
                fontSize: "12px",
                fontWeight: 600
              }}>
                Page {currentPage + 1}
              </Box>
            </Box>

            {/* Other Pages Thumbnails */}
            {pages.map((page, index) => {
              if (index === currentPage) return null;
              return (
                <Box
                  key={page.id}
                  ref={(el: HTMLDivElement | null) => {
                    pageRefs.current[page.id] = el;
                  }}
                  onClick={() => handleSwitchToPage(index)}
                  sx={{
                    width: canvasSize.width,
                    height: canvasSize.height,
                    border: "1px solid #e2e8f0",
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                    backgroundColor: "#f8fafc",
                    backgroundImage: page.thumbnail ? `url(${page.thumbnail})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      border: "2px solid #7c3aed"
                    }
                  }}
                >
                  <Box sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: "rgba(0,0,0,0.7)",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: 1,
                    fontSize: "12px",
                    fontWeight: 600
                  }}>
                    Page {index + 1}
                  </Box>

                  {page.locked && (
                    <Box sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: 1
                    }}>
                      <LockIcon fontSize="small" />
                    </Box>
                  )}

                  <Box sx={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(0,0,0,0.4)",
                      opacity: 1
                    }
                  }}>
                    <Typography sx={{ color: "white", fontWeight: 600 }}>
                      Click to Edit
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

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

          {/* Bottom Add Page Button */}
          <Box sx={{
            my: 3,
            display: "flex",
            justifyContent: "center",
            width: "100%"
          }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleAddPage()}
              sx={{
                borderColor: "#7c3aed",
                color: "#7c3aed",
                borderWidth: 2,
                borderStyle: "dashed",
                py: 2,
                px: 4,
                fontSize: "16px",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#6d28d9",
                  backgroundColor: "rgba(124, 58, 237, 0.05)",
                  borderWidth: 2
                }
              }}
            >
              Add Page
            </Button>
          </Box>
        </Box>
        {/* Context Menu for right-click on canvas objects */}
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX + 100 }
              : undefined
          }
          PaperProps={{ sx: { minWidth: 260, borderRadius: 2, boxShadow: 6 } }}
        >
          <MenuItem onClick={() => handleMenuAction("copy")}>
            <ContentCopyIcon sx={{ mr: 1 }} /> Copy <span style={{ marginLeft: "auto", color: "#888" }}>Ctrl+C</span>
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction("paste")}>
            <ContentPasteIcon sx={{ mr: 1 }} /> Paste <span style={{ marginLeft: "auto", color: "#888" }}>Ctrl+V</span>
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction("duplicate")}>
            <ContentCopyIcon sx={{ mr: 1 }} /> Duplicate <span style={{ marginLeft: "auto", color: "#888" }}>Ctrl+D</span>
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction("delete")}>
            <DeleteIcon sx={{ mr: 1 }} /> Delete <span style={{ marginLeft: "auto", color: "#888" }}>Delete</span>
          </MenuItem>
          <Divider />

          {/* Group/Ungroup options */}
          {(canvasInstance?.getActiveObjects() ?? []).length > 1 ? (
            <MenuItem onClick={() => handleMenuAction("group")}>
              <GroupIcon sx={{ mr: 1 }} /> Group <span style={{ marginLeft: "auto", color: "#888" }}>Ctrl+G</span>
            </MenuItem>
          ) : null}
          {selectedObject?.type === "group" ? (
            <MenuItem onClick={() => handleMenuAction("ungroup")}>
              <GroupOffIcon sx={{ mr: 1 }} /> Ungroup <span style={{ marginLeft: "auto", color: "#888" }}>Ctrl+Shift+G</span>
            </MenuItem>
          ) : null}

          <Divider />

          {/* Layer submenu */}
          <MenuItem disabled>
            <LayersIcon sx={{ mr: 1 }} /> Layer
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction("bringForward")}>
            <ArrowUpwardIcon sx={{ mr: 1 }} /> Bring forward <span style={{ marginLeft: "auto", color: "#888" }}>Ctrl+]</span>
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction("bringToFront")}>
            <VerticalAlignTopIcon sx={{ mr: 1 }} /> Bring to front <span style={{ marginLeft: "auto", color: "#888" }}>Ctrl+Alt+]</span>
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction("sendBackward")}>
            <ArrowDownwardIcon sx={{ mr: 1 }} /> Send backward <span style={{ marginLeft: "auto", color: "#888" }}>Ctrl+[</span>
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction("sendToBack")}>
            <VerticalAlignBottomIcon sx={{ mr: 1 }} /> Send to back <span style={{ marginLeft: "auto", color: "#888" }}>Ctrl+Alt+[</span>
          </MenuItem>
          <Divider />

          {/* Align to page submenu */}
          <MenuItem onClick={handleOpenAlignMenu}>
            <AlignHorizontalLeftIcon sx={{ mr: 1 }} /> Align to page <MoreHorizIcon sx={{ ml: "auto" }} />
          </MenuItem>

          {/* Lock/Unlock */}
          {(selectedObject && (selectedObject as any).locked) ? (
            <MenuItem onClick={() => handleMenuAction("unlock")}>
              <LockOpenIcon sx={{ mr: 1 }} /> Unlock
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handleMenuAction("lock")}>
              <LockIcon sx={{ mr: 1 }} /> Lock <span style={{ marginLeft: "auto", color: "#888" }}>Alt+Shift+L</span>
            </MenuItem>
          )}
          <Divider />

          {/* Extra options (UI only, not functional) */}
          <MenuItem disabled>
            <LinkIcon sx={{ mr: 1 }} /> Link <span style={{ marginLeft: "auto", color: "#888" }}>Ctrl+K</span>
          </MenuItem>
          <MenuItem disabled>
            <AccessTimeIcon sx={{ mr: 1 }} /> Show element timing
          </MenuItem>
          <MenuItem disabled>
            <CommentIcon sx={{ mr: 1 }} /> Comment <span style={{ marginLeft: "auto", color: "#888" }}>Ctrl+Alt+N</span>
          </MenuItem>
          <MenuItem disabled>
            <TextFieldsIcon sx={{ mr: 1 }} /> Alternative text
          </MenuItem>
          <MenuItem disabled>
            <WallpaperIcon sx={{ mr: 1 }} /> Replace background
          </MenuItem>
          <MenuItem disabled>
            <ColorLensIcon sx={{ mr: 1 }} /> Apply colours to page
          </MenuItem>
          <MenuItem disabled>
            <TranslateIcon sx={{ mr: 1 }} /> Translate text
          </MenuItem>
        </Menu>

        {/* Align to page submenu */}
        <Menu
          anchorEl={alignMenuAnchor}
          open={Boolean(alignMenuAnchor)}
          onClose={handleCloseAlignMenu}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{ sx: { minWidth: 180, borderRadius: 2 } }}
        >
          <MenuItem onClick={() => handleAlignAction("left")}>
            <AlignHorizontalLeftIcon sx={{ mr: 1 }} /> Left
          </MenuItem>
          <MenuItem onClick={() => handleAlignAction("center")}>
            <AlignHorizontalCenterIcon sx={{ mr: 1 }} /> Centre
          </MenuItem>
          <MenuItem onClick={() => handleAlignAction("right")}>
            <AlignHorizontalRightIcon sx={{ mr: 1 }} /> Right
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleAlignAction("top")}>
            <AlignVerticalTopIcon sx={{ mr: 1 }} /> Top
          </MenuItem>
          <MenuItem onClick={() => handleAlignAction("middle")}>
            <AlignVerticalCenterIcon sx={{ mr: 1 }} /> Middle
          </MenuItem>
          <MenuItem onClick={() => handleAlignAction("bottom")}>
            <AlignVerticalBottomIcon sx={{ mr: 1 }} /> Bottom
          </MenuItem>
        </Menu>


        {/* ColorPicker - Fixed on Right Side */}
        {/* ColorPicker - Fixed on Right Side */}
        <ColorPicker
          isOpen={colorPickerOpen}
          onClose={() => {
            setColorPickerOpen(false);
            setColorPickerType(null);
          }}
          currentColor={colorPickerColor}
          onColorChange={(color) => {
            if (colorPickerType) {
              handleColorChange(colorPickerType, color);
              setColorPickerColor(typeof color === 'object' ? color.hex || '#000000' : color);
            }
          }}
          title={
            colorPickerType === 'fill' ? 'Fill Colour' :
              colorPickerType === 'stroke' ? 'Stroke Colour' :
                'Shadow Colour'
          }
          allowGradients={colorPickerType === 'fill'}
        />















        {/* ✅ My Projects Panel */}
        {activeCategory === "myprojects" && (
          <Box sx={{ width: 320, minWidth: 320, borderLeft: "1px solid #ddd" }}>
            <MyProjectsPanel
              onSelectProject={async (projectData: any) => {
                if (!canvasInstance || isLoadingProject) {
                  console.warn('⚠️ Canvas not ready or already loading');
                  return;
                }

                // ✅ Set loading flag to prevent multiple clicks
                setIsLoadingProject(true);

                console.log('🔄 Starting project load:', projectData.name);

                try {
                  // ✅ STEP 1: Save current state
                  await saveCurrentCanvasToPage(currentPage);

                  // ✅ STEP 2: Reset all states
                  setSelectedObject(null);
                  setPropertyTab("rectangle");
                  setAction(null);

                  // ✅ STEP 3: Clear canvas completely
                  canvasInstance.clear();
                  canvasInstance.backgroundColor = 'white';
                  canvasInstance.renderAll();

                  // ✅ STEP 4: Wait for clear to complete
                  await new Promise(resolve => setTimeout(resolve, 150));

                  // ✅ STEP 5: Set canvas size FIRST
                  const newWidth = projectData.size?.width || 800;
                  const newHeight = projectData.size?.height || 600;

                  console.log('📐 Setting canvas size:', { width: newWidth, height: newHeight });

                  canvasInstance.setWidth(newWidth);
                  canvasInstance.setHeight(newHeight);
                  setCanvasSize({ width: newWidth, height: newHeight });

                  // ✅ STEP 6: Parse and validate pages
                  if (!projectData.pages || !Array.isArray(projectData.pages) || projectData.pages.length === 0) {
                    console.error('❌ Invalid pages data');
                    setIsLoadingProject(false);
                    return;
                  }

                  const loadedPages: PageItem[] = projectData.pages.map((pg: any, i: number) => {
                    let fabricJSON = pg.fabricJSON;

                    // Parse if string
                    if (typeof fabricJSON === 'string') {
                      try {
                        fabricJSON = JSON.parse(fabricJSON);
                      } catch (e) {
                        console.error(`❌ Parse error page ${i}:`, e);
                        fabricJSON = {
                          version: "5.3.0",
                          objects: [],
                          background: "white",
                          width: newWidth,
                          height: newHeight
                        };
                      }
                    }

                    // Deep clone to prevent reference issues
                    fabricJSON = JSON.parse(JSON.stringify(fabricJSON));

                    // Ensure canvas size in fabricJSON
                    if (fabricJSON) {
                      fabricJSON.width = newWidth;
                      fabricJSON.height = newHeight;
                    }

                    return {
                      id: pg.id || uuidv4(),
                      name: pg.name || `Page ${i + 1}`,
                      fabricJSON: fabricJSON,
                      thumbnail: pg.thumbnail || null,
                      locked: !!pg.locked,
                    };
                  });

                  console.log('📦 Loaded pages:', loadedPages.map((p, i) =>
                    `Page ${i + 1}: ${p.fabricJSON?.objects?.length || 0} objects`
                  ));

                  // ✅ CRITICAL FIX: Load first page BEFORE setting state
                  const firstPage = loadedPages[0];
                  if (firstPage && firstPage.fabricJSON) {
                    let jsonData = firstPage.fabricJSON;

                    if (typeof jsonData === 'string') {
                      jsonData = JSON.parse(jsonData);
                    }

                    // ✅ Load synchronously using Promise
                    await new Promise<void>((resolve) => {
                      canvasInstance.loadFromJSON(jsonData, () => {
                        canvasInstance.setWidth(newWidth);
                        canvasInstance.setHeight(newHeight);

                        if (jsonData.background) {
                          canvasInstance.backgroundColor = jsonData.background;
                        }

                        canvasInstance.renderAll();
                        console.log(`✅ First page loaded: ${canvasInstance.getObjects().length} objects`);
                        resolve();
                      });
                    });
                  }

                  // ✅ NOW set pages state AFTER canvas is loaded
                  setPages(loadedPages);
                  setCurrentPage(0);

                  // ✅ Set metadata
                  setCurrentTemplateId(projectData.id);
                  setTemplateName(projectData.name || "");
                  setIsEditingTemplate(true);
                  setBaseAdminTemplateId(null);

                  // ✅ Close panel after everything is done
                  await new Promise(resolve => setTimeout(resolve, 100));
                  setActiveCategory(null);

                  console.log('✅ Project load complete');

                } catch (error) {
                  console.error('❌ Error loading project:', error);
                } finally {
                  // ✅ Release loading flag
                  setTimeout(() => {
                    setIsLoadingProject(false);
                  }, 300);
                }
              }}
              onClose={() => setActiveCategory(null)}
            />
          </Box>
        )}
        {/* Template panel will need thumbnails — TemplatePanel component should read pages[*].thumbnail from the template when loaded.
            We'll keep the TemplatePanel as you had but you promised to send your TemplatePanel so I can wire thumbnails in the sidebar. */}
        {activeCategory === "templates" && (
          <Box sx={{ width: 320, minWidth: 320, borderLeft: "1px solid #ddd" }}>
            <TemplatePanel onTemplateSelect={(templateData: any) => {
              if (!canvasInstance) return;
              const snapshot = canvasInstance.toJSON();
              const prevSize = { width: canvasInstance.width, height: canvasInstance.height };
              const prevBg = canvasInstance.backgroundColor;
              setAction({
                type: "LOAD_TEMPLATE",
                payload: { template: templateData, snapshot, prevSize, prevBg }
              });
              // set metadata for saving
              if (templateData) {
                setCurrentTemplateId(templateData.id);
                setTemplateName(templateData.name || "");
                setIsEditingTemplate(true);

                // If templateData contains pages, load them (also duplicates code above)
                if (templateData.pages && Array.isArray(templateData.pages) && templateData.pages.length > 0) {
                  const loadedPages: PageItem[] = templateData.pages.map((pg: any, i: number) => ({
                    id: pg.id || uuidv4(),
                    name: pg.name || `Page ${i + 1}`,
                    fabricJSON: pg.fabricJSON || pg.json || null,
                    thumbnail: pg.thumbnail || null,
                    locked: !!pg.locked,
                  }));
                  setPages(loadedPages);
                  setTimeout(() => loadPageToCanvas(0), 50);
                } else if (templateData.fabricJSON || templateData.json) {
                  setPages([{
                    id: templateData.id || uuidv4(),
                    name: templateData.name || "Page 1",
                    fabricJSON: templateData.fabricJSON || templateData.json || null,
                    thumbnail: templateData.thumbnail || null,
                    locked: false
                  }]);
                  setTimeout(() => loadPageToCanvas(0), 50);
                }
              }
            }} />
          </Box>
        )}
      </Box>
    </Box>
  );
};
export default CanvasEditor;
