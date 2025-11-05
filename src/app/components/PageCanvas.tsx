// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import {
//   Box,
//   Typography,
//   IconButton,
// } from "@mui/material";
// import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import AddIcon from "@mui/icons-material/Add";
// import LockIcon from "@mui/icons-material/Lock";
// import LockOpenIcon from "@mui/icons-material/LockOpen";
// import DeleteIcon from "@mui/icons-material/Delete";
// import * as fabric from "fabric";

// type PageItem = {
//   id: string;
//   name: string;
//   fabricJSON: any | null;
//   thumbnail: string | null;
//   locked?: boolean;
// };

// interface PageCanvasProps {
//   page: PageItem;
//   index: number;
//   canvasSize: { width: number; height: number };
//   onCanvasReady: (pageId: string, canvas: fabric.Canvas) => void;
//   onPageUpdate: (pageId: string) => void;
//   onDuplicate: (index: number) => void;
//   onAddBelow: (index: number) => void;
//   onToggleLock: (index: number) => void;
//   onDelete: (index: number) => void;
//   totalPages: number;
//   isActive: boolean;
//   onSetActive: () => void;
// }

// const PageCanvas: React.FC<PageCanvasProps> = ({
//   page,
//   index,
//   canvasSize,
//   onCanvasReady,
//   onPageUpdate,
//   onDuplicate,
//   onAddBelow,
//   onToggleLock,
//   onDelete,
//   totalPages,
//   isActive,
//   onSetActive
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
//   const canvasInstanceRef = useRef<fabric.Canvas | null>(null); 
//   const isInitialized = useRef(false);

//   // FIX 1: Initialize canvas once per page
//   useEffect(() => {
//     if (!canvasRef.current || isInitialized.current) return;

//     console.log(`Initializing canvas for page ${index + 1}`);

//     try {
//       const fabricCanvas = new fabric.Canvas(canvasRef.current, {
//         width: canvasSize.width,
//         height: canvasSize.height,
//         backgroundColor: 'white',
//         preserveObjectStacking: true,
//         renderOnAddRemove: true,
//         enableRetinaScaling: true,
//       });

//       // Store reference
//       canvasInstanceRef.current = fabricCanvas;
//       isInitialized.current = true;
      
//       setCanvas(fabricCanvas);
//       onCanvasReady(page.id, fabricCanvas);

//       console.log(` Canvas ready for page ${index + 1}`);

//     } catch (error) {
//       console.error(` Canvas init error for page ${index + 1}:`, error);
//     }

//     //  FIX: Safe cleanup
//     return () => {
//       console.log(`Cleaning up canvas for page ${index + 1}`);
      
//       try {
//         const fabricCanvas = canvasInstanceRef.current;
        
//         if (fabricCanvas) {
//           //  Check if canvas elements exist before cleanup
//           if (fabricCanvas.upperCanvasEl) {
//             fabricCanvas.off(); // Remove all event listeners
//           }
          
//           fabricCanvas.clear(); // Clear objects
          
//           if (fabricCanvas.dispose) {
//             fabricCanvas.dispose(); // Dispose canvas
//           }
          
//           canvasInstanceRef.current = null;
//           isInitialized.current = false;
//           console.log(`✅ Canvas disposed for page ${index + 1}`);
//         }
//       } catch (error) {
//         console.warn(`Cleanup warning for page ${index + 1}:`, error);
//         isInitialized.current = false;
//       }
//     };
//   }, [page.id]); // Only re-run if page.id changes


//   // FIX 2: Load content only when canvas is ready
//   // useEffect(() => {
//   //   if (!canvas || !page.fabricJSON) return;

//   //   console.log(` Loading content for page ${index + 1}`);

//   //   let jsonData = page.fabricJSON;

//   //   // Parse if string
//   //   if (typeof jsonData === 'string') {
//   //     try {
//   //       jsonData = JSON.parse(jsonData);
//   //     } catch (e) {
//   //       console.error('Failed to parse fabricJSON:', e);
//   //       return;
//   //     }
//   //   }

//   //   // Validate
//   //   if (!jsonData || typeof jsonData !== 'object') {
//   //     console.warn('Invalid fabricJSON for page', index + 1);
//   //     return;
//   //   }

//   //   try {
//   //     canvas.loadFromJSON(jsonData, () => {
//   //       // Set background
//   //       if (jsonData.background) {
//   //         canvas.backgroundColor = jsonData.background;
//   //       }

//   //       // Set dimensions
//   //       if (jsonData.width && jsonData.height) {
//   //         canvas.setWidth(jsonData.width);
//   //         canvas.setHeight(jsonData.height);
//   //       }

