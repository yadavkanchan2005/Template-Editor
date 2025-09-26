import { Canvas, Object as FabricObject } from "fabric";
import { Command } from "../CommandManager";

export default function LayerCommand(
  canvas: Canvas,
  obj: FabricObject,
  prevIndex: number,
  newIndex: number
): Command {
  return {
    do: () => {
      const objects = canvas.getObjects();
      const len = objects.length;
      const targetIndex = Math.max(0, Math.min(newIndex, len - 1));

      const currIndex = objects.indexOf(obj);
      if (currIndex !== -1) objects.splice(currIndex, 1);

      objects.splice(targetIndex, 0, obj);
      (canvas as any)._objects = objects;

      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    },

    undo: () => {
      const objects = canvas.getObjects();
      const len = objects.length;
      const targetIndex = Math.max(0, Math.min(prevIndex, len - 1));

      const currIndex = objects.indexOf(obj);
      if (currIndex !== -1) objects.splice(currIndex, 1);

      objects.splice(targetIndex, 0, obj);
      (canvas as any)._objects = objects;

      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    },
  };
}
