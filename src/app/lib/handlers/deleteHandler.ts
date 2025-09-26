import { Canvas } from "fabric";
import CommandManager from "@/lib/CommandManager";
import { DeleteCommand } from "@/lib/commands/DeleteCommand";

export const handleDelete = (canvas: Canvas, manager: CommandManager) => {
  const activeObj = canvas.getActiveObject();
  if (activeObj) {
    manager.execute(new DeleteCommand(canvas, activeObj));
  }
};