//   //       // Apply lock state
//   //       if (page.locked) {
//   //         canvas.selection = false;
//   //         canvas.getObjects().forEach((obj) => {
//   //           obj.selectable = false;
//   //           obj.evented = false;
//   //         });
//   //       }

//   //       // Mark editable SVG groups loaded from saved templates
//   //       try {
//   //         canvas.getObjects().forEach((obj: any) => {
//   //           if (obj.type === 'group' && Array.isArray((obj as any)._objects)) {
//   //             const childObjs = (obj as any)._objects;
//   //             const allPaths = childObjs.every((c: any) => c.type === 'path' || c.type === 'path-group' || c.type === 'polygon' || c.type === 'polyline');
//   //             if (allPaths) {
//   //               obj.isEditableSVG = true;
//   //               obj.svgPaths = childObjs;
//   //             }
//   //           } else if (obj.type === 'path' || obj.type === 'polygon' || obj.type === 'polyline') {
//   //             // Single path-like object: treat as editable SVG with one path
//   //             obj.isEditableSVG = true;
//   //             obj.svgPaths = [obj];
//   //           }
//   //         });
//   //       } catch (e) {
//   //         console.warn('Editable SVG marking skipped:', e);
//   //       }

//   //       canvas.renderAll();
//   //       console.log(`Loaded ${canvas.getObjects().length} objects for page ${index + 1}`);
//   //     });
//   //   } catch (error) {
//   //     console.error(`Failed to load content for page ${index + 1}:`, error);
//   //   }
//   // }, [canvas]); // Only depend on canvas



// // ✅ FIX 2: Load content with proper SVG color restoration
// useEffect(() => {
//   if (!canvas || !page.fabricJSON) return;

//   console.log(`📄 Loading content for page ${index + 1}`);

//   let jsonData = page.fabricJSON;

//   if (typeof jsonData === 'string') {
//     try {
//       jsonData = JSON.parse(jsonData);
//     } catch (e) {
//       console.error('Failed to parse fabricJSON:', e);
//       return;
//     }
//   }

//   if (!jsonData || typeof jsonData !== 'object') {
//     console.warn('Invalid fabricJSON for page', index + 1);
//     return;
//   }

//   try {
//     canvas.loadFromJSON(jsonData, () => {
//       if (jsonData.background) {
//         canvas.backgroundColor = jsonData.background;
//       }

//       if (jsonData.width && jsonData.height) {
//         canvas.setWidth(jsonData.width);
//         canvas.setHeight(jsonData.height);
//       }

//       if (page.locked) {
//         canvas.selection = false;
//         canvas.getObjects().forEach((obj) => {
//           obj.selectable = false;
//           obj.evented = false;
//         });
//       }

//       // ✅ CRITICAL: Restore SVG editability with COLORS
//       setTimeout(() => {
//         try {
//           let restoredCount = 0;
          
//           canvas.getObjects().forEach((obj: any, objIndex: number) => {
//             const savedObj = jsonData.objects[objIndex];
            
//             if (savedObj && savedObj.isEditableSVG) {
//               console.log(`🔧 Restoring SVG ${objIndex}`);
              
//               if (obj.type === 'group' && obj._objects && Array.isArray(obj._objects)) {
//                 const livePaths = obj._objects.filter((child: any) => 
//                   child && 
//                   typeof child.set === 'function' &&
//                   ['path', 'polygon', 'polyline'].includes(child.type)
//                 );
                
//                 if (livePaths.length > 0) {
//                   obj.isEditableSVG = true;
//                   obj.svgPaths = livePaths;
                  
//                   // ✅ CRITICAL: Restore editableFill for each path
//                   livePaths.forEach((path: any, pathIdx: number) => {
//                     const savedPath = savedObj.objects?.[pathIdx];
                    
//                     // Restore editableFill from saved data
//                     if (savedPath && savedPath.editableFill) {
//                       (path as any).editableFill = savedPath.editableFill;
//                       console.log(`  ✅ Path ${pathIdx}: editableFill = ${savedPath.editableFill}`);
//                     } else if (path.fill) {
//                       // If no editableFill saved, use current fill
//                       (path as any).editableFill = path.fill;
//                       console.log(`  ⚠️ Path ${pathIdx}: using fill = ${path.fill}`);
//                     }
                    
//                     path.isEditableSVG = true;
//                     path.svgPaths = livePaths;
//                   });
                  
