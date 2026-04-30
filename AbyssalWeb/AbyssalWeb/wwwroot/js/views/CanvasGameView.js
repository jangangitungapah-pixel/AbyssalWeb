export class CanvasGameView {
  constructor(engine, shellViewModel) {
    this.engine = engine;
    this.vm = shellViewModel;
    this.originalUpdateHud = engine.updateHud.bind(engine);
    engine.updateHud = () => this.vm.tick();
  }

  dispose() {
    this.engine.updateHud = this.originalUpdateHud;
  }
}
