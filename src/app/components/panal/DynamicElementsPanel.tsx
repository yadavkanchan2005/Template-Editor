
// "use client";
// import React, { useRef, useState, useEffect } from "react";
// import { Box, IconButton, Tooltip, Typography, Tabs, Tab, TextField, InputAdornment } from "@mui/material";
// import { Search, Close, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
// import { styled } from "@mui/material/styles";
// const elementsData = await import("../data/shapesBar.json").then(m => m.default);

// // Icon mapping
// import CropSquareIcon from "@mui/icons-material/CropSquare";
// import CircleIcon from "@mui/icons-material/Circle";
// import ChangeHistoryIcon from "@mui/icons-material/ChangeHistory";
// import DiamondIcon from "@mui/icons-material/Diamond";
// import StarIcon from "@mui/icons-material/Star";
// import FavoriteIcon from "@mui/icons-material/Favorite";
// import PhotoFrameIcon from "@mui/icons-material/CropSquare";
// import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
// import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
// import WallpaperIcon from "@mui/icons-material/Wallpaper";
// import IconsIcon from "@mui/icons-material/Apps";

// // Types
// interface BaseElement {
//   label: string;
//   category?: string;
//   thumbnail?: string;
// }

// interface ShapeElement extends BaseElement {
//   type: string;
// }

// interface JsonElement extends BaseElement {
//   json: any;
// }

// interface ImageElement extends BaseElement {
//   url: string;
// }

// interface SvgElement extends BaseElement {
//   svg: string;
// }

// type ElementItem = ShapeElement | JsonElement | ImageElement | SvgElement;

// interface ElementCategory {
//   name: string;
//   items: ElementItem[];
// }

// interface DynamicElementsPanelProps {
//   onAddElement: (elementData: any) => void;
//   onClose: () => void;
// }


// const animatedObjectsData = [
//   { id: "star", label: "Star", json: "/animations/json/star.json", thumbnail: "/animations/thumbnails/star.png" },
//   { id: "heart", label: "Heart", json: "/animations/json/heart.json", thumbnail: "/animations/thumbnails/heart.png" },
//   { id: "smile", label: "Smile", json: "/animations/json/smile.json", thumbnail: "/animations/thumbnails/smile.png" },
// ];


// const PanelContainer = styled(Box)({
//   position: "fixed",
//   top: "64px",
//   left: "80px",
//   width: 360,
//   height: "calc(100vh - 64px)",
//   backgroundColor: "#fff",
//   borderRadius: "0 12px 12px 0",
//   boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
//   display: "flex",
//   flexDirection: "column",
//   zIndex: 1300,
//   overflow: "hidden",
// });

// const ElementButton = styled(IconButton)({
//   width: 72,
//   height: 72,
//   borderRadius: "12px",
//   backgroundColor: "#f8fafc",
//   color: "#64748b",
//   transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//   border: "1px solid transparent",
//   "&:hover": {
//     backgroundColor: "#e0f2fe",
//     color: "#00c4cc",
//     transform: "translateY(-2px)",
//     borderColor: "#00c4cc",
//     boxShadow: "0 8px 25px rgba(0,196,204,0.15)",
//   },
// });

// const ScrollContainer = styled(Box)({
//   display: "flex",
//   overflowX: "hidden",
//   gap: 12,
//   padding: "12px 16px",
//   scrollBehavior: "smooth",
//   "&::-webkit-scrollbar": {
//     display: "none",
//   },
// });

// const iconMap: { [key: string]: React.ElementType } = {
//   rect: CropSquareIcon,
//   circle: CircleIcon,
//   triangle: ChangeHistoryIcon,
//   diamond: DiamondIcon,
//   star: StarIcon,
//   heart: FavoriteIcon,
// };

// const categoryIcons: { [key: string]: React.ElementType } = {
//   shapes: CropSquareIcon,
//   frames: PhotoFrameIcon,
//   flowers: LocalFloristIcon,
//   stickers: EmojiEmotionsIcon,
//   backgrounds: WallpaperIcon,
//   icons: IconsIcon,
// };

// const DynamicElementsPanel: React.FC<DynamicElementsPanelProps> = ({
//   onAddElement,
//   onClose,
// }) => {
//   const [selectedCategory, setSelectedCategory] = useState(0);
//   const [searchQuery, setSearchQuery] = useState("");
//   const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