//                   restoredCount++;
//                   console.log(`✅ SVG ${objIndex}: ${livePaths.length} paths restored`);
//                 }
//               } else if (['path', 'polygon', 'polyline'].includes(obj.type)) {
//                 obj.isEditableSVG = true;
//                 obj.svgPaths = [obj];
                
//                 if (savedObj.editableFill) {
//                   (obj as any).editableFill = savedObj.editableFill;
//                 } else if (obj.fill) {
//                   (obj as any).editableFill = obj.fill;
//                 }
                
//                 restoredCount++;
//               }
//             }
//           });
          
//           if (restoredCount > 0) {
//             console.log(`✅ Total SVGs restored: ${restoredCount}`);
//           }
          
//         } catch (e) {
//           console.warn('⚠️ SVG restoration error:', e);
//         }
        
//         canvas.renderAll();
//         console.log(`✅ Page ${index + 1} fully loaded`);
        
//       }, 200);
      
//     });
//   } catch (error) {
//     console.error(`❌ Failed to load page ${index + 1}:`, error);
//   }
// }, [canvas]);

//   //  FIX 3: Handle lock state changes
//   useEffect(() => {
//     if (!canvas) return;
    
//     canvas.selection = !page.locked;
//     canvas.getObjects().forEach((obj) => {
//       obj.selectable = !page.locked;
//       obj.evented = !page.locked;
//     });
//     canvas.renderAll();
//   }, [page.locked, canvas]);

//   //  FIX 4: Handle canvas size changes
//   useEffect(() => {
//     if (!canvas) return;
    
//     if (canvas.width !== canvasSize.width || canvas.height !== canvasSize.height) {
//       canvas.setWidth(canvasSize.width);
//       canvas.setHeight(canvasSize.height);
//       canvas.renderAll();
//       console.log(`Resized page ${index + 1}: ${canvasSize.width}x${canvasSize.height}`);
//     }
//   }, [canvas, canvasSize.width, canvasSize.height]);

//   return (
//     <Box
//       onClick={onSetActive}
//       sx={{
//         width: "fit-content",
//         position: "relative",
//         mb: 0
//       }}
//     >
//       {/* Page Header */}
//       <Box sx={{
//         display: "flex",
//             mt: 6 ,
//         gap: 1,
//         alignItems: "center",
//         justifyContent: "space-between",
//         background: "rgba(255,255,255,0.95)",
//         padding: "8px 12px",
//         borderRadius: "8px 8px 0 0",
//         boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
//         width: canvasSize.width
//       }}>
//         <Typography variant="body2" sx={{ fontWeight: 600 }}>
//           Page {index + 1} of {totalPages}
//         </Typography>
        
//         <Box sx={{ display: "flex", gap: 0.5 }}>
//           <IconButton 
//             size="small" 
//             onClick={(e) => {
//               e.stopPropagation();
//               onDuplicate(index);
//             }} 
//             title="Duplicate page"
//           >
//             <ContentCopyIcon fontSize="small" />
//           </IconButton>
          
//           <IconButton 
//             size="small" 
//             onClick={(e) => {
//               e.stopPropagation();
//               onAddBelow(index);
//             }} 
//             title="Add page below"
//           >
//             <AddIcon fontSize="small" />
//           </IconButton>
          
//           <IconButton 
//             size="small" 
//             onClick={(e) => {
//               e.stopPropagation();
//               onToggleLock(index);
//             }} 
//             title={page.locked ? "Unlock page" : "Lock page"}
//           >
//             {page.locked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
//           </IconButton>
          
//           {totalPages > 1 && (
//             <IconButton 
//               size="small" 
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onDelete(index);
//               }} 
//               title="Delete page"
//               sx={{ color: "#ef4444" }}
//             >
//               <DeleteIcon fontSize="small" />
//             </IconButton>
//           )}
//         </Box>
//       </Box>

//       {/* Canvas Container */}
//       <Box
//         sx={{
//           position: "relative",
//           border: isActive ? "3px solid #7c3aed" : "2px solid #e2e8f0",
//           borderRadius: "0 0 8px 8px",
//           overflow: "hidden",
//           boxShadow: isActive 
//             ? "0 8px 24px rgba(124,58,237,0.3)" 
//             : "0 4px 12px rgba(0,0,0,0.08)",
//           transition: "all 0.3s ease",
//           cursor: "pointer",
//           "&:hover": {
//             border: isActive ? "3px solid #7c3aed" : "2px solid #a78bfa",
//             boxShadow: "0 8px 20px rgba(124,58,237,0.2)"
//           }
//         }}
//       >
//         <canvas ref={canvasRef} />
        
