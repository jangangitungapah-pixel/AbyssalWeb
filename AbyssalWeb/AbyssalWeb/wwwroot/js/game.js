"use strict";

const TILE_SIZE = 28;
const MAP_W = 60;
const MAP_H = 40;
const TAU = Math.PI * 2;

class RenderUtils {
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  static clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  static hash(x, y, seed = 11.731) {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  static screen(game, x, y, z = 0) {
    return {
      x: (x - game.camera.x) * TILE_SIZE + game.width / 2,
      y: (y - game.camera.y) * TILE_SIZE + game.height / 2 - z * TILE_SIZE
    };
  }

  static ellipse(ctx, x, y, rx, ry, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  static drawFloor(ctx, sx, sy, gx, gy) {
    const n = RenderUtils.hash(gx, gy, 3.4);
    ctx.fillStyle = n > 0.5 ? "#17171d" : "#14141a";
    ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = "rgba(255,255,255,0.045)";
    ctx.fillRect(sx, sy, TILE_SIZE, 2);
    ctx.fillRect(sx, sy, 2, TILE_SIZE);
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.fillRect(sx, sy + TILE_SIZE - 2, TILE_SIZE, 2);
    ctx.fillRect(sx + TILE_SIZE - 2, sy, 2, TILE_SIZE);

    const crack = Math.sin(gx * 2.73 + gy * 5.91);
    if (crack > 0.48) {
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx + 5 + n * 6, sy + 8);
      ctx.lineTo(sx + 13 + crack * 4, sy + 14);
      ctx.lineTo(sx + 20, sy + 17 + n * 5);
      ctx.stroke();
    }
    if (n > 0.72) {
      ctx.fillStyle = "rgba(190,180,150,0.12)";
      ctx.beginPath();
      ctx.arc(sx + 6 + n * 14, sy + 4 + RenderUtils.hash(gy, gx) * 19, 1.2, 0, TAU);
      ctx.fill();
    }
  }

  static drawWall(ctx, sx, sy, gx, gy) {
    const top = sy - TILE_SIZE * 0.58;
    const grad = ctx.createLinearGradient(sx, sy, sx, sy + TILE_SIZE);
    grad.addColorStop(0, "#30303d");
    grad.addColorStop(1, "#111118");
    ctx.fillStyle = grad;
    ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = "#3b3a45";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 6, top);
    ctx.lineTo(sx + TILE_SIZE + 6, top);
    ctx.lineTo(sx + TILE_SIZE, sy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let row = 0; row < 5; row++) {
      const by = sy + row * 6;
      const offset = row % 2 === 0 ? 0 : 8;
      for (let bx = -offset; bx < TILE_SIZE; bx += 14) {
        ctx.fillStyle = row % 2 === 0 ? "#252532" : "#20202c";
        ctx.fillRect(sx + bx, by, 12, 5);
        ctx.fillStyle = "rgba(255,255,255,0.035)";
        ctx.fillRect(sx + bx, by, 12, 1);
      }
    }
  }

  static drawDoor(ctx, sx, sy, progress) {
    const angle = progress * 1.18;
    ctx.save();
    ctx.translate(sx + TILE_SIZE * 0.5, sy + TILE_SIZE);
    ctx.transform(Math.cos(angle), -Math.sin(angle) * 0.35, 0, 1, 0, 0);
    const grad = ctx.createLinearGradient(-10, -TILE_SIZE * 1.15, 10, 0);
    grad.addColorStop(0, "#7f4d22");
    grad.addColorStop(1, "#2c170d");
    ctx.fillStyle = grad;
    ctx.fillRect(-11, -TILE_SIZE * 1.15, 22, TILE_SIZE * 1.15);
    ctx.fillStyle = "rgba(255,210,80,0.8)";
    ctx.beginPath();
    ctx.arc(6, -16, 2, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  burst(x, y, color, count, text = "") {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        z: 0.1 + Math.random() * 0.8,
        vx: (Math.random() - 0.5) * 3.2,
        vy: (Math.random() - 0.5) * 3.2,
        vz: 3.5 + Math.random() * 3,
        size: 0.05 + Math.random() * 0.12,
        life: 0.45 + Math.random() * 0.5,
        maxLife: 1,
        color,
        text
      });
    }
    if (text) {
      this.particles.push({
        x, y, z: 1.1, vx: 0, vy: -0.4, vz: 2.8,
        size: 0.34, life: 0.9, maxLife: 0.9, color: "#fff4b0", text
      });
    }
  }

  ember(x, y) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 0.6,
      y: y + (Math.random() - 0.5) * 0.4,
      z: 0.1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      vz: 2 + Math.random() * 1.5,
      size: 0.045 + Math.random() * 0.06,
      life: 0.55,
      maxLife: 0.55,
      color: "#ffd566",
      text: ""
    });
  }

  update(dt) {
    const g = 12.5;
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vz -= g * dt;
      if (p.z <= 0) {
        p.z = 0;
        p.vz *= -0.5;
        p.vx *= 0.72;
        p.vy *= 0.72;
      }
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  enqueue(queue) {
    for (const p of this.particles) {
      queue.push({ y: p.y + p.z, draw: game => this.drawOne(game, p), emissive: true });
    }
  }

  drawOne(game, p) {
    const ctx = game.ctx;
    const s = RenderUtils.screen(game, p.x, p.y, p.z);
    const a = RenderUtils.clamp(p.life / p.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    if (p.text) {
      ctx.font = `700 ${Math.max(12, p.size * 42)}px Segoe UI, sans-serif`;
      ctx.textAlign = "center";
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.lineWidth = 3;
      ctx.strokeText(p.text, s.x, s.y);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, s.x, s.y);
    } else {
      ctx.shadowBlur = 16;
      ctx.shadowColor = p.color;
      RenderUtils.ellipse(ctx, s.x, s.y, p.size * TILE_SIZE, p.size * TILE_SIZE * 0.75, p.color, a);
    }
    ctx.restore();
  }
}

