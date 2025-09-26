import LayerCommand from "../commands/LayerCommand";
import CommandManager from "../CommandManager";
import { Canvas } from "fabric";

export function bringForward(canvas: Canvas, manager: CommandManager) {
  const obj = canvas.getActiveObject();
  if (!obj) return;

  const objects = canvas.getObjects();
  const prevIndex = objects.indexOf(obj);
  if (prevIndex === -1) return;

  const newIndex = Math.min(prevIndex + 1, objects.length - 1);
  manager.execute(LayerCommand(canvas, obj, prevIndex, newIndex));
}

export function sendBackward(canvas: Canvas, manager: CommandManager) {
  const obj = canvas.getActiveObject();
  if (!obj) return;

  const objects = canvas.getObjects();
  const prevIndex = objects.indexOf(obj);
  if (prevIndex === -1) return;

  const newIndex = Math.max(prevIndex - 1, 0);
  manager.execute(LayerCommand(canvas, obj, prevIndex, newIndex));
}

export function bringToFront(canvas: Canvas, manager: CommandManager) {
  const obj = canvas.getActiveObject();
  if (!obj) return;

  const objects = canvas.getObjects();
  const prevIndex = objects.indexOf(obj);
  if (prevIndex === -1) return;

  const newIndex = objects.length - 1;
  manager.execute(LayerCommand(canvas, obj, prevIndex, newIndex));
}

export function sendToBack(canvas: Canvas, manager: CommandManager) {
  const obj = canvas.getActiveObject();
  if (!obj) return;

  const objects = canvas.getObjects();
  const prevIndex = objects.indexOf(obj);
  if (prevIndex === -1) return;

  const newIndex = 0;
  manager.execute(LayerCommand(canvas, obj, prevIndex, newIndex));
}
