// export interface Command {
//   do(): void;
//   undo(): void;
// }

// export default class CommandManager {
//   private canvas: any;
//   private undoStack: Command[] = [];
//   private redoStack: Command[] = [];

//   constructor(canvas: any) {
//     this.canvas = canvas;
//   }

//   execute(command: Command) {
//     command.do();
//     this.undoStack.push(command);
//     this.redoStack = [];
//   }

//   undo() {
//     const cmd = this.undoStack.pop();
//     if (cmd) {
//       cmd.undo();
//       this.redoStack.push(cmd);
//     }
//   }

//   redo() {
//     const cmd = this.redoStack.pop();
//     if (cmd) {
//       cmd.do();
//       this.undoStack.push(cmd);
//     }
//   }
//    // ✅ Add save method for CanvasEditor compatibility
//   save() {
//     // You can push a snapshot command or just a canvas JSON for simple tracking
//     const json = this.canvas.toJSON();
//     this.undoStack.push({
//       do: () => {},
//       undo: () => {
//         this.canvas.loadFromJSON(json, () => {
//           this.canvas.renderAll();
//         });
//       }
//     });
//     this.redoStack = [];
//   }
// }





// CommandManager.ts - Complete Undo/Redo System
// CommandManager.ts - Complete Undo/Redo System

// CommandManager.ts - Complete Undo/Redo System (Canva-style)

import * as fabric from 'fabric';

export interface Command {
  do(): void;
  undo(): void;
}

export default class CommandManager {
  private canvas: fabric.Canvas;
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxStackSize: number = 50;
  private isExecuting: boolean = false;
  private objectStates: WeakMap<fabric.Object, any> = new WeakMap();
  private modificationTimer: any = null;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.initializeEventListeners();
  }

  // ✅ Initialize automatic tracking of canvas changes
  private initializeEventListeners() {
    // Capture state BEFORE modification starts
    this.canvas.on('object:moving', this.captureBeforeState.bind(this));
    this.canvas.on('object:scaling', this.captureBeforeState.bind(this));
    this.canvas.on('object:rotating', this.captureBeforeState.bind(this));
    this.canvas.on('object:skewing', this.captureBeforeState.bind(this));

    // Save state AFTER modification ends
    this.canvas.on('object:modified', this.handleObjectModified.bind(this));

    // Track additions (but don't auto-save, let manual control handle it)
    this.canvas.on('object:added', this.handleObjectAdded.bind(this));

    // Track removals
    this.canvas.on('object:removed', this.handleObjectRemoved.bind(this));

    // Track selection to store initial state
    this.canvas.on('selection:created', this.captureSelectionState.bind(this));
    this.canvas.on('selection:updated', this.captureSelectionState.bind(this));
  }

  // ✅ Capture state when selection is made
  private captureSelectionState(e: any) {
    if (this.isExecuting) return;
    
    if (e.selected) {
      e.selected.forEach((obj: fabric.Object) => {
        if (!this.objectStates.has(obj)) {
          this.objectStates.set(obj, this.serializeObject(obj));
        }
      });
    }
  }

  // ✅ Capture state before modification
  private captureBeforeState(e: any) {
    if (this.isExecuting || !e.target) return;
    
    // Only capture if not already stored
    if (!this.objectStates.has(e.target)) {
      this.objectStates.set(e.target, this.serializeObject(e.target));
    }
  }

  // ✅ Handle object modification (after drag/scale/rotate ends)
  private handleObjectModified(e: any) {
    if (this.isExecuting || !e.target) return;

    const obj = e.target;
    const previousState = this.objectStates.get(obj);
    
    if (!previousState) return;

    const currentState = this.serializeObject(obj);

    // Create undo/redo command
    const command: Command = {
      do: () => {
        this.isExecuting = true;
        this.applyObjectState(obj, currentState);
        this.canvas.requestRenderAll();
        this.isExecuting = false;
      },
      undo: () => {
        this.isExecuting = true;
        this.applyObjectState(obj, previousState);
        this.canvas.requestRenderAll();
        this.isExecuting = false;
      }
    };

    // Add to stack without executing (already done)
    this.undoStack.push(command);
    this.redoStack = [];
    this.trimStack();

    // Clear stored state
    this.objectStates.delete(obj);
  }

  // ✅ Handle object addition
  private handleObjectAdded(e: any) {
    if (this.isExecuting || !e.target) return;

    const obj = e.target;
    const objectJSON = this.serializeObject(obj);

    const command: Command = {
      do: () => {
        this.isExecuting = true;
        if (!this.canvas.contains(obj)) {
          this.canvas.add(obj);
          this.canvas.setActiveObject(obj);
        }
        this.canvas.requestRenderAll();
        this.isExecuting = false;
      },
      undo: () => {
        this.isExecuting = true;
        this.canvas.remove(obj);
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
        this.isExecuting = false;
      }
    };

    this.undoStack.push(command);
    this.redoStack = [];
    this.trimStack();
  }

  // ✅ Handle object removal
  private handleObjectRemoved(e: any) {
    if (this.isExecuting || !e.target) return;

    const obj = e.target;
    const objectJSON = this.serializeObject(obj);
    const objectIndex = this.canvas.getObjects().indexOf(obj);

    const command: Command = {
      do: () => {
        this.isExecuting = true;
        this.canvas.remove(obj);
        this.canvas.requestRenderAll();
        this.isExecuting = false;
      },
      undo: () => {
        this.isExecuting = true;
        
        // Recreate object from stored state
        this.restoreObject(objectJSON, objectIndex);
        this.isExecuting = false;
      }
    };

    this.undoStack.push(command);
    this.redoStack = [];
    this.trimStack();
  }

  // ✅ Safely serialize object state (only writable properties)
  private serializeObject(obj: fabric.Object): any {
    const base: any = {
      type: obj.type,
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle,
      opacity: obj.opacity,
      fill: (obj as any).fill,
      stroke: (obj as any).stroke,
      strokeWidth: (obj as any).strokeWidth,
      visible: obj.visible,
      flipX: obj.flipX,
      flipY: obj.flipY,
      originX: obj.originX,
      originY: obj.originY,
    };

    // Add text-specific properties
    if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
      Object.assign(base, {
        text: (obj as any).text,
        fontSize: (obj as any).fontSize,
        fontFamily: (obj as any).fontFamily,
        fontWeight: (obj as any).fontWeight,
        fontStyle: (obj as any).fontStyle,
        textAlign: (obj as any).textAlign,
        underline: (obj as any).underline,
        lineHeight: (obj as any).lineHeight,
        charSpacing: (obj as any).charSpacing,
      });
    }

    // Add shape-specific properties
    if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'ellipse') {
      Object.assign(base, {
        rx: (obj as any).rx,
        ry: (obj as any).ry,
        width: (obj as any).width,
        height: (obj as any).height,
        radius: (obj as any).radius,
      });
    }

    return base;
  }

  // ✅ Safely apply object state
  private applyObjectState(obj: fabric.Object, state: any): void {
    const safeProps: any = {};
    
    const writableProps = [
      'left', 'top', 'scaleX', 'scaleY', 'angle', 'opacity', 
      'fill', 'stroke', 'strokeWidth', 'visible', 'flipX', 'flipY',
      'text', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle',
      'textAlign', 'underline', 'lineHeight', 'charSpacing',
      'rx', 'ry', 'width', 'height', 'radius', 'originX', 'originY'
    ];

    writableProps.forEach(prop => {
      if (state[prop] !== undefined) {
        safeProps[prop] = state[prop];
      }
    });

    obj.set(safeProps);
    obj.setCoords();
  }

  // ✅ Restore object from serialized state
