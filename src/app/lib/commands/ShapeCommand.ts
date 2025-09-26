import { Canvas, Rect, Circle, Triangle, Line, Polygon, Object as FabricObject } from "fabric";
import { Command } from "../CommandManager";

export class ShapeCommand implements Command {
  private canvas: Canvas;
  private shape: FabricObject;

  constructor(canvas: Canvas, type: string) {
    this.canvas = canvas;

    switch (type) {
      case "rect":
        this.shape = new Rect({ left: 150, top: 150, width: 120, height: 80, fill: "lightblue" });
        break;
      case "circle":
        this.shape = new Circle({ left: 200, top: 200, radius: 50, fill: "lightgreen" });
        break;
      case "triangle":
        this.shape = new Triangle({ left: 250, top: 250, width: 100, height: 100, fill: "lightpink" });
        break;
      case "line":
        this.shape = new Line([50, 100, 200, 100], { stroke: "#000", strokeWidth: 3 });
        break;
      case "polygon":
        this.shape = new Polygon(
          [
            { x: 50, y: 0 },
            { x: 100, y: 50 },
            { x: 75, y: 100 },
            { x: 25, y: 100 },
            { x: 0, y: 50 },
          ],
          { left: 350, top: 350, fill: "orange" }
        );
        break;
      default:
        this.shape = new Rect({ left: 100, top: 100, width: 100, height: 100, fill: "gray" });
    }
  }

  do() {
    this.canvas.add(this.shape);
    this.canvas.setActiveObject(this.shape);
    this.canvas.requestRenderAll();
  }

  undo() {
    this.canvas.remove(this.shape);
    this.canvas.requestRenderAll();
  }
}
