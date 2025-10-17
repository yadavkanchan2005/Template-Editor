export interface Command {
  do(): void;
  undo(): void;
}

export default class CommandManager {
  private canvas: any;
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  constructor(canvas: any) {
    this.canvas = canvas;
  }

  execute(command: Command) {
    command.do();
    this.undoStack.push(command);
    this.redoStack = [];
  }

  undo() {
    const cmd = this.undoStack.pop();
    if (cmd) {
      cmd.undo();
      this.redoStack.push(cmd);
    }
  }

  redo() {
    const cmd = this.redoStack.pop();
    if (cmd) {
      cmd.do();
      this.undoStack.push(cmd);
    }
  }
   // ✅ Add save method for CanvasEditor compatibility
  save() {
    // You can push a snapshot command or just a canvas JSON for simple tracking
    const json = this.canvas.toJSON();
    this.undoStack.push({
      do: () => {},
      undo: () => {
        this.canvas.loadFromJSON(json, () => {
          this.canvas.renderAll();
        });
      }
    });
    this.redoStack = [];
  }
}





