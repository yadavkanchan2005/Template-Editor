import { Canvas, Object as FabricObject } from "fabric";
import { Command } from "../CommandManager";

export default function PropertyChangeCommand(
  canvas: Canvas,
  obj: FabricObject,
  prop: string,
  oldValue: any,
  newValue: any
): Command {
  return {
    do: () => {
      obj.set(prop as any, newValue);
      obj.setCoords();
      canvas.requestRenderAll();
    },

    undo: () => {
      obj.set(prop as any, oldValue);
      obj.setCoords();
      canvas.requestRenderAll();
    },
  };
}
