import { Canvas, Textbox } from "fabric";
import { Command } from "../CommandManager";

export class TextCommand implements Command {
  private canvas: Canvas;
  private text: Textbox;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.text = new Textbox("New Text", {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: "#000",
    });
  }

  do() {
    this.canvas.add(this.text);
    this.canvas.setActiveObject(this.text);
    this.canvas.requestRenderAll();
  }

  undo() {
    this.canvas.remove(this.text);
    this.canvas.requestRenderAll();
  }
}
