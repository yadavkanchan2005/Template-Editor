import { Canvas, FabricObject } from "fabric";
import { Command } from "../CommandManager";

export class ClearCommand implements Command {
  private canvas: Canvas;
  private prevObjects: FabricObject[];

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.prevObjects = [...canvas.getObjects()];
  }

  do() {
    this.canvas.clear();
    this.canvas.requestRenderAll();
  }

  undo() {
    this.prevObjects.forEach(obj => this.canvas.add(obj));
    this.canvas.requestRenderAll();
  }
}
