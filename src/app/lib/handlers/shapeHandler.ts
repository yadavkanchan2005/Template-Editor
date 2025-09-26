import { Canvas, Rect, Circle, FabricObject } from "fabric";
import CommandManager from "@/lib/CommandManager";
import { AddCommand } from "@/lib/commands/AddCommand";

export const handleAddRect = (canvas: Canvas, manager: CommandManager) => {
  const rect = new Rect({
    left: 150,
    top: 150,
    width: 100,
    height: 80,
    fill: "blue",
  });
  manager.execute(new AddCommand(canvas, rect as FabricObject));
};

export const handleAddCircle = (canvas: Canvas, manager: CommandManager) => {
  const circle = new Circle({
    left: 200,
    top: 200,
    radius: 50,
    fill: "green",
  });
  manager.execute(new AddCommand(canvas, circle as FabricObject));
};
