"use client";
import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
import CommandManager, { Command } from "@/lib/CommandManager";

const { Canvas, Textbox, Rect, Circle, Triangle, Line, Polygon, Group } = fabric;
const FabricImage = fabric.Image;

type Action = { type: string; payload?: any } | null;

interface Props {
  action: Action;
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

const MiniCanva: React.FC<Props> = ({ action, onCanvasReady, onObjectSelected, setSelectedObject }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);
  const managerRef = useRef<CommandManager | null>(null);

  // --- Generic function to add any element ---
  const addElementToCanvas = async (el: any, canvas: fabric.Canvas): Promise<fabric.Object | null> => {
    let obj: fabric.Object | null = null;

    console.log("Adding element:", el.type, el);

    try {
      switch (el.type) {
        case "text":
          obj = new Textbox(el.text || "Text", {
            left: el.x || 50,
            top: el.y || 50,
            fontSize: el.fontSize || 24,
            fill: el.fill || "#000000",
            fontFamily: el.fontFamily || "Arial",
          });
          break;

        case "image":
          if (!el.src && !el.placeholder) {
            console.warn("Image element has no src, skipping");
            break;
          }
          // Wait for image to load
          const imgSrc = el.src || el.placeholder || "/placeholder.png";

          try {
            const img = await fabric.Image.fromURL(imgSrc, { crossOrigin: "anonymous" });

            if (img && img.width && img.height) {
              const targetWidth = el.width || 200;
              const targetHeight = el.height || 200;

              img.set({
                left: el.x || 50,
                top: el.y || 50,
                scaleX: targetWidth / img.width,
                scaleY: targetHeight / img.height,
              });

              obj = img;
              console.log(" Image loaded:", imgSrc);
            }
          } catch (imgError) {
            console.error(" Image load failed:", imgError);
            // Fallback to colored rectangle
            obj = new Rect({
              left: el.x || 50,
              top: el.y || 50,
              width: el.width || 200,
              height: el.height || 200,
              fill: "#e5e7eb",
              stroke: "#9ca3af",
              strokeWidth: 2,
              strokeDashArray: [10, 5],
            });

            // Add text label
            const label = new Textbox("Image\nPlaceholder", {
              fontSize: 14,
              fill: "#6b7280",
              textAlign: "center",
              width: (el.width || 200) - 20,
            });

            const group = new Group([obj, label], {
              left: el.x || 50,
              top: el.y || 50,
            });

            obj = group;
          }
          break;

case "button":
  const btnWidth = el.width || 140;
  const btnHeight = el.height || 50;

  // Create rectangle for button background
  const btnRect = new Rect({
    width: btnWidth,
    height: btnHeight,
    rx: el.rx || 6,
    ry: el.ry || 6,
    fill: el.fill || "#7b68ee",
    originX: "left",
    originY: "top",
    selectable: true,
    evented: true,
  });

  // Create text for button label
  const btnText = new Textbox(el.text || "Button", {
    fontSize: el.fontSize || 16,
    fill: el.textColor || "#ffffff",
    fontFamily: "Arial",
    textAlign: "center",
    width: btnWidth - 20,
    originX: "center",
    originY: "center",
    selectable: true,
    evented: true,
  });
  
  // Position text in center of rectangle
  btnText.set({
    left: btnWidth / 2,
    top: btnHeight / 2,
  });

  // Create group with interactive children
  const btnGroup = new Group([btnRect, btnText], {
    left: el.x || 50,
    top: el.y || 50,
    subTargetCheck: true,
    interactive: true,
  });

  obj = btnGroup;
  console.log("Button group created with selectable children");
  break;
        case "rect":
        case "rectangle":
          obj = new Rect({
            left: el.x || 50,
            top: el.y || 50,
            width: el.width || 100,
            height: el.height || 100,
            fill: el.fill || "#3b82f6",
            stroke: el.stroke || "",
            strokeWidth: el.strokeWidth || 0,
          });
          break;

        default:
          console.warn("Unknown element type:", el.type);
          // Create a placeholder for unknown types
          obj = new Rect({
            left: el.x || 50,
            top: el.y || 50,
            width: 100,
            height: 100,
            fill: "#f3f4f6",
            stroke: "#d1d5db",
            strokeWidth: 2,
          });
          break;
      }

      if (obj) {
        canvas.add(obj);
        console.log("Element added to canvas:", el.type);
        return obj;
      }
    } catch (error) {
      console.error("Error adding element:", el.type, error);
    }

    return null;
  };
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


