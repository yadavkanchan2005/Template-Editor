"use client";
import React, { useState } from "react";
import { Box, Typography, IconButton, Button, Slider } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import * as fabric from "fabric";

const PanelContainer = styled(Box)({
  position: "fixed",
  left: 64,
  top: 64,
  width: 320,
  height: "calc(100vh - 64px)",
  backgroundColor: "#ffffff",
  borderRight: "1px solid #e2e8f0",
  zIndex: 999,
  overflowY: "auto",
  padding: "16px",
  boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
});

const TabContainer = styled(Box)({
  display: "flex",
  borderBottom: "2px solid #f1f5f9",
  marginBottom: "16px",
});

const Tab = styled(Box)<{ active?: boolean }>(({ active }) => ({
  flex: 1,
  padding: "8px 16px",
  textAlign: "center",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
  color: active ? "#7b68ee" : "#6b7280",
  borderBottom: active ? "2px solid #7b68ee" : "2px solid transparent",
  transition: "all 0.2s",
  "&:hover": {
    color: "#7b68ee",
  },
}));

const AnimationCard = styled(Box)<{ selected?: boolean }>(({ selected }) => ({
  border: `1px solid ${selected ? "#7b68ee" : "#e2e8f0"}`,
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
  cursor: "pointer",
  transition: "all 0.2s",
  backgroundColor: selected ? "#f8f9ff" : "transparent",
  "&:hover": {
    borderColor: "#7b68ee",
    backgroundColor: "#f8f9ff",
    transform: "translateY(-2px)",
  },
}));

const AnimationPreview = styled(Box)({
  width: 80,
  height: 60,
  backgroundColor: "#f1f5f9",
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 8,
  overflow: "hidden",
});

const AnimationText = styled(Typography)({
  fontSize: 20,
  fontWeight: 600,
  color: "#7b68ee",
});

const PresentationSettings = styled(Box)({
  padding: "12px 0",
  borderBottom: "1px solid #e2e8f0",
  marginBottom: "16px",
});

const ToggleSwitch = styled("input")({
  width: 40,
  height: 20,
  borderRadius: 10,
  cursor: "pointer",
});

interface AnimationPanelProps {
  onClose: () => void;
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
   sx?: object; 
}

const animations = [
  { id: "typewriter", name: "Typewriter", description: "Type text character by character" },
  { id: "ascend", name: "Ascend", description: "Rise from bottom" },
  { id: "shift", name: "Shift", description: "Shift and fade in" },
  { id: "fadeIn", name: "Fade In", description: "Simple fade in" },
  { id: "slideLeft", name: "Slide Left", description: "Slide from right" },
  { id: "slideRight", name: "Slide Right", description: "Slide from left" },
  { id: "zoomIn", name: "Zoom In", description: "Zoom from center" },
  { id: "rotate", name: "Rotate", description: "Rotate into view" },
  { id: "bounce", name: "Bounce", description: "Bounce into place" },
  { id: "merge", name: "Merge", description: "Merge from sides" },
  { id: "block", name: "Block", description: "Block reveal effect" },
  { id: "burst", name: "Burst", description: "Burst into view" },
  { id: "roll", name: "Roll", description: "Roll in from side" },
  { id: "skate", name: "Skate", description: "Skate across" },
];

