export class HudView {
  constructor(viewModel, documentRef = document) {
    this.vm = viewModel;
    this.nodes = {
      hpFill: documentRef.getElementById("hp-fill"),
      mpFill: documentRef.getElementById("mp-fill"),
      xpFill: documentRef.getElementById("xp-fill"),
      hpText: documentRef.getElementById("hp-text"),
      mpText: documentRef.getElementById("mp-text"),
      xpText: documentRef.getElementById("xp-text"),
      levelText: documentRef.getElementById("level-text"),
      atkText: documentRef.getElementById("atk-text"),
      depth: documentRef.getElementById("depth"),
      monsterText: documentRef.getElementById("monster-text")
    };
    this.subscriptions = [
      this.vm.subscribe("hpPercent", value => this.nodes.hpFill.style.width = `${value}%`),
      this.vm.subscribe("mpPercent", value => this.nodes.mpFill.style.width = `${value}%`),
      this.vm.subscribe("xpPercent", value => this.nodes.xpFill.style.width = `${value}%`),
      this.vm.subscribe("hpText", value => this.nodes.hpText.textContent = value),
      this.vm.subscribe("mpText", value => this.nodes.mpText.textContent = value),
      this.vm.subscribe("xpText", value => this.nodes.xpText.textContent = value),
      this.vm.subscribe("levelText", value => this.nodes.levelText.textContent = value),
      this.vm.subscribe("atkText", value => this.nodes.atkText.textContent = value),
      this.vm.subscribe("depthText", value => this.nodes.depth.textContent = value),
      this.vm.subscribe("monsterText", value => this.nodes.monsterText.textContent = value)
    ];
    this.vm.refresh();
    this.renderAll();
  }

  renderAll() {
    this.nodes.hpFill.style.width = `${this.vm.get("hpPercent")}%`;
    this.nodes.mpFill.style.width = `${this.vm.get("mpPercent")}%`;
    this.nodes.xpFill.style.width = `${this.vm.get("xpPercent")}%`;
    this.nodes.hpText.textContent = this.vm.get("hpText");
    this.nodes.mpText.textContent = this.vm.get("mpText");
    this.nodes.xpText.textContent = this.vm.get("xpText");
    this.nodes.levelText.textContent = this.vm.get("levelText");
    this.nodes.atkText.textContent = this.vm.get("atkText");
    this.nodes.depth.textContent = this.vm.get("depthText");
    this.nodes.monsterText.textContent = this.vm.get("monsterText");
  }

  dispose() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
  }
}
