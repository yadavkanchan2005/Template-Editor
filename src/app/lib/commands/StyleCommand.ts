import { Canvas, FabricObject } from "fabric";
import { Command } from "../CommandManager";

export class StyleCommand implements Command {
  private canvas: Canvas;
  private object: FabricObject;
  private property: string;
  private newValue: any;
  private oldValue: any;

  constructor(canvas: Canvas, object: FabricObject, property: string, newValue: any) {
    this.canvas = canvas;
    this.object = object;
    this.property = property;
    this.newValue = newValue;
    this.oldValue = (object as any)[property];
  }

  do() {
    (this.object as any)[this.property] = this.newValue;
    this.object.setCoords();
    this.canvas.requestRenderAll();
  }

  undo() {
    (this.object as any)[this.property] = this.oldValue;
    this.object.setCoords();
    this.canvas.requestRenderAll();
  }
}
