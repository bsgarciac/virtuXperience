import Phaser from 'phaser';
import { fmtNum } from './math.js';
import { seeded } from '../../../../shared/random.js';

/* ---- scene (Phaser: the abyss, the bridge, the rover, the effects) ---- */
// The controller and the live scene find each other through this object.
export var bridgeCtl = { scene: null, initialTarget: 0 };

export function BridgeScene(){ Phaser.Scene.call(this, { key: 'BridgeScene' }); }
BridgeScene.prototype = Object.create(Phaser.Scene.prototype);
BridgeScene.prototype.constructor = BridgeScene;

BridgeScene.prototype.create = function(){
  var self = this;
  this.T = bridgeCtl.initialTarget;
  this.busy = false; this.wonState = false; this.pendingResize = false;
  this.planks = []; this.emitters = [];
  this.makeTextures();
  this.buildAll();
  var timer = null;
  this.scale.on('resize', function(){
    clearTimeout(timer);
    timer = setTimeout(function(){
      if(bridgeCtl.scene !== self) return;
      if(self.busy){ self.pendingResize = true; } else { self.buildAll(); }
    }, 120);
  });
  bridgeCtl.scene = this;
};

BridgeScene.prototype.makeTextures = function(){
  var g;
  if(!this.textures.exists('bg-spark')){
    g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 0.12); g.fillCircle(8, 8, 8);
    g.fillStyle(0xffffff, 0.3);  g.fillCircle(8, 8, 6);
    g.fillStyle(0xffffff, 0.7);  g.fillCircle(8, 8, 3.5);
    g.fillStyle(0xffffff, 1);    g.fillCircle(8, 8, 2);
    g.generateTexture('bg-spark', 16, 16);
    g.destroy();
  }
  if(!this.textures.exists('bg-conf')){
    g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 10, 6);
    g.generateTexture('bg-conf', 10, 6);
    g.destroy();
  }
};

BridgeScene.prototype.put = function(obj){ this.root.add(obj); return obj; };

BridgeScene.prototype.buildAll = function(){
  this.tweens.killAll();
  this.time.removeAllEvents();
  if(this.root) this.root.destroy(true);
  (this.emitters || []).forEach(function(e){ e.destroy(); });
  this.emitters = []; this.planks = [];
  this.root = this.add.container(0, 0);
  this.layout();
  this.drawBackdrop();
  this.drawAbyss();
  this.drawCliffs();
  this.drawRuler();
  this.drawDecor();
  this.plankLayer = this.add.container(0, 0);
  this.root.add(this.plankLayer);
  this.makeCounter();
  this.makeRover();
  this.makeFx();
  if(this.wonState) this.restoreWon();
};

BridgeScene.prototype.layout = function(){
  var W = this.scale.width, H = this.scale.height, T = this.T;
  this.W = W; this.H = H;
  this.k = Phaser.Math.Clamp(Math.min(W / 900, H / 430), 0.55, 1.15);
  this.groundY = Math.round(H * 0.62);
  this.u = Math.min(W * 0.62 / T, 70 * this.k);   // pixels per meter
  this.gap = this.u * T;
  this.leftEdge = W / 2 - this.gap / 2;
  this.rightEdge = W / 2 + this.gap / 2;
  this.plankH = Phaser.Math.Clamp(H * 0.035, 8, 15);
  this.roverStartX = Math.max(30 * this.k, this.leftEdge - 72 * this.k);
  this.beaconX = this.rightEdge + Math.max(56 * this.k, (W - this.rightEdge) * 0.5);
};

