"use client";
import React, { useState } from "react";
import { Box, Typography, IconButton, Button, Slider } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import * as fabric from "fabric";




const PANEL_TOP = 80;

const PanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isOpen'
})<{ isOpen?: boolean }>(({ isOpen }) => ({
  position: 'fixed',            
  top: PANEL_TOP,               
  right: 0,                    
  width: 400,                   
  height: `calc(100vh - ${PANEL_TOP}px)`,
  backgroundColor: '#ffffff',
  borderLeft: '1px solid #e5e7eb',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
  transition: 'transform 0.3s ease',
  zIndex: 1000,
}));





const HeaderSection = styled(Box)({
  padding: "20px 20px 16px 20px",
  borderBottom: "1px solid #e5e7eb",
  position: "sticky",
  top: 0,
  bottom:5,
  backgroundColor: "#ffffff",
  zIndex: 10,
  flexShrink: 0,
});

const TabContainer = styled(Box)({
  display: "flex",
  gap: "4px",
  marginTop: "5px",
  flex: 1,               
  padding: '16px 20px',
  overflowY: 'auto',    
});

const Tab = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive?: boolean }>(({ isActive }) => ({
  flex: 1,
  padding: "8px 10px",
  textAlign: "center",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: "13px",
  color: isActive ? "#1e1e1e" : "#6b7280",
  backgroundColor: "transparent",
  borderRadius: "6px",
  border: "none",
  borderBottom: isActive ? "2px solid #8b5cf6" : "2px solid transparent",
  transition: "all 0.2s",
  "&:hover": {
    color: "#1e1e1e",
  },
}));

const ContentSection = styled(Box)({
  flex: 1,
  padding: "16px 20px",
  overflowY: "auto",
  
});

const SectionTitle = styled(Typography)({
  fontSize: "12px",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "8px",
  marginTop: "8px",
});

const ToggleContainer = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid #f3f4f6",
});

const AnimationGrid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "6px",
  marginBottom: "16px",
});

const AnimationCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected?: boolean }>(({ isSelected }) => ({
  aspectRatio: "1",
  border: `2.5px solid ${isSelected ? "#8b5cf6" : "#e5e7eb"}`,
  borderRadius: "10px",
  marginBottom: 5,
  padding: "8px",
  cursor: "pointer",
  transition: "all 0.15s",
  backgroundColor: isSelected ? "#f5f3ff" : "#ffffff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  "&:hover": {
    borderColor: "#8b5cf6",
    backgroundColor: "#faf9ff",
  },
}));

const AnimationIcon = styled(Box)({
  fontSize: "28px",
  fontWeight: 600,
  color: "#8b5cf6",
  fontFamily: "Arial, sans-serif",
});

const AnimationName = styled(Typography)({
  fontSize: "10px",
  fontWeight: 500,
  color: "#374151",
  textAlign: "center",
});

const FooterSection = styled(Box)({
  position: "sticky",
  bottom: 20,
  backgroundColor: "white",
  padding: "16px 20px",
  borderTop: "1px solid #e5e7eb",
  flexShrink: 0,  
});

interface AnimationPanelProps {
  onClose: () => void;
  canvas: fabric.Canvas | null;
  selectedObject: fabric.Object | null;
}

