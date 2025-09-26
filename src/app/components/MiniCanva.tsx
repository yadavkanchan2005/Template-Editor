"use client";
import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
import CommandManager, { Command } from "@/lib/CommandManager"; 

const { Canvas, Textbox, Rect, Circle, Triangle, Line, Polygon } = fabric;
const FabricImage = fabric.Image;

type Action = { type: string; payload?: any } | null;

interface Props {
  action: Action;
    drawMode?: boolean; 
  onCanvasReady?: (canvas: fabric.Canvas) => void;
   onObjectSelected?: (object: fabric.Object | null) => void; 
     setSelectedObject?: (obj: fabric.Object | null) => void;
}


function moveObjectToIndex(canvas: fabric.Canvas, obj: fabric.Object, index: number) {
  // Try fabric's built-in moveTo (some builds have it)
  if (typeof (obj as any).moveTo === "function") {
    try {
      (obj as any).moveTo(index);
      obj.setCoords();
      canvas.requestRenderAll();
      return;
    } catch (e) {
      // fallback to manual
    }
  }

  // Fallback: manual reorder of internal objects array
  const objects = canvas.getObjects();
  const curr = objects.indexOf(obj);
  if (curr !== -1) {
    objects.splice(curr, 1);
  }
  const targetIndex = Math.max(0, Math.min(index, objects.length));
  objects.splice(targetIndex, 0, obj);

  // assign back to internal array and refresh
  (canvas as any)._objects = objects;
  obj.setCoords();
  canvas.requestRenderAll();
}

