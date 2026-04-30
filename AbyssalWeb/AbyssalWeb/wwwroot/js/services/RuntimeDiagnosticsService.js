export class RuntimeDiagnosticsService {
  constructor(runtime) {
    this.runtime = runtime;
  }

  read() {
    const snapshot = this.runtime.snapshot;
    return {
      coordinateSystem: snapshot.coordinateSystem,
      player: snapshot.player,
      camera: snapshot.camera,
      visibleMonsterCount: snapshot.monsters.length,
      projectileCount: snapshot.projectiles.length,
      exploredTiles: snapshot.exploredTiles,
      depth: snapshot.depth
    };
  }

  toText() {
    return JSON.stringify(this.read());
  }
}
