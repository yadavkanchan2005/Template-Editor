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
  const canvasInstanceRef = useRef<fabric.Canvas | null>(null); 
  const isInitialized = useRef(false);

  // FIX 1: Initialize canvas once per page
  useEffect(() => {
    if (!canvasRef.current || isInitialized.current) return;

    console.log(`Initializing canvas for page ${index + 1}`);

    try {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: 'white',
        preserveObjectStacking: true,
        renderOnAddRemove: true,
        enableRetinaScaling: true,
      });

      // Store reference
      canvasInstanceRef.current = fabricCanvas;
      isInitialized.current = true;
      
      setCanvas(fabricCanvas);
      onCanvasReady(page.id, fabricCanvas);

      console.log(` Canvas ready for page ${index + 1}`);

    } catch (error) {
      console.error(` Canvas init error for page ${index + 1}:`, error);
    }

    //  FIX: Safe cleanup
    return () => {
      console.log(`Cleaning up canvas for page ${index + 1}`);
      
      try {
        const fabricCanvas = canvasInstanceRef.current;
        
        if (fabricCanvas) {
          //  Check if canvas elements exist before cleanup
          if (fabricCanvas.upperCanvasEl) {
            fabricCanvas.off(); // Remove all event listeners
          }
          
          fabricCanvas.clear(); // Clear objects
          
          if (fabricCanvas.dispose) {
            fabricCanvas.dispose(); // Dispose canvas
          }
          
          canvasInstanceRef.current = null;
          isInitialized.current = false;
          console.log(`✅ Canvas disposed for page ${index + 1}`);
        }
      } catch (error) {
        console.warn(`Cleanup warning for page ${index + 1}:`, error);
        isInitialized.current = false;
      }
    };
  }, [page.id]); // Only re-run if page.id changes

  // FIX 2: Load content only when canvas is ready
  useEffect(() => {
    if (!canvas || !page.fabricJSON) return;

    console.log(` Loading content for page ${index + 1}`);

    let jsonData = page.fabricJSON;

    // Parse if string
    if (typeof jsonData === 'string') {
      try {
        jsonData = JSON.parse(jsonData);
      } catch (e) {
        console.error('Failed to parse fabricJSON:', e);
        return;
      }
    }

    // Validate
    if (!jsonData || typeof jsonData !== 'object') {
      console.warn('Invalid fabricJSON for page', index + 1);
      return;
    }

    try {
      canvas.loadFromJSON(jsonData, () => {
        // Set background
        if (jsonData.background) {
          canvas.backgroundColor = jsonData.background;
        }

        // Set dimensions
        if (jsonData.width && jsonData.height) {
          canvas.setWidth(jsonData.width);
          canvas.setHeight(jsonData.height);
        }

        // Apply lock state
        if (page.locked) {
          canvas.selection = false;
          canvas.getObjects().forEach((obj) => {
            obj.selectable = false;
            obj.evented = false;
          });
        }

        canvas.renderAll();
        console.log(`Loaded ${canvas.getObjects().length} objects for page ${index + 1}`);
      });
    } catch (error) {
      console.error(`Failed to load content for page ${index + 1}:`, error);
    }
  }, [canvas]); // Only depend on canvas

  //  FIX 3: Handle lock state changes
  useEffect(() => {
    if (!canvas) return;
    
    canvas.selection = !page.locked;
    canvas.getObjects().forEach((obj) => {
      obj.selectable = !page.locked;
      obj.evented = !page.locked;
    });
    canvas.renderAll();
  }, [page.locked, canvas]);

  //  FIX 4: Handle canvas size changes
  useEffect(() => {
    if (!canvas) return;
    
    if (canvas.width !== canvasSize.width || canvas.height !== canvasSize.height) {
      canvas.setWidth(canvasSize.width);
      canvas.setHeight(canvasSize.height);
      canvas.renderAll();
      console.log(`Resized page ${index + 1}: ${canvasSize.width}x${canvasSize.height}`);
    }
  }, [canvas, canvasSize.width, canvasSize.height]);

  return (
    <Box
      onClick={onSetActive}
      sx={{
        width: "fit-content",
        position: "relative",
        mb: 0
      }}
    >
      {/* Page Header */}
      <Box sx={{
        display: "flex",
            mt: 6 ,
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
          
          {totalPages > 1 && (
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
          )}
        </Box>
      </Box>

      {/* Canvas Container */}
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
          cursor: "pointer",
          "&:hover": {
            border: isActive ? "3px solid #7c3aed" : "2px solid #a78bfa",
            boxShadow: "0 8px 20px rgba(124,58,237,0.2)"
          }
        }}
      >
        <canvas ref={canvasRef} />
        
        {/* Lock indicator */}
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