class MapGenerator {
  constructor(width, height, depth) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.tiles = [];
    this.rooms = [];
    this.doors = [];
    for (let y = 0; y < height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < width; x++) {
        this.tiles[y][x] = { type: "wall", walkable: false, visible: false, explored: false, door: null };
      }
    }
  }

  generate() {
    this.split({ x: 1, y: 1, w: this.width - 2, h: this.height - 2 }, 0);
    for (const room of this.rooms) this.carveRoom(room);
    for (let i = 1; i < this.rooms.length; i++) this.connectRooms(this.rooms[i - 1], this.rooms[i]);
    this.placeDoors();
    return this;
  }

  split(node, level) {
    if (level >= 5 || node.w < 12 || node.h < 10) {
      const pad = 1 + Math.floor(Math.random() * 2);
      const rw = Math.max(5, node.w - pad * 2 - Math.floor(Math.random() * 4));
      const rh = Math.max(5, node.h - pad * 2 - Math.floor(Math.random() * 4));
      const rx = node.x + pad + Math.floor(Math.random() * Math.max(1, node.w - rw - pad));
      const ry = node.y + pad + Math.floor(Math.random() * Math.max(1, node.h - rh - pad));
      this.rooms.push({ x: rx, y: ry, w: rw, h: rh, cx: rx + Math.floor(rw / 2), cy: ry + Math.floor(rh / 2) });
      return;
    }
    const horizontal = node.w / node.h < 1.18 ? true : node.h / node.w < 1.18 ? false : Math.random() > 0.5;
    if (horizontal) {
      const split = Math.floor(node.h * (0.38 + Math.random() * 0.24));
      this.split({ x: node.x, y: node.y, w: node.w, h: split }, level + 1);
      this.split({ x: node.x, y: node.y + split, w: node.w, h: node.h - split }, level + 1);
    } else {
      const split = Math.floor(node.w * (0.38 + Math.random() * 0.24));
      this.split({ x: node.x, y: node.y, w: split, h: node.h }, level + 1);
      this.split({ x: node.x + split, y: node.y, w: node.w - split, h: node.h }, level + 1);
    }
  }

  carveRoom(room) {
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) this.floor(x, y);
    }
  }

  floor(x, y) {
    if (x <= 0 || y <= 0 || x >= this.width - 1 || y >= this.height - 1) return;
    this.tiles[y][x].type = "floor";
    this.tiles[y][x].walkable = true;
  }

  connectRooms(a, b) {
    const bendX = Math.random() > 0.5 ? a.cx : b.cx;
    this.carveLine(a.cx, a.cy, bendX, a.cy);
    this.carveLine(bendX, a.cy, bendX, b.cy);
    this.carveLine(bendX, b.cy, b.cx, b.cy);
  }

  carveLine(x0, y0, x1, y1) {
    const dx = Math.sign(x1 - x0);
    const dy = Math.sign(y1 - y0);
    let x = x0;
    let y = y0;
    this.floor(x, y);
    while (x !== x1 || y !== y1) {
      if (x !== x1) x += dx;
      if (y !== y1) y += dy;
      this.floor(x, y);
    }
  }

  placeDoors() {
    for (const room of this.rooms) {
      for (let x = room.x; x < room.x + room.w; x++) {
        this.tryDoor(x, room.y);
        this.tryDoor(x, room.y + room.h - 1);
      }
      for (let y = room.y; y < room.y + room.h; y++) {
        this.tryDoor(room.x, y);
        this.tryDoor(room.x + room.w - 1, y);
      }
    }
  }

  tryDoor(x, y) {
    if (!this.inBounds(x, y) || !this.tiles[y][x].walkable || this.tiles[y][x].door) return;
    const n = this.isWalkable(x, y - 1), s = this.isWalkable(x, y + 1), e = this.isWalkable(x + 1, y), w = this.isWalkable(x - 1, y);
    const verticalCorridor = n && s && !e && !w;
    const horizontalCorridor = e && w && !n && !s;
    const nearRoom = this.rooms.some(r => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
    if ((verticalCorridor || horizontalCorridor || Math.random() < 0.08) && nearRoom && this.doors.length < 22) {
      const door = { x, y, open: 0, target: 0 };
      this.tiles[y][x].door = door;
      this.doors.push(door);
    }
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  isWalkable(x, y) {
    return this.inBounds(x, y) && this.tiles[y][x].walkable;
  }

  updateDoors(player, dt) {
    for (const d of this.doors) {
      const near = Math.hypot(player.x - (d.x + 0.5), player.y - (d.y + 0.5)) < 1.5;
      d.target = near ? 1 : 0;
      d.open = RenderUtils.lerp(d.open, d.target, 1 - Math.pow(0.001, dt));
    }
  }

  computeFov(px, py, radius) {
    for (let y = 0; y < this.height; y++) for (let x = 0; x < this.width; x++) this.tiles[y][x].visible = false;
    const ox = Math.floor(px);
    const oy = Math.floor(py);
    for (let a = 0; a < 360; a += 2) {
      const rad = a * Math.PI / 180;
      const tx = Math.floor(ox + Math.cos(rad) * radius);
      const ty = Math.floor(oy + Math.sin(rad) * radius);
      this.trace(ox, oy, tx, ty, radius);
    }
    if (this.inBounds(ox, oy)) {
      this.tiles[oy][ox].visible = true;
      this.tiles[oy][ox].explored = true;
    }
  }

  trace(x0, y0, x1, y1, maxDist) {
    let dx = Math.abs(x1 - x0);
    let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    for (let step = 0; step <= maxDist * 2; step++) {
      if (!this.inBounds(x, y)) return;
      this.tiles[y][x].visible = true;
      this.tiles[y][x].explored = true;
      if (!this.tiles[y][x].walkable && !(x === x0 && y === y0)) return;
      if (x === x1 && y === y1) return;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
  }
}

class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.lastX = x;
    this.lastY = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 0.3;
    this.walkAnim = 0;
    this.facing = 0;
    this.baseScale = 1;
    this.cape = Array.from({ length: 5 }, (_, i) => ({ x, y: y + i * 0.1 }));
  }

  moveWithCollision(map, dx, dy) {
    this.lastX = this.x;
    this.lastY = this.y;
    this.tryMove(map, dx, 0);
    this.tryMove(map, 0, dy);
    if (Math.abs(dx) + Math.abs(dy) > 0.001) {
      this.facing = Math.atan2(dy, dx);
      this.walkAnim += Math.hypot(dx, dy) * 18;
    }
  }

  tryMove(map, dx, dy) {
    const nx = this.x + dx;
    const ny = this.y + dy;
    const minX = Math.floor(nx - this.radius);
    const maxX = Math.floor(nx + this.radius);
    const minY = Math.floor(ny - this.radius);
    const maxY = Math.floor(ny + this.radius);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (!map.isWalkable(x, y)) return false;
      }
    }
    this.x = nx;
    this.y = ny;
    return true;
  }

  updateCape(time) {
    this.cape[0].x = this.x - Math.cos(this.facing) * 0.13;
    this.cape[0].y = this.y - Math.sin(this.facing) * 0.13;
    const inertiaX = (this.lastX - this.x) * 3.5;
    const inertiaY = (this.lastY - this.y) * 3.5;
    for (let i = 1; i < this.cape.length; i++) {
      const prev = this.cape[i - 1];
      const p = this.cape[i];
      const wind = Math.sin(time * 2 + i * 1.4) * 0.035;
      const targetX = prev.x + inertiaX + wind;
      const targetY = prev.y + 0.16 + inertiaY * 0.35;
      p.x = RenderUtils.lerp(p.x, targetX, 0.34);
      p.y = RenderUtils.lerp(p.y, targetY, 0.34);
    }
  }
}

