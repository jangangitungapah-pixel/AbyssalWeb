export class EventBus {
  constructor() {
    this.channels = new Map();
  }

  on(topic, handler) {
    if (!this.channels.has(topic)) this.channels.set(topic, new Set());
    this.channels.get(topic).add(handler);
    return () => this.off(topic, handler);
  }

  off(topic, handler) {
    this.channels.get(topic)?.delete(handler);
  }

  emit(topic, payload = {}) {
    const handlers = this.channels.get(topic);
    if (!handlers) return;
    for (const handler of handlers) handler(payload);
  }
}
