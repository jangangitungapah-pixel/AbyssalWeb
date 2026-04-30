export class CombatViewModel {
  constructor(runtime, eventBus) {
    this.runtime = runtime;
    this.eventBus = eventBus;
    this.unsubscribe = this.eventBus.on("input:pointer", payload => {
      if (payload.down) this.runtime.shoot();
    });
  }

  dispose() {
    this.unsubscribe?.();
  }
}