const AnimationPanel: React.FC<AnimationPanelProps> = ({ onClose, canvas, selectedObject,sx }) => {
  const [activeTab, setActiveTab] = useState<"page" | "text">("text");
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(
    (selectedObject as any)?.animationId || null
  );
  const [speed, setSpeed] = useState<number>((selectedObject as any)?.animationSpeed || 1);
  const [appearOnClick, setAppearOnClick] = useState<boolean>(
    (selectedObject as any)?.appearOnClick || false
  );

  const handleAnimationSelect = (animationId: string) => {
    setSelectedAnimation(animationId);
  };

  const applyAnimation = () => {
    if (!selectedObject || !canvas || !selectedAnimation) return;

    // Store animation data in object
    (selectedObject as any).animationId = selectedAnimation;
    (selectedObject as any).animationSpeed = speed;
    (selectedObject as any).appearOnClick = appearOnClick;

    // Preview animation
    previewAnimation(selectedObject, selectedAnimation, speed);

    canvas.requestRenderAll();
  };

  const removeAnimation = () => {
    if (!selectedObject) return;
    (selectedObject as any).animationId = null;
    (selectedObject as any).animationSpeed = 1;
    (selectedObject as any).appearOnClick = false;
    setSelectedAnimation(null);
    setSpeed(1);
    setAppearOnClick(false);
  };

  const previewAnimation = (obj: fabric.Object, animationId: string, animSpeed: number) => {
    if (!canvas) return;

    const duration = 1000 / animSpeed; 
    const originalLeft = obj.left || 0;
    const originalTop = obj.top || 0;
    const originalScaleX = obj.scaleX || 1;
    const originalScaleY = obj.scaleY || 1;
    const originalOpacity = obj.opacity || 1;
    const originalAngle = obj.angle || 0;

    switch (animationId) {
      case "fadeIn":
        obj.set({ opacity: 0 });
        obj.animate({ opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll()
        });
        break;

      case "slideLeft":
        obj.set({ left: originalLeft + 200 });
        obj.animate({ left: originalLeft }, {
          duration,
          onChange: () => canvas.renderAll()
        });
        break;

      case "slideRight":
        obj.set({ left: originalLeft - 200 });
        obj.animate({ left: originalLeft }, {
          duration,
          onChange: () => canvas.renderAll()
        });
        break;

      case "ascend":
        obj.set({ top: originalTop + 100, opacity: 0 });
        obj.animate({ top: originalTop, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll()
        });
        break;

      case "shift":
        obj.set({ left: originalLeft - 50, opacity: 0 });
        obj.animate({ left: originalLeft, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll()
        });
        break;

      case "zoomIn":
        obj.set({ scaleX: 0, scaleY: 0, opacity: 0 });
        obj.animate({ scaleX: originalScaleX, scaleY: originalScaleY, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll()
        });
        break;

      case "rotate":
        obj.set({ angle: -180, opacity: 0 });
        obj.animate({ angle: originalAngle, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll()
        });
        break;

      case "bounce":
        obj.set({ top: originalTop - 150, opacity: 0 });
        obj.animate({ top: originalTop, opacity: originalOpacity }, {
          duration: duration * 1.2,
          easing: (t: number) => {
            const c = 1.70158;
            return --t * t * ((c + 1) * t + c) + 1;
          },
          onChange: () => canvas.renderAll(),
        });
        break;

      case "merge":
        obj.set({ scaleX: 0.1, opacity: 0 });
        obj.animate({ scaleX: originalScaleX, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll()
        });
        break;

      case "block":
        obj.set({ scaleY: 0, opacity: 0 });
        obj.animate({ scaleY: originalScaleY, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll()
        });
        break;

      case "burst":
        obj.set({ scaleX: 2, scaleY: 2, opacity: 0 });
        obj.animate({ scaleX: originalScaleX, scaleY: originalScaleY, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll()
        });
        break;

      case "roll":
        obj.set({ left: originalLeft - 200, angle: -360 });
        obj.animate({ left: originalLeft, angle: originalAngle }, {
          duration,
          onChange: () => canvas.renderAll()
        });
        break;

      case "skate":
        obj.set({ left: originalLeft - 150, top: originalTop - 50, opacity: 0 });
        obj.animate({ left: originalLeft, top: originalTop, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll()
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
              canvas.renderAll();
              charIndex++;
            } else {
              clearInterval(interval);
            }
          }, charDuration);
        }
        break;
    }
  };

  return (
    <PanelContainer>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Animate</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      <Tab active={activeTab === "page"} onClick={() => setActiveTab("page")}>Page</Tab>
      {/* <Tab $active={activeTab === "text"} onClick={() => setActiveTab("text")}>Text</Tab> */}

      {!selectedObject ? (
        <Typography variant="body2" color="text.secondary">Select an element to animate</Typography>
      ) : (
        <>
          <PresentationSettings>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Presentation settings</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">Appear on click</Typography>
              <label>
                <input
                  type="checkbox"
                  checked={appearOnClick}
                  onChange={(e) => setAppearOnClick(e.target.checked)}
                  style={{ width: 40, height: 20, cursor: "pointer" }}
                />
              </label>
            </Box>
          </PresentationSettings>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Speed</Typography>
            <Slider
              value={speed}
              min={0.5}
              max={3}
              step={0.1}
              onChange={(_, value) => setSpeed(value as number)}
              marks={[
                { value: 0.5, label: "Slow" },
                { value: 1.5, label: "Normal" },
                { value: 3, label: "Fast" },
              ]}
              sx={{ color: "#7b68ee" }}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, pb: 1, borderBottom: "1px solid #e2e8f0" }}>
            Custom
          </Typography>

          {/* <Box sx={{ mb: 2, p: 1.5, bgcolor: "#f8f9ff", borderRadius: 2, border: "1px solid #e2e8f0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 40, height: 40, bgcolor: "#7b68ee", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography sx={{ color: "white", fontSize: 20 }}>🐝</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Create an Animation</Typography>
                <Typography variant="caption" color="text.secondary">Drag elements around the canvas to create your own animations.</Typography>
              </Box>
            </Box>
          </Box> */}

          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Suggested</Typography>

          {animations.map((anim) => (
            <AnimationCard
              key={anim.id}
              selected={selectedAnimation === anim.id}
              onClick={() => handleAnimationSelect(anim.id)}
            >
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <AnimationPreview>
                  <AnimationText>ABC</AnimationText>
                </AnimationPreview>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{anim.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{anim.description}</Typography>
                </Box>
              </Box>
            </AnimationCard>
          ))}

          <Box sx={{ position: "sticky", bottom: 0, bgcolor: "white", pt: 2, borderTop: "1px solid #e2e8f0" }}>
            {selectedAnimation && (
              <>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    mb: 1,
                    bgcolor: "#7b68ee",
                    "&:hover": { bgcolor: "#6858d3" },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  onClick={applyAnimation}
                >
                  Apply Animation
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  sx={{ textTransform: "none", fontWeight: 600 }}
                  onClick={removeAnimation}
                >
                  Remove animation
                </Button>
              </>
            )}
          </Box>
        </>
      )}
    </PanelContainer>
  );
};

export default AnimationPanel;