import { Canvas, FabricObject } from "fabric";
import { Command } from "../CommandManager";

export class AddCommand implements Command {
  private canvas: Canvas;
  private object: FabricObject;

  constructor(canvas: Canvas, object: FabricObject) {
    this.canvas = canvas;
    this.object = object;
  }

  do() {
    this.canvas.add(this.object);
    this.canvas.setActiveObject(this.object);
    this.canvas.requestRenderAll();
  }

  undo() {
    this.canvas.remove(this.object);
    this.canvas.requestRenderAll();
  }
}
