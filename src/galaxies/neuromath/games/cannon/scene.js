import Phaser from 'phaser';
import { f, fmt, pt } from './math.js';
import { SceneKit } from '../../../../shared/game/scene-kit.js';

/* ---- scene (Phaser: the axes, the wall, the cannon, the shot) ---- */
// World units are meters on a Cartesian plane whose origin is the cannon's
// pivot at ground level: px(x), py(y) map them to the stage.

// The controller and the live scene find each other through this object:
// level and params are the controller's current level and parameters.
export var cannonCtl = { scene: null, level: null, params: null };

export function CannonScene(){ Phaser.Scene.call(this, { key: 'CannonScene' }); }
CannonScene.prototype = Object.create(Phaser.Scene.prototype);
CannonScene.prototype.constructor = CannonScene;
Object.assign(CannonScene.prototype, SceneKit);

CannonScene.prototype.create = function(){
  var self = this;
  this.busy = false; this.pendingResize = false; this.wonState = false;
  this.emitters = []; this.trail = null; this.marker = null;
  this.makeTextures();
  this.buildAll();
  var timer = null;
  this.scale.on('resize', function(){
    clearTimeout(timer);
    timer = setTimeout(function(){
      if(cannonCtl.scene !== self) return;
      if(self.busy){ self.pendingResize = true; } else { self.buildAll(); }
    }, 120);
  });
  cannonCtl.scene = this;
};

CannonScene.prototype.buildAll = function(){
  this.tweens.killAll();
  this.time.removeAllEvents();
  if(this.root) this.root.destroy(true);
  (this.emitters || []).forEach(function(e){ e.destroy(); });
  this.emitters = [];
  this.root = this.add.container(0, 0);
  this.layout();
  this.drawBackdrop();
  this.drawGround();
  this.drawAxes();
  this.trailLayer = this.add.container(0, 0); this.root.add(this.trailLayer);
  if(!this.wonState) this.drawWall();
  if(cannonCtl.level.rock) this.drawRock();
  this.drawCannon();
  this.makeRover();
  this.makeFx();
  this.aim(cannonCtl.params, false);
  // the latest shot's trail stays bright; the one before it fades
  if(this.trail) this.drawTrail(this.trail, this.trailFresh ? 0.85 : 0.28);
  if(this.marker) this.drawMarker(this.marker);
  if(this.wonState) this.rover.x = this.beyondX;
};

CannonScene.prototype.layout = function(){
  var W = this.scale.width, H = this.scale.height, lv = cannonCtl.level;
  this.W = W; this.H = H;
  this.k = Phaser.Math.Clamp(Math.min(W / 900, H / 430), 0.55, 1.15);
  var k = this.k;
  this.groundY = Math.round(H * 0.84);
  this.x0 = Math.max(96 * k, W * 0.17);
  this.sx = (W * 0.66 - this.x0) / lv.wall.x;
  this.sy = (this.groundY - 30 * k) / lv.ymax;
  this.wallThick = Phaser.Math.Clamp(this.sx * 0.45, 16 * k, 34 * k);
  this.wallLeft = this.px(lv.wall.x);
  this.beyondX = this.wallLeft + this.wallThick + (W - this.wallLeft - this.wallThick) * 0.5;
  this.roverStartX = Math.max(30 * k, this.x0 - 88 * k);
};

CannonScene.prototype.px = function(x){ return this.x0 + x * this.sx; };
CannonScene.prototype.py = function(y){ return this.groundY - y * this.sy; };

CannonScene.prototype.drawGround = function(){
  var W = this.W, H = this.H, gY = this.groundY;
  var slabH = Phaser.Math.Clamp(H * 0.035, 8, 18);
  var g = this.put(this.add.graphics());
  g.fillStyle(0x121a3a, 1); g.fillRect(0, gY, W, H - gY);
  g.fillStyle(0x2a3568, 1); g.fillRect(0, gY, W, slabH);
  g.fillStyle(0x1f2957, 1); g.fillRect(0, gY + slabH * 0.6, W, slabH * 0.4);
  g.lineStyle(2.5, 0x57d9c9, 0.7); g.lineBetween(0, gY + 1, W, gY + 1);
};

