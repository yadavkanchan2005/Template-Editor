"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import DeleteIcon from "@mui/icons-material/Delete";
import * as fabric from "fabric";

type PageItem = {
  id: string;
  name: string;
  fabricJSON: any | null;
  thumbnail: string | null;
  locked?: boolean;
};

interface PageCanvasProps {
  page: PageItem;
  index: number;
  canvasSize: { width: number; height: number };
  onCanvasReady: (pageId: string, canvas: fabric.Canvas) => void;
  onPageUpdate: (pageId: string) => void;
  onDuplicate: (index: number) => void;
  onAddBelow: (index: number) => void;
  onToggleLock: (index: number) => void;
  onDelete: (index: number) => void;
  totalPages: number;
  isActive: boolean;
  onSetActive: () => void;
}

const PageCanvas: React.FC<PageCanvasProps> = ({
  page,
  index,
  canvasSize,
  onCanvasReady,
  onPageUpdate,
  onDuplicate,
  onAddBelow,
  onToggleLock,
  onDelete,
  totalPages,
  isActive,
  onSetActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current || canvas) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: 'white',
      preserveObjectStacking: true,
    });

    // Load page content if exists
    if (page.fabricJSON) {
      let jsonData = page.fabricJSON;
      if (typeof jsonData === 'string') {
        try {
          jsonData = JSON.parse(jsonData);
        } catch (e) {
          console.error('Failed to parse fabricJSON:', e);
        }
      }

      fabricCanvas.loadFromJSON(jsonData, () => {
        if (jsonData.background) {
          fabricCanvas.backgroundColor = jsonData.background;
        }
        fabricCanvas.renderAll();
      });
    }

    // Apply lock state
    if (page.locked) {
      fabricCanvas.selection = false;
      fabricCanvas.getObjects().forEach((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
    }

    // Auto-save on changes
    fabricCanvas.on('object:modified', () => {
      onPageUpdate(page.id);
    });

    fabricCanvas.on('object:added', () => {
      onPageUpdate(page.id);
    });

    fabricCanvas.on('object:removed', () => {
      onPageUpdate(page.id);
    });

    setCanvas(fabricCanvas);
    onCanvasReady(page.id, fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Update lock state
  useEffect(() => {
    if (!canvas) return;
    
    canvas.selection = !page.locked;
    canvas.getObjects().forEach((obj) => {
      obj.selectable = !page.locked;
      obj.evented = !page.locked;
    });
    canvas.renderAll();
  }, [page.locked, canvas]);

  return (
    <Box
      onClick={onSetActive}
      sx={{
        width: "fit-content",
        position: "relative",
        mb: 4
      }}
    >
      {/* Page Controls */}
      <Box sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.95)",
        padding: "8px 12px",
        borderRadius: "8px 8px 0 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        width: canvasSize.width
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Page {index + 1} of {totalPages}
        </Typography>
        
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(index);
            }} 
            title="Duplicate page"
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
          
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onAddBelow(index);
            }} 
            title="Add page below"
          >
            <AddIcon fontSize="small" />
          </IconButton>
          
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock(index);
            }} 
            title={page.locked ? "Unlock page" : "Lock page"}
          >
            {page.locked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
          </IconButton>
          
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }} 
            title="Delete page"
            sx={{ color: "#ef4444" }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Canvas */}
      <Box
        sx={{
          position: "relative",
          border: isActive ? "3px solid #7c3aed" : "2px solid #e2e8f0",
          borderRadius: "0 0 8px 8px",
          overflow: "hidden",
          boxShadow: isActive 
            ? "0 8px 24px rgba(124,58,237,0.3)" 
            : "0 4px 12px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          cursor: "default",
          "&:hover": {
            border: isActive ? "3px solid #7c3aed" : "2px solid #a78bfa",
            boxShadow: "0 8px 20px rgba(124,58,237,0.2)"
          }
        }}
      >
        <canvas ref={canvasRef} />
        
        {page.locked && (
          <Box sx={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "6px 10px",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            pointerEvents: "none"
          }}>
            <LockIcon fontSize="small" />
            <Typography variant="caption">Locked</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageCanvas;