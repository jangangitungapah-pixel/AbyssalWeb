export class HudModel {
  constructor() {
    this.level = 1;
    this.depth = 1;
    this.hp = 0;
    this.maxHp = 0;
    this.mp = 0;
    this.maxMp = 0;
    this.xp = 0;
    this.nextXp = 0;
    this.atk = 0;
    this.hostiles = 0;
  }

  static fromRuntime(runtime) {
    const player = runtime.player;
    const model = new HudModel();
    model.level = player.level;
    model.depth = runtime.depth;
    model.hp = Math.ceil(player.hp);
    model.maxHp = player.maxHp;
    model.mp = Math.floor(player.mp);
    model.maxMp = player.maxMp;
    model.xp = player.xp;
    model.nextXp = player.nextXp;
    model.atk = Math.floor(player.atk);
    model.hostiles = runtime.monsters.length;
    return model;
  }
}