  const playObjectAnimation = (obj: fabric.Object, animationId: string, speed: number) => {
    const canvas = canvasInstance.current;
    if (!canvas) return;

    const duration = 1000 / speed;
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
          onChange: () => canvas.renderAll(),
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
        });
        break;

      case "slideLeft":
        obj.set({ left: originalLeft + 200 });
        obj.animate({ left: originalLeft }, {
          duration,
          onChange: () => canvas.renderAll(),
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
        });
        break;

      case "slideRight":
        obj.set({ left: originalLeft - 200 });
        obj.animate({ left: originalLeft }, {
          duration,
          onChange: () => canvas.renderAll(),
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
        });
        break;

      case "ascend":
        obj.set({ top: originalTop + 100, opacity: 0 });
        obj.animate({ top: originalTop, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll(),
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
        });
        break;

      case "shift":
        obj.set({ left: originalLeft - 50, opacity: 0 });
        obj.animate({ left: originalLeft, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll(),
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
        });
        break;

      case "zoomIn":
        obj.set({ scaleX: 0, scaleY: 0, opacity: 0 });
        obj.animate({ scaleX: originalScaleX, scaleY: originalScaleY, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll(),
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
        });
        break;

      case "rotate":
        obj.set({ angle: -180, opacity: 0 });
        obj.animate({ angle: originalAngle, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll(),
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
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
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
        });
        break;

      case "merge":
        obj.set({ scaleX: 0.1, opacity: 0 });
        obj.animate({ scaleX: originalScaleX, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll(),
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
        });
        break;

      case "block":
        obj.set({ scaleY: 0, opacity: 0 });
        obj.animate({ scaleY: originalScaleY, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll(),
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
        });
        break;

      case "burst":
        obj.set({ scaleX: 2, scaleY: 2, opacity: 0 });
        obj.animate({ scaleX: originalScaleX, scaleY: originalScaleY, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll(),
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
        });
        break;

      case "roll":
        obj.set({ left: originalLeft - 200, angle: -360 });
        obj.animate({ left: originalLeft, angle: originalAngle }, {
          duration,
          onChange: () => canvas.renderAll(),
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
        });
        break;

      case "skate":
        obj.set({ left: originalLeft - 150, top: originalTop - 50, opacity: 0 });
        obj.animate({ left: originalLeft, top: originalTop, opacity: originalOpacity }, {
          duration,
          onChange: () => canvas.renderAll(),
          onComplete: () => {
            setTimeout(() => {
              if ((obj as any).animationId === animationId) {
                playObjectAnimation(obj, animationId, speed);
              }
            }, 1000);
          }
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


  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      subTargetCheck: true,
    });


    canvasInstance.current = canvas;
    managerRef.current = new CommandManager(canvas);
    if (onCanvasReady) onCanvasReady(canvas);

    // --- Selection events ---
    canvas.on("selection:created", (e: any) => {
      let obj = e.selected?.[0] || null;

      if (obj?.type === "group") {
        // Check if clicked on child object inside group
        if ((e.target as fabric.Object)?.type) {
          obj = e.target as fabric.Object; // select the actual child
        }
      }

      setSelectedObject?.(obj);
    });

    canvas.on("selection:updated", (e: any) => {
      let obj = e.selected?.[0] || null;
      if (obj?.type === "group") {
        if ((e.target as fabric.Object)?.type) {
          obj = e.target as fabric.Object;
        }
      }

      setSelectedObject?.(obj);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject?.(null);
    });




    // store object state when user presses mouse down (before transform)
    canvas.on("mouse:down", (opt: any) => {
      const target = opt.target as fabric.Object | undefined;
      if (target) {
        prevStateMap.current.set(target, target.toObject());
      }
    });
