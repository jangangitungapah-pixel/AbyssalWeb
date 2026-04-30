export class ObservableObject {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.listeners = new Map();
  }

  get(property) {
    return this.state[property];
  }

  set(property, value) {
    const previous = this.state[property];
    if (Object.is(previous, value)) return;
    this.state[property] = value;
    this.notify(property, value, previous);
    this.notify("*", this.state, this.state);
  }

  patch(values) {
    for (const [key, value] of Object.entries(values)) this.set(key, value);
  }

  subscribe(property, handler) {
    if (!this.listeners.has(property)) this.listeners.set(property, new Set());
    this.listeners.get(property).add(handler);
    return () => this.listeners.get(property)?.delete(handler);
  }

  notify(property, value, previous) {
    const handlers = this.listeners.get(property);
    if (!handlers) return;
    for (const handler of handlers) handler(value, previous, property);
  }
}
