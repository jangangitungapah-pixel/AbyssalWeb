export class GameRuntimeModel {
  constructor(engine) {
    this.engine = engine;
  }

  get player() {
    return this.engine.player;
  }

  get map() {
    return this.engine.map;
  }

  get monsters() {
    return this.engine.monsters;
  }

  get projectiles() {
    return this.engine.projectiles;
  }

  get depth() {
    return this.engine.depth;
  }

  get snapshot() {
    return JSON.parse(this.engine.renderText());
  }

  advance(seconds) {
    this.engine.update(seconds);
    this.engine.render();
  }

  shoot() {
    this.engine.player.shoot(this.engine);
  }
}
