
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
import RectanglePropertiesPanel from "./RectanglePropertiesPanel";
import TextPropertiesPanel from "./TextPropertiesPanel";
import CommandManager from "@/lib/CommandManager";
import { useAuth } from "../../hooks/context/AuthContext";
import TemplatePanel from "./panal/TemplatePanel";
import { templateApi } from "../../../services/templateApi";
import ColorPicker from "./data/ColorPicker";
import MyProjectsPanel from "./panal/MyProjectsPanel";
import PageCanvas from "./PageCanvas";
import type { AlertColor } from '@mui/material';

import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";

const CanvaHeader = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(135deg, #6b7bf6 0%, #9b59b6 100%)",
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

type SnackbarState = {
  open: boolean;
  message: string;
  severity: AlertColor; // 'success' | 'info' | 'warning' | 'error'
};



const CanvasEditor: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [action, setAction] = useState<{ type: string; payload?: any } | null>(null);
  // Multi-canvas system
  const [canvases, setCanvases] = useState<Map<string, fabric.Canvas>>(new Map());
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [managers, setManagers] = useState<Map<string, CommandManager>>(new Map());
  const autoSaveTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
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
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  // After existing states, add:
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerType, setColorPickerType] = useState<'fill' | 'stroke' | 'shadow' | null>(null);
  const [colorPickerColor, setColorPickerColor] = useState('#000000');
  // Multi-page state
  const [pages, setPages] = useState<PageItem[]>([{ id: uuidv4(), name: "Page 1", fabricJSON: null, thumbnail: null, locked: false },]);
  const userId = user?.id || null;
  const pageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [activePageId, setActivePageId] = useState<string | null>(null);


  const canvasInstance = canvases.get(pages[activePageIndex]?.id) || null;
  const manager = managers.get(pages[activePageIndex]?.id) || null;


  const [currentPageForBg, setCurrentPageForBg] = useState<string | null>(null);
  const [currentBgColor, setCurrentBgColor] = useState<string | any>('white');


  useEffect(() => setMounted(true), []);


  // Stable z-index change without object:added
  function moveObjectToIndex(canvas: fabric.Canvas, obj: fabric.Object, newIndex: number) {
    const objects = canvas.getObjects();
    const len = objects.length;
    if (len === 0) return;

    const currIndex = objects.indexOf(obj);
    if (currIndex === -1) return;

    const clamped = Math.max(0, Math.min(newIndex, len - 1));
    if (currIndex === clamped) return;

    // Reorder in-place without remove/add
    objects.splice(currIndex, 1);
    objects.splice(clamped, 0, obj);
    (canvas as any)._objects = objects;

    obj.dirty = true as any;

    // Silent remove without firing Fabric events
    function silentRemove(canvas: fabric.Canvas, obj: fabric.Object) {
      const arr = canvas.getObjects();
      const idx = arr.indexOf(obj);
      if (idx !== -1) {
        arr.splice(idx, 1);
        (canvas as any)._objects = arr;
      }
      // detach any group ref
      (obj as any).group = null;
    }

    // Silent insert without firing Fabric events
    function silentInsertAt(canvas: fabric.Canvas, index: number, obj: fabric.Object) {
      const arr = canvas.getObjects();
      const clamped = Math.max(0, Math.min(index, arr.length));
      // attach canvas
      (obj as any).canvas = canvas;
      (obj as any).group = null;
      arr.splice(clamped, 0, obj);
      (canvas as any)._objects = arr;
      obj.setCoords();
    }

    canvas.requestRenderAll();
  }



  //  Fabric 5+ safe cross-platform paste
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      e.preventDefault();

      const activeCanvas = activePageId ? canvases.get(activePageId) : null;
      if (!activeCanvas) return;

      try {
        const text = e.clipboardData?.getData('text');
        if (text) {
          try {
            const json = JSON.parse(text);
            if (json.type && json.objects) {
              const objects: fabric.FabricObject[] = await fabric.util.enlivenObjects(json.objects);
              objects.forEach((obj) => {
                obj.set({
                  left: (obj.left || 0) + 20,
                  top: (obj.top || 0) + 20,
                });
                activeCanvas.add(obj);
              });
              activeCanvas.requestRenderAll();
              return;
            }
          } catch { }

          const textbox = new fabric.Textbox(text, {
            left: 100,
            top: 100,
            fontSize: 24,
            fill: '#000000',
            width: 400,
          });
          activeCanvas.add(textbox);
          activeCanvas.setActiveObject(textbox);
          activeCanvas.requestRenderAll();
          return;
        }

        const items = e.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              const blob = items[i].getAsFile();
              if (blob) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  fabric.Image.fromURL(event.target?.result as string, {
                    crossOrigin: 'anonymous',
                  }).then((img) => {
                    img.scaleToWidth(400);
                    img.set({ left: 100, top: 100 });
                    activeCanvas.add(img);
                    activeCanvas.setActiveObject(img);
                    activeCanvas.requestRenderAll();
                  });
                };
                reader.readAsDataURL(blob);
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error('Paste error:', error);
      }
    };

    window.addEventListener('paste', handlePaste);

    //  Safe cleanup
    return () => {
      try {
        window.removeEventListener('paste', handlePaste);
      } catch (error) {
        console.warn('Paste listener cleanup warning:', error);
      }
    };
  }, [canvases, activePageId]);


  //  Auto-save before page refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      try {
        canvases.forEach((canvas, pageId) => {
          if (canvas && canvas.toJSON) {
            const fabricJSON = canvas.toJSON();
            setPages(prev => prev.map(p =>
              p.id === pageId ? { ...p, fabricJSON } : p
            ));
          }
        });
        console.log(' Auto-saved all canvases before close');
      } catch (error) {
        console.warn('Auto-save error:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); //  Empty deps to avoid re-attaching


  //  FIXED: Safe context menu setup
  // useEffect(() => {
  //   if (!canvasInstance) return;

  //   const handleContextMenu = (e: MouseEvent) => {
  //     const target = canvasInstance.findTarget(e);

  //     if (target) {
  //       e.preventDefault();
  //       setSelectedObject(target);
  //       setContextMenu({
  //         mouseX: e.clientX - 2,
  //         mouseY: e.clientY - 4,
  //         object: target,
  //       });
  //     } else {
  //       setContextMenu(null);
  //     }
  //   };

  //   //  Check if upperCanvasEl exists before adding listener
  //   const upperCanvas = canvasInstance.upperCanvasEl;
  //   if (upperCanvas) {
  //     upperCanvas.addEventListener("contextmenu", handleContextMenu);
  //   }

  //   return () => {
  //     // Safe cleanup - check if still exists
  //     if (upperCanvas && upperCanvas.removeEventListener) {
  //       try {
  //         upperCanvas.removeEventListener("contextmenu", handleContextMenu);
  //       } catch (error) {
  //         console.warn('Context menu cleanup warning:', error);
  //       }
  //     }
  //   };
  // }, [canvasInstance]);


  //  FIXED: Safe context menu setup + Custom selection colors
  //  FIXED: Exact Canva-style - Hover shows border only, Select shows controls
  useEffect(() => {
    if (!canvasInstance) return;

    // 🎨 Selection rectangle styling
    canvasInstance.selectionColor = 'rgba(139, 92, 246, 0.08)';
    canvasInstance.selectionBorderColor = '#8b5cf6';
    canvasInstance.selectionLineWidth = 2;

    // 🎨 Default object styling
    const styleObject = (obj: fabric.Object) => {
      obj.set({
        borderColor: '#8b5cf6',
        borderScaleFactor: 2,
        cornerColor: '#ffffff',
        cornerStrokeColor: '#8b5cf6',
        cornerStyle: 'circle',
        cornerSize: 10,
        transparentCorners: false,
        padding: 5,
        hasRotatingPoint: true,
        rotatingPointOffset: 40,
      });
    };

    // Apply to all existing objects
    canvasInstance.getObjects().forEach((obj) => {
      styleObject(obj);
      // Initially hide borders and controls
      obj.set({
        hasBorders: false,
        hasControls: false,
      });
    });

    // Apply to newly added objects
    const handleObjectAdded = (e: any) => {
      if (e.target) {
        styleObject(e.target);
        // Hide by default
        e.target.set({
          hasBorders: false,
          hasControls: false,
        });
      }
    };

    canvasInstance.on('object:added', handleObjectAdded);

    // 🎨 HOVER - Show purple border only (NO controls)
    const handleMouseOver = (e: any) => {
      const target = e.target;
      const activeObj = canvasInstance.getActiveObject();

      if (target && target !== activeObj) {
        target.set({
          hasBorders: true,      // Show border
          hasControls: false,    // Hide controls (no white dots)
        });

        canvasInstance.setCursor('move');
        canvasInstance.requestRenderAll();
      }
    };

    const handleMouseOut = (e: any) => {
      const target = e.target;
      const activeObj = canvasInstance.getActiveObject();

      if (target && target !== activeObj) {
        target.set({
          hasBorders: false,     // Hide border
          hasControls: false,    // Keep controls hidden
        });

        canvasInstance.setCursor('default');
        canvasInstance.requestRenderAll();
      }
    };

    // 🎨 SELECTION CREATED - Show border + controls (with white dots)
    const handleSelectionCreated = (e: any) => {
      if (e.selected && e.selected[0]) {
        e.selected.forEach((obj: fabric.Object) => {
          obj.set({
            hasBorders: true,      // Show border
            hasControls: true,     // Show controls (white dots)
          });
        });
        canvasInstance.requestRenderAll();
      }
    };

    // 🎨 SELECTION UPDATED - Keep showing border + controls
    const handleSelectionUpdated = (e: any) => {
      // Show on newly selected
      if (e.selected && e.selected[0]) {
        e.selected.forEach((obj: fabric.Object) => {
          obj.set({
            hasBorders: true,
            hasControls: true,
          });
        });
      }

      // Hide on deselected
      if (e.deselected) {
        e.deselected.forEach((obj: fabric.Object) => {
          obj.set({
            hasBorders: false,
            hasControls: false,
          });
        });
      }

      canvasInstance.requestRenderAll();
    };

    // 🎨 SELECTION CLEARED - Hide everything
    const handleSelectionCleared = () => {
      canvasInstance.getObjects().forEach((obj) => {
        obj.set({
          hasBorders: false,
          hasControls: false,
        });
      });
      canvasInstance.requestRenderAll();
    };

    canvasInstance.on('mouse:over', handleMouseOver);
    canvasInstance.on('mouse:out', handleMouseOut);
    canvasInstance.on('selection:created', handleSelectionCreated);
    canvasInstance.on('selection:updated', handleSelectionUpdated);
    canvasInstance.on('selection:cleared', handleSelectionCleared);

    // Context menu
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

    const upperCanvas = canvasInstance.upperCanvasEl;
    if (upperCanvas) {
      upperCanvas.addEventListener("contextmenu", handleContextMenu);
    }

    // Cleanup
    return () => {
      canvasInstance.off('object:added', handleObjectAdded);
      canvasInstance.off('mouse:over', handleMouseOver);
      canvasInstance.off('mouse:out', handleMouseOut);
      canvasInstance.off('selection:created', handleSelectionCreated);
      canvasInstance.off('selection:updated', handleSelectionUpdated);
      canvasInstance.off('selection:cleared', handleSelectionCleared);

      if (upperCanvas && upperCanvas.removeEventListener) {
        try {
          upperCanvas.removeEventListener("contextmenu", handleContextMenu);
        } catch (error) {
          console.warn('Context menu cleanup warning:', error);
        }
      }
    };
  }, [canvasInstance]);

  const handleCloseContextMenu = () => setContextMenu(null);

  // Context menu actions
  const handleMenuAction = (action: string) => {
    console.log('🎯 Action triggered:', action);
    if (!canvasInstance || !manager || !selectedObject) return;

    const active = canvasInstance.getActiveObject() as fabric.Object | null;
    // Cases that need a selection will check `active` below

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
      case "group": {
        const actives = canvasInstance?.getActiveObjects() || [];
        if (actives.length > 1 && canvasInstance && manager) {
          const canvas = canvasInstance;

          // Store original state
          const indices = actives.map((o) => canvas.getObjects().indexOf(o));
          const insertIndex = Math.min(...indices);
          const storedObjects = actives.slice(); // Store reference

          manager.execute({
            do: () => {
              // Simply remove and group - Fabric handles it
              const toGroup = storedObjects.slice();
              toGroup.forEach(obj => canvas.remove(obj));

              const group = new fabric.Group(toGroup);
              canvas.add(group);
              canvas.setActiveObject(group);
              canvas.requestRenderAll();

              setSnackbar({
                open: true,
                message: `Grouped ${toGroup.length} objects`,
                severity: 'success'
              });
            },

            undo: () => {
              const currentGroup = canvas.getActiveObject();
              if (currentGroup?.type === 'group') {
                const items = (currentGroup as fabric.Group).getObjects();
                canvas.remove(currentGroup);

                // Add items back
                items.forEach((item, i) => {
                  canvas.add(item);
                });

                canvas.requestRenderAll();
              }
            },
          });
        }
        break;
      }

      case "ungroup":
        if (selectedObject?.type === "group" && canvasInstance && manager) {
          const canvas = canvasInstance;
          const group = selectedObject as fabric.Group;

          const groupIndex = canvas.getObjects().indexOf(group);
          const storedGroup = group; // Store reference

          manager.execute({
            do: () => {
              // Get items before removing
              const items = storedGroup.getObjects().slice();
              const gLeft = storedGroup.left || 0;
              const gTop = storedGroup.top || 0;

              // Remove group first
              canvas.remove(storedGroup);

              // Add items back with adjusted positions
              items.forEach((item) => {
                const iLeft = item.left || 0;
                const iTop = item.top || 0;

                // Set absolute position
                if (typeof item.set === 'function') {
                  item.set({
                    left: gLeft + iLeft,
                    top: gTop + iTop,
                  });
                } else {
                  (item as any).left = gLeft + iLeft;
                  (item as any).top = gTop + iTop;
                }

                canvas.add(item);
              });

              canvas.discardActiveObject();
              canvas.requestRenderAll();

              setSnackbar({
                open: true,
                message: `Ungrouped ${items.length} objects`,
                severity: 'success'
              });
            },

            undo: () => {
              const items = canvas.getObjects().slice(groupIndex, groupIndex + storedGroup.getObjects().length);

              // Remove ungrouped items
              items.forEach(item => canvas.remove(item));

              // Re-add group
              canvas.add(storedGroup);
              canvas.setActiveObject(storedGroup);
              canvas.requestRenderAll();
            },
          });
        }
        break;
      case "lock":
        if (manager) {
          const obj = selectedObject;
          const prev = {
            hasControls: obj.hasControls,
            hasBorders: obj.hasBorders,
            lockMovementX: obj.lockMovementX,
            lockMovementY: obj.lockMovementY,
            lockScalingX: obj.lockScalingX,
            lockScalingY: obj.lockScalingY,
            lockRotation: obj.lockRotation,
            hoverCursor: obj.hoverCursor,
            selectable: obj.selectable,
            evented: obj.evented,
            locked: (obj as any).locked,
          } as any;
          manager.execute({
            do: () => {
              obj.set({
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
              (obj as any).locked = true;
              canvasInstance.setActiveObject(obj);
              setSelectedObject(obj);
              canvasInstance.requestRenderAll();
            },
            undo: () => {
              obj.set(prev);
              (obj as any).locked = prev.locked;
              canvasInstance.setActiveObject(obj);
              setSelectedObject(obj);
              canvasInstance.requestRenderAll();
            }
          });
        }
        break;
      case "unlock":
        if (manager) {
          const obj = selectedObject;
          const prev = {
            hasControls: obj.hasControls,
            hasBorders: obj.hasBorders,
            lockMovementX: obj.lockMovementX,
            lockMovementY: obj.lockMovementY,
            lockScalingX: obj.lockScalingX,
            lockScalingY: obj.lockScalingY,
            lockRotation: obj.lockRotation,
            hoverCursor: obj.hoverCursor,
            selectable: obj.selectable,
            evented: obj.evented,
            locked: (obj as any).locked,
          } as any;
          manager.execute({
            do: () => {
              obj.set({
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
              (obj as any).locked = false;
              canvasInstance.setActiveObject(obj);
              setSelectedObject(obj);
              canvasInstance.requestRenderAll();
            },
            undo: () => {
              obj.set(prev);
              (obj as any).locked = prev.locked;
              canvasInstance.setActiveObject(obj);
              setSelectedObject(obj);
              canvasInstance.requestRenderAll();
            }
          });
        }
        break;
      case "bringForward": {
        console.log('[Layer] bringForward handler reached');
        if (!canvasInstance || !manager) break;
        const canvas = canvasInstance;
        if (!active) {
          setSnackbar({ open: true, message: "Select an object first", severity: "info" });
          break;
        }

        const objects = canvas.getObjects();
        const prevIndex = objects.indexOf(active);
        if (prevIndex === -1) break;

        const newIndex = Math.min(prevIndex + 1, objects.length - 1);
        if (prevIndex === newIndex) {
          setSnackbar({ open: true, message: "Object is already at the top layer", severity: "info" });
          break;
        }

        manager.execute({
          do: () => {
            moveObjectToIndex(canvas, active, newIndex);
            canvas.setActiveObject(active);
            setSelectedObject(active);
          },
          undo: () => {
            moveObjectToIndex(canvas, active, prevIndex);
            canvas.setActiveObject(active);
            setSelectedObject(active);
          },
        });
        setSnackbar({ open: true, message: "Object moved forward", severity: "success" });
        break;
      }

      case "sendBackward": {
        if (!canvasInstance || !manager) break;
        const canvas = canvasInstance;
        if (!active) {
          setSnackbar({ open: true, message: "Select an object first", severity: "info" });
          break;
        }

        const objects = canvas.getObjects();
        const prevIndex = objects.indexOf(active);
        if (prevIndex === -1) break;

        const newIndex = Math.max(prevIndex - 1, 0);
        if (prevIndex === newIndex) {
          setSnackbar({ open: true, message: "Object is already at the bottom layer", severity: "info" });
          break;
        }

        manager.execute({
          do: () => {
            moveObjectToIndex(canvas, active, newIndex);
            canvas.setActiveObject(active);
            setSelectedObject(active);
          },
          undo: () => {
            moveObjectToIndex(canvas, active, prevIndex);
            canvas.setActiveObject(active);
            setSelectedObject(active);
          },
        });
        setSnackbar({ open: true, message: "Object moved backward", severity: "success" });
        break;
      }

      case "bringToFront": {
        if (!canvasInstance || !manager) break;
        const canvas = canvasInstance;
        if (!active) {
          setSnackbar({ open: true, message: "Select an object first", severity: "info" });
          break;
        }

        const objects = canvas.getObjects();
        const prevIndex = objects.indexOf(active);
        if (prevIndex === -1) break;

        const newIndex = objects.length - 1;
        if (prevIndex === newIndex) {
          setSnackbar({ open: true, message: "Object is already at the front", severity: "info" });
          break;
        }

        manager.execute({
          do: () => {
            moveObjectToIndex(canvas, active, newIndex);
            canvas.setActiveObject(active);
            setSelectedObject(active);
          },
          undo: () => {
            moveObjectToIndex(canvas, active, prevIndex);
            canvas.setActiveObject(active);
            setSelectedObject(active);
          },
        });
        setSnackbar({ open: true, message: "Object brought to front", severity: "success" });
        break;
      }

      case "sendToBack": {
        if (!canvasInstance || !manager) break;
        const canvas = canvasInstance;
        if (!active) {
          setSnackbar({ open: true, message: "Select an object first", severity: "info" });
          break;
        }

        const objects = canvas.getObjects();
        const prevIndex = objects.indexOf(active);
        if (prevIndex === -1) break;

        const newIndex = 0;
        if (prevIndex === newIndex) {
          setSnackbar({ open: true, message: "Object is already at the back", severity: "info" });
          break;
        }

        manager.execute({
          do: () => {
            moveObjectToIndex(canvas, active, newIndex);
            canvas.setActiveObject(active);
            setSelectedObject(active);
          },
          undo: () => {
            moveObjectToIndex(canvas, active, prevIndex);
            canvas.setActiveObject(active);
            setSelectedObject(active);
          },
        });
        setSnackbar({ open: true, message: "Object sent to back", severity: "success" });
        break;

      }
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
    if (!canvasInstance || !selectedObject || !manager) return;
    const canvasWidth = canvasInstance.getWidth();
    const canvasHeight = canvasInstance.getHeight();
    const objWidth = selectedObject.getScaledWidth();
    const objHeight = selectedObject.getScaledHeight();

    const prev = { left: selectedObject.left, top: selectedObject.top } as any;

    manager.execute({
      do: () => {
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
      },
      undo: () => {
        selectedObject.set(prev);
        canvasInstance.requestRenderAll();
      }
    });

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
      //  Check if user is typing in input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return; // Don't interfere with typing
      }

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

      //  DELETE KEY FIX
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const active = canvasInstance.getActiveObject();
        if (active) {
          canvasInstance.remove(active);
          canvasInstance.discardActiveObject();
          canvasInstance.requestRenderAll();
          setSelectedObject(null);
        }
        return;
      }

      if (e.ctrlKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        canvasInstance.discardActiveObject();

        const all = canvasInstance.getObjects();
        if (all.length > 0) {
          const sel = new fabric.ActiveSelection(all, { canvas: canvasInstance });
          canvasInstance.setActiveObject(sel);
        }

        canvasInstance.requestRenderAll();
        return;
      }
      // Copy
      if (e.ctrlKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        const active = canvasInstance.getActiveObject();
        if (active) {
          active.clone().then((cloned: fabric.Object) => {
            (window as any)._clipboard = cloned;
          });
        }
      }

      // Paste
      if (e.ctrlKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        const clipboard = (window as any)._clipboard;
        if (clipboard) {
          clipboard.clone().then((clonedObj: fabric.Object) => {
            clonedObj.set({
              left: (clonedObj.left ?? 0) + 20,
              top: (clonedObj.top ?? 0) + 20
            });
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




  useEffect(() => {
    if (activePageIndex >= 0 && pages[activePageIndex]) {
      const pageId = pages[activePageIndex].id;
      setCurrentPageForBg(pageId);

      // Update background color display
      const canvas = canvases.get(pageId);
      if (canvas) {
        setCurrentBgColor(canvas.backgroundColor || 'white');
      }
    }
  }, [activePageIndex, pages, canvases]);


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

  //new 
  const handleCanvasReady = (pageId: string, canvas: fabric.Canvas) => {
    console.log(`📝 Registering canvas for page: ${pageId}`);

    // ✅ CRITICAL: Check if canvas already exists for this page
    const existingCanvas = canvases.get(pageId);
    if (existingCanvas && existingCanvas !== canvas) {
      console.log(`⚠️ Duplicate canvas detected for ${pageId}, disposing old one`);
      try {
        // Mark as disposing
        (existingCanvas as any)._isDisposing = true;

        // Stop operations
        if ((existingCanvas as any).cancelRequestedRender) {
          (existingCanvas as any).cancelRequestedRender();
        }

        // Check if still valid
        if (existingCanvas.upperCanvasEl) {
          existingCanvas.off?.();
          existingCanvas.clear?.();

          setTimeout(() => {
            try {
              if (existingCanvas.dispose && existingCanvas.upperCanvasEl) {
                existingCanvas.dispose();
                console.log(`✅ Old canvas disposed for ${pageId}`);
              }
            } catch (e) {
              console.warn('Old canvas disposal warning:', e);
            }
          }, 50);
        }
      } catch (e) {
        console.warn('Existing canvas cleanup warning:', e);
      }
    }

    // Register new canvas
    setCanvases(prev => {
      const updated = new Map(prev);
      updated.set(pageId, canvas);
      return updated;
    });

    // Create command manager
    const mgr = new CommandManager(canvas);
    setManagers(prev => {
      const updated = new Map(prev);
      updated.set(pageId, mgr);
      return updated;
    });

    // Setup auto-save with delay
    setTimeout(() => {
      canvas.on('object:modified', () => triggerAutoSave(pageId));
      canvas.on('object:added', () => triggerAutoSave(pageId));
      canvas.on('object:removed', () => triggerAutoSave(pageId));
    }, 500);

    // Selection tracking
    canvas.on('selection:created', (e) => {
      if (e.selected && e.selected[0]) {
        setSelectedObject(e.selected[0]);
      }
    });

    canvas.on('selection:updated', (e) => {
      if (e.selected && e.selected[0]) {
        setSelectedObject(e.selected[0]);
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    console.log(`✅ Canvas registered for page: ${pageId}`);
  };

  // NEW: Auto-save with debounce
  const triggerAutoSave = (pageId: string) => {
    // FIX: Don't auto-save during template load
    if (isLoadingProject) {
      console.log('⏸Skipping auto-save during load');
      return;
    }

    if (autoSaveTimers.current[pageId]) {
      clearTimeout(autoSaveTimers.current[pageId]);
    }

    autoSaveTimers.current[pageId] = setTimeout(() => {
      savePageData(pageId);
    }, 1500);
  };

  //  NEW: Save individual page
  const savePageData = (pageId: string) => {
    const canvas = canvases.get(pageId);
    if (!canvas) return;

    const fabricJSON = canvas.toJSON();
    let thumbnail: string | null = null;

    try {
      thumbnail = canvas.toDataURL({
        format: 'png',
        quality: 0.5,
        multiplier: 0.25
      });
    } catch (err) {
      console.warn('Thumbnail generation failed:', err);
    }

    setPages(prev => prev.map(p =>
      p.id === pageId
        ? { ...p, fabricJSON, thumbnail }
        : p
    ));

    console.log(`Auto-saved page: ${pageId}`);
  };

  //  NEW: Update page (called from PageCanvas)
  const handlePageUpdate = (pageId: string) => {
    triggerAutoSave(pageId);
  };
  const handleAddPage = () => {
    const newPage: PageItem = {
      id: uuidv4(),
      name: `Page ${pages.length + 1}`,
      fabricJSON: {
        version: "5.3.0",
        objects: [],
        background: "white",
        width: canvasSize.width,
        height: canvasSize.height,
      },
      thumbnail: null,
      locked: false,
    };

    // FIX: Add page and wait for React to render
    setPages(prev => {
      const copy = [...prev];
      copy.splice(activePageIndex + 1, 0, newPage);
      return copy;
    });

    // Wait for render, then activate
    setTimeout(() => {
      setActivePageIndex(activePageIndex + 1);
      setActivePageId(newPage.id);
      console.log(` Added page ${activePageIndex + 2}`);
    }, 100);
  };

  // UPDATED: Duplicate page
  const handleDuplicatePage = (index: number) => {
    const source = pages[index];
    const canvas = canvases.get(source.id);

    let fabricJSON = source.fabricJSON;
    if (canvas) {
      fabricJSON = canvas.toJSON();
    }

    const copyPage: PageItem = {
      id: uuidv4(),
      name: `${source.name} (copy)`,
      fabricJSON: fabricJSON ? JSON.parse(JSON.stringify(fabricJSON)) : null,
      thumbnail: source.thumbnail,
      locked: false,
    };

    setPages(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, copyPage);
      return copy;
    });

    setActivePageIndex(index + 1);
    console.log(`Duplicated page ${index + 1}`);
  };

  //  UPDATED: Delete page
  const handleDeletePage = (index: number) => {
    if (pages.length === 1) {
      alert("Cannot delete the last page!");
      return;
    }

    if (!confirm(`Delete page ${index + 1}? This cannot be undone.`)) return;

    const pageId = pages[index].id;
    const canvas = canvases.get(pageId);

    // Dispose canvas and manager
    if (canvas) {
      canvas.dispose();
      setCanvases(prev => {
        const updated = new Map(prev);
        updated.delete(pageId);
        return updated;
      });
    }

    setManagers(prev => {
      const updated = new Map(prev);
      updated.delete(pageId);
      return updated;
    });

    setPages(prev => prev.filter((_, i) => i !== index));

    // Adjust active index
    if (activePageIndex >= index) {
      setActivePageIndex(Math.max(0, activePageIndex - 1));
    }

    console.log(`Deleted page ${index + 1}`);
  };

  //  UPDATED: Toggle lock
  const handleToggleLockPage = (index: number) => {
    setPages(prev => prev.map((p, i) =>
      i === index ? { ...p, locked: !p.locked } : p
    ));

    console.log(` Toggled lock for page ${index + 1}`);
  };

  //   const handleSave = async () => {
  //   if (!user) return;

  //   if (!templateName.trim()) {
  //     setSnackbar({
  //       open: true,
  //       message: "Please enter a template name",
  //       severity: "error",
  //     });
  //     return;
  //   }

  //   setSaving(true);

  //   try {
  //     console.log(`💾 Saving project with ${pages.length} pages...`);

  //     // ✅ Save all canvases WITH SVG METADATA
  //     const pagesPayload = await Promise.all(
  //       pages.map(async (page) => {
  //         const canvas = canvases.get(page.id);

  //         let fabricJSON = page.fabricJSON;
  //         let thumbnail = page.thumbnail;

  //         // Get fresh data from canvas
  //         if (canvas) {
  //           fabricJSON = canvas.toJSON();

  //           // ✅ PRESERVE SVG METADATA before saving
  //           const canvasObjects = canvas.getObjects();
  //           canvasObjects.forEach((obj: any, idx: number) => {
  //             if (fabricJSON.objects[idx] && obj.isEditableSVG) {
  //               console.log(`💾 Preserving SVG metadata for object ${idx}`);

  //               fabricJSON.objects[idx].isEditableSVG = true;
  //               fabricJSON.objects[idx].svgPaths = obj.svgPaths;

  //               // Preserve editableFill for each path
  //               if (obj.svgPaths && Array.isArray(obj.svgPaths)) {
  //                 obj.svgPaths.forEach((path: any, pathIdx: number) => {
  //                   if (fabricJSON.objects[idx].objects && fabricJSON.objects[idx].objects[pathIdx]) {
  //                     fabricJSON.objects[idx].objects[pathIdx].editableFill = path.fill;
  //                   }
  //                 });
  //               }
  //             }
  //           });

  //           console.log(`📄 Page ${page.name}: ${fabricJSON?.objects?.length || 0} objects`);

  //           try {
  //             thumbnail = canvas.toDataURL({
  //               format: 'png',
  //               quality: 0.5,
  //               multiplier: 0.25
  //             });
  //           } catch (err) {
  //             console.warn(`⚠️ Failed to generate thumbnail for ${page.name}`);
  //           }
  //         } else {
  //           console.warn(`⚠️ No canvas for page ${page.name}, using stored data`);
  //         }

  //         // Ensure valid fabricJSON
  //         if (!fabricJSON || typeof fabricJSON !== 'object') {
  //           fabricJSON = {
  //             version: "5.3.0",
  //             objects: [],
  //             background: "white",
  //             width: canvasSize.width,
  //             height: canvasSize.height,
  //           };
  //         }

  //         if (!fabricJSON.width) fabricJSON.width = canvasSize.width;
  //         if (!fabricJSON.height) fabricJSON.height = canvasSize.height;

  //         return {
  //           id: page.id,
  //           name: page.name,
  //           fabricJSON: fabricJSON,
  //           thumbnail: thumbnail,
  //           locked: page.locked || false,
  //         };
  //       })
  //     );

  //     // Verify data
  //     console.log(`✅ Prepared ${pagesPayload.length} pages for save:`);
  //     pagesPayload.forEach((p, i) => {
  //       console.log(`Page ${i + 1}: ${p.fabricJSON?.objects?.length || 0} objects`);
  //     });

  //     const canvasData: any = {
  //       name: templateName,
  //       category: isAdmin ? (templateCategory || undefined) : undefined,
  //       size: canvasSize,
  //       pages: pagesPayload,
  //       thumbnail: pagesPayload[0]?.thumbnail,
  //     };

  //     // API calls (rest same as before)
  //     if (isAdmin) {
  //       if (currentTemplateId && isEditingTemplate) {
  //         await templateApi.updateTemplate(currentTemplateId, canvasData);
  //         setSnackbar({
  //           open: true,
  //           message: "Template updated successfully!",
  //           severity: "success"
  //         });
  //       } else {
  //         const response = await templateApi.createTemplate(canvasData);
  //         setCurrentTemplateId(response.id);
  //         setIsEditingTemplate(true);
  //         setSnackbar({
  //           open: true,
  //           message: "Template created successfully!",
  //           severity: "success"
  //         });
  //       }
  //     } else {
  //       if (baseAdminTemplateId && !isEditingTemplate) {
  //         const copiedTemplate = await templateApi.copyTemplateToMyProjects(baseAdminTemplateId);
  //         const updatedTemplate = await templateApi.updateUserTemplate(copiedTemplate.id, canvasData);
  //         setCurrentTemplateId(updatedTemplate.id);
  //         setIsEditingTemplate(true);
  //         setBaseAdminTemplateId(null);
  //         setSnackbar({
  //           open: true,
  //           message: "Template copied and saved!",
  //           severity: "success"
  //         });
  //       } else if (currentTemplateId && isEditingTemplate) {
  //         await templateApi.updateUserTemplate(currentTemplateId, canvasData);
  //         setSnackbar({
  //           open: true,
  //           message: "Project updated successfully!",
  //           severity: "success"
  //         });
  //       } else {
  //         const response = await templateApi.createUserTemplate({
  //           ...canvasData,
  //           baseTemplateId: undefined,
  //         });
  //         setCurrentTemplateId(response.id);
  //         setIsEditingTemplate(true);
  //         setSnackbar({
  //           open: true,
  //           message: "Project saved successfully!",
  //           severity: "success"
  //         });
  //       }
  //     }

  //     setSaveDialogOpen(false);
  //     window.dispatchEvent(new Event('refreshProjects'));
  //     window.dispatchEvent(new Event('refreshTemplates'));

  //   } catch (error: any) {
  //     console.error('❌ Save error:', error);
  //     setSnackbar({
  //       open: true,
  //       message: error?.response?.data?.message || "Save failed. Check console.",
  //       severity: "error"
  //     });
  //   } finally {
  //     setSaving(false);
  //   }
  // };





  const handleSave = async () => {
    if (!user) return;

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
      console.log(`💾 Saving project with ${pages.length} pages...`);

      // ✅ Check if template name already exists
      const existingTemplates = isAdmin
        ? await templateApi.getAllTemplates()
        : await templateApi.getMyTemplates();

      const duplicateTemplate = existingTemplates.find(
        (t: any) =>
          t.name.toLowerCase() === templateName.toLowerCase() &&
          t.id !== currentTemplateId
      );

      // ✅ Show confirmation dialog if duplicate found
      if (duplicateTemplate && !isEditingTemplate) {
        const userConfirmed = window.confirm(
          `⚠️ Template "${templateName}" already exists!\n\n` +
          `Do you want to replace it?\n\n` +
          `Click OK to replace, or Cancel to keep both.`
        );

        if (!userConfirmed) {
          setSaving(false);
          setSnackbar({
            open: true,
            message: "Save cancelled by user",
            severity: "info",
          });
          return;
        }

        // Delete existing template
        if (isAdmin) {
          await templateApi.deleteTemplate(duplicateTemplate.id);
        } else {
          await templateApi.deleteUserTemplate(duplicateTemplate.id);
        }

        console.log(`Deleted existing template: ${duplicateTemplate.name}`);
      }

      // Save all canvases WITH SVG METADATA (existing code continues...)
      const pagesPayload = await Promise.all(
        pages.map(async (page) => {
          const canvas = canvases.get(page.id);

          let fabricJSON = page.fabricJSON;
          let thumbnail = page.thumbnail;

          if (canvas) {
            fabricJSON = canvas.toJSON();

            // Preserve SVG metadata
            const canvasObjects = canvas.getObjects();
            canvasObjects.forEach((obj: any, idx: number) => {
              if (fabricJSON.objects[idx] && obj.isEditableSVG) {
                console.log(`💾 Preserving SVG metadata for object ${idx}`);

                fabricJSON.objects[idx].isEditableSVG = true;
                fabricJSON.objects[idx].svgPaths = obj.svgPaths;

                if (obj.svgPaths && Array.isArray(obj.svgPaths)) {
                  obj.svgPaths.forEach((path: any, pathIdx: number) => {
                    if (fabricJSON.objects[idx].objects && fabricJSON.objects[idx].objects[pathIdx]) {
                      fabricJSON.objects[idx].objects[pathIdx].editableFill = path.fill;
                    }
                  });
                }
              }
            });

            console.log(`📄 Page ${page.name}: ${fabricJSON?.objects?.length || 0} objects`);

            try {
              thumbnail = canvas.toDataURL({
                format: 'png',
                quality: 0.5,
                multiplier: 0.25
              });
            } catch (err) {
              console.warn(`⚠️ Failed to generate thumbnail for ${page.name}`);
            }
          }

          if (!fabricJSON || typeof fabricJSON !== 'object') {
            fabricJSON = {
              version: "5.3.0",
              objects: [],
              background: "white",
              width: canvasSize.width,
              height: canvasSize.height,
            };
          }

          if (!fabricJSON.width) fabricJSON.width = canvasSize.width;
          if (!fabricJSON.height) fabricJSON.height = canvasSize.height;

          return {
            id: page.id,
            name: page.name,
            fabricJSON: fabricJSON,
            thumbnail: thumbnail,
            locked: page.locked || false,
          };
        })
      );

      console.log(`✅ Prepared ${pagesPayload.length} pages for save`);

      const canvasData: any = {
        name: templateName,
        category: isAdmin ? (templateCategory.toLowerCase() || undefined) : undefined, // ✅ Save in lowercase
        size: canvasSize,
        pages: pagesPayload,
        thumbnail: pagesPayload[0]?.thumbnail,
      };

      // API calls
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
            message: duplicateTemplate
              ? "Template replaced successfully!"
              : "Template created successfully!",
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
            message: "Template copied and saved!",
            severity: "success"
          });
        } else if (currentTemplateId && isEditingTemplate) {
          await templateApi.updateUserTemplate(currentTemplateId, canvasData);
          setSnackbar({
            open: true,
            message: "Project updated successfully!",
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
            message: duplicateTemplate
              ? "Project replaced successfully!"
              : "Project saved successfully!",
            severity: "success"
          });
        }
      }

      setSaveDialogOpen(false);
      window.dispatchEvent(new Event('refreshProjects'));
      window.dispatchEvent(new Event('refreshTemplates'));

    } catch (error: any) {
      console.error('❌ Save error:', error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Save failed. Check console.",
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
    if (confirm("Create a new blank template? Unsaved changes will be lost.")) {
      // FIXED: Safe disposal of all canvases
      canvases.forEach((canvas, pageId) => {
        try {
          console.log(` Disposing canvas: ${pageId}`);

          // Check if canvas elements exist
          if (canvas.upperCanvasEl) {
            canvas.off(); // Remove all listeners
          }

          canvas.clear(); // Clear objects

          if (canvas.dispose) {
            canvas.dispose(); // Dispose canvas
          }
        } catch (error) {
          console.warn(`Canvas disposal warning for ${pageId}:`, error);
        }
      });

      setCanvases(new Map());
      setManagers(new Map());

      // Reset to single blank page
      const blankPage: PageItem = {
        id: uuidv4(),
        name: "Page 1",
        fabricJSON: {
          version: "5.3.0",
          objects: [],
          background: "white",
          width: canvasSize.width,
          height: canvasSize.height,
        },
        thumbnail: null,
        locked: false
      };

      setPages([blankPage]);
      setActivePageIndex(0);
      setActivePageId(blankPage.id);
      setCurrentTemplateId(null);
      setTemplateName("");
      setIsEditingTemplate(false);
      setSelectedObject(null);
      setContextMenu(null);

      setSnackbar({
        open: true,
        message: "New blank canvas created",
        severity: "success",
      });
    }
  };

  //  FIXED: Handlers with SVG double-click and background image support
  const handlers = {
    onAddText: (textConfig?: {
      text: string;
      fontSize: number;
      fontWeight: string | number;
      fontFamily?: string;
    }) => {
      const canvas = canvases.get(pages[activePageIndex]?.id);
      if (!canvas) {
        console.warn('No active canvas');
        return;
      }

      const config = textConfig || {
        text: "New Text",
        fontSize: 32,
        fontWeight: "normal",
        fontFamily: "Inter",
      };

      // Font loading logic (keep existing)
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

        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        canvas.requestRenderAll();
        setSelectedObject(textbox);
        setPropertyTab("text");
      }, config.fontFamily && config.fontFamily !== "Inter" ? 300 : 0);
    },

    onAddUpload: (data: any) => {
      const canvas = canvases.get(pages[activePageIndex]?.id);
      if (!canvas) {
        console.warn('No active canvas');
        return;
      }

      // FIXED SVG UPLOAD
      if (data.type === "svg") {
        fabric.loadSVGFromString(data.data).then(({ objects, options }) => {
          const validObjects = objects.filter((obj): obj is fabric.FabricObject => obj !== null);

          if (validObjects.length === 0) {
            console.error('No valid SVG objects found');
            setSnackbar({
              open: true,
              message: "SVG ke andar koi objects nahi hain",
              severity: "error"
            });
            return;
          }

          // Store original colors
          const colorMap = new Map<string, number>();
          validObjects.forEach((obj, idx) => {
            const fill = obj.fill;
            if (fill && typeof fill === 'string' && fill !== 'none' && fill !== 'transparent') {
              if (!colorMap.has(fill)) {
                colorMap.set(fill, idx);
              }
            }
          });

          const svgGroup = fabric.util.groupSVGElements(validObjects, options);

          // Mark as editable SVG
          (svgGroup as any).isEditableSVG = true;
          (svgGroup as any).svgPaths = validObjects;
          (svgGroup as any).svgColorMap = colorMap;
          (svgGroup as any).originalColors = new Map(colorMap);

          // Scale if too large
          const maxWidth = canvas.width! * 0.5;
          const maxHeight = canvas.height! * 0.5;

          if (svgGroup.width! > maxWidth || svgGroup.height! > maxHeight) {
            const scale = Math.min(maxWidth / svgGroup.width!, maxHeight / svgGroup.height!);
            svgGroup.scale(scale);
          }

          // Center on canvas
          svgGroup.set({
            left: (canvas.width! - svgGroup.getScaledWidth()) / 2,
            top: (canvas.height! - svgGroup.getScaledHeight()) / 2,
          });

          canvas.add(svgGroup);
          canvas.setActiveObject(svgGroup);
          canvas.requestRenderAll();
          setSelectedObject(svgGroup);

        }).catch((error) => {
          console.error('Failed to load SVG:', error);
          setSnackbar({
            open: true,
            message: "SVG load nahi hua",
            severity: "error"
          });
        });
        return;
      }

      // Handle images
      if (data.type === "ADD_IMAGE") {
        fabric.Image.fromURL(data.src, { crossOrigin: 'anonymous' }).then((img) => {
          const canvasWidth = canvas.width!;
          const canvasHeight = canvas.height!;

          if (data.isBackground) {
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

            canvas.add(img);
            const objs = canvas.getObjects();
            const imgIndex = objs.indexOf(img);
            if (imgIndex > -1) {
              objs.splice(imgIndex, 1);
              objs.unshift(img);
              canvas.renderAll();
            }
            setSelectedObject(null);
          } else {
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
            canvas.add(img);
            canvas.setActiveObject(img);
            setSelectedObject(img);
          }
          canvas.requestRenderAll();
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
        const template = payload.template;

        console.log('📂 Loading template:', template.name);

        // ✅ Set loading state
        setIsLoadingProject(true);

        // ✅ Small delay to let React process state
        setTimeout(() => {
          const newSize = {
            width: template.size?.width || 800,
            height: template.size?.height || 600
          };

          console.log('📐 New canvas size:', newSize);
          setCanvasSize(newSize);

          // ✅ CRITICAL: Clear references FIRST
          setSelectedObject(null);
          setContextMenu(null);

          // ✅ Safe disposal with proper checks
          const canvasArray = Array.from(canvases.entries());

          canvasArray.forEach(([pageId, canvas]) => {
            try {
              console.log(`🗑️ Disposing canvas: ${pageId}`);

              // ✅ CRITICAL: Mark as disposing first
              (canvas as any)._isDisposing = true;

              // ✅ Stop pending renders
              if ((canvas as any).cancelRequestedRender) {
                (canvas as any).cancelRequestedRender();
              }

              // Check if already disposed - check ALL canvas elements
              const isDisposed = !canvas.upperCanvasEl ||
                !canvas.lowerCanvasEl ||
                !canvas.wrapperEl;

              if (isDisposed) {
                console.log(`⏭️ Canvas ${pageId} already disposed`);
                return;
              }

              // Discard selection
              try {
                canvas.discardActiveObject?.();
              } catch (e) { }

              // Remove listeners
              try {
                canvas.off?.();
              } catch (e) { }

              // Remove objects
              try {
                const objects = canvas.getObjects?.() || [];
                objects.slice().forEach(obj => {
                  try {
                    if (canvas.upperCanvasEl) {
                      canvas.remove(obj);
                    }
                  } catch (e) { }
                });
              } catch (e) { }

              // Clear
              try {
                if (canvas.upperCanvasEl && canvas.clear) {
                  canvas.clear();
                }
              } catch (e) { }

              // ✅ Delay disposal
              setTimeout(() => {
                try {
                  if (canvas.dispose && canvas.upperCanvasEl) {
                    canvas.dispose();
                    console.log(`✅ Canvas ${pageId} disposed`);
                  }
                } catch (e) { }
              }, 50);

            } catch (error) {
              console.warn(`⚠️ Canvas disposal error for ${pageId}:`, error);
            }
          });

          // ✅ Clear maps after starting all disposals
          setTimeout(() => {
            setCanvases(new Map());
            setManagers(new Map());
            console.log('✅ All canvas references cleared');
          }, 100);
          // ✅ Parse template pages
          let templatePages = template.pages;

          if (!templatePages && template.elements) {
            console.log('🔄 Converting old format');
            templatePages = [{
              id: uuidv4(),
              name: 'Page 1',
              fabricJSON: template.elements,
              thumbnail: template.thumbnail,
              locked: false
            }];
          }

          const loadedPages: PageItem[] = [];

          if (templatePages && Array.isArray(templatePages) && templatePages.length > 0) {
            templatePages.forEach((pg: any, i: number) => {
              let fabricJSON = pg.fabricJSON || pg.json;

              if (typeof fabricJSON === 'string') {
                try {
                  fabricJSON = JSON.parse(fabricJSON);
                } catch (e) {
                  console.error(`❌ Parse error page ${i}:`, e);
                  fabricJSON = null;
                }
              }

              if (!fabricJSON || typeof fabricJSON !== 'object') {
                fabricJSON = {
                  version: "5.3.0",
                  objects: [],
                  background: "white",
                  width: newSize.width,
                  height: newSize.height,
                };
              }

              if (!fabricJSON.objects || !Array.isArray(fabricJSON.objects)) {
                fabricJSON.objects = [];
              }

              // Restore SVG editability
              if (fabricJSON.objects.length > 0) {
                fabricJSON.objects.forEach((obj: any) => {
                  if (obj.type === 'group' && obj.objects && Array.isArray(obj.objects)) {
                    const pathObjects = obj.objects.filter((child: any) =>
                      ['path', 'path-group', 'polygon', 'polyline'].includes(child.type)
                    );

                    if (pathObjects.length > 0) {
                      obj.isEditableSVG = true;
                      obj.svgPaths = pathObjects;

                      pathObjects.forEach((path: any) => {
                        path.isEditableSVG = true;
                        path.svgPaths = pathObjects;
                        if (path.editableFill) {
                          path.fill = path.editableFill;
                        }
                      });
                    }
                  }
                });
              }

              if (!fabricJSON.width) fabricJSON.width = newSize.width;
              if (!fabricJSON.height) fabricJSON.height = newSize.height;

              loadedPages.push({
                id: pg.id || uuidv4(),
                name: pg.name || `Page ${i + 1}`,
                fabricJSON: fabricJSON,
                thumbnail: pg.thumbnail || null,
                locked: !!pg.locked,
              });
            });
          } else {
            loadedPages.push({
              id: uuidv4(),
              name: "Page 1",
              fabricJSON: {
                version: "5.3.0",
                objects: [],
                background: "white",
                width: newSize.width,
                height: newSize.height,
              },
              thumbnail: null,
              locked: false,
            });
          }

          console.log(`✅ Prepared ${loadedPages.length} pages`);

          // ✅ Set new state with proper delay
          // ✅ CRITICAL: Generate completely new page IDs to force React re-mount
          const freshPages = loadedPages.map(pg => ({
            ...pg,
            id: `${pg.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Unique ID
          }));

          console.log(`✅ Prepared ${freshPages.length} pages with fresh IDs`);

          setTimeout(() => {
            // ✅ Set fresh pages with unique IDs
            setPages(freshPages);
            setActivePageIndex(0);
            setActivePageId(freshPages[0]?.id || null);
            setBaseAdminTemplateId(template.createdBy && !template.userId ? template.id : null);
            setCurrentTemplateId(template.userId ? template.id : null);
            setTemplateName(template.name || "");
            setIsEditingTemplate(!!template.userId);
            setActiveCategory(null);

            console.log('✅ Pages state updated with fresh IDs');

            setSnackbar({
              open: true,
              message: `Template "${template.name}" loaded`,
              severity: "success"
            });

            // ✅ Wait longer for all pages to fully mount and render
            setTimeout(() => {
              setIsLoadingProject(false);
              console.log('✅ Template loading complete');

              // ✅ Force render on all canvases after load complete
              setTimeout(() => {
                canvases.forEach((canvas, pageId) => {
                  if (canvas && canvas.requestRenderAll) {
                    console.log(`🎨 Force rendering canvas: ${pageId}`);
                    canvas.requestRenderAll();
                  }
                });
                console.log('🎨 All canvases force rendered');
              }, 500);

            }, 800);
          }, 250);
        }, 150);

        return;
      } else {
        setAction({ type: "ADD_SHAPE", payload });
      }
    },
    onDelete: () => {
      if (!canvasInstance) return;
      const active = canvasInstance.getActiveObject();
      if (active) {
        canvasInstance.remove(active); // Tracked by CommandManager via object:removed
        canvasInstance.requestRenderAll();
      }
    },
    onUndo: () => { if (manager) manager.undo(); },
    onRedo: () => { if (manager) manager.redo(); },
    onClear: () => {
      if (!canvasInstance || !manager) return;
      const prevJSON = canvasInstance.toJSON();
      manager.execute({
        do: () => {
          // Remove all objects without disposing the canvas
          const objs = canvasInstance.getObjects().slice();
          objs.forEach(o => canvasInstance.remove(o));
          canvasInstance.discardActiveObject();
          canvasInstance.requestRenderAll();
        },
        undo: () => {
          canvasInstance.loadFromJSON(prevJSON, () => {
            canvasInstance.requestRenderAll();
          });
        }
      });
    },
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
      colorType: typeof color === 'object' ? (color.type || 'hex') : 'string',
      isEditableSVG,
      selectedObjectType: selectedObject.type,
      color: typeof color === 'object' ? color : color
    });

    // ========== SVG GRADIENT APPLICATION ==========
    if (isEditableSVG && type === 'fill' && typeof color === 'object' && color.type) {
      const svgPaths = (selectedObject as any).svgPaths || [];
      const oldColor = colorPickerColor;

      console.log('🌈 SVG Gradient Apply:', {
        pathCount: svgPaths.length,
        gradientType: color.type,
        colorStops: color.colorStops
      });

      if (!svgPaths || svgPaths.length === 0) {
        console.error('No SVG paths found');
        return;
      }

      // Get SVG GROUP dimensions (not individual paths)
      const group = selectedObject as fabric.Group;
      const groupWidth = (group.width || 100) * (group.scaleX || 1);
      const groupHeight = (group.height || 100) * (group.scaleY || 1);

      console.log('SVG Group Dimensions:', { groupWidth, groupHeight });

      manager.execute({
        do: () => {
          svgPaths.forEach((path: any, idx: number) => {
            try {
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
                //  CRITICAL: Correct positioning
                offsetX: -groupWidth / 2,
                offsetY: -groupHeight / 2
              });

              path.set('fill', gradient);
              (path as any).editableFill = 'gradient';

              console.log(` Path ${idx} gradient applied`);
            } catch (err) {
              console.error(` Path ${idx} gradient failed:`, err);
            }
          });

          canvasInstance.requestRenderAll();

          setSnackbar({
            open: true,
            message: 'Gradient applied to SVG',
            severity: 'success'
          });
        },
        undo: () => {
          svgPaths.forEach((path: any) => {
            if ((path as any).editableFill === 'gradient') {
              path.set('fill', oldColor);
              (path as any).editableFill = oldColor;
            }
          });
          canvasInstance.requestRenderAll();
        }
      });

      return;
    }

    // ========== SVG SOLID COLOR CHANGE ==========
    // if (isEditableSVG && type === 'fill') {
    //   const svgPaths = (selectedObject as any).svgPaths || [];

    //   console.log('🖌️ SVG Solid Color Update:', {
    //     oldColor: colorPickerColor,
    //     newColor: typeof color === 'object' ? color.hex : color,
    //     pathCount: svgPaths.length
    //   });

    //   if (!svgPaths || svgPaths.length === 0) {
    //     console.error('❌ No SVG paths found');
    //     return;
    //   }

    //   // ✅ SAFE COLOR NORMALIZATION
    //   const normalizeColor = (c: any): string => {
    //     if (!c) return '';
    //     if (typeof c === 'string') {
    //       return c.toLowerCase().replace(/\s/g, '').replace(/#/g, '');
    //     }
    //     if (typeof c === 'object' && c.type) {
    //       return 'gradient';
    //     }
    //     return String(c).toLowerCase().replace(/\s/g, '').replace(/#/g, '');
    //   };

    //   const newColor = typeof color === 'object' ? (color.hex || color) : color;
    //   const oldColor = colorPickerColor;

    //   manager.execute({
    //     do: () => {
    //       let changedCount = 0;
    //       const oldNorm = normalizeColor(oldColor);

    //       svgPaths.forEach((path: any, idx: number) => {
    //         const pathFill = path.fill;
    //         const pathNorm = normalizeColor(pathFill);

    //         // ✅ Match with normalized colors
    //         if (pathNorm === oldNorm) {
    //           path.set('fill', newColor);
    //           (path as any).editableFill = newColor;
    //           changedCount++;
    //           console.log(`✅ Changed path ${idx}: ${pathFill} → ${newColor}`);
    //         }
    //       });

    //       console.log(`✅ Total paths changed: ${changedCount}`);

    //       // ✅ Update color picker state
    //       setColorPickerColor(newColor);

    //       canvasInstance.requestRenderAll();
    //     },
    //     undo: () => {
    //       const newNorm = normalizeColor(newColor);

    //       svgPaths.forEach((path: any) => {
    //         const pathNorm = normalizeColor(path.fill);
    //         if (pathNorm === newNorm) {
    //           path.set('fill', oldColor);
    //           (path as any).editableFill = oldColor;
    //         }
    //       });

    //       setColorPickerColor(oldColor);
    //       canvasInstance.requestRenderAll();
    //     }
    //   });

    //   return;
    // }


    // FIXED: SVG Color Change with editableFill tracking
    if (isEditableSVG && type === 'fill') {
      const svgPaths = (selectedObject as any).svgPaths || [];

      console.log('Canva-style SVG Color Change:', {
        oldColor: colorPickerColor,
        newColor: typeof color === 'object' ? color.hex : color,
        totalPaths: svgPaths.length
      });

      if (!svgPaths || svgPaths.length === 0) {
        console.error('No SVG paths found');
        return;
      }

      const newColor = typeof color === 'object' ? (color.hex || color) : color;

      // ENHANCED: Color normalization with RGB support
      const normalizeColor = (c: any): string => {
        if (!c) return '';

        let colorStr = '';
        if (typeof c === 'string') {
          colorStr = c;
        } else if (typeof c === 'object' && c.hex) {
          colorStr = c.hex;
        } else {
          colorStr = String(c);
        }

        // Handle rgb/rgba format
        if (colorStr.startsWith('rgb')) {
          const matches = colorStr.match(/\d+/g);
          if (matches && matches.length >= 3) {
            const r = parseInt(matches[0]).toString(16).padStart(2, '0');
            const g = parseInt(matches[1]).toString(16).padStart(2, '0');
            const b = parseInt(matches[2]).toString(16).padStart(2, '0');
            return `${r}${g}${b}`.toLowerCase();
          }
        }

        return colorStr.toLowerCase().replace(/\s/g, '').replace(/#/g, '');
      };

      const oldColorNorm = normalizeColor(colorPickerColor);
      const pathsToChange: any[] = [];

      console.log(` Finding ALL elements with color: ${colorPickerColor} → ${oldColorNorm}`);

      // CRITICAL: Check ALL paths and collect matches
      for (let i = 0; i < svgPaths.length; i++) {
        const path = svgPaths[i];

        if (path && typeof path.set === 'function') {
          const pathEditableColor = (path as any).editableFill;
          const pathFillColor = path.fill;

          const editableNorm = normalizeColor(pathEditableColor);
          const fillNorm = normalizeColor(pathFillColor);

          console.log(`  Path ${i}:`, {
            editableFill: pathEditableColor,
            fill: pathFillColor,
            editableNorm,
            fillNorm,
            targetNorm: oldColorNorm
          });

          // Match against EITHER editableFill OR fill (handles saved templates)
          if (editableNorm === oldColorNorm || fillNorm === oldColorNorm) {
            pathsToChange.push({
              path: path,
              index: i,
              oldColor: pathEditableColor || pathFillColor
            });
            console.log(`MATCH! Path ${i}`);
          } else {
            console.log(`Skip path ${i}`);
          }
        }
      }

      if (pathsToChange.length === 0) {
        console.warn('No paths with matching color');

        const availableColors = [...new Set(
          svgPaths
            .map((p: any) => (p as any).editableFill || p.fill)
            .filter((c: any) => c && c !== 'none' && c !== 'transparent')
        )].slice(0, 5);

        console.log('Available colors:', availableColors);

        setSnackbar({
          open: true,
          message: `No elements with ${colorPickerColor}. Found: ${availableColors.join(', ')}`,
          severity: 'info'
        });
        return;
      }

      console.log(`Found ${pathsToChange.length}/${svgPaths.length} matching paths`);

      // Store old state with full info
      const oldPathData: any[] = pathsToChange.map((item: any) => ({
        path: item.path,
        fill: item.path.fill,
        editableFill: (item.path as any).editableFill,
        index: item.index
      }));

      manager.execute({
        do: () => {
          let successCount = 0;

          pathsToChange.forEach((item: any) => {
            try {
              item.path.set({ fill: newColor });
              (item.path as any).editableFill = newColor;
              successCount++;
              console.log(`   Changed path ${item.index}: ${item.oldColor} → ${newColor}`);
            } catch (err) {
              console.error(`   Path ${item.index} error:`, err);
            }
          });

          setColorPickerColor(newColor);
          (selectedObject as any).dirty = true;
          canvasInstance.requestRenderAll();

          setSnackbar({
            open: true,
            message: `✅ Changed ${successCount} element(s): ${colorPickerColor} → ${newColor}`,
            severity: 'success'
          });

          console.log(`🎉 Color change complete: ${successCount}/${pathsToChange.length} updated`);
        },

        undo: () => {
          let undoCount = 0;

          oldPathData.forEach((data: any) => {
            try {
              data.path.set({ fill: data.fill });
              (data.path as any).editableFill = data.editableFill;
              undoCount++;
            } catch (err) {
              console.error(' Undo error:', err);
            }
          });

          if (oldPathData.length > 0) {
            const restoredColor = oldPathData[0].editableFill || oldPathData[0].fill;
            setColorPickerColor(restoredColor);
          }

          (selectedObject as any).dirty = true;
          canvasInstance.requestRenderAll();

          setSnackbar({
            open: true,
            message: `↩️ Restored ${undoCount} element(s)`,
            severity: 'info'
          });

          console.log(`↩️ Undo complete: ${undoCount} elements restored`);
        }
      });

      return;
    }

    // ========== REGULAR SHAPES - GRADIENT ==========
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

      console.log('Regular Shape Gradient:', {
        objWidth,
        objHeight,
        gradientType: color.type
      });

      manager.execute({
        do: () => {
          (selectedObject as any).set('fill', gradient);
          (selectedObject as any).set('dirty', true);
          canvasInstance.requestRenderAll();
        },
        undo: () => {
          (selectedObject as any).set('fill', oldFill);
          (selectedObject as any).set('dirty', true);
          canvasInstance.requestRenderAll();
        }
      });
      return;
    }

    // ========== SOLID COLORS (Non-SVG) ==========
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
      // Handle gradient → solid color conversion
      const oldFill = (selectedObject as any)[type];
      const isCurrentlyGradient = oldFill && typeof oldFill === 'object' && oldFill.type;

      console.log('🎨 Solid Color Apply:', {
        type,
        newColor,
        wasGradient: isCurrentlyGradient
      });

      manager.execute({
        do: () => {
          (selectedObject as any).set(type, newColor);

          if (isCurrentlyGradient) {
            (selectedObject as any).set('dirty', true);
          }

          canvasInstance.requestRenderAll();
        },
        undo: () => {
          (selectedObject as any).set(type, oldFill);

          if (isCurrentlyGradient) {
            (selectedObject as any).set('dirty', true);
          }

          canvasInstance.requestRenderAll();
        }
      });
    }
  };


  //  Page Background Handler - NEW
  const handlePageBackgroundChange = (color: string | any) => {
    if (!currentPageForBg) return;

    const canvas = canvases.get(currentPageForBg);
    if (!canvas) return;

    console.log('Changing page background:', {
      pageId: currentPageForBg,
      colorType: typeof color
    });

    // Handle gradient
    if (typeof color === 'object' && color.type) {
      const canvasWidth = canvas.width || 800;
      const canvasHeight = canvas.height || 600;

      const gradient = new fabric.Gradient({
        type: color.type || 'linear',
        coords: color.type === 'radial'
          ? {
            x1: canvasWidth / 2,
            y1: canvasHeight / 2,
            x2: canvasWidth / 2,
            y2: canvasHeight / 2,
            r1: 0,
            r2: Math.min(canvasWidth, canvasHeight) / 2
          }
          : { x1: 0, y1: 0, x2: canvasWidth, y2: 0 },
        colorStops: color.colorStops || [
          { offset: 0, color: '#ff9a9e' },
          { offset: 1, color: '#fecfef' }
        ]
      });

      canvas.backgroundColor = gradient;
      console.log('Applied gradient background');
    } else {
      // Solid color
      const solidColor = typeof color === 'object' ? (color.hex || color) : color;
      canvas.backgroundColor = solidColor;
      console.log('Applied solid background:', solidColor);
    }

    canvas.requestRenderAll();

    // Update pages state
    setPages((prev) =>
      prev.map((p) =>
        p.id === currentPageForBg
          ? { ...p, fabricJSON: canvas.toJSON() }
          : p
      )
    );
  };

  // Get Current Page Background - NEW
  const getCurrentPageBackground = () => {
    if (!currentPageForBg) return 'white';
    const canvas = canvases.get(currentPageForBg);
    return canvas?.backgroundColor || 'white';
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
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f5f3ff" }}>
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
          onSelectProject={(projectData: any) => {
            console.log('Sidebar project selected:', projectData.name);

            //  Bas ek line!
            handlers.onAddShape({
              type: "LOAD_TEMPLATE",
              template: projectData
            });
          }}
        />

        <Box sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          gap: 3,
          py: 3,
          px: 2,
          height: "calc(100vh - 64px)",
          overflowY: "auto",
          overflowX: "hidden",
          backgroundColor: "#faf9fc"
        }}>
          {pages.map((page, index) => (
            <PageCanvas
              key={page.id}
              page={page}
              index={index}
              canvasSize={canvasSize}
              onCanvasReady={handleCanvasReady}
              onPageUpdate={handlePageUpdate}
              onDuplicate={handleDuplicatePage}
              onAddBelow={() => {
                setActivePageIndex(index);
                handleAddPage();
              }}
              onToggleLock={handleToggleLockPage}
              onDelete={handleDeletePage}
              totalPages={pages.length}
              isActive={index === activePageIndex}
              onSetActive={() => {
                setActivePageIndex(index);
                setActivePageId(page.id);
                console.log(` Active page: ${index + 1}`);
              }}
            />
          ))}

          {/* Add Page Button */}
          <Button
            variant="outlined"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => {
              setActivePageIndex(pages.length - 1);
              handleAddPage();
            }}
            sx={{
              borderColor: "#8b5cf6", 
              color: "#8b5cf6",
              borderWidth: 2,
              borderStyle: "dashed",
              py: 2,
              px: 4,
              mt: 2,
              fontSize: "16px",
              fontWeight: 600,
              backgroundColor: "rgba(139, 92, 246, 0.05)", 
              "&:hover": {
                borderColor: "#7c3aed", 
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                borderWidth: 2
              }
            }}
          >
            Add Page Below
          </Button>
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



        <ColorPicker
          isOpen={colorPickerOpen}
          onClose={() => {
            setColorPickerOpen(false);
            setColorPickerType(null);
            setCurrentPageForBg(null);
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

          // NEW PROPS for Page Background:
          showPageBackgroundOption={true}
          currentPageBackground={getCurrentPageBackground()}
          onPageBackgroundChange={handlePageBackgroundChange}
        />

        {/* My Projects Panel */}
        {activeCategory === "myprojects" && (
          <Box sx={{ width: 320, minWidth: 320, borderLeft: "1px solid #ddd" }}>
            <MyProjectsPanel
              onSelectProject={(projectData: any) => {
                console.log(' Project selected:', projectData.name);

                //  Simple - handlers.onAddShape use 
                handlers.onAddShape({
                  type: "LOAD_TEMPLATE",
                  template: projectData
                });
              }}
              onClose={() => setActiveCategory(null)}
            />
          </Box>
        )}
        {activeCategory === "templates" && (
          <Box sx={{ width: 320, minWidth: 320, borderLeft: "1px solid #ddd" }}>
            <TemplatePanel
              onTemplateSelect={(templateData: any) => {
                console.log('Template selected:', templateData.name);

                //  Simple - use handlers.onAddShape
                handlers.onAddShape({
                  type: "LOAD_TEMPLATE",
                  template: templateData
                });
              }}
              onClose={() => setActiveCategory(null)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CanvasEditor;