//   // Transform JSON data into structured categories
//   const categories: ElementCategory[] = Object.entries(elementsData).map(([key, items]) => {
//     const transformedItems: ElementItem[] = items.map((item: any) => ({
//       ...item,
//     }));

//     return {
//       name: key.charAt(0).toUpperCase() + key.slice(1),
//       items: transformedItems,
//     };
//   });

//   categories.push({
//   name: "Animations",
//   items: animatedObjectsData,
// });

//   // Filter items based on search
//   const getFilteredItems = (items: ElementItem[]) => {
//     if (!searchQuery) return items;
//     return items.filter(item => 
//       item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
//     );
//   };

//   const handleElementClick = (item: ElementItem) => {
//     console.log("Element clicked:", item);

//     // Determine item type and extract appropriate data
//     if ((item as any).url) {
//       // Image type
//       console.log("Image payload:", (item as any).url);
//       onAddElement((item as any).url);
//     } else if ((item as any).json) {
//       // JSON type
//       console.log("JSON payload:", (item as any).json);
//       onAddElement((item as any).json);
//     } else if ((item as any).svg) {
//       // SVG type
//       console.log("SVG payload:", (item as any).svg);
//       onAddElement({ type: 'svg', data: (item as any).svg });
//     } else if ((item as any).type) {
//       // Shape type
//       console.log("Shape payload:", (item as any).type);
//       onAddElement((item as any).type);
//     } else {
//       console.error("Unknown element type:", item);
//     }
//   };

//   const scrollLeft = (categoryName: string) => {
//     const ref = scrollRefs.current[categoryName];
//     if (ref) ref.scrollBy({ left: -220, behavior: "smooth" });
//   };

//   const scrollRight = (categoryName: string) => {
//     const ref = scrollRefs.current[categoryName];
//     if (ref) ref.scrollBy({ left: 220, behavior: "smooth" });
//   };

//   const getElementType = (item: ElementItem): 'icon' | 'json' | 'img' | 'svg' => {
//     if ((item as any).url) return 'img';
//     if ((item as any).json) return 'json';
//     if ((item as any).svg) return 'svg';
//     return 'icon';
//   };

//   const renderElement = (item: ElementItem, index: number) => {
//     const elementType = getElementType(item);
//     const IconComponent = iconMap[(item as any).type] || CropSquareIcon;

//     return (
//       <Tooltip key={index} title={item.label} placement="top" arrow>
//         <ElementButton
//           onClick={() => handleElementClick(item)}
//         >
//           {elementType === 'icon' && (
//             <IconComponent sx={{ fontSize: 32 }} />
//           )}
//           {elementType === 'json' && (
//             item.thumbnail ? (
//               <img 
//                 src={item.thumbnail} 
//                 alt={item.label} 
//                 style={{ 
//                   width: 50, 
//                   height: 50, 
//                   objectFit: "contain",
//                   borderRadius: "4px"
//                 }} 
//               />
//             ) : (
//               <LocalFloristIcon sx={{ fontSize: 32 }} />
//             )
//           )}
//           {elementType === 'img' && (
//             <img 
//               src={(item as any).url} 
//               alt={item.label} 
//               style={{ 
//                 width: 50, 
//                 height: 50, 
//                 objectFit: "contain", 
//                 borderRadius: "6px" 
//               }} 
//             />
//           )}
//           {elementType === 'svg' && (
//             <Box 
//               dangerouslySetInnerHTML={{ __html: (item as any).svg }} 
//               sx={{ 
//                 width: 32, 
//                 height: 32, 
//                 "& svg": { 
//                   width: "100%", 
//                   height: "100%", 
//                   fill: "currentColor" 
//                 } 
//               }}
//             />
//           )}
//         </ElementButton>
//       </Tooltip>
//     );
//   };

//   const renderCategory = (category: ElementCategory, index: number) => {
//     const filteredItems = getFilteredItems(category.items);
//     const categoryKey = category.name.toLowerCase();

//     if (filteredItems.length === 0) return null;

