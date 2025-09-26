
"use client";
import React, { useRef, useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Typography, Tabs, Tab, TextField, InputAdornment } from "@mui/material";
import { Search, Close, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
const elementsData = await import("../data/shapesBar.json").then(m => m.default);

// Icon mapping
import CropSquareIcon from "@mui/icons-material/CropSquare";
import CircleIcon from "@mui/icons-material/Circle";
import ChangeHistoryIcon from "@mui/icons-material/ChangeHistory";
import DiamondIcon from "@mui/icons-material/Diamond";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PhotoFrameIcon from "@mui/icons-material/CropSquare";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import IconsIcon from "@mui/icons-material/Apps";

// Types
interface BaseElement {
  label: string;
  category?: string;
  thumbnail?: string;
}

interface ShapeElement extends BaseElement {
  type: string;
}

interface JsonElement extends BaseElement {
  json: any;
}

interface ImageElement extends BaseElement {
  url: string;
}

interface SvgElement extends BaseElement {
  svg: string;
}

type ElementItem = ShapeElement | JsonElement | ImageElement | SvgElement;

interface ElementCategory {
  name: string;
  items: ElementItem[];
}

interface DynamicElementsPanelProps {
  onAddElement: (elementData: any) => void;
  onClose: () => void;
}


const animatedObjectsData = [
  { id: "star", label: "Star", json: "/animations/json/star.json", thumbnail: "/animations/thumbnails/star.png" },
  { id: "heart", label: "Heart", json: "/animations/json/heart.json", thumbnail: "/animations/thumbnails/heart.png" },
  { id: "smile", label: "Smile", json: "/animations/json/smile.json", thumbnail: "/animations/thumbnails/smile.png" },
];


const PanelContainer = styled(Box)({
  position: "fixed",
  top: "64px",
  left: "80px",
  width: 360,
  height: "calc(100vh - 64px)",
  backgroundColor: "#fff",
  borderRadius: "0 12px 12px 0",
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  display: "flex",
  flexDirection: "column",
  zIndex: 1300,
  overflow: "hidden",
});

const ElementButton = styled(IconButton)({
  width: 72,
  height: 72,
  borderRadius: "12px",
  backgroundColor: "#f8fafc",
  color: "#64748b",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: "1px solid transparent",
  "&:hover": {
    backgroundColor: "#e0f2fe",
    color: "#00c4cc",
    transform: "translateY(-2px)",
    borderColor: "#00c4cc",
    boxShadow: "0 8px 25px rgba(0,196,204,0.15)",
  },
});

const ScrollContainer = styled(Box)({
  display: "flex",
  overflowX: "hidden",
  gap: 12,
  padding: "12px 16px",
  scrollBehavior: "smooth",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

const iconMap: { [key: string]: React.ElementType } = {
  rect: CropSquareIcon,
  circle: CircleIcon,
  triangle: ChangeHistoryIcon,
  diamond: DiamondIcon,
  star: StarIcon,
  heart: FavoriteIcon,
};

const categoryIcons: { [key: string]: React.ElementType } = {
  shapes: CropSquareIcon,
  frames: PhotoFrameIcon,
  flowers: LocalFloristIcon,
  stickers: EmojiEmotionsIcon,
  backgrounds: WallpaperIcon,
  icons: IconsIcon,
};

const DynamicElementsPanel: React.FC<DynamicElementsPanelProps> = ({
  onAddElement,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Transform JSON data into structured categories
  const categories: ElementCategory[] = Object.entries(elementsData).map(([key, items]) => {
    const transformedItems: ElementItem[] = items.map((item: any) => ({
      ...item,
    }));

    return {
      name: key.charAt(0).toUpperCase() + key.slice(1),
      items: transformedItems,
    };
  });

  categories.push({
  name: "Animations",
  items: animatedObjectsData,
});

  // Filter items based on search
  const getFilteredItems = (items: ElementItem[]) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const handleElementClick = (item: ElementItem) => {
    console.log("Element clicked:", item);
    
    // Determine item type and extract appropriate data
    if ((item as any).url) {
      // Image type
      console.log("Image payload:", (item as any).url);
      onAddElement((item as any).url);
    } else if ((item as any).json) {
      // JSON type
      console.log("JSON payload:", (item as any).json);
      onAddElement((item as any).json);
    } else if ((item as any).svg) {
      // SVG type
      console.log("SVG payload:", (item as any).svg);
      onAddElement({ type: 'svg', data: (item as any).svg });
    } else if ((item as any).type) {
      // Shape type
      console.log("Shape payload:", (item as any).type);
      onAddElement((item as any).type);
    } else {
      console.error("Unknown element type:", item);
    }
  };

  const scrollLeft = (categoryName: string) => {
    const ref = scrollRefs.current[categoryName];
    if (ref) ref.scrollBy({ left: -220, behavior: "smooth" });
  };

  const scrollRight = (categoryName: string) => {
    const ref = scrollRefs.current[categoryName];
    if (ref) ref.scrollBy({ left: 220, behavior: "smooth" });
  };

  const getElementType = (item: ElementItem): 'icon' | 'json' | 'img' | 'svg' => {
    if ((item as any).url) return 'img';
    if ((item as any).json) return 'json';
    if ((item as any).svg) return 'svg';
    return 'icon';
  };

  const renderElement = (item: ElementItem, index: number) => {
    const elementType = getElementType(item);
    const IconComponent = iconMap[(item as any).type] || CropSquareIcon;
    
    return (
      <Tooltip key={index} title={item.label} placement="top" arrow>
        <ElementButton
          onClick={() => handleElementClick(item)}
        >
          {elementType === 'icon' && (
            <IconComponent sx={{ fontSize: 32 }} />
          )}
          {elementType === 'json' && (
            item.thumbnail ? (
              <img 
                src={item.thumbnail} 
                alt={item.label} 
                style={{ 
                  width: 50, 
                  height: 50, 
                  objectFit: "contain",
                  borderRadius: "4px"
                }} 
              />
            ) : (
              <LocalFloristIcon sx={{ fontSize: 32 }} />
            )
          )}
          {elementType === 'img' && (
            <img 
              src={(item as any).url} 
              alt={item.label} 
              style={{ 
                width: 50, 
                height: 50, 
                objectFit: "contain", 
                borderRadius: "6px" 
              }} 
            />
          )}
          {elementType === 'svg' && (
            <Box 
              dangerouslySetInnerHTML={{ __html: (item as any).svg }} 
              sx={{ 
                width: 32, 
                height: 32, 
                "& svg": { 
                  width: "100%", 
                  height: "100%", 
                  fill: "currentColor" 
                } 
              }}
            />
          )}
        </ElementButton>
      </Tooltip>
    );
  };

  const renderCategory = (category: ElementCategory, index: number) => {
    const filteredItems = getFilteredItems(category.items);
    const categoryKey = category.name.toLowerCase();
    
    if (filteredItems.length === 0) return null;

    return (
      <Box key={index} sx={{ mb: 3 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            px: 2, 
            mb: 2, 
            fontWeight: 600, 
            color: "#374151",
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          {React.createElement(categoryIcons[categoryKey] || CropSquareIcon, { fontSize: "small" })}
          {category.name} ({filteredItems.length})
        </Typography>
        
        <Box sx={{ position: "relative" }}>
          {/* Left Scroll Button */}
          <IconButton
            onClick={() => scrollLeft(categoryKey)}
            sx={{
              position: "absolute",
              left: -8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:hover": { backgroundColor: "#f8fafc" },
            }}
            size="small"
          >
            <ArrowBackIos fontSize="small" />
          </IconButton>

          {/* Scrollable Content */}
          <ScrollContainer
            ref={(el) => {
              scrollRefs.current[categoryKey] = el as HTMLDivElement | null;
            }}
          >
            {filteredItems.map((item, idx) => renderElement(item, idx))}
          </ScrollContainer>

          {/* Right Scroll Button */}
          <IconButton
            onClick={() => scrollRight(categoryKey)}
            sx={{
              position: "absolute",
              right: -8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:hover": { backgroundColor: "#f8fafc" },
            }}
            size="small"
          >
            <ArrowForwardIos fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  };

  return (
    <PanelContainer>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
            Elements
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: "#64748b" }}>
            <Close />
          </IconButton>
        </Box>

        {/* Search */}
    <Box>
  <TextField
    fullWidth
    size="small"
    placeholder="Search elements..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Search fontSize="small" />
        </InputAdornment>
      ),
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        backgroundColor: "#fff",
        borderRadius: "8px",
      },
    }}
  />
</Box>
  </Box>
      {/* Category Tabs */}
      <Box sx={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#fff" }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              minWidth: 80,
              fontSize: "12px",
              fontWeight: 500,
            },
          }}
        >
          <Tab label="All" />
          {categories.map((category, index) => (
            <Tab key={index} label={category.name} />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto", py: 2 }}>
        {selectedCategory === 0 ? (
          // Show all categories
          categories.map((category, index) => renderCategory(category, index))
        ) : (
          // Show selected category
          renderCategory(categories[selectedCategory - 1], 0)
        )}
        
        {/* Empty State */}
        {searchQuery && categories.every(cat => getFilteredItems(cat.items).length === 0) && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="textSecondary">
              No elements found for "{searchQuery}"
            </Typography>
          </Box>
        )}
      </Box>
    </PanelContainer>
  );
};

export default DynamicElementsPanel;