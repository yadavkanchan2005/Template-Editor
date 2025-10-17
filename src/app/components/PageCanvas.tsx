// components/PageCanvas.tsx
"use client";
import React, { useRef, useEffect } from "react";
import { Box, Typography, IconButton, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import MiniCanva from "./MiniCanva";
import * as fabric from "fabric";

const PageCanvasWrapper = styled(Paper)(({ theme }) => ({
  position: "relative",
  backgroundColor: "#fff",
  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  borderRadius: "8px",
  overflow: "hidden",
  border: "2px solid transparent",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#7b68ee",
    boxShadow: "0 8px 24px rgba(123,104,238,0.2)",
  },
  "&.active": {
    borderColor: "#00c4cc",
    boxShadow: "0 8px 32px rgba(0,196,204,0.3)",
  },
}));

export type PageItem = {
  id: string;
  name: string;
  fabricJSON: any | null;
  thumbnail: string | null;
  locked: boolean;
  width: number;
  height: number;
};

interface PageCanvasProps {
  page: PageItem;
  index: number;
  isActive: boolean;
  action: any;
  onCanvasReady: (canvas: fabric.Canvas, pageId: string) => void;
  onObjectSelected: (obj: fabric.Object | null) => void;
  onPageClick: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onToggleLock: (index: number) => void;
}

const PageCanvas: React.FC<PageCanvasProps> = ({
  page,
  index,
  isActive,
  action,
  onCanvasReady,
  onObjectSelected,
  onPageClick,
  onDuplicate,
  onDelete,
  onToggleLock,
}) => {
  const pageRef = useRef<HTMLDivElement>(null);

  // Scroll into view when active
  useEffect(() => {
    if (isActive && pageRef.current) {
      pageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isActive]);

  return (
    <Box
      ref={pageRef}
      sx={{
        position: "relative",
        width: "fit-content",
        mb: 4,
      }}
    >
      {/* Page Header Controls */}
      <Box
        sx={{
          position: "absolute",
          top: -40,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          zIndex: 10,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: isActive ? "#00c4cc" : "#64748b",
            fontWeight: isActive ? 700 : 500,
            fontSize: "0.875rem",
          }}
        >
          {page.name}
        </Typography>

        {/* Page Controls */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock(index);
            }}
            sx={{
              bgcolor: "white",
              boxShadow: 1,
              "&:hover": { bgcolor: "#f8f9fa" },
            }}
            title={page.locked ? "Unlock" : "Lock"}
          >
            {page.locked ? (
              <LockIcon fontSize="small" />
            ) : (
              <LockOpenIcon fontSize="small" />
            )}
          </IconButton>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(index);
            }}
            disabled={!isActive}
            sx={{
              bgcolor: "white",
              boxShadow: 1,
              "&:hover": { bgcolor: "#f8f9fa" },
            }}
            title="Duplicate"
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            sx={{
              bgcolor: "white",
              boxShadow: 1,
              "&:hover": { bgcolor: "#ffebee", color: "#d32f2f" },
            }}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Canvas Container */}
      <PageCanvasWrapper
        className={isActive ? "active" : ""}
        onClick={() => onPageClick(index)}
        sx={{
          width: page.width,
          height: page.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          cursor: isActive ? "default" : "pointer",
        }}
      >
        {/* MiniCanva Component */}
        {isActive ? (
          <MiniCanva
            action={action}
            onCanvasReady={(canvas: fabric.Canvas) => onCanvasReady(canvas, page.id)}
            onObjectSelected={onObjectSelected}
            setSelectedObject={onObjectSelected}
          />
        ) : (
          // Show thumbnail for inactive pages
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f8f9fa",
            }}
          >
            {page.thumbnail ? (
              <img
                src={page.thumbnail}
                alt={page.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Typography variant="h6" color="text.secondary">
                {page.name}
              </Typography>
            )}
          </Box>
        )}

        {/* Locked Overlay */}
        {page.locked && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <LockIcon sx={{ fontSize: 64, color: "rgba(0,0,0,0.1)" }} />
          </Box>
        )}
      </PageCanvasWrapper>
    </Box>
  );
};

export default PageCanvas;