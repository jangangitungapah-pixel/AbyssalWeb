import { ObservableObject } from "../core/ObservableObject.js";

export class GameShellViewModel extends ObservableObject {
  constructor(runtime, diagnosticsService, hudViewModel) {
    super({
      mode: "playing",
      frame: 0,
      diagnosticsText: "{}",
      lastError: "",
      isPaused: false
    });
    this.runtime = runtime;
    this.diagnosticsService = diagnosticsService;
    this.hud = hudViewModel;
  }

  tick() {
    this.set("frame", this.get("frame") + 1);
    this.hud.refresh();
    if (this.get("frame") % 15 === 0) this.set("diagnosticsText", this.diagnosticsService.toText());
  }

  advanceForTest(milliseconds) {
    const steps = Math.max(1, Math.round(milliseconds / (1000 / 60)));
    for (let i = 0; i < steps; i++) this.runtime.advance(1 / 60);
    this.tick();
  }

  diagnosticsJson() {
    return this.diagnosticsService.toText();
  }
}
