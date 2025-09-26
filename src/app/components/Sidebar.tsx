"use client";
import React, { useState, useEffect } from "react";
import { Drawer, IconButton, Tooltip, Divider, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WidgetsIcon from "@mui/icons-material/Widgets";
import DeleteIcon from "@mui/icons-material/Delete";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CreateIcon from "@mui/icons-material/Create"; // Pencil / Draw icon

import DynamicElementsPanel from "./panal/DynamicElementsPanel";

const CanvaSidebar = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: 80,
    backgroundColor: "#f8fafc",
    borderRight: "1px solid #e2e8f0",
    marginTop: "64px",
    paddingTop: theme.spacing(2),
    boxSizing: "border-box",
  },
}));

const SidebarIconButton = styled(IconButton)(({ theme }) => ({
  width: 48,
  height: 48,
  margin: "4px 8px",
  borderRadius: "12px",
  color: "#64748b",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#e2e8f0",
    color: "#00c4cc",
    transform: "translateY(-1px)",
  },
}));

const SectionDivider = styled(Divider)(({ theme }) => ({
  margin: "12px 16px",
  backgroundColor: "#e2e8f0",
}));

interface SidebarProps {
  onAddText: () => void;
  onAddShape: (shapeOrJson: any) => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDrawMode: () => void; 
  onSelectCategory?: (cat: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onAddText,
  onAddShape,
  onDelete,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onDrawMode,
}) => {
  const [mounted, setMounted] = useState(false);
  const [elementsOpen, setElementsOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const toggleElementsPanel = () => setElementsOpen((open) => !open);
  const closeElementsPanel = () => setElementsOpen(false);

  return (
    <>
      <CanvaSidebar
        variant="permanent"
        anchor="left"
        sx={{ "& .MuiDrawer-paper": { position: "fixed", zIndex: 1200 } }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "100%",
            overflowY: "auto",
          }}
        >
          {/* Templates */}
          <Tooltip title="Templates" placement="right" arrow>
            <SidebarIconButton aria-label="Templates">
              <DashboardIcon />
            </SidebarIconButton>
          </Tooltip>

          {/* Add Text */}
          <Tooltip title="Add Text" placement="right" arrow>
            <SidebarIconButton onClick={onAddText} aria-label="Add Text">
              <TextFieldsIcon />
            </SidebarIconButton>
          </Tooltip>

          {/* Pencil / Draw */}
          <Tooltip title="Draw / Pencil" placement="right" arrow>
            <SidebarIconButton onClick={onDrawMode} aria-label="Draw">
              <CreateIcon />
            </SidebarIconButton>
          </Tooltip>

          <SectionDivider />

          {/* Elements */}
          <Tooltip title="Elements" placement="right" arrow>
            <SidebarIconButton onClick={toggleElementsPanel} aria-label="Elements">
              <WidgetsIcon />
            </SidebarIconButton>
          </Tooltip>

          <SectionDivider />

          {/* Delete */}
          <Tooltip title="Delete" placement="right" arrow>
            <SidebarIconButton onClick={onDelete} aria-label="Delete">
              <DeleteIcon />
            </SidebarIconButton>
          </Tooltip>

          <SectionDivider />

          {/* Layer Controls */}
          <Tooltip title="Bring Forward" placement="right" arrow>
            <SidebarIconButton onClick={onBringForward} aria-label="Bring Forward">
              <ArrowUpwardIcon />
            </SidebarIconButton>
          </Tooltip>

          <Tooltip title="Send Backward" placement="right" arrow>
            <SidebarIconButton onClick={onSendBackward} aria-label="Send Backward">
              <ArrowDownwardIcon />
            </SidebarIconButton>
          </Tooltip>

          <Tooltip title="Bring to Front" placement="right" arrow>
            <SidebarIconButton onClick={onBringToFront} aria-label="Bring to Front">
              <VerticalAlignTopIcon />
            </SidebarIconButton>
          </Tooltip>

          <Tooltip title="Send to Back" placement="right" arrow>
            <SidebarIconButton onClick={onSendToBack} aria-label="Send to Back">
              <VerticalAlignBottomIcon />
            </SidebarIconButton>
          </Tooltip>
        </Box>
      </CanvaSidebar>

      {/* Elements Panel */}
      {elementsOpen && (
        <DynamicElementsPanel 
          onAddElement={onAddShape} 
          onClose={closeElementsPanel} 
        />
      )}
    </>
  );
};

export default Sidebar;
