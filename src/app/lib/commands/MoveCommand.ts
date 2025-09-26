import { Canvas, FabricObject } from "fabric";
import { Command } from "../CommandManager";

interface ObjectState {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
}

export class MoveCommand implements Command {
  private canvas: Canvas;
  private object: FabricObject;
  private prevState: ObjectState;
  private newState: ObjectState;

  constructor(canvas: Canvas, object: FabricObject, prevState: ObjectState, newState: ObjectState) {
    this.canvas = canvas;
    this.object = object;
    this.prevState = prevState;
    this.newState = newState;
  }

  private applyState(state: ObjectState) {
    this.object.set({
      left: state.left,
      top: state.top,
      scaleX: state.scaleX,
      scaleY: state.scaleY,
      angle: state.angle,
    });
    this.object.setCoords();
    this.canvas.requestRenderAll();
  }

  do() {
    this.applyState(this.newState);
  }

  undo() {
    this.applyState(this.prevState);
  }
}
