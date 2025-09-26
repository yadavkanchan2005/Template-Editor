// components/AnimatedObjectsPanel.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import lottie, { AnimationItem } from "lottie-web";

interface AnimationItemType {
  id: string;
  label: string;
  jsonPath: string;       // path to Lottie JSON
  thumbnail: string;      // path to thumbnail image
}

interface Props {
  onAddAnimation: (animationData: any) => void;
}

// Example animations (replace with your own)
const animationList: AnimationItemType[] = [
  {
    id: "star",
    label: "Star",
    jsonPath: "/animations/star.json",
    thumbnail: "/animations/thumbnails/star.png",
  },
  {
    id: "heart",
    label: "Heart",
    jsonPath: "/animations/heart.json",
    thumbnail: "/animations/thumbnails/heart.png",
  },
  {
    id: "smile",
    label: "Smile",
    jsonPath: "/animations/smile.json",
    thumbnail: "/animations/thumbnails/smile.png",
  },
];

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

const AnimatedObjectsPanel: React.FC<Props> = ({ onAddAnimation }) => {
  const handleAddAnimation = async (jsonPath: string) => {
    const res = await fetch(jsonPath);
    const animationData = await res.json();
    onAddAnimation(animationData);
  };

  return (
    <Box sx={{ width: 220, borderRight: "1px solid #ddd", p: 2, overflowY: "auto", maxHeight: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Animated Objects
      </Typography>
      <Stack spacing={1}>
        {animationList.map((anim) => (
          <Button
            key={anim.id}
            variant="outlined"
            fullWidth
            sx={{
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onClick={() => handleAddAnimation(anim.jsonPath)}
          >
            <span>{anim.label}</span>
            <AnimationPreview jsonPath={anim.jsonPath} width={50} height={50} />
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

export default AnimatedObjectsPanel;