//         {/* Lock indicator */}
//         {page.locked && (
//           <Box sx={{
//             position: "absolute",
//             top: 12,
//             right: 12,
//             background: "rgba(0,0,0,0.7)",
//             color: "white",
//             padding: "6px 10px",
//             borderRadius: 1,
//             display: "flex",
//             alignItems: "center",
//             gap: 0.5,
//             pointerEvents: "none"
//           }}>
//             <LockIcon fontSize="small" />
//             <Typography variant="caption">Locked</Typography>
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// };

// export default PageCanvas;




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

  // ✅ Replace line 40-73 (entire first useEffect)
useEffect(() => {
  // ✅ CRITICAL: Don't initialize if canvas ref doesn't exist or already initialized
  if (!canvasRef.current) {
    console.log(`⏭️ Canvas ref not ready for page ${index + 1}`);
    return;
  }

  if (isInitialized.current) {
    console.log(`⏭️ Canvas already initialized for page ${index + 1}`);
    return;
  }

  // ✅ Check if canvas element already has a Fabric instance
  const existingCanvas = (canvasRef.current as any).__fabric;
  if (existingCanvas) {
    console.log(`⚠️ Found existing Fabric canvas on element for page ${index + 1}, disposing first`);
    try {
      if (existingCanvas.dispose) {
        existingCanvas.dispose();
      }
    } catch (e) {
      console.warn('Existing canvas disposal warning:', e);
    }
    // Clear the reference
    delete (canvasRef.current as any).__fabric;
  }

  console.log(`🎨 Initializing NEW canvas for page ${index + 1}`);

  try {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: 'white',
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      enableRetinaScaling: true,
    });

    // ✅ Store reference on DOM element to detect duplicates
    (canvasRef.current as any).__fabric = fabricCanvas;

    canvasInstanceRef.current = fabricCanvas;
    isInitialized.current = true;
    
    setCanvas(fabricCanvas);
    onCanvasReady(page.id, fabricCanvas);

    console.log(`✅ Canvas ready for page ${index + 1}`);

  } catch (error) {
    console.error(`❌ Canvas init error for page ${index + 1}:`, error);
    isInitialized.current = false;
  }

  // ✅ CLEANUP with proper disposal
  return () => {
    const fabricCanvas = canvasInstanceRef.current;
    
    if (!fabricCanvas) {
      console.log(`⏭️ No canvas to dispose for page ${index + 1}`);
      return;
    }

    console.log(`🧹 Cleanup starting for page ${index + 1}`);
    
    // Mark as disposing
    (fabricCanvas as any)._isDisposing = true;
    
    try {
      // Stop pending operations
      if ((fabricCanvas as any).cancelRequestedRender) {
        (fabricCanvas as any).cancelRequestedRender();
      }
      
      // Check if already disposed
      const isDisposed = !fabricCanvas.upperCanvasEl || 
                         !fabricCanvas.lowerCanvasEl;
      
      if (isDisposed) {
        console.log(`⏭️ Already disposed - page ${index + 1}`);
        canvasInstanceRef.current = null;
        isInitialized.current = false;
        
        // Clear DOM reference
        if (canvasRef.current) {
          delete (canvasRef.current as any).__fabric;
        }
        return;
      }

      // Discard selection
      try {
        fabricCanvas.discardActiveObject?.();
      } catch (e) {}

      // Remove listeners
      try {
        fabricCanvas.off?.();
      } catch (e) {}

      // Remove objects
      try {
        const objects = fabricCanvas.getObjects?.() || [];
        objects.slice().forEach(obj => {
          try {
            if (fabricCanvas.upperCanvasEl) {
              fabricCanvas.remove(obj);
            }
          } catch (e) {}
        });
      } catch (e) {}

      // Clear
      try {
        if (fabricCanvas.upperCanvasEl && fabricCanvas.clear) {
          fabricCanvas.clear();
        }
      } catch (e) {}

      // ✅ Dispose with delay
      setTimeout(() => {
        try {
          if (fabricCanvas.dispose && fabricCanvas.upperCanvasEl) {
            fabricCanvas.dispose();
            console.log(`✅ Disposed - page ${index + 1}`);
          }
        } catch (e) {
          console.warn(`⚠️ Dispose warning - page ${index + 1}:`, e);
        }
        
        // Clear DOM reference after disposal
        if (canvasRef.current) {
          delete (canvasRef.current as any).__fabric;
        }
      }, 50);

    } catch (error) {
      console.warn(`⚠️ Cleanup error - page ${index + 1}:`, error);
    } finally {
      // Always clear references
      canvasInstanceRef.current = null;
      isInitialized.current = false;
    }
  };
}, [page.id, canvasSize.width, canvasSize.height]); // ✅ Include size in deps // Only re-run if page.id changes


  // ✅ FIX 2: Load content with proper SVG color restoration
  useEffect(() => {
    if (!canvas || !page.fabricJSON) return;

    console.log(`📄 Loading content for page ${index + 1}`);

    let jsonData = page.fabricJSON;

    if (typeof jsonData === 'string') {
      try {
        jsonData = JSON.parse(jsonData);
      } catch (e) {
        console.error('Failed to parse fabricJSON:', e);
        return;
      }
    }

    if (!jsonData || typeof jsonData !== 'object') {
      console.warn('Invalid fabricJSON for page', index + 1);
      return;
    }

    try {
      canvas.loadFromJSON(jsonData, () => {
        if (jsonData.background) {
          canvas.backgroundColor = jsonData.background;
        }

        if (jsonData.width && jsonData.height) {
          canvas.setWidth(jsonData.width);
          canvas.setHeight(jsonData.height);
        }

        if (page.locked) {
          canvas.selection = false;
          canvas.getObjects().forEach((obj) => {
            obj.selectable = false;
            obj.evented = false;
          });
        }

        // ✅ CRITICAL: Restore SVG editability with COLORS
        setTimeout(() => {
          try {
            let restoredCount = 0;
            
            canvas.getObjects().forEach((obj: any, objIndex: number) => {
              const savedObj = jsonData.objects[objIndex];
              
              if (savedObj && savedObj.isEditableSVG) {
                console.log(`🔧 Restoring SVG ${objIndex}`);
                
                if (obj.type === 'group' && obj._objects && Array.isArray(obj._objects)) {
                  const livePaths = obj._objects.filter((child: any) => 
                    child && 
                    typeof child.set === 'function' &&
                    ['path', 'polygon', 'polyline'].includes(child.type)
                  );
                  
                  if (livePaths.length > 0) {
                    obj.isEditableSVG = true;
                    obj.svgPaths = livePaths;
                    
                    // ✅ CRITICAL: Restore editableFill for each path
                    livePaths.forEach((path: any, pathIdx: number) => {
                      const savedPath = savedObj.objects?.[pathIdx];
                      
                      // Restore editableFill from saved data
                      if (savedPath && savedPath.editableFill) {
                        (path as any).editableFill = savedPath.editableFill;
                        console.log(`  ✅ Path ${pathIdx}: editableFill = ${savedPath.editableFill}`);
                      } else if (path.fill) {
                        // If no editableFill saved, use current fill
                        (path as any).editableFill = path.fill;
                        console.log(`  ⚠️ Path ${pathIdx}: using fill = ${path.fill}`);
                      }
                      
                      path.isEditableSVG = true;
                      path.svgPaths = livePaths;
                    });
                    
                    restoredCount++;
                    console.log(`✅ SVG ${objIndex}: ${livePaths.length} paths restored`);
                  }
                } else if (['path', 'polygon', 'polyline'].includes(obj.type)) {
                  obj.isEditableSVG = true;
                  obj.svgPaths = [obj];
                  
                  if (savedObj.editableFill) {
                    (obj as any).editableFill = savedObj.editableFill;
                  } else if (obj.fill) {
                    (obj as any).editableFill = obj.fill;
                  }
                  
                  restoredCount++;
                }
              }
            });
            
            if (restoredCount > 0) {
              console.log(`✅ Total SVGs restored: ${restoredCount}`);
            }
            
          } catch (e) {
            console.warn('⚠️ SVG restoration error:', e);
          }
          
          canvas.renderAll();
          console.log(`✅ Page ${index + 1} fully loaded`);
          
        }, 200);
        
      });
    } catch (error) {
      console.error(`❌ Failed to load page ${index + 1}:`, error);
    }
  }, [canvas]);

  // ✅ FIX 3: Handle lock state changes
  useEffect(() => {
    if (!canvas) return;
    
    canvas.selection = !page.locked;
    canvas.getObjects().forEach((obj) => {
      obj.selectable = !page.locked;
      obj.evented = !page.locked;
    });
    canvas.renderAll();
  }, [page.locked, canvas]);

  // ✅ FIX 4: Handle canvas size changes
  useEffect(() => {
    if (!canvas) return;
    
    if (canvas.width !== canvasSize.width || canvas.height !== canvasSize.height) {
      canvas.setWidth(canvasSize.width);
      canvas.setHeight(canvasSize.height);
      canvas.renderAll();
      console.log(`📐 Resized page ${index + 1}: ${canvasSize.width}x${canvasSize.height}`);
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
        mt: 6,
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