canvas.on("selection:created", (e: any) => {
  const obj = e.selected?.[0] || null;
  console.log("Selection created:", obj?.type);
  if (setSelectedObject) {
    setSelectedObject(obj);
  }
  if (onObjectSelected) {
    onObjectSelected(obj);
  }
});

canvas.on("selection:updated", (e: any) => {
  const obj = e.selected?.[0] || null;
  console.log("Selection updated:", obj?.type);
  if (setSelectedObject) {
    setSelectedObject(obj);
  }
  if (onObjectSelected) {
    onObjectSelected(obj);
  }
});

canvas.on("selection:cleared", () => {
  console.log("Selection cleared");
  if (setSelectedObject) {
    setSelectedObject(null);
  }
  if (onObjectSelected) {
    onObjectSelected(null);
  }
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
          return;
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


    // Play animations on load
   const playAllAnimations = () => {
  const objects = canvas.getObjects();
  objects.forEach((obj) => {
    const animId = (obj as any).animationId;
    const animSpeed = (obj as any).animationSpeed || 1;
    const appearOnClick = (obj as any).appearOnClick;

    if (animId && animId !== "none" && !appearOnClick) {
      setTimeout(() => {
        playObjectAnimation(obj, animId, animSpeed);
      }, 300);
    }
  });
};

setTimeout(playAllAnimations, 500);

    setTimeout(playAllAnimations, 500);
    // When object is added, play its animation
    canvas.on('object:added', (e: any) => {
      const obj = e.target;
      const animId = (obj as any).animationId;
      const animSpeed = (obj as any).animationSpeed || 1;
      const appearOnClick = (obj as any).appearOnClick;

      if (animId && !appearOnClick) {
        setTimeout(() => {
          playObjectAnimation(obj, animId, animSpeed);
        }, 100);
      }
    });



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

      case "LOAD_TEMPLATE": {
        const { template, snapshot, prevSize, prevBg } = payload;
        const elements = template.elements;

        const cmd: Command = {
          do: async () => {
            try {
              // Clear canvas
              canvas.clear();
              canvas.backgroundColor = "#ffffff";
              // Load elements sequentially
              const loadedObjects = [];
              for (const el of elements) {
                const obj = await addElementToCanvas(el, canvas);
                if (obj) loadedObjects.push(obj);
              }

              canvas.requestRenderAll();
            } catch (error) {
              console.error("Template loading failed:", error);
            }
          },
          undo: async () => {
            try {
              await restoreFromJSON(canvas, snapshot);
              if (prevSize) {
                canvas.setDimensions(prevSize);
                canvas.backgroundColor = prevBg || "#ffffff";
              }
              canvas.requestRenderAll();
            } catch (error) {
              console.error("Template undo failed:", error);
            }
          },
        };

        manager.execute(cmd);
        break;
      }


      case "ADD_TEMPLATE_ELEMENTS":
        if (action.type === "ADD_TEMPLATE_ELEMENTS" && Array.isArray(action.payload)) {
          canvas.clear();
          action.payload.forEach((el: any) => addElementToCanvas(el, canvas));
        }
        break;
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
          if (typeof payload === "string" && !payload.startsWith("http") && !payload.startsWith("/")) {
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

        // 3) SVG

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

      case "RESIZE": {
        const { width, height } = payload;
        const prevWidth = canvas.width;
        const prevHeight = canvas.height;

        const cmd: Command = {
          do: () => {
            canvas.setDimensions({ width, height });
            canvas.requestRenderAll();
          },
          undo: () => {
            canvas.setDimensions({ width: prevWidth, height: prevHeight });
            canvas.requestRenderAll();
          },
        };
        manager.execute(cmd);
        break;
      }

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
