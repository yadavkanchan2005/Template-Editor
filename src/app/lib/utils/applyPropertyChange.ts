// lib/utils/applyPropertyChange.ts
import { Object as FabricObject } from "fabric";
import PropertyChangeCommand from "@/lib/commands/PropertyChangeCommand";
import CommandManager from "@/lib/CommandManager";


export function applyPropertyChange(
  canvas: any,
  manager: CommandManager | null,
  property: string,
  value: any
) {
  if (!canvas || !manager) return;

  // active object le lo
  const obj = canvas.getActiveObject() as FabricObject | null;
  if (!obj) return;

  // old vs new value compare
  const oldValue = obj.get(property);
  if (oldValue === value) return;

  // command execute with undo/redo support
manager.execute(
    PropertyChangeCommand(canvas, obj, property, oldValue, value)
);
}