import { Canvas, FabricObject } from "fabric";
import CommandManager from "@/lib/CommandManager";
import { StyleCommand } from "../commands/StyleCommand";

export const handleFontChange = (canvas: Canvas, manager: CommandManager, font: string) => {
  const activeObj = canvas.getActiveObject() as any;
  if (activeObj && activeObj.type === "textbox") {
    manager.execute(new StyleCommand(canvas, activeObj as FabricObject, "fontFamily", font));
  }
};

export const handleColorChange = (canvas: Canvas, manager: CommandManager, color: string) => {
  const activeObj = canvas.getActiveObject() as any;
  if (activeObj) {
    manager.execute(new StyleCommand(canvas, activeObj as FabricObject, "fill", color));
  }
};
