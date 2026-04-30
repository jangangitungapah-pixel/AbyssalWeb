export class InputCommandService {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.bindings = new Map([
      ["KeyW", "move:up"],
      ["KeyA", "move:left"],
      ["KeyS", "move:down"],
      ["KeyD", "move:right"],
      ["KeyF", "view:fullscreen"]
    ]);
  }

  describe(code) {
    return this.bindings.get(code) ?? "input:unknown";
  }

  publishKeyDown(code) {
    this.eventBus.emit("input:keyDown", { code, command: this.describe(code) });
  }

  publishKeyUp(code) {
    this.eventBus.emit("input:keyUp", { code, command: this.describe(code) });
  }

  publishPointer(x, y, down) {
    this.eventBus.emit("input:pointer", { x, y, down });
  }
}