const MiniCanva: React.FC<Props> = ({ action, onCanvasReady, onObjectSelected,setSelectedObject }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);
  const managerRef = useRef<CommandManager | null>(null);
  

  // map to store object state before modification (for modify command)
  const prevStateMap = useRef<WeakMap<fabric.Object, any>>(new WeakMap());

  // helper: restore from JSON (used by clear undo)
  const restoreFromJSON = async (canvas: fabric.Canvas, json: any) => {
    canvas.clear();
    await new Promise<void>((resolve) => {
      canvas.loadFromJSON(json, () => {
        canvas.renderAll();
        resolve();
      });
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 900,
      height: 600,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    
    canvasInstance.current = canvas;
    managerRef.current = new CommandManager(canvas);
 if (onCanvasReady) onCanvasReady(canvas);

  canvas.on("selection:created", (e: any) => {
  const obj = e.selected?.[0] || null;
  if (onObjectSelected) onObjectSelected(obj);
});
canvas.on("selection:updated", (e: any) => {
  const obj = e.selected?.[0] || null;
  if (onObjectSelected) onObjectSelected(obj);
});
canvas.on("selection:cleared", () => {
  if (onObjectSelected) onObjectSelected(null);
});


canvas.on("path:created", (e) => {
  const path = e.path;

  path.set({
    stroke: canvas.freeDrawingBrush?.color || "#000",
strokeWidth: canvas.freeDrawingBrush?.width || 3,
// jo brush width hai
    fill: "#00c4cc",   // fill after complete
    selectable: true,
    evented: true,
  });

  // back to selection mode
  canvas.isDrawingMode = false;
  canvas.selection = true;
  canvas.forEachObject((obj) => (obj.selectable = true));
  canvas.setActiveObject(path);
  onObjectSelected?.(path);

  canvas.requestRenderAll();
});



  // Selection
    const handleSelection = (e: any) => {
      const obj = e.selected?.[0] || null;
      if (onObjectSelected) onObjectSelected(obj);
    };
    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => onObjectSelected?.(null));

    // Save baseline before modification
    canvas.on("mouse:down", (opt: any) => {
      const target = opt.target as fabric.Object | undefined;
      if (target) prevStateMap.current.set(target, target.toObject());
    });

    canvas.on("object:modified", (evt: any) => {
      const target = evt.target as fabric.Object;
      if (!target || !managerRef.current) return;
      const prev = prevStateMap.current.get(target) ?? null;
      const next = target.toObject();
      if (!prev) {
        prevStateMap.current.set(target, next);
        return;
      }

      const cmd = {
        do: () => {
          target.set(next);
          target.setCoords();
          canvas.requestRenderAll();
        },
        undo: () => {
          target.set(prev);
          target.setCoords();
          canvas.requestRenderAll();
        },
      };
      managerRef.current.execute(cmd);
      prevStateMap.current.delete(target);
    });

    // Hover highlight
    canvas.on("mouse:over", (e) => {
      if (e.target) e.target.set({ strokeWidth: 2 });
      canvas.requestRenderAll();
    });
    canvas.on("mouse:out", (e) => {
      if (e.target) e.target.set({ strokeWidth: 1 });
      canvas.requestRenderAll();
    });

    
    // keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        managerRef.current?.undo();
        return;
      }
      // Ctrl/Cmd + Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        managerRef.current?.redo();
        return;
      }
      // Delete / Backspace -> delete selected objects
      if (e.key === "Delete" || e.key === "Backspace") {
     
  const activeElement = document.activeElement;

  if (
    activeElement &&
    (activeElement.tagName === "INPUT" ||
     activeElement.tagName === "TEXTAREA" ||
     (activeElement as HTMLElement).isContentEditable)
  ) {
    return; // kuch na karo, normal input behavior
  }
        e.preventDefault();
        const selected = canvas.getActiveObjects();
        if (selected && selected.length) {
          selected.forEach((obj) => {
            const idx = canvas.getObjects().indexOf(obj);
            const cmd: Command = {
              do: () => {
                canvas.remove(obj);
                canvas.discardActiveObject();
                canvas.requestRenderAll();
              },
              undo: () => {
                const objs = canvas.getObjects();
                objs.splice(Math.max(0, Math.min(idx, objs.length)), 0, obj);
                (canvas as any)._objects = objs;
                obj.setCoords();
                canvas.requestRenderAll();
              },
            };
            managerRef.current?.execute(cmd);
          });
        }
      }
    };



    
    document.addEventListener("keydown", handleKeyDown);

    // cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      canvas.dispose();
      canvasInstance.current = null;
      managerRef.current = null;
    };
  }, []);


  // handle incoming actions from Sidebar / parent
  useEffect(() => {
    if (!action) return;
    const canvas = canvasInstance.current;
    const manager = managerRef.current;
    if (!canvas || !manager) return;
    const { type, payload } = action;

    switch (type) {
      // ADD TEXT
      case "ADD_TEXT": {
        const t = new Textbox("New Text", { left: 100, top: 100, fontSize: 24, fill: "#000" });
        const cmd: Command = {
          do: () => {
            canvas.add(t);
            canvas.setActiveObject(t);
            canvas.requestRenderAll();
          },
          undo: () => {
            canvas.remove(t);
            canvas.requestRenderAll();
          },
        };
        manager.execute(cmd);
        break;
      }


// ADD SHAPE
case "ADD_SHAPE": {
  let obj: fabric.Object | null = null;

  // 1) Normal shapes
  if (typeof payload === "string" &&
      !payload.startsWith("http") &&
      !payload.startsWith("/")) {
    switch (payload) {
      case "rect":
        obj = new fabric.Rect({
          left: 150, top: 150,
          width: 120, height: 80,
          fill: "lightblue"
        });
        break;

      case "circle":
        obj = new fabric.Circle({
          left: 200, top: 200,
          radius: 50,
          fill: "lightgreen"
        });
        break;

      case "triangle":
        obj = new fabric.Triangle({
          left: 250, top: 250,
          width: 100, height: 100,
          fill: "lightpink"
        });
        break;

      case "diamond":
        obj = new fabric.Polygon(
          [
            { x: 50, y: 0 },
            { x: 100, y: 50 },
            { x: 50, y: 100 },
            { x: 0, y: 50 },
          ],
          { left: 300, top: 300, fill: "purple" }
        );
        break;
        
      case "star": {
        const pts = Array.from({ length: 5 }, (_, i) => {
          const a = (i * 72 - 90) * (Math.PI / 180);
          return { x: 50 * Math.cos(a), y: 50 * Math.sin(a) };
        });
        obj = new fabric.Polygon(pts, {
          left: 300, top: 300, fill: "yellow"
        });
        break;
      }

      case "heart":
        obj = new fabric.Path(
          "M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 " +
          "C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09" +
          "C13.09,3.81,14.76,3,16.5,3 " +
          "C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54" +
          "L12,21.35z",
          { left: 300, top: 300, fill: "red", scaleX: 3, scaleY: 3 }
        );
        break;
        
        
    }

    if (obj && canvas && manager) {
      const cmd: Command = {
        do: () => {
          canvas.add(obj!);
          canvas.setActiveObject(obj!);
          canvas.requestRenderAll();
        },
        undo: () => {
          canvas.remove(obj!);
          canvas.requestRenderAll();
        },
      };
      manager.execute(cmd);
    }
  }

  // 2) JSON objects
  else if (payload && typeof payload === "object" && payload.objects) {
    fabric.util.enlivenObjects(payload.objects).then((objects: any[]) => {
      if (canvas && manager) {
        const cmd: Command = {
          do: () => {
            objects.forEach((obj, i) => {
              obj.set({ left: 200 + i * 10, top: 200 + i * 10 });
              canvas.add(obj);
            });
            if (objects.length > 0) {
              canvas.setActiveObject(objects[0]);
            }
            canvas.requestRenderAll();
          },
          undo: () => {
            objects.forEach((obj) => canvas.remove(obj));
            canvas.requestRenderAll();
          },
        };
        manager.execute(cmd);
      }
    });
  }



  // 3) SVG (import and add each path as an individual object)
else if (payload && typeof payload === "object" && payload.type === "svg") {
  (async () => {
    const { objects, options } = await fabric.loadSVGFromString(payload.data);
    if (canvas && manager) {
      objects.forEach((obj) => {
        if (obj && typeof obj.set === "function") {
          obj.set({
            left: 200,
            top: 200,
            originX: "center",
            originY: "center",
            selectable: true,
            evented: true,
          });
          obj.padding = 0;           
          obj.strokeUniform = true;  
          obj.setCoords();          

          const cmd: Command = {
            do: () => {
              canvas.add(obj);
              canvas.setActiveObject(obj);
              canvas.requestRenderAll();
            },
            undo: () => {
              canvas.remove(obj);
              canvas.requestRenderAll();
            },
          };
          manager.execute(cmd);
        }
      });
    }
  })();
}



  // 4) Images
  else if (typeof payload === "string" &&
           (payload.startsWith("http") || payload.startsWith("/"))) {
    fabric.Image.fromURL(payload, { crossOrigin: "anonymous" })
      .then((img) => {
        if (img && canvas && manager) {
          img.scaleToWidth(200);
          img.set({ left: 200, top: 200 });

          const cmd: Command = {
            do: () => {
              canvas.add(img);
              canvas.setActiveObject(img);
              canvas.requestRenderAll();
            },
            undo: () => {
              canvas.remove(img);
              canvas.requestRenderAll();
            },
          };
          manager.execute(cmd);
        }
      })
      .catch((err) => {
        console.error("Image load error:", err);
      });
  }

  break;
}



      // DELETE selected
      case "DELETE": {
        const active = canvas.getActiveObjects();
        if (active?.length) {
          active.forEach((o) => {
            const idx = canvas.getObjects().indexOf(o);
            const obj = o;
            const cmd: Command = {
              do: () => {
                canvas.remove(obj);
                canvas.discardActiveObject();
                canvas.requestRenderAll();
              },
              undo: () => {
                const objs = canvas.getObjects();
                objs.splice(Math.max(0, Math.min(idx, objs.length)), 0, obj);
                (canvas as any)._objects = objs;
                obj.setCoords();
                canvas.requestRenderAll();
              },
            };
            manager.execute(cmd);
          });
        }
        break;


      }

case "TOGGLE_DRAW": {
  if (!canvas) return;

  const isDraw = !!payload;
  canvas.isDrawingMode = isDraw;
  canvas.selection = !isDraw;

  // Objects selectable only if not drawing
  canvas.forEachObject((obj) => (obj.selectable = !isDraw));
  if (isDraw) {
    if (!canvas.freeDrawingBrush) canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = "#000"; 


    canvas.on("path:created", (e) => {
      const path = e.path;

      path.set({
        strokeWidth: 3,
        stroke: "#000",
        fill: "#00c4cc", 
        selectable: true,
        evented: true,
      });
      canvas.isDrawingMode = false;
      canvas.selection = true;

      canvas.forEachObject((obj) => (obj.selectable = true));

      canvas.setActiveObject(path);
      onObjectSelected?.(path);

      canvas.requestRenderAll();
    });
  } else {
    canvas.off("path:created");
  }
  canvas.requestRenderAll();
  break;
}



      // CLEAR (store full JSON for undo)
      case "CLEAR": {
        const snapshot = canvas.toJSON();
        const cmd: Command = {
          do: () => {
            canvas.clear();
            canvas.backgroundColor = "#ffffff";
            canvas.requestRenderAll();
          },
          undo: () => {
            restoreFromJSON(canvas, snapshot);
          },
        };
        manager.execute(cmd);
        break;
      }

      // UNDO / REDO
      case "UNDO":
        manager.undo();
        break;
      case "REDO":
        manager.redo();
        break;

      // BRING FORWARD
      case "BRING_FORWARD": {
        const active = canvas.getActiveObject();
        if (active) {
          const objects = canvas.getObjects();
          const prevIndex = objects.indexOf(active);
          const newIndex = Math.min(prevIndex + 1, objects.length - 1);

          const cmd: Command = {
            do: () => {
              moveObjectToIndex(canvas, active, newIndex);
              canvas.setActiveObject(active);
            },
            undo: () => {
              moveObjectToIndex(canvas, active, prevIndex);
              canvas.setActiveObject(active);
            },
          };

          manager.execute(cmd);
        }
        break;
      }

      // SEND BACKWARD
      case "SEND_BACKWARD": {
        const active = canvas.getActiveObject();
        if (active) {
          const objects = canvas.getObjects();
          const prevIndex = objects.indexOf(active);
          const newIndex = Math.max(prevIndex - 1, 0);

          const cmd: Command = {
            do: () => {
              moveObjectToIndex(canvas, active, newIndex);
              canvas.setActiveObject(active);
            },
            undo: () => {
              moveObjectToIndex(canvas, active, prevIndex);
              canvas.setActiveObject(active);
            },
          };

          manager.execute(cmd);
        }
        break;
      }

      // BRING TO FRONT
      case "BRING_TO_FRONT": {
        const active = canvas.getActiveObject();
        if (active) {
          const objects = canvas.getObjects();
          const prevIndex = objects.indexOf(active);
          const newIndex = objects.length - 1;

          const cmd: Command = {
            do: () => {
              moveObjectToIndex(canvas, active, newIndex);
              canvas.setActiveObject(active);
            },
            undo: () => {
              moveObjectToIndex(canvas, active, prevIndex);
              canvas.setActiveObject(active);
            },
          };

          manager.execute(cmd);
        }
        break;
      }

      // SEND TO BACK
      case "SEND_TO_BACK": {
        const active = canvas.getActiveObject();
        if (active) {
          const objects = canvas.getObjects();
          const prevIndex = objects.indexOf(active);
          const newIndex = 0;

          const cmd: Command = {
            do: () => {
              moveObjectToIndex(canvas, active, newIndex);
              canvas.setActiveObject(active);
            },
            undo: () => {
              moveObjectToIndex(canvas, active, prevIndex);
              canvas.setActiveObject(active);
            },
          };

          manager.execute(cmd);
        }
        break;
      }

      // COLOR / STROKE / FONT / FONT SIZE
      case "CHANGE_COLOR": {
        const active = canvas.getActiveObject() as any;
        if (active) {
          const prev = active.fill;
          const cmd: Command = {
            do: () => {
              active.set({ fill: payload });
              canvas.requestRenderAll();
            },
            undo: () => {
              active.set({ fill: prev });
              canvas.requestRenderAll();
            },
          };
          manager.execute(cmd);
        }
        break;
      }

   case "TOGGLE_DRAW":
    canvas.isDrawingMode = !!payload;
    canvas.selection = !canvas.isDrawingMode;
    canvas.forEachObject((obj) => (obj.selectable = !canvas.isDrawingMode));
    canvas.requestRenderAll();
    break;
    
      case "CHANGE_STROKE": {
        const active = canvas.getActiveObject() as any;
        if (active) {
          const prev = active.stroke;
          const cmd: Command = {
            do: () => {
              active.set({ stroke: payload });
              canvas.requestRenderAll();
            },
            undo: () => {
              active.set({ stroke: prev });
              canvas.requestRenderAll();
            },
          };
          manager.execute(cmd);
        }
        break;
      }

      case "CHANGE_FONT": {
        const active = canvas.getActiveObject() as any;
        if (active?.type === "textbox") {
          const prev = active.fontFamily;
          const cmd: Command = {
            do: () => {
              active.set({ fontFamily: payload });
              canvas.requestRenderAll();
            },
            undo: () => {
              active.set({ fontFamily: prev });
              canvas.requestRenderAll();
            },
          };
          manager.execute(cmd);
        }
        break;
      }

      case "CHANGE_FONT_SIZE": {
        const active = canvas.getActiveObject() as any;
        if (active?.type === "textbox") {
          const prev = active.fontSize;
          const cmd: Command = {
            do: () => {
              active.set({ fontSize: payload });
              canvas.requestRenderAll();
            },
            undo: () => {
              active.set({ fontSize: prev });
              canvas.requestRenderAll();
            },
          };
          manager.execute(cmd);
        }
        break;
      }

      // UPLOAD image (file -> dataURL -> fabric.Image)
      case "UPLOAD": {
        const file: File = payload;
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then((img) => {
            if (!img) return;
            img.scaleToWidth(300);
            const cmd: Command = {
              do: () => {
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.requestRenderAll();
              },
              undo: () => {
                canvas.remove(img);
                canvas.requestRenderAll();
              },
            };
            manager.execute(cmd);
          });
        };
        reader.readAsDataURL(file);
        break;
      }


      
      // EXPORT
    //   case "EXPORT": {
    //     const dataUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier: 1 });
    //     const a = document.createElement("a");
    //     a.href = dataUrl;
    //     a.download = "canvas.png";
    //     a.click();
    //     break;
    //   }

    //   default:
    //     break;
    // }
// EXPORT
case "EXPORT": {
  if (!payload) return;

  if (payload === "png" || payload === "jpg") {
    const dataUrl = canvas.toDataURL({
      format: payload,
      quality: 1,
      multiplier: 2, // High resolution
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `canvas.${payload}`;
    a.click();
  }

  if (payload === "svg") {
    const svgData = canvas.toSVG();
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canvas.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (payload === "pdf") {
    import("jspdf").then((jsPDF) => {
      const doc = new jsPDF.jsPDF("l", "pt", [canvas.width!, canvas.height!]);
      const dataUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 });
      doc.addImage(dataUrl, "PNG", 0, 0, canvas.width!, canvas.height!);
      doc.save("canvas.pdf");
    });
  }

  break;
}

    }
  }, [action]);

  return <canvas ref={canvasRef} style={{ border: "1px solid #ddd" }} />;
};

export default MiniCanva;