//     return (
//       <Box key={index} sx={{ mb: 3 }}>
//         <Typography 
//           variant="subtitle2" 
//           sx={{ 
//             px: 2, 
//             mb: 2, 
//             fontWeight: 600, 
//             color: "#374151",
//             display: "flex",
//             alignItems: "center",
//             gap: 1
//           }}
//         >
//           {React.createElement(categoryIcons[categoryKey] || CropSquareIcon, { fontSize: "small" })}
//           {category.name} ({filteredItems.length})
//         </Typography>

//         <Box sx={{ position: "relative" }}>
//           {/* Left Scroll Button */}
//           <IconButton
//             onClick={() => scrollLeft(categoryKey)}
//             sx={{
//               position: "absolute",
//               left: -8,
//               top: "50%",
//               transform: "translateY(-50%)",
//               zIndex: 10,
//               backgroundColor: "#fff",
//               boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//               "&:hover": { backgroundColor: "#f8fafc" },
//             }}
//             size="small"
//           >
//             <ArrowBackIos fontSize="small" />
//           </IconButton>

//           {/* Scrollable Content */}
//           <ScrollContainer
//             ref={(el) => {
//               scrollRefs.current[categoryKey] = el as HTMLDivElement | null;
//             }}
//           >
//             {filteredItems.map((item, idx) => renderElement(item, idx))}
//           </ScrollContainer>

//           {/* Right Scroll Button */}
//           <IconButton
//             onClick={() => scrollRight(categoryKey)}
//             sx={{
//               position: "absolute",
//               right: -8,
//               top: "50%",
//               transform: "translateY(-50%)",
//               zIndex: 10,
//               backgroundColor: "#fff",
//               boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//               "&:hover": { backgroundColor: "#f8fafc" },
//             }}
//             size="small"
//           >
//             <ArrowForwardIos fontSize="small" />
//           </IconButton>
//         </Box>
//       </Box>
//     );
//   };

//   return (
//     <PanelContainer>
//       {/* Header */}
//       <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
//         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//           <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
//             Elements
//           </Typography>
//           <IconButton onClick={onClose} size="small" sx={{ color: "#64748b" }}>
//             <Close />
//           </IconButton>
//         </Box>

//         {/* Search */}
//     <Box>
//   <TextField
//     fullWidth
//     size="small"
//     placeholder="Search elements..."
//     value={searchQuery}
//     onChange={(e) => setSearchQuery(e.target.value)}
//     InputProps={{
//       startAdornment: (
//         <InputAdornment position="start">
//           <Search fontSize="small" />
//         </InputAdornment>
//       ),
//     }}
//     sx={{
//       "& .MuiOutlinedInput-root": {
//         backgroundColor: "#fff",
//         borderRadius: "8px",
//       },
//     }}
//   />
// </Box>
//   </Box>
//       {/* Category Tabs */}
//       <Box sx={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#fff" }}>
//         <Tabs
//           value={selectedCategory}
//           onChange={(_, newValue) => setSelectedCategory(newValue)}
//           variant="scrollable"
//           scrollButtons="auto"
//           sx={{
//             "& .MuiTab-root": {
//               minWidth: 80,
//               fontSize: "12px",
//               fontWeight: 500,
//             },
//           }}
//         >
//           <Tab label="All" />
//           {categories.map((category, index) => (
//             <Tab key={index} label={category.name} />
//           ))}
//         </Tabs>
//       </Box>

//       {/* Content */}
//       <Box sx={{ flex: 1, overflow: "auto", py: 2 }}>
//         {selectedCategory === 0 ? (
//           // Show all categories
//           categories.map((category, index) => renderCategory(category, index))
//         ) : (
//           // Show selected category
//           renderCategory(categories[selectedCategory - 1], 0)
//         )}

//         {/* Empty State */}
//         {searchQuery && categories.every(cat => getFilteredItems(cat.items).length === 0) && (
//           <Box sx={{ textAlign: "center", py: 4 }}>
//             <Typography variant="body2" color="textSecondary">
//               No elements found for "{searchQuery}"
//             </Typography>
//           </Box>
//         )}
//       </Box>
//     </PanelContainer>
//   );
// };

// export default DynamicElementsPanel;






import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Search,
  Close,
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
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
import api from "../../lib/utils/axios";

