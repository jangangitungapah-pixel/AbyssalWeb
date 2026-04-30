import { ObservableObject } from "../core/ObservableObject.js";
import { HudModel } from "../models/HudModel.js";

export class HudViewModel extends ObservableObject {
  constructor(runtime) {
    super({
      hpText: "0 / 0",
      mpText: "0 / 0",
      xpText: "0 / 0",
      hpPercent: 0,
      mpPercent: 0,
      xpPercent: 0,
      levelText: "LV 1",
      atkText: "ATK 0",
      depthText: "Depth 1",
      monsterText: "0 HOSTILES"
    });
    this.runtime = runtime;
  }

  refresh() {
    const hud = HudModel.fromRuntime(this.runtime);
    this.patch({
      hpText: `${hud.hp} / ${hud.maxHp}`,
      mpText: `${hud.mp} / ${hud.maxMp}`,
      xpText: `${hud.xp} / ${hud.nextXp}`,
      hpPercent: this.percent(hud.hp, hud.maxHp),
      mpPercent: this.percent(hud.mp, hud.maxMp),
      xpPercent: this.percent(hud.xp, hud.nextXp),
      levelText: `LV ${hud.level}`,
      atkText: `ATK ${hud.atk}`,
      depthText: `Depth ${hud.depth}`,
      monsterText: `${hud.hostiles} HOSTILES`
    });
  }

  percent(value, total) {
    if (total <= 0) return 0;
    return Math.max(0, Math.min(100, value / total * 100));
  }
}