const animations = [
  { id: "typewriter", name: "Typewriter", icon: "AB|" },
  { id: "ascend", name: "Ascend", icon: "ABͨ" },
  { id: "shift", name: "Shift", icon: "ᴬᴮᶜ" },
  { id: "fadeIn", name: "Fade In", icon: "ABC" },
  { id: "slideLeft", name: "Slide Left", icon: "←ABC" },
  { id: "slideRight", name: "Slide Right", icon: "ABC→" },
  { id: "zoomIn", name: "Zoom In", icon: "⊕" },
  { id: "rotate", name: "Rotate", icon: "↻" },
  { id: "bounce", name: "Bounce", icon: "⤊" },
  { id: "merge", name: "Merge", icon: "←→" },
  { id: "block", name: "Block", icon: "▬" },
  { id: "burst", name: "Burst", icon: "✦" },
  { id: "roll", name: "Roll", icon: "↻ABC" },
  { id: "skate", name: "Skate", icon: "⤢" },
  { id: "wave", name: "Wave", icon: "∿" },
  { id: "blink", name: "Blink", icon: "✦" },
  { id: "flipH", name: "Flip H", icon: "⇋" },
  { id: "flipV", name: "Flip V", icon: "⇵" },
  { id: "swing", name: "Swing", icon: "⥂" },
  { id: "pop", name: "Pop", icon: "⬆" },
  { id: "shake", name: "Shake", icon: "⇆" },
  { id: "wobble", name: "Wobble", icon: "⤨" },
  { id: "pulse", name: "Pulse", icon: "⬤" },
  { id: "drop", name: "Drop", icon: "⬇" },
  { id: "expandWidth", name: "Expand W", icon: "▭" },
  { id: "colorFlash", name: "Color Flash", icon: "✦" },
  { id: "sway", name: "Sway", icon: "⤾" },
{ id: "bounceUp", name: "Bounce Up", icon: "⥣" },
// New animations from screenshot
  { id: "drift", name: "Drift", icon: "⇄" },
  { id: "tectonic", name: "Tectonic", icon: "⇆" },
  { id: "tumble", name: "Tumble", icon: "⟳" },
  { id: "neon", name: "Neon", icon: "💡" },
  { id: "scrapbook", name: "Scrapbook", icon: "📄" },
  { id: "stomp", name: "Stomp", icon: "⬛" },
  { id: "photoFlow", name: "Photo Flow", icon: "📷↓" },
  { id: "photoRise", name: "Photo Rise", icon: "📷↑" },
  { id: "photoZoom", name: "Photo Zoom", icon: "🔍" },
  { id: "rotate", name: "Rotate", icon: "↻" },
  { id: "flicker", name: "Flicker", icon: "⚡" },
  { id: "pulse", name: "Pulse", icon: "⬤" },
  { id: "wiggle", name: "Wiggle", icon: "〰️" },
];


