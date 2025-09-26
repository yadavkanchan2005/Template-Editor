import { Canvas, FabricObject, Textbox } from "fabric";
import CommandManager from "@/lib/CommandManager";
import { AddCommand } from "@/lib/commands/AddCommand";

export const handleAddText = (canvas: Canvas, manager: CommandManager) => {
  const text = new Textbox("Edit me", {
    left: 100,
    top: 100,
    fontSize: 24,
    fontFamily: "Roboto",
    fill: "#000000",
  });
  manager.execute(new AddCommand(canvas, text as FabricObject));
};