private restoreObject(state: any, index?: number): void {
  let obj: fabric.Object | null = null;

  // ✅ Fix: destructure type out, use rest as options
  const { type, ...options } = state;

  switch (type) {
    case 'textbox':
      obj = new fabric.Textbox(state.text || '', options);
      break;
    case 'text':
    case 'i-text':
      obj = new fabric.Text(state.text || '', options);
      break;
    case 'rect':
      obj = new fabric.Rect(options);
      break;
    case 'circle':
      obj = new fabric.Circle(options);
      break;
    case 'ellipse':
      obj = new fabric.Ellipse(options);
      break;
    case 'triangle':
      obj = new fabric.Triangle(options);
      break;
    case 'polygon':
      obj = new fabric.Polygon(state.points || [], options);
      break;
    case 'line':
      obj = new fabric.Line([0, 0, 100, 100], options);
      break;
    default:
      console.warn('Unknown object type:', type);
      return;
  }

  if (obj) {
    if (typeof index === 'number' && index >= 0) {
      this.canvas.insertAt(index, obj);
    } else {
      this.canvas.add(obj);
    }
    this.canvas.setActiveObject(obj);
    this.canvas.requestRenderAll();
  }
}

  // ✅ Manual command execution (for property changes like color, font, etc.)
  execute(command: Command) {
    if (this.isExecuting) return;
    
    this.isExecuting = true;
    command.do();
    this.isExecuting = false;
    
    this.undoStack.push(command);
    this.redoStack = [];
    this.trimStack();
  }

  // ✅ Execute property change with undo/redo
  executePropertyChange(obj: fabric.Object, property: string, newValue: any, oldValue: any) {
    if (this.isExecuting) return;

    const command: Command = {
      do: () => {
        this.isExecuting = true;
        (obj as any).set({ [property]: newValue });
        this.canvas.requestRenderAll();
        this.isExecuting = false;
      },
      undo: () => {
        this.isExecuting = true;
        (obj as any).set({ [property]: oldValue });
        this.canvas.requestRenderAll();
        this.isExecuting = false;
      }
    };

    this.execute(command);
  }

  // ✅ Undo last action
  undo() {
    if (this.undoStack.length === 0) return;
    
    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);
  }

  // ✅ Redo last undone action
  redo() {
    if (this.redoStack.length === 0) return;
    
    const command = this.redoStack.pop()!;
    this.isExecuting = true;
    command.do();
    this.isExecuting = false;
    this.undoStack.push(command);
  }

  // ✅ Limit stack size
  private trimStack() {
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
  }

  // ✅ Clear all history
  clear() {
    this.undoStack = [];
    this.redoStack = [];
     this.objectStates = new WeakMap(); 
  }

  // ✅ Check if undo/redo is available
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  // ✅ Get stack info
  getStackInfo() {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length
    };
  }
}