BridgeScene.prototype.drawBackdrop = function(){
  var W = this.W, H = this.H, k = this.k, gY = this.groundY, i, x, y;
  var g = this.put(this.add.graphics());
  g.fillGradientStyle(0x080d24, 0x080d24, 0x2a2152, 0x2a2152, 1);
  g.fillRect(0, 0, W, gY + 1);
  g.fillStyle(0x070a1a, 1); g.fillRect(0, gY, W, H - gY);
  // aurora glow along the horizon
  g.fillStyle(0x57d9c9, 0.05); g.fillEllipse(W * 0.30, gY, W * 0.9, H * 0.50);
  g.fillStyle(0x9b8cf2, 0.07); g.fillEllipse(W * 0.72, gY, W * 0.8, H * 0.45);
  g.fillStyle(0xe2708f, 0.05); g.fillEllipse(W * 0.50, gY, W * 0.6, H * 0.28);

  // stars: two twinkling groups plus a few bright ones
  var rnd = seeded(11);
  var s1 = this.put(this.add.graphics()), s2 = this.put(this.add.graphics()), s3 = this.put(this.add.graphics());
  for(i = 0; i < 120; i++){
    x = rnd() * W; y = rnd() * gY * 0.92;
    var sg = i % 2 ? s1 : s2;
    sg.fillStyle(0xffffff, rnd() * 0.5 + 0.2);
    sg.fillCircle(x, y, rnd() * 1.2 + 0.3);
  }
  for(i = 0; i < 12; i++){
    x = rnd() * W; y = rnd() * gY * 0.8;
    s3.fillStyle(0xffffff, 0.9); s3.fillCircle(x, y, 1.5);
    s3.fillStyle(0xffffff, 0.16); s3.fillCircle(x, y, 4.5);
  }
  this.tweens.add({ targets: s1, alpha: { from: 0.45, to: 1 }, duration: 2300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  this.tweens.add({ targets: s2, alpha: { from: 1, to: 0.45 }, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  this.tweens.add({ targets: s3, alpha: { from: 0.6, to: 1 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

  // ringed planet
  var px = W * 0.80, py = gY * 0.34, pr = 44 * k;
  g.fillStyle(0x3a2e6b, 1); g.fillCircle(px, py, pr);
  g.fillStyle(0x56428f, 0.6); g.fillEllipse(px, py - pr * 0.2, pr * 1.7, pr * 0.28);
  g.fillStyle(0x6b52a8, 0.45); g.fillEllipse(px, py + pr * 0.3, pr * 1.5, pr * 0.2);
  g.fillStyle(0x05070a, 0.35); g.fillCircle(px + pr * 0.3, py + pr * 0.3, pr * 0.5);
  g.fillStyle(0xffffff, 0.18); g.fillCircle(px - pr * 0.3, py - pr * 0.3, pr * 0.3);
  this.put(this.add.ellipse(px, py, pr * 3.3, pr * 0.95, 0x000000, 0).setStrokeStyle(2 * k, 0xe8b84b, 0.55).setAngle(-16));
  // small moon
  var mx = W * 0.13, my = gY * 0.25, mr = 11 * k;
  g.fillStyle(0xaab4d8, 0.85); g.fillCircle(mx, my, mr);
  g.fillStyle(0x6b74a0, 0.35); g.fillCircle(mx - mr * 0.3, my - mr * 0.1, mr * 0.22); g.fillCircle(mx + mr * 0.25, my + mr * 0.3, mr * 0.16);
  g.fillStyle(0x05070a, 0.3); g.fillCircle(mx + mr * 0.3, my + mr * 0.3, mr * 0.5);

  // distant ridges
  var ridges = [ { c: 0x151d40, a: 0.95, amp: 14, base: 34, f: 0.011 }, { c: 0x1b2552, a: 0.95, amp: 10, base: 14, f: 0.02 } ];
  ridges.forEach(function(rd, ri){
    g.fillStyle(rd.c, rd.a);
    g.beginPath(); g.moveTo(0, gY);
    for(var xx = 0; xx <= W + 30; xx += 30){
      g.lineTo(xx, gY - rd.base * k - (Math.sin(xx * rd.f + ri * 2) + Math.sin(xx * rd.f * 2.3 + 1)) * rd.amp * k * 0.5);
    }
    g.lineTo(W, gY); g.closePath(); g.fillPath();
  });
};

BridgeScene.prototype.drawAbyss = function(){
  var W = this.W, H = this.H, gY = this.groundY;
  var g = this.put(this.add.graphics());
  g.fillGradientStyle(0x0a0e26, 0x0a0e26, 0x3d1216, 0x3d1216, 1);
  g.fillRect(this.leftEdge, gY, this.gap, H - gY);
  g.fillStyle(0xe2604f, 0.22); g.fillEllipse(W / 2, H + 6, this.gap * 1.05, H * 0.30);
  g.fillStyle(0xf2a34d, 0.10); g.fillEllipse(W / 2, H + 6, this.gap * 0.6, H * 0.18);
  // embers drifting up out of the abyss
  var motes = this.add.particles(0, 0, 'bg-spark', {
    emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(this.leftEdge + 6, H - 8, Math.max(10, this.gap - 12), 6) },
    lifespan: { min: 2600, max: 4600 },
    speedY: { min: -46, max: -16 }, speedX: { min: -8, max: 8 },
    scale: { start: 0.55, end: 0 }, alpha: { start: 0.8, end: 0 },
    tint: [0xe2604f, 0xf2a34d, 0xe8b84b], frequency: 140, blendMode: 'ADD'
  });
  motes.setDepth(1);
  this.emitters.push(motes);
};

BridgeScene.prototype.drawCliffs = function(){
  var W = this.W, H = this.H, k = this.k, gY = this.groundY, self = this;
  var slabH = Phaser.Math.Clamp(H * 0.05, 12, 26);
  var jag = [0, -4, 5, -6, 4, -2, 3], jy = [0, 0.05, 0.11, 0.19, 0.27, 0.36, 1];

  [-1, 1].forEach(function(s){
    var edge = s < 0 ? self.leftEdge : self.rightEdge, outer = s < 0 ? 0 : W;
    var rnd = seeded(s < 0 ? 5 : 9);
    var g = self.put(self.add.graphics()), i;
    // rock face with a jagged inner edge
    g.fillStyle(0x121a3a, 1);
    g.beginPath(); g.moveTo(outer, gY); g.lineTo(edge, gY);
    for(i = 1; i < jag.length; i++) g.lineTo(edge + s * jag[i] * k, gY + (H - gY) * jy[i]);
    g.lineTo(outer, H); g.closePath(); g.fillPath();
    // strata
    for(i = 1; i <= 4; i++){
      var sy = gY + (H - gY) * (0.10 + i * 0.16);
      g.lineStyle(2, 0x0b1226, 0.55);
      g.beginPath(); g.moveTo(outer, sy);
      var span = Math.abs(edge - outer) - 12 * k;
      for(var t = 1; t <= 6; t++){ g.lineTo(outer - s * span * t / 6, sy + (rnd() - 0.5) * 8); }
      g.strokePath();
    }
    // grassy slab + glowing lip
    g.fillStyle(0x2a3568, 1); g.fillRect(Math.min(outer, edge), gY, Math.abs(edge - outer), slabH);
    g.fillStyle(0x1f2957, 1); g.fillRect(Math.min(outer, edge), gY + slabH * 0.6, Math.abs(edge - outer), slabH * 0.4);
    g.lineStyle(2.5, 0x57d9c9, 0.7); g.lineBetween(outer, gY + 1, edge, gY + 1);
    // crystals on the far side of the cliff
    var cw = Math.abs(edge - outer);
    if(cw > 120){
      var palette = [0x57d9c9, 0x9b8cf2, 0xe8b84b];
      for(i = 0; i < 3; i++){
        var cx = s < 0 ? 12 * k + rnd() * cw * 0.28 : W - (12 * k + rnd() * cw * 0.28);
        var b = (4 + rnd() * 3) * k, h = (14 + rnd() * 16) * k, col = palette[i % 3];
        g.fillStyle(col, 0.07); g.fillCircle(cx, gY - h * 0.4, h * 0.95);
        g.fillStyle(col, 0.95);
        g.fillTriangle(cx - b, gY, cx - b * 0.3, gY - h, cx + b, gY);
        g.fillStyle(0xffffff, 0.3); g.fillTriangle(cx - b * 0.3, gY - h, cx + b * 0.1, gY - h * 0.55, cx - b * 0.55, gY - h * 0.35);
      }
    }
  });
};

BridgeScene.prototype.drawRuler = function(){
  var k = this.k, gY = this.groundY, u = this.u, T = this.T, L = this.leftEdge, R = this.rightEdge, i;
  var g = this.put(this.add.graphics());
  var y1 = gY - 62 * k;
  // dimension line with end caps and dotted guides down to the edges
  g.lineStyle(1.5, 0x57d9c9, 0.55); g.lineBetween(L, y1, R, y1);
  g.lineBetween(L, y1 - 7 * k, L, y1 + 7 * k); g.lineBetween(R, y1 - 7 * k, R, y1 + 7 * k);
  g.fillStyle(0x57d9c9, 0.7);
  g.fillTriangle(L, y1, L + 9 * k, y1 - 4 * k, L + 9 * k, y1 + 4 * k);
  g.fillTriangle(R, y1, R - 9 * k, y1 - 4 * k, R - 9 * k, y1 + 4 * k);
  g.lineStyle(1, 0x57d9c9, 0.3);
  for(var yy = y1 + 10 * k; yy < gY - 4; yy += 8){ g.lineBetween(L, yy, L, yy + 4); g.lineBetween(R, yy, R, yy + 4); }
  this.put(this.add.text((L + R) / 2, y1, 'ABISMO · ' + T + ' m', {
    fontFamily: 'Space Mono, monospace', fontSize: Math.round(13 * k) + 'px', fontStyle: 'bold', color: '#57d9c9',
    backgroundColor: '#0b1226', padding: { x: 9, y: 3 }
  }).setOrigin(0.5));
  // blueprint: one dotted cell per meter of bridge still to build
  var labelEvery = u >= 24 ? 1 : 5;
  for(i = 0; i < T; i++){
    g.lineStyle(1, 0x57d9c9, 0.28);
    g.strokeRect(L + i * u + 1, gY, u - 2, this.plankH);
    if((i + 1) % labelEvery === 0 || i === T - 1){
      this.put(this.add.text(L + i * u + u / 2, gY - 10 * k, String(i + 1), {
        fontFamily: 'Space Mono, monospace', fontSize: Math.max(9, Math.round(10 * k)) + 'px', color: '#6b74a0'
      }).setOrigin(0.5));
    }
  }
};

BridgeScene.prototype.drawDecor = function(){
  var k = this.k, gY = this.groundY, W = this.W;
  var g = this.put(this.add.graphics());
  // landed rocket (only when the cliff is wide enough to fit it beside the rover)
  if(this.leftEdge >= 185 * k){
    var rx = this.leftEdge * 0.30, s = k;
    g.lineStyle(3 * s, 0x6b74a0, 1);
    g.lineBetween(rx - 9 * s, gY - 16 * s, rx - 20 * s, gY); g.lineBetween(rx + 9 * s, gY - 16 * s, rx + 20 * s, gY);
    g.fillStyle(0xe2708f, 1);
    g.fillTriangle(rx - 11 * s, gY - 30 * s, rx - 24 * s, gY - 8 * s, rx - 11 * s, gY - 12 * s);
    g.fillTriangle(rx + 11 * s, gY - 30 * s, rx + 24 * s, gY - 8 * s, rx + 11 * s, gY - 12 * s);
    g.fillStyle(0x6b74a0, 1); g.fillRect(rx - 6 * s, gY - 16 * s, 12 * s, 6 * s);
    g.fillStyle(0xdfe6ff, 1); g.fillRoundedRect(rx - 11 * s, gY - 74 * s, 22 * s, 60 * s, 8 * s);
    g.fillStyle(0x05070a, 0.16); g.fillRect(rx + 2 * s, gY - 72 * s, 9 * s, 56 * s);
    g.fillStyle(0xe2708f, 1); g.fillTriangle(rx - 11 * s, gY - 66 * s, rx, gY - 98 * s, rx + 11 * s, gY - 66 * s);
    g.fillStyle(0x0b1226, 1); g.fillCircle(rx, gY - 46 * s, 8 * s);
    g.fillStyle(0x57d9c9, 1); g.fillCircle(rx, gY - 46 * s, 6 * s);
    g.fillStyle(0xffffff, 0.5); g.fillCircle(rx - 2 * s, gY - 48 * s, 2 * s);
    g.fillStyle(0xe8b84b, 1); g.fillRect(rx - 11 * s, gY - 30 * s, 22 * s, 3 * s);
  }
  // goal beacon: a golden portal on the far cliff
  var bx = this.beaconX;
  g.fillStyle(0x26305a, 1); g.fillEllipse(bx, gY, 58 * k, 10 * k);
  g.fillStyle(0xe8b84b, 0.25); g.fillEllipse(bx, gY, 40 * k, 6 * k);
  this.beaconGlow = this.put(this.add.ellipse(bx, gY - 46 * k, 52 * k, 76 * k, 0x57d9c9, 0.12));
  this.beaconRing = this.put(this.add.ellipse(bx, gY - 46 * k, 42 * k, 68 * k, 0x000000, 0).setStrokeStyle(3.5 * k, 0xe8b84b, 1));
  this.beaconGlyph = this.put(this.add.text(bx, gY - 46 * k, '±', {
    fontFamily: 'Cinzel, serif', fontSize: Math.round(30 * k) + 'px', fontStyle: 'bold', color: '#e8b84b'
  }).setOrigin(0.5));
  this.tweens.add({ targets: this.beaconGlow, alpha: { from: 0.08, to: 0.3 }, scale: { from: 1, to: 1.12 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  this.tweens.add({ targets: this.beaconGlyph, alpha: { from: 0.7, to: 1 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
};

BridgeScene.prototype.makeCounter = function(){
  this.counter = this.put(this.add.text(this.leftEdge, this.groundY - 46 * this.k, '', {
    fontFamily: 'Space Mono, monospace', fontSize: Math.round(17 * this.k) + 'px', fontStyle: 'bold',
    color: '#e8b84b', backgroundColor: '#0b1226', padding: { x: 7, y: 2 }
  }).setOrigin(0.5, 1).setAlpha(0));
};

BridgeScene.prototype.setCounter = function(text, x, bad){
  var lim = 34 * this.k;
  this.counter.setText(text).setColor(bad ? '#ff9b8b' : '#e8b84b')
    .setPosition(Phaser.Math.Clamp(x, lim, this.W - lim), this.groundY - 46 * this.k).setAlpha(1);
};

BridgeScene.prototype.makeRover = function(){
  var k = this.k, wr = 8 * k, i;
  var c = this.add.container(this.roverStartX, this.groundY);
  var g = this.add.graphics();
  g.fillStyle(0x000000, 0.28); g.fillEllipse(0, 0, 54 * k, 6 * k);
  // cargo crystals riding on the back
  g.fillStyle(0x57d9c9, 1); g.fillTriangle(-19 * k, -33 * k, -14 * k, -44 * k, -9 * k, -33 * k);
  g.fillStyle(0xe2708f, 1); g.fillTriangle(-11 * k, -33 * k, -7 * k, -41 * k, -3 * k, -33 * k);
  // chassis and body
  g.fillStyle(0x3a447c, 1); g.fillRoundedRect(-27 * k, -20 * k, 54 * k, 11 * k, 4 * k);
  g.fillStyle(0xdfe6ff, 1); g.fillRoundedRect(-21 * k, -33 * k, 36 * k, 15 * k, 5 * k);
  g.fillStyle(0xe8b84b, 1); g.fillRect(-21 * k, -22 * k, 36 * k, 3 * k);
  g.fillStyle(0x57d9c9, 0.95); g.fillRoundedRect(3 * k, -31 * k, 13 * k, 10 * k, 4 * k);
  g.fillStyle(0xffffff, 0.55); g.fillRect(5 * k, -29 * k, 4 * k, 2 * k);
  // headlight and its beam
  g.fillStyle(0xffe9a8, 0.12); g.fillTriangle(28 * k, -15 * k, 70 * k, -28 * k, 70 * k, -2 * k);
  g.fillStyle(0xffe9a8, 1); g.fillCircle(26 * k, -15 * k, 3 * k);
  // antenna
  g.lineStyle(1.5 * k, 0x9aa3c7, 1); g.lineBetween(9 * k, -33 * k, 9 * k, -42 * k);
  g.fillStyle(0xe2604f, 1); g.fillCircle(9 * k, -43 * k, 2 * k);
  c.add(g);
  var wheels = [];
  [-16 * k, 16 * k].forEach(function(wx){
    var w = this.add.graphics({ x: wx, y: -wr });
    w.fillStyle(0x0b1226, 1); w.fillCircle(0, 0, wr);
    w.lineStyle(2 * k, 0x9aa3c7, 1); w.strokeCircle(0, 0, wr);
    w.lineStyle(1.5 * k, 0x9aa3c7, 0.9);
    for(i = 0; i < 3; i++){
      var a = i * Math.PI / 3;
      w.lineBetween(-Math.cos(a) * wr * 0.8, -Math.sin(a) * wr * 0.8, Math.cos(a) * wr * 0.8, Math.sin(a) * wr * 0.8);
    }
    w.fillStyle(0xe8b84b, 1); w.fillCircle(0, 0, wr * 0.32);
    c.add(w); wheels.push(w);
  }, this);
  c.wheels = wheels; c.wr = wr;
  this.rover = c;
  this.root.add(c);
};

BridgeScene.prototype.makeFx = function(){
  var sparks = this.add.particles(0, 0, 'bg-spark', {
    emitting: false, lifespan: 520, speed: { min: 20, max: 100 },
    scale: { start: 0.55, end: 0 }, alpha: { start: 1, end: 0 }, tint: 0x57d9c9, blendMode: 'ADD'
  });
  var embers = this.add.particles(0, 0, 'bg-spark', {
    emitting: false, lifespan: 720, speed: { min: 40, max: 210 }, angle: { min: 195, max: 345 }, gravityY: 320,
    scale: { start: 0.8, end: 0 }, alpha: { start: 1, end: 0 }, tint: [0xf2a34d, 0xe2604f, 0xe8b84b], blendMode: 'ADD'
  });
  var confetti = this.add.particles(0, 0, 'bg-conf', {
    emitting: false, lifespan: { min: 1000, max: 1700 }, speed: { min: 150, max: 430 }, angle: { min: 215, max: 325 },
    gravityY: 540, rotate: { min: 0, max: 360 }, scale: { start: 1, end: 0.55 }, alpha: { start: 1, end: 0 },
    tint: [0x57d9c9, 0xe8b84b, 0xe2708f, 0x9b8cf2, 0x4fbf8b]
  });
  sparks.setDepth(2); embers.setDepth(2); confetti.setDepth(3);
  this.sparks = sparks; this.embers = embers; this.confetti = confetti;
  this.emitters.push(sparks, embers, confetti);
};

BridgeScene.prototype.addPlank = function(i, over, animate){
  var u = this.u, h = this.plankH, k = this.k, gY = this.groundY;
  var edge = over ? 0xe2604f : 0x57d9c9, fill = over ? 0x5a2228 : 0x2b3b7c;
  var c = this.add.container(this.leftEdge + i * u, gY);
  var g = this.add.graphics();
  g.fillStyle(edge, 0.16); g.fillRoundedRect(-2, -3, u + 2, h + 8, 6);                  // glow
  g.lineStyle(1.5, edge, 0.5); g.beginPath();                                           // truss under the deck
  g.moveTo(1, h); g.lineTo(u / 2, h + Math.min(u * 0.55, 22 * k)); g.lineTo(u - 1, h); g.strokePath();
  g.fillStyle(fill, 1); g.fillRoundedRect(1, 0, u - 2, h, 3);                          // plank
  g.fillStyle(edge, 1); g.fillRect(3, 0, Math.max(2, u - 6), 2);
  g.fillStyle(0xffffff, 0.10); g.fillRect(3, 2, Math.max(2, u - 6), h * 0.35);
  g.lineStyle(2, edge, 0.85); g.lineBetween(1, 0, 1, -13 * k);                         // rail post
  g.lineStyle(1.5, edge, 0.6); g.lineBetween(1, -13 * k, u + 1, -13 * k);              // rail
  var shine = this.add.graphics();
  shine.fillStyle(0xe8b84b, 1); shine.fillRoundedRect(1, 0, u - 2, h, 3); shine.setAlpha(0);
  c.add([g, shine]);
  this.plankLayer.add(c);
  this.planks.push({ c: c, shine: shine });
  if(animate){
    c.y = gY - 38 * k; c.setAlpha(0);
    this.tweens.add({ targets: c, y: gY, alpha: 1, duration: 260, ease: 'Back.easeOut' });
    this.sparks.setParticleTint(edge);
    this.sparks.explode(4, this.leftEdge + i * u + u / 2, gY);
  }
  return c;
};

BridgeScene.prototype.clearPlanks = function(){
  this.planks.forEach(function(p){ p.c.destroy(); });
  this.planks = [];
  if(this.counter) this.counter.setAlpha(0);
};

BridgeScene.prototype.finishBusy = function(){
  this.busy = false;
  if(this.pendingResize){ this.pendingResize = false; this.buildAll(); }
};

BridgeScene.prototype.runBridge = function(val, kind, onResult, onReady){
  var self = this, T = this.T, n = val > 0 ? Math.min(val, T + 2) : 0;
  this.busy = true;
  this.clearPlanks();
  var dt = n > 0 ? Phaser.Math.Clamp(1400 / n, 70, 200) : 0;
  for(var i = 0; i < n; i++){
    (function(idx){
      self.time.delayedCall(idx * dt, function(){
        self.addPlank(idx, idx >= T, true);
        self.setCounter((idx + 1) + ' m', self.leftEdge + (idx + 1) * self.u, idx >= T);
      });
    })(i);
  }
  this.time.delayedCall(n * dt + 350, function(){
    // reveal the real value (it can exceed what fits on screen, or be <= 0)
    self.setCounter(fmtNum(val) + ' m', self.leftEdge + n * self.u, kind !== 'win');
    if(kind === 'win'){
      self.shineWave(function(){
        self.driveTo(self.beaconX - 40 * self.k, Phaser.Math.Clamp((self.beaconX - 40 * self.k - self.rover.x) / 0.26, 1400, 3400), function(){
          self.wonState = true;
          self.celebrate();
          onResult(); onReady();
          self.finishBusy();
        });
      });
    } else if(kind === 'long'){
      self.collapseLong(onResult, onReady);
    } else {
      self.driveAndFall(n, onResult, onReady);
    }
  });
};

BridgeScene.prototype.shineWave = function(cb){
  var self = this;
  this.planks.forEach(function(p, i){
    self.tweens.add({ targets: p.shine, alpha: { from: 0, to: 0.9 }, duration: 170, delay: i * 40, yoyo: true, hold: 30, ease: 'Sine.easeOut' });
  });
  this.time.delayedCall(this.planks.length * 40 + 380, cb);
};

BridgeScene.prototype.driveTo = function(x, dur, cb){
  var self = this, r = this.rover, last = r.x;
  this.tweens.add({
    targets: r, x: x, duration: dur, ease: 'Sine.easeInOut',
    onUpdate: function(){
      var dx = r.x - last; last = r.x;
      r.wheels.forEach(function(w){ w.rotation += dx / r.wr; });
      r.y = self.groundY - Math.abs(Math.sin(r.x * 0.12)) * 1.4 * self.k;
    },
    onComplete: function(){ r.y = self.groundY; if(cb) cb(); }
  });
};

BridgeScene.prototype.celebrate = function(){
  var k = this.k, bx = this.beaconX, gY = this.groundY;
  this.cameras.main.flash(240, 87, 217, 201);
  this.confetti.explode(80, bx, gY - 70 * k);
  this.sparks.setParticleTint(0xe8b84b);
  this.sparks.explode(26, bx, gY - 46 * k);
  this.tweens.add({ targets: this.beaconRing, scaleX: { from: 1, to: 1.35 }, scaleY: { from: 1, to: 1.35 }, duration: 260, yoyo: true, repeat: 1, ease: 'Sine.easeOut' });
  this.tweens.add({ targets: this.rover, y: gY - 16 * k, duration: 190, yoyo: true, repeat: 1, ease: 'Quad.easeOut' });
};

BridgeScene.prototype.driveAndFall = function(n, onResult, onReady){
  var self = this, k = this.k, r = this.rover, gY = this.groundY;
  var tipX = this.leftEdge + n * this.u;
  var stopX = Math.max(r.x + 4, tipX - 12 * k);
  this.driveTo(stopX, Phaser.Math.Clamp((stopX - r.x) / 0.24, 500, 3000), function(){
    self.embers.explode(14, r.x + 22 * k, gY);
    self.cameras.main.shake(260, 0.006);
    self.tweens.add({ targets: r, rotation: 1.2, x: r.x + 44 * k, duration: 1000, ease: 'Quad.easeIn' });
    self.tweens.add({ targets: r, y: self.H + 90 * k, duration: 1000, ease: 'Quad.easeIn' });
    self.tweens.add({ targets: r, alpha: 0, duration: 320, delay: 700 });
    self.time.delayedCall(450, onResult);
    self.time.delayedCall(1150, function(){
      self.dissolvePlanks(function(){
        self.resetRover();
        onReady();
        self.finishBusy();
      });
    });
  });
};

BridgeScene.prototype.collapseLong = function(onResult, onReady){
  var self = this, T = this.T, gY = this.groundY, H = this.H, k = this.k;
  var n = this.planks.length;
  // the planks that stick out past the far cliff shudder first
  this.planks.slice(T).forEach(function(p){
    self.tweens.add({ targets: p.c, x: '+=3', duration: 40, yoyo: true, repeat: 6 });
  });
  this.cameras.main.shake(320, 0.008);
  this.embers.explode(18, this.rightEdge, gY);
  this.time.delayedCall(520, function(){
    onResult();
    self.planks.forEach(function(p, i){
      self.tweens.add({
        targets: p.c, y: gY + H, rotation: (i % 2 ? 1 : -1) * (0.4 + (i % 3) * 0.2), alpha: 0,
        duration: 800, delay: (n - 1 - i) * 30, ease: 'Quad.easeIn'
      });
    });
  });
  this.time.delayedCall(520 + n * 30 + 900, function(){
    self.clearPlanks();
    onReady();
    self.finishBusy();
  });
};

BridgeScene.prototype.dissolvePlanks = function(cb){
  var self = this, n = this.planks.length;
  this.planks.forEach(function(p, i){
    self.tweens.add({ targets: p.c, alpha: 0, y: p.c.y + 14, duration: 260, delay: (n - 1 - i) * 45 });
  });
  if(this.counter) this.tweens.add({ targets: this.counter, alpha: 0, duration: 300 });
  this.time.delayedCall(n * 45 + 320, function(){ self.clearPlanks(); cb(); });
};

BridgeScene.prototype.resetRover = function(){
  var r = this.rover;
  r.setPosition(this.roverStartX, this.groundY).setRotation(0).setAlpha(0);
  r.wheels.forEach(function(w){ w.rotation = 0; });
  this.tweens.add({ targets: r, alpha: 1, duration: 350 });
};

// After a resize following a win: redraw the finished bridge without animating.
BridgeScene.prototype.restoreWon = function(){
  for(var i = 0; i < this.T; i++) this.addPlank(i, false, false);
  this.rover.setPosition(this.beaconX - 40 * this.k, this.groundY);
  this.setCounter(this.T + ' m', this.rightEdge, false);
};

BridgeScene.prototype.changeLevel = function(T){
  var self = this, cam = this.cameras.main;
  this.T = T; this.wonState = false; this.busy = false;
  cam.fadeOut(200, 8, 12, 30);
  cam.once('camerafadeoutcomplete', function(){
    if(bridgeCtl.scene !== self) return;
    self.buildAll();
    cam.fadeIn(300, 8, 12, 30);
  });
};
