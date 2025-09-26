import { Canvas, Object as FabricObject } from "fabric";
import { Command } from "../CommandManager";

export class DeleteCommand implements Command {
  private canvas: Canvas;
  private target: FabricObject | null;

  constructor(canvas: Canvas, target: FabricObject | null) {
    this.canvas = canvas;
    this.target = target;
  }

  do() {
    if (this.target) {
      this.canvas.remove(this.target);
      this.canvas.requestRenderAll();
    }
  }

  undo() {
    if (this.target) {
      this.canvas.add(this.target);
      this.canvas.setActiveObject(this.target);
      this.canvas.requestRenderAll();
    }
  }
}