const AnimationPanel: React.FC<AnimationPanelProps> = ({ onClose, canvas, selectedObject }) => {
  const [activeTab, setActiveTab] = useState<"page" | "text">("text");
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(
    (selectedObject as any)?.animationId || null
  );
  const [speed, setSpeed] = useState<number>((selectedObject as any)?.animationSpeed || 1);
  const [appearOnClick, setAppearOnClick] = useState<boolean>(
    (selectedObject as any)?.appearOnClick || false
  );

const handleAnimationSelect = (animationId: string | null) => {
  setSelectedAnimation(animationId);
  if (animationId === null && selectedObject) {
    (selectedObject as any).animationId = null;
    (selectedObject as any).animationSpeed = 1;
    (selectedObject as any).appearOnClick = false;
    setSpeed(1);
    setAppearOnClick(false);
    if (canvas) canvas.requestRenderAll();
  }
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
        obj.animate({ opacity: originalOpacity }, { duration, onChange: () => canvas.renderAll() });
        break;
      case "slideLeft":
        obj.set({ left: originalLeft + 200 });
        obj.animate({ left: originalLeft }, { duration, onChange: () => canvas.renderAll() });
        break;
      case "slideRight":
        obj.set({ left: originalLeft - 200 });
        obj.animate({ left: originalLeft }, { duration, onChange: () => canvas.renderAll() });
        break;
      case "ascend":
        obj.set({ top: originalTop + 100, opacity: 0 });
        obj.animate({ top: originalTop, opacity: originalOpacity }, { duration, onChange: () => canvas.renderAll() });
        break;
      case "shift":
        obj.set({ left: originalLeft - 50, opacity: 0 });
        obj.animate({ left: originalLeft, opacity: originalOpacity }, { duration, onChange: () => canvas.renderAll() });
        break;
      case "zoomIn":
        obj.set({ scaleX: 0, scaleY: 0, opacity: 0 });
        obj.animate({ scaleX: originalScaleX, scaleY: originalScaleY, opacity: originalOpacity }, { duration, onChange: () => canvas.renderAll() });
        break;
      case "rotate":
        obj.set({ angle: -180, opacity: 0 });
        obj.animate({ angle: originalAngle, opacity: originalOpacity }, { duration, onChange: () => canvas.renderAll() });
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
        obj.animate({ scaleX: originalScaleX, opacity: originalOpacity }, { duration, onChange: () => canvas.renderAll() });
        break;
      case "block":
        obj.set({ scaleY: 0, opacity: 0 });
        obj.animate({ scaleY: originalScaleY, opacity: originalOpacity }, { duration, onChange: () => canvas.renderAll() });
        break;
      case "burst":
        obj.set({ scaleX: 2, scaleY: 2, opacity: 0 });
        obj.animate({ scaleX: originalScaleX, scaleY: originalScaleY, opacity: originalOpacity }, { duration, onChange: () => canvas.renderAll() });
        break;
      case "roll":
        obj.set({ left: originalLeft - 200, angle: -360 });
        obj.animate({ left: originalLeft, angle: originalAngle }, { duration, onChange: () => canvas.renderAll() });
        break;
      case "skate":
        obj.set({ left: originalLeft - 150, top: originalTop - 50, opacity: 0 });
        obj.animate({ left: originalLeft, top: originalTop, opacity: originalOpacity }, { duration, onChange: () => canvas.renderAll() });
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
      case "wave":
        if (obj.type === "textbox" || obj.type === "text") {
          const textObj = obj as fabric.Textbox;
          const fullText = textObj.text || "";
          let t = 0;
          const amplitude = 5; // px
          const frequency = 0.3; // speed
          const interval = setInterval(() => {
            if (!canvas) { clearInterval(interval); return; }
            textObj.set({
              top: (obj.top || 0) + amplitude * Math.sin(frequency * t),
            });
            canvas.renderAll();
            t += 1;
            if (t > 100) clearInterval(interval); // optional stop
          }, 16);
        }
        break;

      case "blink":
        if (!canvas) return;
        let visible = true;
        const interval = setInterval(() => {
          if (!canvas) { clearInterval(interval); return; }
          obj.set({ opacity: visible ? 0 : 1 });
          canvas.renderAll();
          visible = !visible;
        }, 300); // change every 300ms
        break;

case "colorFlash":
  if (obj.fill) {
    const originalColor = obj.fill as string;
    let flash = true;
    const colorInterval = setInterval(() => {
      obj.set({ fill: flash ? "#8b5cf6" : originalColor });
      canvas.renderAll();
      flash = !flash;
    }, 300);
  }
  break;


  case "expandWidth":
  obj.set({ scaleX: 0 });
  obj.animate({ scaleX: obj.scaleX || 1 }, { duration, onChange: () => canvas.renderAll() });
  break;  


case "drop":
  const origTop = obj.top || 0;
  obj.set({ top: origTop - 200, opacity: 0 });
  obj.animate({ top: origTop, opacity: 1 }, { duration, easing: fabric.util.ease.easeOutBounce, onChange: () => canvas.renderAll() });
  break;


case "pulse":
  let pulseScale = 1;
  const pulseInterval = setInterval(() => {
    obj.set({ scaleX: pulseScale, scaleY: pulseScale });
    canvas.renderAll();
    pulseScale = pulseScale === 1 ? 1.2 : 1;
  }, 300);
  break;

case "wobble": {
  const originalAngle = obj.angle || 0;
  let wobbleAngle = 10;
  let wobbleCount = 0;
  const wobbleInterval = setInterval(() => {
    obj.set({ angle: originalAngle + (wobbleCount % 2 === 0 ? wobbleAngle : -wobbleAngle) });
    canvas.renderAll();
    wobbleCount++;
    if (wobbleCount > 6) { 
      obj.set({ angle: originalAngle }); 
      clearInterval(wobbleInterval); 
    }
  }, 100);
  break;
}


case "shake": {
  const originalLeft = obj.left || 0;
  let shakeCount = 0;
  const shakeInterval = setInterval(() => {
    obj.set({ left: originalLeft + (shakeCount % 2 === 0 ? 10 : -10) });
    canvas.renderAll();
    shakeCount++;
    if (shakeCount > 6) {
      obj.set({ left: originalLeft });
      clearInterval(shakeInterval);
    }
  }, 50);
  break;
}

case "swing": {
  const originalAngle = obj.angle || 0;
  let swingCount = 0;
  const swingInterval = setInterval(() => {
    obj.set({ angle: originalAngle + Math.sin(swingCount) * 15 });
    canvas.renderAll();
    swingCount += 0.3;
    if (swingCount > Math.PI * 4) { 
      obj.set({ angle: originalAngle }); 
      clearInterval(swingInterval); 
    }
  }, 50);
  break;
}

case "sway":
  let swayCount = 0;
  const swayInterval = setInterval(() => {
    obj.set({ left: (originalLeft || 0) + (swayCount % 2 === 0 ? 10 : -10) });
    canvas.renderAll();
    swayCount++;
    if (swayCount > 6) {
      obj.set({ left: originalLeft });
      clearInterval(swayInterval);
    }
  }, 100);
  break;

case "bounceUp":
  obj.set({ top: (originalTop || 0) + 100, opacity: 0 });
  obj.animate({ top: originalTop, opacity: originalOpacity }, {
    duration,
    easing: (t) => 1 - Math.pow(1 - t, 3), 
    onChange: () => canvas.renderAll(),
  });
  break;


  case "drift":
  obj.animate({ left: (obj.left || 0) + 10, top: (obj.top || 0) + 5 }, { duration, onChange: () => canvas.renderAll() });
  break;

case "tectonic":
  obj.animate({ left: (obj.left || 0) + 5, top: (obj.top || 0) - 5 }, { duration, onChange: () => canvas.renderAll() });
  break;

case "tumble":
  obj.set({ angle: -360 });
  obj.animate({ angle: 0 }, { duration, onChange: () => canvas.renderAll() });
  break;

case "neon":
  let neonOn = false;
  const neonInterval = setInterval(() => {
    obj.set({ stroke: neonOn ? "#8b5cf6" : "#ffffff" });
    canvas.renderAll();
    neonOn = !neonOn;
  }, 300);
  break;

case "scrapbook":
  obj.set({ angle: -10, left: (originalLeft || 0) - 5 });
  obj.animate({ angle: 0, left: originalLeft }, { duration, onChange: () => canvas.renderAll() });
  break;

case "stomp":
  obj.set({ scaleY: 0 });
  obj.animate({ scaleY: 1 }, { duration, onChange: () => canvas.renderAll() });
  break;

case "photoFlow":
  obj.set({ top: (originalTop || 0) - 100, opacity: 0 });
  obj.animate({ top: originalTop, opacity: 1 }, { duration, onChange: () => canvas.renderAll() });
  break;

case "photoRise":
  obj.set({ top: (originalTop || 0) + 100, opacity: 0 });
  obj.animate({ top: originalTop, opacity: 1 }, { duration, onChange: () => canvas.renderAll() });
  break;

case "photoZoom":
  obj.set({ scaleX: 0, scaleY: 0, opacity: 0 });
  obj.animate({ scaleX: originalScaleX, scaleY: originalScaleY, opacity: 1 }, { duration, onChange: () => canvas.renderAll() });
  break;

case "flicker":
  let flickerOn = true;
  const flickerInterval = setInterval(() => {
    obj.set({ opacity: flickerOn ? 0 : 1 });
    canvas.renderAll();
    flickerOn = !flickerOn;
  }, 150);
  break;

case "wiggle":
  let wiggleCount = 0;
  const wiggleInterval = setInterval(() => {
    obj.set({ left: (originalLeft || 0) + (wiggleCount % 2 === 0 ? 5 : -5) });
    canvas.renderAll();
    wiggleCount++;
    if (wiggleCount > 6) {
      obj.set({ left: originalLeft });
      clearInterval(wiggleInterval);
    }
  }, 50);
  break;

    }
  };

  const applyAnimation = () => {
    if (!selectedObject || !canvas || !selectedAnimation) return;

    (selectedObject as any).animationId = selectedAnimation;
    (selectedObject as any).animationSpeed = speed;
    (selectedObject as any).appearOnClick = appearOnClick;

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

  return (
    <PanelContainer>
      <HeaderSection>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" , marginBottom:"10px" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "24px", color: "#1e1e1e" }}>
            Animate
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: "#6b7280" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <TabContainer>
          <Tab isActive={activeTab === "page"} onClick={() => setActiveTab("page")}>
            Page
          </Tab>
          <Tab isActive={activeTab === "text"} onClick={() => setActiveTab("text")}>
            Text
          </Tab>
        </TabContainer>
      </HeaderSection>

      <ContentSection>
        {!selectedObject ? (
          <Box sx={{ textAlign: "center", mt: 4, color: "#9ca3af" }}>
            <Typography variant="body2" sx={{ fontSize: "13px" }}>
              Select an element to animate
            </Typography>
          </Box>
        ) : (
          <>
            {/* <SectionTitle>Presentation settings</SectionTitle>

            <ToggleContainer>
              <Typography variant="body2" sx={{ fontSize: "13px", color: "#374151" }}>
                Appear on click
              </Typography>
              <label>
                <input
                  type="checkbox"
                  checked={appearOnClick}
                  onChange={(e) => setAppearOnClick(e.target.checked)}
                  style={{
                    width: 36,
                    height: 20,
                    cursor: "pointer",
                    accentColor: "#8b5cf6"
                  }}
                />
              </label>
            </ToggleContainer> */}

            {/* Speed Control */}
            <Box sx={{ mb: 3, mt: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="body2" sx={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>
                  Speed
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "12px", fontWeight: 600, color: "#8b5cf6" }}>
                  {speed.toFixed(1)}x
                </Typography>
              </Box>
              <Slider
                value={speed}
                min={0.5}
                max={3}
                step={0.1}
                onChange={(_, value) => setSpeed(value as number)}
                sx={{
                  color: "#8b5cf6",
                  height: 4,
                  "& .MuiSlider-thumb": {
                    width: 16,
                    height: 16,
                    backgroundColor: "#8b5cf6",
                    "&:hover": {
                      boxShadow: "0 0 0 6px rgba(139, 92, 246, 0.16)",
                    },
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: "#8b5cf6",
                  },
                  "& .MuiSlider-rail": {
                    backgroundColor: "#e5e7eb",
                  },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                <Typography variant="caption" sx={{ fontSize: "10px", color: "#9ca3af" }}>
                  Slow
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "10px", color: "#9ca3af" }}>
                  Normal
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "10px", color: "#9ca3af" }}>
                  Fast
                </Typography>
              </Box>
            </Box>


            <SectionTitle>Suggested</SectionTitle>


              <AnimationGrid>
  {/* "None" option */}
  <AnimationCard
    isSelected={selectedAnimation === null}
    onClick={() => handleAnimationSelect(null)}
  >
    <AnimationIcon>Ø</AnimationIcon>
    <AnimationName>None</AnimationName>

  </AnimationCard>

              {animations.map((anim) => (
                <AnimationCard
                  key={anim.id}
                  isSelected={selectedAnimation === anim.id}
                  onClick={() => handleAnimationSelect(anim.id)}
                >
                  <AnimationIcon>{anim.icon}</AnimationIcon>
                  <AnimationName>{anim.name}</AnimationName>
                </AnimationCard>
              ))}
            </AnimationGrid>
          </>
        )}
      </ContentSection>

      {selectedObject && selectedAnimation && (
        <FooterSection>
          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: "#8b5cf6",
              color: "#ffffff",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "13px",
              py: 1.5,
              borderRadius: "8px",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#7c3aed",
                boxShadow: "none"
              },
            }}
            onClick={applyAnimation}
          >
            Apply Animation
          </Button>
          <Button
            fullWidth
            variant="text"
            sx={{
              mt: 1,
              color: "#8b5cf6",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "13px",
              py: 1,
              "&:hover": {
                backgroundColor: "#f5f3ff",
              },
            }}
            onClick={removeAnimation}
          >
            Remove animation
          </Button>
        </FooterSection>
      )}
    </PanelContainer>
  );
};

export default AnimationPanel;