// Types
interface BaseElement {
  id: string;
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

// Styled components
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

// Icon mapping
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
  const [categories, setCategories] = useState<ElementCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Track loaded items per category
  const [categoryData, setCategoryData] = useState<{
    [key: string]: {
      items: ElementItem[];
      loading: boolean;
    };
  }>({});

  // Fetch categories and items from API on mount
useEffect(() => {
  const fetchElements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/media/elements');
      const data = res.data as Array<{ id: string; url: string; category: string; type?: string; filename?: string }>;

      //  Filter out UGC items and only keep element/ items
      const filteredData = data.filter((d) => {
        // Check if URL contains 'element/' or 'element%2F' (URL encoded)
        const isElement = d.url && (d.url.includes('element/') || d.url.includes('element%2F'));
        return isElement;
      });

      console.log('[DynamicElementsPanel] Filtered elements count:', filteredData.length);

      const grouped: { [key: string]: ElementItem[] } = {};
      filteredData.forEach((d) => {
        const cat = (d.category || 'Others').trim();
        if (!grouped[cat]) grouped[cat] = [];
        const label = d.filename || (d.url.split('/').pop() || 'element');
        grouped[cat].push({ id: d.id, label, url: d.url, category: cat } as ImageElement);
      });

      const formattedCategories: ElementCategory[] = Object.entries(grouped).map(([key, items]) => ({ name: key, items }));
      setCategories(formattedCategories);

      const initialCategoryData: { [key: string]: { items: ElementItem[]; loading: boolean } } = {};
      formattedCategories.forEach((cat) => {
        initialCategoryData[cat.name] = { items: cat.items, loading: false };
      });
      setCategoryData(initialCategoryData);

      setLoading(false);
    } catch (err: any) {
      setError('Error fetching elements');
      setLoading(false);
      console.error('[DynamicElementsPanel] Error fetching elements:', err);
    }
  };
  fetchElements();
}, []);


  // Search filter
  const getFilteredItems = (items: ElementItem[]) => {
    if (!searchQuery) return items;
    return items.filter(
      (item) =>
        item.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

// handleElementClick - detect if it's a background image
// UPDATED handleElementClick function for DynamicElementsPanel.tsx

const handleElementClick = async (item: ElementItem) => {
  const anyItem = item as any;
  
  if (anyItem.svg) {
    onAddElement({ type: "svg", data: anyItem.svg });
    return;
  }
  
  if (anyItem.json) {
      onAddElement(anyItem.json);
    return;
  }
  
  if (anyItem.url) {
    const url: string = anyItem.url;
    const fullUrl = getImageUrl(url);
    
    
    const lower = url.toLowerCase();
    
    //  Check if it's a background image
    const isBackground = anyItem.category?.toLowerCase() === 'backgrounds' || 
                      anyItem.category?.toLowerCase() === 'background';
    
    //  SVG FILE HANDLING
    if (lower.endsWith('.svg') || lower.includes('.svg')) {
      console.log(' Fetching SVG file...');
      try {
        const res = await fetch(fullUrl);
        const svgText = await res.text();
        console.log(' SVG fetched, length:', svgText.length);
        
        // ✅ Send SVG as string for special handling
        onAddElement({ 
          type: 'svg', 
          data: svgText,
          isFile: true 
        });
      } catch (e) {
        console.error(' Failed to fetch SVG:', e);
      }
      return;
    }
    
    // JSON
    if (lower.endsWith('.json') || lower.includes('.json')) {
      console.log(' Fetching JSON...');
      try {
        const res = await fetch(fullUrl);
        const json = await res.json();
        console.log('JSON fetched');
        onAddElement(json);
      } catch (e) {
        console.error(' Failed to fetch JSON:', e);
      }
      return;
    }
    
    // Video
    if (lower.match(/\.(mp4|webm|mov)$/)) {
      console.log(' Video detected');
      onAddElement({ type: 'video', src: fullUrl });
      return;
    }
    
    // Image
    console.log('Image detected', isBackground ? '(BACKGROUND)' : '(REGULAR)');
    onAddElement({ 
      type: 'ADD_IMAGE', 
      src: fullUrl,
      isBackground: isBackground 
    });
    return;
  }
  
  if (anyItem.type) {
    console.log('Shape type detected:', anyItem.type);
    onAddElement({ type: 'ADD_SHAPE', payload: anyItem.type });
  }
};

  const getElementType = (item: ElementItem): "icon" | "json" | "img" | "svg" => {
    if ((item as any).url) return "img";
    if ((item as any).json) return "json";
    if ((item as any).svg) return "svg";
    return "icon";
  };


const getImageUrl = (url: string) => {
  console.log('getImageUrl input:', url); 
  
  if (!url) return "/placeholder.png";
  
  // If it's already a proxy URL from backend
  if (url.startsWith("/media/elements/proxy")) {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    console.log('Proxy URL built:', fullUrl); 
    return fullUrl;
  }
  
  // If it's a full HTTP URL
  if (url.startsWith("http")) {
    console.log('Direct HTTP URL:', url); 
    return url;
  }
  
  // If it's just a key, build proxy URL
  const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL}/media/elements/proxy?key=${encodeURIComponent(url)}`;
  console.log('Built proxy URL from key:', proxyUrl); 
  return proxyUrl;
};
  const renderElement = (item: ElementItem, index: number) => {
    const elementType = getElementType(item);
    const IconComponent = iconMap[(item as any).type] || CropSquareIcon;

    return (
      <Tooltip key={index} title={item.label} placement="top" arrow>
        <ElementButton onClick={() => handleElementClick(item)}>
          {elementType === "icon" && <IconComponent sx={{ fontSize: 32 }} />}
          {elementType === "json" && item.thumbnail ? (
            <img
              src={getImageUrl(item.thumbnail)}
              alt={item.label}
              style={{ width: 50, height: 50, objectFit: "contain", borderRadius: "6px" }}
              onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
            />
          ) : elementType === "json" ? (
            <LocalFloristIcon sx={{ fontSize: 32 }} />
          ) : null}
          {elementType === "img" && (
            <img
              src={getImageUrl((item as any).url)}
              alt={item.label}
              style={{ width: 50, height: 50, objectFit: "contain", borderRadius: "6px" }}
              onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
            />
          )}
         {elementType === "svg" && (
  <Box
    dangerouslySetInnerHTML={{ __html: (item as any).svg }}
    sx={{
      width: 32,
      height: 32,
      "& svg": { width: "100%", height: "100%", fill: "currentColor" },
    }}
  />
)}
        </ElementButton>
      </Tooltip>
    );
  };

  const renderCategory = (category: ElementCategory, index: number) => {
    const categoryKey = category.name;
    const items = categoryData[categoryKey]?.items || [];
    const filteredItems = getFilteredItems(items);

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
            gap: 1,
          }}
        >
          {React.createElement(categoryIcons[categoryKey.toLowerCase()] || CropSquareIcon, {
            fontSize: "small",
          })}
          {category.name} ({filteredItems.length})
        </Typography>

        <Box sx={{ position: "relative" }}>
          {/* Left Scroll */}
          <IconButton
            onClick={() => scrollRefs.current[categoryKey]?.scrollBy({ left: -220, behavior: "smooth" })}
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

          {/* Scrollable */}
          <ScrollContainer
            ref={(el) => {
              scrollRefs.current[categoryKey] = el as HTMLDivElement | null;
            }}
          >
            {filteredItems.map((item, idx) => renderElement(item, idx))}
          </ScrollContainer>

          {/* Right Scroll */}
          <IconButton
            onClick={() => scrollRefs.current[categoryKey]?.scrollBy({ left: 220, behavior: "smooth" })}
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
              "& .MuiOutlinedInput-root": { backgroundColor: "#fff", borderRadius: "8px" },
            }}
          />
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#fff" }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ "& .MuiTab-root": { minWidth: 80, fontSize: "12px", fontWeight: 500 } }}
        >
          <Tab label="All" />
          {categories.map((category, index) => (
            <Tab key={index} label={category.name} />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto", py: 2 }}>
        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="textSecondary">
              Loading elements...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        ) : selectedCategory === 0 ? (
          categories.map((category, index) => renderCategory(category, index))
        ) : (
          renderCategory(categories[selectedCategory - 1], 0)
        )}

        {searchQuery &&
          categories.every(
            (cat) =>
              getFilteredItems(categoryData[cat.name]?.items || []).length === 0
          ) && (
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