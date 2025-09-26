// components/AnimatedObjectsDragPanel.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { Box, Typography, Stack } from "@mui/material";
import lottie, { AnimationItem } from "lottie-web";
import { useDrag, DragSourceMonitor } from "react-dnd";

interface AnimationItemType {
  id: string;
  label: string;
  jsonPath: string;
}


interface Props {
  animations: AnimationItemType[];
  onDropAnimation: (animationData: any, x: number, y: number) => void;
}

// Mini Lottie preview
const AnimationPreview: React.FC<{ jsonPath: string; width?: number; height?: number }> = ({
  jsonPath,
  width = 50,
  height = 50,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: AnimationItem;
    const loadPreview = async () => {
      const res = await fetch(jsonPath);
      const animationData = await res.json();
      if (!containerRef.current) return;

      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData,
      });
    };
    loadPreview();

    return () => anim?.destroy();
  }, [jsonPath]);

  return <div ref={containerRef} style={{ width, height }} />;
};

// Helper to attach dragRef safely
const attachDragRef = (dragRef: (node: Element | null) => void, node: HTMLDivElement | null) => {
  if (node) dragRef(node);
};

// Draggable animation item
const DraggableAnimation: React.FC<{ anim: AnimationItemType }> = ({ anim }) => {
  const [, dragRef] = useDrag(() => ({
    type: "ANIMATION",
    item: { jsonPath: anim.jsonPath },
  }));

  return (
    <div ref={(node) => attachDragRef(dragRef, node)}>
      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: 1,
          p: 1,
          mb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "grab",
        }}
      >
        <span>{anim.label}</span>
        <AnimationPreview jsonPath={anim.jsonPath} width={50} height={50} />
      </Box>
    </div>
  );
};

const AnimatedObjectsDragPanel: React.FC<Props> = ({ animations }) => {
  return (
    <Box
      sx={{
        width: 220,
        borderRight: "1px solid #ddd",
        p: 2,
        overflowY: "auto",
        maxHeight: "100%",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Animated Objects
      </Typography>
      <Stack spacing={1}>
        {animations.map((anim) => (
          <DraggableAnimation key={anim.id} anim={anim} />
        ))}
      </Stack>
    </Box>
  );
};

export default AnimatedObjectsDragPanel;