// Cartesian axes with integer ticks, a faint grid, and dotted guides from
// both axes to the crack so its coordinates can be read off the plane.
CannonScene.prototype.drawAxes = function(){
  var k = this.k, gY = this.groundY, x0 = this.x0, lv = cannonCtl.level, i;
  var g = this.put(this.add.graphics());
  var xStep = this.sx >= 30 ? 1 : 2, yStep = this.sy >= 26 ? 1 : (this.sy >= 12 ? 2 : 5);
  var xMax = Math.floor((this.W - x0) / this.sx), yMax = Math.floor(lv.ymax);
  var font = { fontFamily: 'Space Mono, monospace', fontSize: Math.max(9, Math.round(10.5 * k)) + 'px', color: '#6b74a0' };
  // half-unit ticks when there is room, so vertices like x = 1,5 can be read
  if(this.sx >= 110){
    g.lineStyle(1, 0x9aa3c7, 0.35);
    for(i = 0; i < xMax; i++) g.lineBetween(this.px(i + 0.5), gY - 3, this.px(i + 0.5), gY + 3);
  }
  for(i = 1; i <= xMax; i++){
    g.lineStyle(1, 0x57d9c9, 0.07); g.lineBetween(this.px(i), gY, this.px(i), this.py(yMax));
    g.lineStyle(1.5, 0x9aa3c7, 0.5); g.lineBetween(this.px(i), gY - 4, this.px(i), gY + 4);
    if(i % xStep === 0) this.put(this.add.text(this.px(i), gY + 7 * k, String(i), font).setOrigin(0.5, 0));
  }
  for(i = 1; i <= yMax; i++){
    g.lineStyle(1, 0x57d9c9, 0.07); g.lineBetween(x0, this.py(i), this.W, this.py(i));
    g.lineStyle(1.5, 0x9aa3c7, 0.5); g.lineBetween(x0 - 4, this.py(i), x0 + 4, this.py(i));
    if(i % yStep === 0) this.put(this.add.text(x0 - 8 * k, this.py(i), String(i), font).setOrigin(1, 0.5));
  }
  g.lineStyle(1.5, 0x9aa3c7, 0.6); g.lineBetween(x0, gY, x0, this.py(yMax) - 6);
  this.put(this.add.text(x0 + 6 * k, this.py(yMax) - 8 * k, 'y', Object.assign({}, font, { color: '#9aa3c7' })).setOrigin(0, 1));
  this.put(this.add.text(this.W - 10 * k, gY - 6 * k, 'x', Object.assign({}, font, { color: '#9aa3c7' })).setOrigin(1, 1));
  // guides to the crack
  var cx = this.wallLeft, cy = this.py(lv.crack);
  g.lineStyle(1, 0xe8b84b, 0.4);
  for(var xx = x0; xx < cx - 4; xx += 9) g.lineBetween(xx, cy, Math.min(xx + 4, cx), cy);
  for(var yy = cy; yy < gY - 2; yy += 9) g.lineBetween(cx, yy, cx, Math.min(yy + 4, gY));
};