class Player extends Entity {
  constructor(x, y) {
    super(x, y);
    this.level = 1;
    this.xp = 0;
    this.nextXp = 60;
    this.STR = 8;
    this.VIT = 10;
    this.INT = 16;
    this.weaponAtk = 7;
    this.maxHp = 0;
    this.hp = 0;
    this.maxMp = 90;
    this.mp = 90;
    this.cooldown = 0;
    this.attackTimer = 0;
    this.attackSwing = 0;
    this.aimAngle = 0;
    this.staffGlow = 0;
    this.idleTime = 0;
    this.recalc();
    this.hp = this.maxHp;
  }

  recalc() {
    this.maxHp = this.VIT * 10 + this.level * 5;
    this.atk = this.STR * 1.5 + this.weaponAtk;
    this.maxMp = 70 + this.INT * 3 + this.level * 4;
    this.baseScale = this.level >= 10 ? 1.35 : this.level >= 5 ? 1.15 : 1;
  }

  gainXp(amount) {
    this.xp += amount;
    while (this.xp >= this.nextXp) {
      this.xp -= this.nextXp;
      this.level++;
      this.STR += 1;
      this.VIT += 1;
      this.INT += 2;
      this.nextXp = Math.floor(this.nextXp * 1.35 + 25);
      const oldMax = this.maxHp;
      this.recalc();
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp - oldMax + 18);
      this.mp = this.maxMp;
    }
  }

  update(game, dt) {
    this.idleTime += dt;
    let ix = 0;
    let iy = 0;
    if (game.keys.has("KeyW")) iy -= 1;
    if (game.keys.has("KeyS")) iy += 1;
    if (game.keys.has("KeyA")) ix -= 1;
    if (game.keys.has("KeyD")) ix += 1;
    const len = Math.hypot(ix, iy) || 1;
    ix /= len;
    iy /= len;
    const speed = 4.05;
    this.vx = ix * speed;
    this.vy = iy * speed;
    this.moveWithCollision(game.map, this.vx * dt, this.vy * dt);
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.staffGlow = Math.max(0, this.staffGlow - dt * 1.8);
    this.mp = Math.min(this.maxMp, this.mp + 13 * dt);
    const screen = RenderUtils.screen(game, this.x, this.y);
    this.aimAngle = Math.atan2(game.mouse.y - screen.y, game.mouse.x - screen.x);
    this.attackSwing = RenderUtils.lerp(this.attackSwing, 0, 1 - Math.pow(0.0004, dt));
    this.updateCape(game.time);
    if (this.level >= 10 && Math.random() < dt * 18) game.particles.ember(this.x, this.y + 0.25);
  }

  shoot(game) {
    if (this.cooldown > 0 || this.mp < 8) return;
    const s = RenderUtils.screen(game, this.x, this.y);
    const angle = Math.atan2(game.mouse.y - s.y, game.mouse.x - s.x);
    game.projectiles.push(new Projectile(this.x + Math.cos(angle) * 0.45, this.y + Math.sin(angle) * 0.45, angle, this.atk + this.INT * 0.85));
    this.cooldown = 0.22;
    this.attackTimer = 0.34;
    this.attackSwing = 1;
    this.staffGlow = 1;
    this.mp -= 8;
  }

  drawLimb(ctx, ax, ay, bx, by, widthA, widthB, color, glow = null) {
    ctx.save();
    if (glow) {
      ctx.shadowBlur = glow.blur;
      ctx.shadowColor = glow.color;
    }
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = widthA;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    const mx = (ax + bx) * 0.5;
    const my = (ay + by) * 0.5;
    ctx.quadraticCurveTo(mx, my + (widthA - widthB) * 0.25, bx, by);
    ctx.stroke();
    ctx.restore();
  }

  drawHand(ctx, x, y, radius, fill, glow = null) {
    ctx.save();
    if (glow) {
      ctx.shadowBlur = glow.blur;
      ctx.shadowColor = glow.color;
    }
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawStaff(ctx, rig) {
    const pulse = this.staffGlow * 0.75 + 0.25 + Math.sin(this.idleTime * 7) * 0.08;
    const tipX = rig.staffHand.x + Math.cos(rig.staffAngle) * 30;
    const tipY = rig.staffHand.y + Math.sin(rig.staffAngle) * 30;
    ctx.save();
    ctx.strokeStyle = "#5d3411";
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(rig.staffHand.x - Math.cos(rig.staffAngle) * 12, rig.staffHand.y - Math.sin(rig.staffAngle) * 12);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    ctx.restore();

    const crystal = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 11 + pulse * 5);
    crystal.addColorStop(0, "rgba(255,251,240,0.98)");
    crystal.addColorStop(0.42, `rgba(137, 203, 255, ${0.65 + pulse * 0.18})`);
    crystal.addColorStop(1, "rgba(79, 112, 255, 0)");
    ctx.save();
    ctx.shadowBlur = 16 + pulse * 12;
    ctx.shadowColor = "rgba(110, 165, 255, 0.95)";
    ctx.fillStyle = crystal;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY - 8);
    ctx.lineTo(tipX + 6, tipY);
    ctx.lineTo(tipX, tipY + 8);
    ctx.lineTo(tipX - 6, tipY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  draw(game) {
    const ctx = game.ctx;
    const s = RenderUtils.screen(game, this.x, this.y);
    const velocity = Math.hypot(this.vx, this.vy);
    const moveBlend = RenderUtils.clamp(velocity / 4.05, 0, 1);
    const breath = Math.sin(this.idleTime * 3.2) * 0.035;
    const bodyRise = Math.sin(this.idleTime * 6 + this.walkAnim * 0.28) * (1 + moveBlend * 2.4);
    const attackKick = Math.sin(RenderUtils.clamp(this.attackTimer / 0.34, 0, 1) * Math.PI);
    const scale = this.baseScale + breath + moveBlend * 0.02;
    const torsoTwist = Math.sin(this.walkAnim * 0.5) * 0.08 * moveBlend + attackKick * 0.18;
    const aim = this.aimAngle;
    const facingDir = Math.cos(aim) >= 0 ? 1 : -1;
    const shoulderY = -10 + bodyRise * 0.22;
    const hipY = 1 + bodyRise * 0.15;
    const leftStride = Math.sin(this.walkAnim) * 6;
    const rightStride = Math.sin(this.walkAnim + Math.PI) * 6;
    const leftLift = Math.max(0, -Math.sin(this.walkAnim)) * (3 + moveBlend * 4);
    const rightLift = Math.max(0, Math.sin(this.walkAnim)) * (3 + moveBlend * 4);
    const attackReach = 0.35 + attackKick * 0.85;
    const castLean = Math.sin(aim) * 0.14 + attackKick * 0.12;
    const hoodDip = attackKick * 1.6 - bodyRise * 0.05;
    const staffAngle = aim - 0.18 + attackKick * 0.45 * facingDir;
    const offAngle = aim + Math.PI * 0.85 - attackKick * 0.22;
    const rig = {
      leftFoot: { x: -7 + Math.cos(this.walkAnim + Math.PI) * 1.2, y: 11 + leftStride * 0.15 - leftLift },
      rightFoot: { x: 7 + Math.cos(this.walkAnim) * 1.2, y: 11 + rightStride * 0.15 - rightLift },
      leftKnee: { x: -5 + Math.sin(this.walkAnim + Math.PI) * 1.5, y: 3 + leftStride * 0.2 - leftLift * 0.45 },
      rightKnee: { x: 5 + Math.sin(this.walkAnim) * 1.5, y: 3 + rightStride * 0.2 - rightLift * 0.45 },
      leftShoulder: { x: -9, y: shoulderY + Math.cos(this.walkAnim) * 0.8 * moveBlend },
      rightShoulder: { x: 9, y: shoulderY - Math.cos(this.walkAnim) * 0.8 * moveBlend },
      offHand: {
        x: Math.cos(offAngle) * (8 + moveBlend * 2) - 1.5,
        y: shoulderY + Math.sin(offAngle) * (8 + moveBlend * 2) - 1.5 + bodyRise * 0.06
      },
      staffHand: {
        x: Math.cos(staffAngle) * (11 + attackReach * 6),
        y: shoulderY + Math.sin(staffAngle) * (11 + attackReach * 6) - 1 + bodyRise * 0.04
      },
      head: { x: Math.cos(aim) * 1.6 + attackKick * 1.2, y: -23 + hoodDip },
      staffAngle
    };

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.scale(scale, scale);
    ctx.rotate(this.facing * 0.15);
    RenderUtils.ellipse(ctx, 0, 11, 13 + moveBlend * 1.5, 5.5 + moveBlend, "rgba(0,0,0,0.44)");
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < this.cape.length; i++) {
      const p = RenderUtils.screen(game, this.cape[i].x, this.cape[i].y);
      if (i === 0) ctx.moveTo(p.x - 8, p.y + 2);
      else ctx.lineTo(p.x - (9 - i), p.y + i * 5);
    }
    for (let i = this.cape.length - 1; i >= 0; i--) {
      const p = RenderUtils.screen(game, this.cape[i].x, this.cape[i].y);
      ctx.lineTo(p.x + (9 - i), p.y + i * 5);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(42, 22, 82, 0.88)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.scale(scale, scale);
    ctx.rotate(torsoTwist + castLean * 0.35);

    this.drawLimb(ctx, -3, hipY, rig.leftKnee.x, rig.leftKnee.y, 5.5, 4.6, "#171422");
    this.drawLimb(ctx, rig.leftKnee.x, rig.leftKnee.y, rig.leftFoot.x, rig.leftFoot.y, 4.6, 4, "#1e1830");
    this.drawLimb(ctx, 3, hipY, rig.rightKnee.x, rig.rightKnee.y, 5.5, 4.6, "#171422");
    this.drawLimb(ctx, rig.rightKnee.x, rig.rightKnee.y, rig.rightFoot.x, rig.rightFoot.y, 4.6, 4, "#1e1830");
    RenderUtils.ellipse(ctx, rig.leftFoot.x, rig.leftFoot.y + 1.5, 4.4, 2.6, "#0f0d16");
    RenderUtils.ellipse(ctx, rig.rightFoot.x, rig.rightFoot.y + 1.5, 4.4, 2.6, "#0f0d16");

    const robe = ctx.createLinearGradient(0, -22, 0, 16);
    robe.addColorStop(0, "#f1f5ff");
    robe.addColorStop(0.18, "#98a4ff");
    robe.addColorStop(0.48, "#4f5ee0");
    robe.addColorStop(1, "#1a2044");
    ctx.fillStyle = robe;
    ctx.beginPath();
    ctx.moveTo(-11, 8);
    ctx.bezierCurveTo(-16, -1 - breath * 14, -12 - castLean * 7, -18, -2, -18 - hoodDip);
    ctx.bezierCurveTo(-5, -15 - hoodDip * 0.2, 5, -15 - hoodDip * 0.2, 2, -18 - hoodDip);
    ctx.bezierCurveTo(12 + castLean * 7, -12, 16, -1 - breath * 14, 11, 8);
    ctx.bezierCurveTo(7 + moveBlend * 1.5, 14, -7 - moveBlend * 1.5, 14, -11, 8);
    ctx.fill();

    const sash = ctx.createLinearGradient(-6, -6, 8, 10);
    sash.addColorStop(0, "#ffd66f");
    sash.addColorStop(1, "#9b5d18");
    ctx.fillStyle = sash;
    ctx.beginPath();
    ctx.moveTo(-3, -3);
    ctx.lineTo(4, -1);
    ctx.lineTo(3, 9);
    ctx.lineTo(-5, 9);
    ctx.closePath();
    ctx.fill();

    this.drawLimb(ctx, rig.leftShoulder.x, rig.leftShoulder.y, rig.offHand.x * 0.5, (rig.leftShoulder.y + rig.offHand.y) * 0.5, 5.3, 4.4, "#d8e2ff");
    this.drawLimb(ctx, rig.offHand.x * 0.5, (rig.leftShoulder.y + rig.offHand.y) * 0.5, rig.offHand.x, rig.offHand.y, 4.4, 3.8, "#c7d3ff");
    this.drawHand(ctx, rig.offHand.x, rig.offHand.y, 3.3, "#ecf3ff");

    this.drawLimb(ctx, rig.rightShoulder.x, rig.rightShoulder.y, rig.staffHand.x * 0.48, (rig.rightShoulder.y + rig.staffHand.y) * 0.5 - attackKick * 2.2, 5.5, 4.5, "#dbe7ff");
    this.drawLimb(ctx, rig.staffHand.x * 0.48, (rig.rightShoulder.y + rig.staffHand.y) * 0.5 - attackKick * 2.2, rig.staffHand.x, rig.staffHand.y, 4.5, 4, "#cad7ff", { blur: 8 + this.staffGlow * 10, color: "rgba(106, 170, 255, 0.45)" });
    this.drawHand(ctx, rig.staffHand.x, rig.staffHand.y, 3.5, "#f8fbff");
    this.drawStaff(ctx, rig);

    const collar = ctx.createLinearGradient(0, -22, 0, -4);
    collar.addColorStop(0, "#f4f7ff");
    collar.addColorStop(1, "#4d54b9");
    ctx.fillStyle = collar;
    ctx.beginPath();
    ctx.moveTo(-10, -11);
    ctx.bezierCurveTo(-9, -18, -3, -21, 0, -21.5);
    ctx.bezierCurveTo(3, -21, 9, -18, 10, -11);
    ctx.bezierCurveTo(4, -7, -4, -7, -10, -11);
    ctx.fill();

    const neckGlow = ctx.createRadialGradient(0, -13, 0, 0, -13, 8);
    neckGlow.addColorStop(0, "rgba(244, 249, 255, 0.95)");
    neckGlow.addColorStop(1, "rgba(244, 249, 255, 0)");
    ctx.fillStyle = neckGlow;
    ctx.beginPath();
    ctx.arc(0, -13, 8, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.translate(rig.head.x, rig.head.y);
    ctx.rotate(Math.sin(aim) * 0.1 + attackKick * 0.08);
    const hood = ctx.createLinearGradient(0, -12, 0, 10);
    hood.addColorStop(0, "#f8fbff");
    hood.addColorStop(0.28, "#d5ddff");
    hood.addColorStop(0.8, "#6773dd");
    hood.addColorStop(1, "#202852");
    ctx.fillStyle = hood;
    ctx.beginPath();
    ctx.moveTo(-8, 4);
    ctx.bezierCurveTo(-9, -6, -5, -12, 0, -12.5);
    ctx.bezierCurveTo(5, -12, 9, -6, 8, 4);
    ctx.bezierCurveTo(5, 9, -5, 9, -8, 4);
    ctx.fill();

    ctx.fillStyle = "#fff7ef";
    ctx.beginPath();
    ctx.arc(0.5, -1, 4.8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#2b335f";
    ctx.beginPath();
    ctx.arc(2.2, -1.8, 0.9, 0, TAU);
    ctx.arc(-1.5, -1.8, 0.9, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(54, 64, 117, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-1.6, 1.3);
    ctx.quadraticCurveTo(0.8, 2.8 + breath * 12, 2.7, 1.2);
    ctx.stroke();
    ctx.restore();

    if (this.staffGlow > 0.05) {
      ctx.save();
      ctx.globalAlpha = this.staffGlow * 0.55;
      ctx.strokeStyle = "rgba(150, 210, 255, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rig.staffHand.x + Math.cos(rig.staffAngle) * 24, rig.staffHand.y + Math.sin(rig.staffAngle) * 24, 10 + this.staffGlow * 4, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
}

class Monster extends Entity {
  constructor(x, y, kind, depth) {
    super(x, y);
    this.kind = kind;
    const stats = {
      Slime: { hp: 32, speed: 1.45, xp: 18, color: "#52d273" },
      Goblin: { hp: 46, speed: 2.1, xp: 28, color: "#9ccc52" },
      Skeleton: { hp: 58, speed: 1.78, xp: 36, color: "#d8d2bc" },
      Minotaur: { hp: 112, speed: 1.35, xp: 76, color: "#b75d3d" }
    }[kind];
    this.isElite = Math.random() < 0.10 + depth * 0.02;
    this.maxHp = stats.hp * (this.isElite ? 2 : 1);
    this.hp = this.maxHp;
    this.speed = stats.speed * (this.isElite ? 1.12 : 1);
    this.xp = Math.floor(stats.xp * (this.isElite ? 2.4 : 1));
    this.color = stats.color;
    this.radius = this.isElite ? 0.39 : 0.3;
    this.path = [];
    this.pathTimer = 0;
    this.hitTimer = 0;
  }

  update(game, dt) {
    this.hitTimer = Math.max(0, this.hitTimer - dt);
    const tx = Math.floor(this.x);
    const ty = Math.floor(this.y);
    const seesPlayer = game.map.inBounds(tx, ty) && game.map.tiles[ty][tx].visible;
    if (seesPlayer) {
      this.pathTimer -= dt;
      if (this.pathTimer <= 0) {
        this.path = game.findPath(Math.floor(this.x), Math.floor(this.y), Math.floor(game.player.x), Math.floor(game.player.y));
        this.pathTimer = 0.35 + Math.random() * 0.2;
      }
      const target = this.path[1] || this.path[0];
      if (target) {
        const dx = target.x + 0.5 - this.x;
        const dy = target.y + 0.5 - this.y;
        const len = Math.hypot(dx, dy) || 1;
        this.moveWithCollision(game.map, dx / len * this.speed * dt, dy / len * this.speed * dt);
      }
      if (Math.hypot(this.x - game.player.x, this.y - game.player.y) < 0.68) {
        game.player.hp = Math.max(0, game.player.hp - (this.isElite ? 17 : 9) * dt);
      }
    }
    this.updateCape(game.time * 0.45);
  }

  takeDamage(game, amount) {
    const crit = Math.random() < 0.16;
    const dmg = Math.floor(amount * (crit ? 1.85 : 1) * (0.88 + Math.random() * 0.24));
    this.hp -= dmg;
    this.hitTimer = 0.16;
    game.particles.burst(this.x, this.y, "#b80f28", crit ? 18 : 10, crit ? "CRITICAL" : `-${dmg}`);
    if (this.hp <= 0) {
      game.player.gainXp(this.xp);
      return true;
    }
    return false;
  }

  draw(game) {
    const ctx = game.ctx;
    const s = RenderUtils.screen(game, this.x, this.y);
    const scale = this.isElite ? 1.3 : 1;
    const breath = Math.sin(Date.now() / 220 + this.x) * 0.05;
    ctx.save();
    ctx.translate(s.x, s.y);
    if (this.isElite) {
      ctx.fillStyle = "rgba(255, 54, 82, 0.24)";
      ctx.beginPath();
      ctx.ellipse(0, 8, 18, 7, 0, 0, TAU);
      ctx.fill();
    }
    ctx.scale(scale, scale);
    const liftL = Math.max(0, -Math.sin(this.walkAnim)) * 3;
    const liftR = Math.max(0, Math.sin(this.walkAnim)) * 3;
    RenderUtils.ellipse(ctx, -5, 8 - liftL, 4, 5, "#171217");
    RenderUtils.ellipse(ctx, 5, 8 - liftR, 4, 5, "#171217");
    ctx.fillStyle = this.hitTimer > 0 ? "#fff0f0" : this.color;
    ctx.beginPath();
    ctx.moveTo(-13, 5);
    ctx.bezierCurveTo(-13, -10, -7, -18, 0, -18 - breath * 8);
    ctx.bezierCurveTo(8, -18, 14, -9, 13, 5);
    ctx.bezierCurveTo(7, 13, -7, 13, -13, 5);
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff243b";
    ctx.fillStyle = "#ff243b";
    ctx.beginPath();
    ctx.arc(-4, -6, 2, 0, TAU);
    ctx.arc(4, -6, 2, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

class Projectile {
  constructor(x, y, angle, damage) {
    this.x = x;
    this.y = y;
    this.z = 0.25;
    this.vx = Math.cos(angle) * 10.8;
    this.vy = Math.sin(angle) * 10.8;
    this.life = 1;
    this.damage = damage;
    this.radius = 0.18;
    this.dead = false;
  }

  update(game, dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (!game.map.isWalkable(Math.floor(this.x), Math.floor(this.y)) || this.life <= 0) this.explode(game);
    for (const m of game.monsters) {
      if (!this.dead && Math.hypot(m.x - this.x, m.y - this.y) < m.radius + this.radius) {
        if (m.takeDamage(game, this.damage)) m.dead = true;
        this.explode(game);
      }
    }
  }

  explode(game) {
    if (this.dead) return;
    this.dead = true;
    game.particles.burst(this.x, this.y, "#ffb347", 18, "");
  }

  draw(game) {
    const ctx = game.ctx;
    const s = RenderUtils.screen(game, this.x, this.y, this.z);
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ffb347";
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 11);
    grad.addColorStop(0, "#fff8da");
    grad.addColorStop(0.45, "#ffb347");
    grad.addColorStop(1, "rgba(255,110,25,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 11, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.lightCanvas = document.createElement("canvas");
    this.lightCtx = this.lightCanvas.getContext("2d");
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, down: false };
    this.camera = { x: 0, y: 0 };
    this.depth = 1;
    this.time = 0;
    this.lastFrame = 0;
    this.projectiles = [];
    this.monsters = [];
    this.particles = new ParticleSystem();
    this.resize();
    this.newDungeon();
    this.bind();
    window.render_game_to_text = () => this.renderText();
    window.advanceTime = ms => {
      const steps = Math.max(1, Math.round(ms / (1000 / 60)));
      for (let i = 0; i < steps; i++) this.update(1 / 60);
      this.render();
    };
    requestAnimationFrame(t => this.loop(t));
  }

  bind() {
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("keydown", e => {
      this.keys.add(e.code);
      if (e.code === "KeyF") this.toggleFullscreen();
    });
    window.addEventListener("keyup", e => this.keys.delete(e.code));
    this.canvas.addEventListener("mousemove", e => {
      const r = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * this.width / r.width;
      this.mouse.y = (e.clientY - r.top) * this.height / r.height;
    });
    this.canvas.addEventListener("mousedown", e => {
      if (e.button === 0) {
        this.mouse.down = true;
        this.player.shoot(this);
      }
    });
    window.addEventListener("mouseup", e => {
      if (e.button === 0) this.mouse.down = false;
    });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.floor(window.innerWidth * dpr);
    this.height = Math.floor(window.innerHeight * dpr);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.lightCanvas.width = this.width;
    this.lightCanvas.height = this.height;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  newDungeon() {
    this.map = new MapGenerator(MAP_W, MAP_H, this.depth).generate();
    const start = this.map.rooms[0];
    this.player = new Player(start.cx + 0.5, start.cy + 0.5);
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    const kinds = ["Slime", "Goblin", "Skeleton", "Minotaur"];
    for (let i = 1; i < this.map.rooms.length; i++) {
      const room = this.map.rooms[i];
      const count = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < count; j++) {
        const x = room.x + 1 + Math.random() * Math.max(1, room.w - 2);
        const y = room.y + 1 + Math.random() * Math.max(1, room.h - 2);
        const kind = kinds[Math.min(kinds.length - 1, Math.floor(Math.random() * (2.2 + this.depth * 0.22)))];
        this.monsters.push(new Monster(x, y, kind, this.depth));
      }
    }
  }

  loop(t) {
    const dt = Math.min(0.05, (t - this.lastFrame) / 1000 || 1 / 60);
    this.lastFrame = t;
    this.update(dt);
    this.render();
    requestAnimationFrame(n => this.loop(n));
  }

  update(dt) {
    this.time += dt;
    if (this.mouse.down) this.player.shoot(this);
    this.player.update(this, dt);
    this.camera.x = RenderUtils.lerp(this.camera.x, this.player.x, 0.1);
    this.camera.y = RenderUtils.lerp(this.camera.y, this.player.y, 0.1);
    this.map.updateDoors(this.player, dt);
    this.map.computeFov(this.player.x, this.player.y, 10);
    for (const m of this.monsters) m.update(this, dt);
    for (const p of this.projectiles) p.update(this, dt);
    this.monsters = this.monsters.filter(m => !m.dead);
    this.projectiles = this.projectiles.filter(p => !p.dead);
    this.particles.update(dt);
    this.updateHud();
  }

  findPath(sx, sy, ex, ey) {
    const key = (x, y) => `${x},${y}`;
    const open = [{ x: sx, y: sy, g: 0, f: Math.abs(ex - sx) + Math.abs(ey - sy), parent: null }];
    const best = new Map();
    best.set(key(sx, sy), 0);
    const closed = new Set();
    while (open.length) {
      open.sort((a, b) => a.f - b.f);
      const cur = open.shift();
      if (cur.x === ex && cur.y === ey) {
        const path = [];
        let n = cur;
        while (n) {
          path.unshift({ x: n.x, y: n.y });
          n = n.parent;
        }
        return path.slice(0, 12);
      }
      closed.add(key(cur.x, cur.y));
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      for (const [dx, dy] of dirs) {
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        const nk = key(nx, ny);
        if (closed.has(nk) || !this.map.isWalkable(nx, ny)) continue;
        const g = cur.g + 1;
        if (!best.has(nk) || g < best.get(nk)) {
          best.set(nk, g);
          open.push({ x: nx, y: ny, g, f: g + Math.abs(ex - nx) + Math.abs(ey - ny), parent: cur });
        }
      }
    }
    return [];
  }

  render() {
    const ctx = this.ctx;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#050508";
    ctx.fillRect(0, 0, this.width, this.height);
    const queue = [];
    const minX = Math.max(0, Math.floor(this.camera.x - this.width / TILE_SIZE / 2) - 2);
    const maxX = Math.min(MAP_W - 1, Math.ceil(this.camera.x + this.width / TILE_SIZE / 2) + 2);
    const minY = Math.max(0, Math.floor(this.camera.y - this.height / TILE_SIZE / 2) - 3);
    const maxY = Math.min(MAP_H - 1, Math.ceil(this.camera.y + this.height / TILE_SIZE / 2) + 3);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const tile = this.map.tiles[y][x];
        if (!tile.explored) continue;
        const pos = RenderUtils.screen(this, x, y);
        if (tile.walkable) {
          queue.push({ y: y, draw: () => RenderUtils.drawFloor(ctx, pos.x, pos.y, x, y) });
          if (tile.door) queue.push({ y: y + 0.72, draw: () => RenderUtils.drawDoor(ctx, pos.x, pos.y, tile.door.open) });
        } else {
          queue.push({ y: y + 0.95, draw: () => RenderUtils.drawWall(ctx, pos.x, pos.y, x, y) });
        }
      }
    }
    for (const m of this.monsters) queue.push({ y: m.y + 0.5, draw: () => m.draw(this), emissive: true });
    for (const p of this.projectiles) queue.push({ y: p.y + p.z, draw: () => p.draw(this), emissive: true });
    queue.push({ y: this.player.y + 0.5, draw: () => this.player.draw(this) });
    this.particles.enqueue(queue);
    queue.sort((a, b) => a.y - b.y);
    for (const item of queue) item.draw(this);

    this.applyFovDarkness(minX, maxX, minY, maxY);
    this.applyLightMap();
    this.drawEmissive();
  }

  applyFovDarkness(minX, maxX, minY, maxY) {
    const ctx = this.ctx;
    ctx.save();
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const tile = this.map.tiles[y][x];
        const s = RenderUtils.screen(this, x, y - 0.6);
        if (!tile.visible) {
          ctx.fillStyle = tile.explored ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0.92)";
          ctx.fillRect(s.x, s.y, TILE_SIZE, TILE_SIZE * 1.65);
        }
      }
    }
    ctx.restore();
  }

  applyLightMap() {
    const lctx = this.lightCtx;
    lctx.globalCompositeOperation = "source-over";
    lctx.fillStyle = "#1b1b22";
    lctx.fillRect(0, 0, this.width, this.height);
    lctx.globalCompositeOperation = "lighter";
    const ps = RenderUtils.screen(this, this.player.x, this.player.y, 0.2);
    const pr = 235 + Math.sin(Date.now() / 150) * 22;
    this.radialLight(lctx, ps.x, ps.y, pr, ["rgba(255,255,250,1)", "rgba(255,154,70,0.58)", "rgba(0,0,0,0)"]);
    for (const p of this.projectiles) {
      const s = RenderUtils.screen(this, p.x, p.y, p.z);
      this.radialLight(lctx, s.x, s.y, 92, ["rgba(255,245,190,0.95)", "rgba(255,88,25,0.45)", "rgba(0,0,0,0)"]);
    }
    this.ctx.save();
    this.ctx.globalCompositeOperation = "multiply";
    this.ctx.drawImage(this.lightCanvas, 0, 0);
    this.ctx.restore();
  }

  radialLight(ctx, x, y, radius, stops) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, stops[0]);
    g.addColorStop(0.42, stops[1]);
    g.addColorStop(1, stops[2]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
  }

  drawEmissive() {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    for (const m of this.monsters) {
      if (!this.isVisibleWorld(m.x, m.y)) continue;
      const s = RenderUtils.screen(this, m.x, m.y);
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff243b";
      ctx.fillStyle = "#ff243b";
      ctx.beginPath();
      ctx.arc(s.x - 4, s.y - 6, 2.2, 0, TAU);
      ctx.arc(s.x + 4, s.y - 6, 2.2, 0, TAU);
      ctx.fill();
    }
    for (const p of this.projectiles) p.draw(this);
    ctx.restore();
  }

  isVisibleWorld(x, y) {
    const gx = Math.floor(x);
    const gy = Math.floor(y);
    return this.map.inBounds(gx, gy) && this.map.tiles[gy][gx].visible;
  }

  updateHud() {
    const hpPct = this.player.hp / this.player.maxHp * 100;
    const mpPct = this.player.mp / this.player.maxMp * 100;
    const xpPct = this.player.xp / this.player.nextXp * 100;
    document.getElementById("hp-fill").style.width = `${RenderUtils.clamp(hpPct, 0, 100)}%`;
    document.getElementById("mp-fill").style.width = `${RenderUtils.clamp(mpPct, 0, 100)}%`;
    document.getElementById("xp-fill").style.width = `${RenderUtils.clamp(xpPct, 0, 100)}%`;
    document.getElementById("hp-text").textContent = `${Math.ceil(this.player.hp)} / ${this.player.maxHp}`;
    document.getElementById("mp-text").textContent = `${Math.floor(this.player.mp)} / ${this.player.maxMp}`;
    document.getElementById("xp-text").textContent = `${this.player.xp} / ${this.player.nextXp}`;
    document.getElementById("level-text").textContent = `LV ${this.player.level}`;
    document.getElementById("atk-text").textContent = `ATK ${Math.floor(this.player.atk)}`;
    document.getElementById("depth").textContent = `Depth ${this.depth}`;
    document.getElementById("monster-text").textContent = `${this.monsters.length} HOSTILES`;
  }

  renderText() {
    const visibleMonsters = this.monsters
      .filter(m => this.isVisibleWorld(m.x, m.y))
      .slice(0, 8)
      .map(m => ({ kind: m.kind, x: Number(m.x.toFixed(2)), y: Number(m.y.toFixed(2)), hp: Math.ceil(m.hp), elite: m.isElite }));
    return JSON.stringify({
      coordinateSystem: "world tiles, origin top-left, x right, y down",
      player: {
        x: Number(this.player.x.toFixed(2)),
        y: Number(this.player.y.toFixed(2)),
        hp: Math.ceil(this.player.hp),
        mp: Math.floor(this.player.mp),
        level: this.player.level,
        xp: this.player.xp,
        cooldown: Number(this.player.cooldown.toFixed(2))
      },
      camera: { x: Number(this.camera.x.toFixed(2)), y: Number(this.camera.y.toFixed(2)) },
      monsters: visibleMonsters,
      projectiles: this.projectiles.map(p => ({ x: Number(p.x.toFixed(2)), y: Number(p.y.toFixed(2)), life: Number(p.life.toFixed(2)) })),
      depth: this.depth,
      exploredTiles: this.map.tiles.flat().filter(t => t.explored).length
    });
  }
}

const game = new Game();
window.AbyssalWebEngine = game;