// The wall is a stack of blocks so it can crumble piece by piece.
CannonScene.prototype.drawWall = function(){
  var k = this.k, lv = cannonCtl.level, L = this.wallLeft, T = this.wallThick, gY = this.groundY;
  var top = this.py(lv.wall.h), rows = Math.max(3, Math.round((gY - top) / (24 * k)));
  var rowH = (gY - top) / rows;
  this.wallPieces = [];
  for(var r = 0; r < rows; r++){
    var y = top + r * rowH, halves = r % 2 ? [[0, 0.55], [0.55, 1]] : [[0, 0.4], [0.4, 1]];
    for(var h = 0; h < halves.length; h++){
      var x1 = L + T * halves[h][0], x2 = L + T * halves[h][1], bw = x2 - x1;
      // each block is centered on its own container so it tumbles in place
      var c = this.add.container((x1 + x2) / 2, y + rowH / 2);
      var g = this.add.graphics();
      g.fillStyle(0x1b2552, 1); g.fillRect(-bw / 2, -rowH / 2, bw, rowH);
      g.fillStyle(0x26305a, 1); g.fillRect(-bw / 2, -rowH / 2, bw, Math.max(2, rowH * 0.22));
      g.lineStyle(1.5, 0x0b1226, 0.9); g.strokeRect(-bw / 2, -rowH / 2, bw, rowH);
      c.add(g);
      this.put(c);
      this.wallPieces.push(c);
    }
  }
  // crystals on top
  var cg = this.put(this.add.graphics());
  [[0.3, 0x57d9c9, 16], [0.7, 0xe2708f, 12]].forEach(function(cr){
    var cx = L + T * cr[0], hh = cr[2] * k, b = 4 * k;
    cg.fillStyle(cr[1], 0.9); cg.fillTriangle(cx - b, top, cx, top - hh, cx + b, top);
  });
  this.wallCrystals = cg;
  // the crack: a jagged, glowing line across the wall face at crack height
  var cy = this.py(lv.crack);
  var crack = this.add.graphics();
  crack.fillStyle(0xe8b84b, 0.16); crack.fillEllipse(L + T * 0.35, cy, T * 1.3, 18 * k);
  crack.lineStyle(3 * k, 0xffe9a8, 1);
  crack.beginPath(); crack.moveTo(L - 1, cy);
  var zig = [[0.18, -5], [0.34, 4], [0.5, -3], [0.64, 5], [0.78, -2]];
  zig.forEach(function(z){ crack.lineTo(L + T * z[0], cy + z[1] * k); });
  crack.strokePath();
  this.crack = this.put(crack);
  this.tweens.add({ targets: crack, alpha: { from: 0.65, to: 1 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  this.crackLabel = this.put(this.add.text(L - 8 * k, cy - 8 * k, 'grieta ' + pt(lv.wall.x, lv.crack), {
    fontFamily: 'Space Mono, monospace', fontSize: Math.round(12 * k) + 'px', fontStyle: 'bold', color: '#e8b84b',
    backgroundColor: '#0b1226', padding: { x: 6, y: 2 }
  }).setOrigin(1, 1));
};

CannonScene.prototype.drawRock = function(){
  var k = this.k, rk = cannonCtl.level.rock, gY = this.groundY;
  var cx = this.px(rk.x), top = this.py(rk.h), hw = Phaser.Math.Clamp(this.sx * 0.32, 12 * k, 30 * k);
  var g = this.put(this.add.graphics());
  g.fillStyle(0x222c5c, 1);
  g.beginPath(); g.moveTo(cx - hw * 1.2, gY); g.lineTo(cx - hw, top + (gY - top) * 0.25); g.lineTo(cx - hw * 0.35, top);
  g.lineTo(cx + hw * 0.5, top + 4 * k); g.lineTo(cx + hw, top + (gY - top) * 0.3); g.lineTo(cx + hw * 1.15, gY); g.closePath(); g.fillPath();
  g.fillStyle(0x05070a, 0.25); g.fillTriangle(cx + hw * 0.1, top + 6 * k, cx + hw, top + (gY - top) * 0.3, cx + hw * 1.15, gY);
  g.lineStyle(2, 0x3a447c, 1); g.strokePath();
  this.put(this.add.text(cx, top - 6 * k, 'roca · ' + fmt(rk.h) + ' m', {
    fontFamily: 'Space Mono, monospace', fontSize: Math.max(9, Math.round(10.5 * k)) + 'px', color: '#9aa3c7',
    backgroundColor: '#0b1226', padding: { x: 5, y: 1 }
  }).setOrigin(0.5, 1));
};

// The cannon: a small turret whose pivot is the origin (0, c). A mast lifts
// it when c > 0, and the barrel points along the launch slope f'(0) = b.
CannonScene.prototype.drawCannon = function(){
  var k = this.k;
  this.mast = this.put(this.add.graphics());
  var c = this.add.container(this.x0, this.groundY);
  var barrel = this.add.container(0, 0);
  var bg = this.add.graphics();
  bg.fillStyle(0x6b74a0, 1); bg.fillRoundedRect(0, -5 * k, 34 * k, 10 * k, 3 * k);
  bg.fillStyle(0xe8b84b, 1); bg.fillRect(26 * k, -6 * k, 6 * k, 12 * k);
  bg.fillStyle(0xffffff, 0.25); bg.fillRect(3 * k, -4 * k, 20 * k, 2.5 * k);
  barrel.add(bg);
  var base = this.add.graphics();
  base.fillStyle(0x3a447c, 1); base.fillCircle(0, 0, 11 * k);
  base.fillStyle(0xdfe6ff, 1); base.fillCircle(0, 0, 6 * k);
  base.fillStyle(0x57d9c9, 1); base.fillCircle(0, 0, 3 * k);
  c.add([barrel, base]);
  c.barrel = barrel;
  this.cannon = this.put(c);
};

CannonScene.prototype.drawMast = function(cy){
  var k = this.k, x = this.x0, gY = this.groundY, m = this.mast;
  m.clear();
  if(gY - cy < 2) return;
  m.lineStyle(2.5 * k, 0x6b74a0, 1);
  m.lineBetween(x - 7 * k, gY, x - 4 * k, cy); m.lineBetween(x + 7 * k, gY, x + 4 * k, cy);
  m.lineStyle(1.5 * k, 0x6b74a0, 0.7);
  for(var y = gY; y > cy + 8 * k; y -= 14 * k){ m.lineBetween(x - 6 * k, y, x + 5 * k, y - 14 * k); }
  m.fillStyle(0x3a447c, 1); m.fillRect(x - 12 * k, gY - 4 * k, 24 * k, 4 * k);
};

// Point the cannon for params p: raise it to c and turn the barrel to slope b.
CannonScene.prototype.aim = function(p, animate){
  if(!this.cannon || !p) return;
  var cy = this.py(p.c);
  var ang = -Math.atan2(p.b * this.sy, this.sx);
  var self = this;
  if(animate){
    this.tweens.add({ targets: this.cannon.barrel, rotation: ang, duration: 180, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: this.cannon, y: cy, duration: 220, ease: 'Sine.easeOut',
      onUpdate: function(){ self.drawMast(self.cannon.y); } });
  } else {
    this.cannon.barrel.rotation = ang;
    this.cannon.y = cy;
    this.drawMast(cy);
  }
};

CannonScene.prototype.drawTrail = function(points, alpha){
  var g = this.add.graphics(), self = this;
  g.fillStyle(0xffe9a8, alpha);
  points.forEach(function(q){ g.fillCircle(self.px(q[0]), self.py(q[1]), 2.2 * self.k); });
  this.trailLayer.add(g);
  return g;
};

CannonScene.prototype.drawMarker = function(m){
  var k = this.k, x = this.px(m.x), y = this.py(m.y);
  var g = this.put(this.add.graphics());
  g.lineStyle(2.5 * k, 0xe2604f, 1);
  g.lineBetween(x - 6 * k, y - 6 * k, x + 6 * k, y + 6 * k); g.lineBetween(x - 6 * k, y + 6 * k, x + 6 * k, y - 6 * k);
  this.put(this.add.text(x + (m.right ? 10 : -10) * k, y - 10 * k, m.text, {
    fontFamily: 'Space Mono, monospace', fontSize: Math.round(12 * k) + 'px', fontStyle: 'bold', color: '#ff9b8b',
    backgroundColor: '#0b1226', padding: { x: 5, y: 2 }
  }).setOrigin(m.right ? 0 : 1, 1));
};

CannonScene.prototype.finishBusy = function(){
  this.busy = false;
  if(this.pendingResize){ this.pendingResize = false; this.buildAll(); }
};

// Fire along f with params p; out is simulate()'s result. onResult shows the
// outcome in the panel, onReady unlocks the controls once the scene is idle.
CannonScene.prototype.runShot = function(p, out, onResult, onReady){
  var self = this, k = this.k;
  this.busy = true;
  this.marker = null; this.trailFresh = false;
  this.buildAll(); // clears the previous marker, keeps the previous trail dimmed
  var xEnd = out.kind === 'over'
    ? Math.min(out.land === null ? Infinity : out.land, (this.W + 30 - this.x0) / this.sx)
    : out.x;
  var ball = this.put(this.add.circle(this.px(0), this.py(p.c), 5.5 * k, 0xffe9a8, 1));
  var glow = this.put(this.add.circle(this.px(0), this.py(p.c), 11 * k, 0xe8b84b, 0.3));
  var trailG = this.add.graphics(); this.trailLayer.add(trailG);
  var pts = [], lastPx = -Infinity;
  // recoil and muzzle flash
  this.tweens.add({ targets: this.cannon.barrel, x: -5 * k, duration: 70, yoyo: true, ease: 'Quad.easeOut' });
  this.sparks.setParticleTint(0xffe9a8); this.sparks.explode(10, this.px(0), this.py(p.c));
  this.cameras.main.shake(120, 0.003);
  var dur = Phaser.Math.Clamp(600 + xEnd * this.sx * 1.6, 800, 2200);
  var prog = { t: 0 };
  this.tweens.add({
    targets: prog, t: 1, duration: dur, ease: 'Linear',
    onUpdate: function(){
      var x = prog.t * xEnd, y = f(p, x), sx = self.px(x), sy = self.py(y);
      ball.setPosition(sx, sy); glow.setPosition(sx, sy);
      if(sx - lastPx > 9 * k){
        lastPx = sx; pts.push([x, y]);
        trailG.fillStyle(0xffe9a8, 0.85); trailG.fillCircle(sx, sy, 2.2 * k);
      }
    },
    onComplete: function(){
      pts.push([xEnd, f(p, xEnd)]);
      self.trail = pts; self.trailFresh = true;
      ball.destroy(); glow.destroy();
      self.impact(p, out, xEnd, onResult, onReady);
    }
  });
};

CannonScene.prototype.impact = function(p, out, xEnd, onResult, onReady){
  var self = this, k = this.k, lv = cannonCtl.level;
  var ix = this.px(xEnd), iy = this.py(f(p, xEnd));
  var done = function(){ onResult(); onReady(); self.finishBusy(); };
  if(out.kind === 'crack'){
    this.sparks.setParticleTint(0xe8b84b); this.sparks.explode(24, ix, iy);
    this.cameras.main.shake(380, 0.012);
    this.crumbleWall(function(){
      self.wonState = true;
      onResult();
      self.driveTo(self.beyondX, Phaser.Math.Clamp((self.beyondX - self.rover.x) / 0.3, 1200, 3000), function(){
        self.burstAt(self.beyondX, self.groundY - 46 * k);
        self.tweens.add({ targets: self.rover, y: self.groundY - 16 * k, duration: 190, yoyo: true, repeat: 1, ease: 'Quad.easeOut' });
        onReady();
        self.time.delayedCall(900, function(){ self.finishBusy(); });
      });
    });
    return;
  }
  this.embers.explode(out.kind === 'over' ? 6 : 16, ix, iy);
  this.cameras.main.shake(220, out.kind === 'over' ? 0.002 : 0.006);
  if(out.kind === 'glancing'){
    this.tweens.add({ targets: this.crack, alpha: { from: 1, to: 0.2 }, duration: 120, yoyo: true, repeat: 2 });
    this.marker = { x: lv.wall.x, y: out.y, text: 'de lado: f\'(' + fmt(lv.wall.x) + ') = ' + fmt(out.slope) };
  } else if(out.kind === 'over'){
    this.marker = { x: lv.wall.x, y: out.y, text: 'pasó por encima · y = ' + fmt(out.y), right: true };
  } else if(out.kind === 'ground'){
    this.marker = { x: out.x, y: 0, text: 'cayó en x = ' + fmt(out.x) };
  } else {
    this.marker = { x: out.x, y: out.y, text: 'y = ' + fmt(out.y) };
  }
  this.drawMarker(this.marker);
  this.time.delayedCall(450, done);
};

CannonScene.prototype.crumbleWall = function(cb){
  var self = this, H = this.H, n = this.wallPieces.length;
  this.crack.destroy(); this.crackLabel.destroy();
  this.tweens.add({ targets: this.wallCrystals, alpha: 0, y: 40, duration: 500 });
  this.wallPieces.forEach(function(pc, i){
    self.tweens.add({
      targets: pc, y: pc.y + H, x: pc.x + (i % 2 ? 1 : -1) * (8 + (i % 3) * 10) * self.k, angle: (i % 2 ? 1 : -1) * (20 + (i % 4) * 15), alpha: 0,
      duration: 900, delay: (n - 1 - i) * 25, ease: 'Quad.easeIn'
    });
  });
  this.embers.explode(22, this.wallLeft + this.wallThick / 2, this.groundY - 20 * this.k);
  this.time.delayedCall(n * 25 + 700, cb);
};

// Called by the controller when the player changes a parameter.
CannonScene.prototype.onParams = function(p){ if(!this.busy) this.aim(p, true); };

CannonScene.prototype.changeLevel = function(){
  var self = this, cam = this.cameras.main;
  this.wonState = false; this.busy = false; this.trail = null; this.marker = null;
  cam.fadeOut(200, 8, 12, 30);
  cam.once('camerafadeoutcomplete', function(){
    if(cannonCtl.scene !== self) return;
    self.buildAll();
    cam.fadeIn(300, 8, 12, 30);
  });
};
