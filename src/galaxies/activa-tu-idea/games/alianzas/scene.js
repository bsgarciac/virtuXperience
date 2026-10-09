import Phaser from 'phaser';
import { makeSintonizadorTextures } from './sprites.js';

// Two moments on the same stage:
//  - 'room': the Distrito Cristalino as a small platformer. The Sintonizador
//    walks and jumps across the rocks, picks up Células Lógicas, and reaches
//    the corrupted Nodo up on the right; E / Espacio activates it.
//  - 'node': a close-up of the Nodo while the four phases are played in the
//    panel below. Each phase cleared blends the corrupted art towards the
//    purified one (setRestored) and leaves a mark: satellites on the orbits,
//    threads of light, a burst.
// The controller talks to the scene through alianzasCtl.

export var alianzasCtl = {
  scene: null,
  game: null,         // the Phaser.Game the scene runs in
  onInteract: null,   // runs once when the player activates the Nodo
  onCell: null,       // onCell(count, total) each time a Célula is picked up
  input: { left: false, right: false, jump: false, act: false } // touch buttons
};

var ASSETS = 'assets/activa-tu-idea/';
var BG_W = 1400, BG_H = 781; // the coordinates below are on this frame

// Rocks you can stand on: [left, top, right] on the background art. The
// ground is solid; the rest can be jumped through from below.
var PLATFORMS = [
  [520, 528, 648], [652, 482, 770], [790, 462, 960], [962, 446, 1032],
  [1036, 452, 1104], [945, 302, 1400]
];
var GROUND_Y = 612;
var CELLS = [[300, 540], [585, 470], [870, 400], [1070, 385], [1010, 240]];
export var CELL_COUNT = CELLS.length;
var NODE = { x: 1272, y: 225 };  // the Nodo on the room art
var NODE_CLOSE = { x: 700, y: 250 }; // the Nodo on the close-up art
var CHAR_H = 150; // the Sintonizador's height on the room art

// ?debug in the URL draws the physics bodies, to line platforms up with the art.
var DEBUG = /[?&]debug\b/.test(window.location.search);

export function AlianzasScene(){
  Phaser.Scene.call(this, { key: 'AlianzasScene', physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: DEBUG } } });
}
AlianzasScene.prototype = Object.create(Phaser.Scene.prototype);
AlianzasScene.prototype.constructor = AlianzasScene;

AlianzasScene.prototype.preload = function(){
  this.load.image('dc-room', ASSETS + 'distrito.jpg');
  this.load.image('dc-node-bad', ASSETS + 'nodo-corrupto.jpg');
  this.load.image('dc-node-good', ASSETS + 'nodo-purificado.jpg');
  this.load.image('sint-sheet', ASSETS + 'sintonizador.jpg');
};

AlianzasScene.prototype.create = function(){
  alianzasCtl.scene = this;
  makeSintonizadorTextures(this);
  this.mode = this.mode || 'room';
  this.restored = this.restored || 0;
  this.marks = this.marks || { satellites: [], threads: 0 };
  this.build();
  var self = this;
  function onResize(){ self.build(); }
  this.scale.on('resize', onResize);
  this.events.once('shutdown', function(){ self.scale.off('resize', onResize); });
  this.events.once('destroy', function(){ self.scale.off('resize', onResize); });

  var kb = this.input.keyboard;
  this.keys = kb.addKeys('LEFT,RIGHT,UP,A,D,W,SPACE,E');
};

// Lays everything out for the current stage size and mode.
AlianzasScene.prototype.build = function(){
  this.W = this.scale.width; this.H = this.scale.height;
  if(this.root) this.root.destroy(true);
  if(this.collider){ this.collider.destroy(); this.collider = null; }
  if(this.physicsGroup){ this.physicsGroup.clear(true, true); this.physicsGroup = null; }
  if(this.player){ this.player.destroy(); this.player = null; }
  this.root = this.add.container(0, 0);
  if(this.mode === 'room') this.buildRoom();
  else this.buildNode();
};

/* ---------- room: the walkable district ---------- */

// The art is fitted inside the stage (nothing cropped) and sits on its
// bottom edge; s maps art pixels to screen pixels.
AlianzasScene.prototype.roomFrame = function(){
  var s = Math.min(this.W / BG_W, this.H / BG_H);
  return { s: s, ox: (this.W - BG_W * s) / 2, oy: this.H - BG_H * s };
};
AlianzasScene.prototype.toScreen = function(x, y){
  var f = this.frame; return { x: f.ox + x * f.s, y: f.oy + y * f.s };
};

AlianzasScene.prototype.buildRoom = function(){
  var self = this;
  this.orbitLayer = null;
  var f = this.frame = this.roomFrame(), s = f.s;
  this.cameras.main.setBackgroundColor('#0a0f1f');
  this.root.add(this.add.image(f.ox, f.oy, 'dc-room').setOrigin(0).setScale(s));

  // A pulsing red glow on the corrupted Nodo, so the goal reads from afar.
  var n = this.toScreen(NODE.x, NODE.y);
  var glow = this.add.circle(n.x, n.y, 70 * s, 0xff3b3b, 0.18);
  this.root.add(glow);
  this.tweens.add({ targets: glow, alpha: { from: 0.1, to: 0.3 }, scale: { from: 1, to: 1.2 }, duration: 900, yoyo: true, repeat: -1 });

  // Platforms
  this.physicsGroup = this.physics.add.staticGroup();
  var addPlat = function(l, t, r, solid){
    var a = self.toScreen(l, t), b = self.toScreen(r, t);
    var z = self.add.zone((a.x + b.x) / 2, a.y + 6 * s, b.x - a.x, 12 * s);
    self.physics.add.existing(z, true);
    if(!solid){ z.body.checkCollision.down = false; z.body.checkCollision.left = false; z.body.checkCollision.right = false; }
    self.physicsGroup.add(z);
  };
  addPlat(0, GROUND_Y, BG_W, true);
  PLATFORMS.forEach(function(p){ addPlat(p[0], p[1], p[2], false); });

  // The Sintonizador: an invisible physics box, with the pose drawn on top.
  var start = this.playerPos || { x: 120, y: GROUND_Y - 4 };
  var sp = this.toScreen(start.x, start.y);
  var bodyW = 46 * s, bodyH = CHAR_H * s * 0.9;
  this.player = this.add.zone(sp.x, sp.y - bodyH / 2, bodyW, bodyH);
  this.physics.add.existing(this.player);
  this.player.body.setGravityY(1500 * s).setMaxVelocityY(1400 * s).setCollideWorldBounds(true);
  this.physics.world.setBounds(f.ox, 0, BG_W * s, this.H);
  this.collider = this.physics.add.collider(this.player, this.physicsGroup);
  this.look = this.add.image(sp.x, sp.y, 'sint-idle').setOrigin(0.5, 1);
  this.look.setScale(CHAR_H * s / this.look.height);
  this.root.add(this.look);
  this.facing = this.facing || 1;

  // Células Lógicas still to pick up
  this.collected = this.collected || {};
  this.cellSprites = [];
  CELLS.forEach(function(c, i){
    if(self.collected[i]) return;
    var p = self.toScreen(c[0], c[1]);
    var cell = self.add.container(p.x, p.y);
    // Dark crystals with a bright cyan rim: they stand out from the gold
    // orbs painted on the background art.
    var halo = self.add.circle(0, 0, 27 * s, 0x7ff6ff, 0.3);
    var pts = [{x:0, y:-23*s}, {x:14*s, y:-4*s}, {x:0, y:23*s}, {x:-14*s, y:-4*s}];
    var gem = self.add.graphics();
    gem.fillStyle(0x120c26, 1);
    gem.fillPoints(pts, true);
    gem.fillStyle(0xb98cff, 0.85);
    gem.fillPoints([{x:0, y:-23*s}, {x:14*s, y:-4*s}, {x:0, y:0}], true);
    gem.lineStyle(2.6, 0x9ff7ff, 1);
    gem.strokePoints(pts, true);
    gem.fillStyle(0xffffff, 0.9);
    gem.fillCircle(-4 * s, -8 * s, 2.4 * s + 0.6);
    cell.add([halo, gem]);
    self.root.add(cell);
    self.tweens.add({ targets: cell, y: p.y - 6 * s, duration: 1100 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    self.tweens.add({ targets: halo, alpha: { from: 0.15, to: 0.4 }, duration: 700, yoyo: true, repeat: -1 });
    self.cellSprites.push({ i: i, obj: cell, x: p.x, y: p.y });
  });

  // The Nodo stays sealed behind a force field until every Célula is
  // picked up; a lock and a counter float over it.
  this.seal = null;
  if(!this.allCells()){
    this.seal = this.add.container(n.x, n.y);
    var field = this.add.ellipse(0, 10 * s, 190 * s, 230 * s, 0xe2604f, 0.12).setStrokeStyle(2.5, 0xff7a6b, 0.8);
    var lock = this.add.text(0, -125 * s, '🔒', { fontSize: Math.round(26 * s + 6) + 'px' }).setOrigin(0.5);
    this.sealCount = this.add.text(0, -125 * s + 22 * s + 8, '', {
      fontFamily: 'Space Mono, monospace', fontSize: Math.round(12 * s + 5) + 'px', fontStyle: '700', color: '#ffd2cc',
      backgroundColor: 'rgba(11,18,38,.85)', padding: { x: 6, y: 2 }
    }).setOrigin(0.5);
    this.seal.add([field, lock, this.sealCount]);
    this.root.add(this.seal);
    this.tweens.add({ targets: field, alpha: { from: 0.55, to: 1 }, scaleX: { from: 1, to: 1.04 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.updateSeal();
  }

  // Prompt over the Nodo when the player is close
  this.prompt = this.add.container(n.x, n.y - 165 * s).setVisible(false);
  this.promptBg = this.add.rectangle(0, 0, 150, 30, 0x0b1226, 0.92).setStrokeStyle(1.5, 0x6cc4ff, 1);
  this.promptText = this.add.text(0, 0, '', { fontFamily: 'Manrope, sans-serif', fontSize: '13px', fontStyle: '700', color: '#e2f4ff' }).setOrigin(0.5);
  this.prompt.add([this.promptBg, this.promptText]);
  this.root.add(this.prompt);
  this.tweens.add({ targets: this.prompt, y: this.prompt.y - 5, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
};

AlianzasScene.prototype.update = function(time){
  if(this.mode !== 'room' || !this.player || this.frozen) return;
  var s = this.frame.s, b = this.player.body, k = this.keys, t = alianzasCtl.input;
  var left = k.LEFT.isDown || k.A.isDown || t.left;
  var right = k.RIGHT.isDown || k.D.isDown || t.right;
  var jump = Phaser.Input.Keyboard.JustDown(k.UP) || Phaser.Input.Keyboard.JustDown(k.W) || t.jump;
  var act = Phaser.Input.Keyboard.JustDown(k.E) || t.act;
  var space = Phaser.Input.Keyboard.JustDown(k.SPACE);
  t.jump = false; t.act = false;

  var n = this.toScreen(NODE.x, NODE.y);
  var near = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.x, n.y) < 170 * s;
  this.prompt.setVisible(near);
  if(near) this.setPrompt(this.allCells() ? 'E / Espacio · Activar el Nodo' : '🔒 Recoge todas las Células (' + this.cellCount() + '/' + CELLS.length + ')', this.allCells());
  if(near && (act || space) && this.allCells()){ this.activateNode(); return; }
  if(space) jump = true;

  var speed = 300 * s;
  b.setVelocityX(left ? -speed : (right ? speed : 0));
  if(left) this.facing = -1; else if(right) this.facing = 1;
  // A jump pressed just before landing, or just after stepping off a rock,
  // still counts (jump buffer and "coyote time"), so it doesn't feel lost.
  var onGround = b.blocked.down || b.touching.down;
  if(onGround) this.lastGround = time;
  if(jump) this.jumpAt = time;
  if(time - (this.jumpAt || -1e9) < 140 && time - (this.lastGround || -1e9) < 110 && b.velocity.y >= 0){
    b.setVelocityY(-Math.sqrt(2 * 1500 * s * 205 * s));
    this.jumpAt = -1e9; this.lastGround = -1e9;
    onGround = false;
  }

  // Pose: idle when still, the running pose (bobbing) when moving, tilted in the air.
  var moving = left || right;
  var look = this.look;
  look.setTexture(!onGround || moving ? 'sint-run' : 'sint-idle');
  look.setScale(CHAR_H * s / look.height);
  look.setFlipX(look.texture.key === 'sint-run' && this.facing < 0);
  var bob = onGround && moving ? Math.abs(Math.sin(time / 90)) * 5 * s : 0;
  look.setPosition(this.player.x, this.player.y + this.player.height / 2 - bob);
  look.setAngle(!onGround ? -6 * this.facing : (moving ? Math.sin(time / 90) * 2 : 0));

  // Pick up Células
  var self = this;
  this.cellSprites = this.cellSprites.filter(function(c){
    if(Phaser.Math.Distance.Between(self.player.x, self.player.y, c.x, c.y) > 55 * s) return true;
    self.collected[c.i] = true;
    self.tweens.killTweensOf(c.obj);
    self.tweens.add({ targets: c.obj, y: c.y - 40 * s, alpha: 0, scale: 1.6, duration: 450, onComplete: function(){ c.obj.destroy(); } });
    self.sparks(c.x, c.y, [0xffd77a, 0xffffff], 10, 50 * s);
    self.updateSeal();
    if(alianzasCtl.onCell) alianzasCtl.onCell(self.cellCount(), CELLS.length);
    return false;
  });

  // Remember where the player is (in art coordinates) for a resize.
  var f = this.frame;
  this.playerPos = { x: (this.player.x - f.ox) / s, y: (this.player.y + this.player.height / 2 - f.oy) / s - 2 };
};

AlianzasScene.prototype.cellCount = function(){ return Object.keys(this.collected || {}).length; };
AlianzasScene.prototype.allCells = function(){ return this.cellCount() >= CELLS.length; };

AlianzasScene.prototype.setPrompt = function(text, ready){
  if(this.promptText.text !== text) this.promptText.setText(text);
  this.promptBg.setSize(this.promptText.width + 26, 30);
  this.promptBg.setStrokeStyle(1.5, ready ? 0x6cc4ff : 0xff7a6b, 1);
};

// Updates the counter on the seal, and breaks it once every Célula is in.
AlianzasScene.prototype.updateSeal = function(){
  if(!this.seal) return;
  if(!this.allCells()){ this.sealCount.setText(this.cellCount() + '/' + CELLS.length + ' ◆'); return; }
  var seal = this.seal, s = this.frame.s;
  this.seal = null;
  this.tweens.killTweensOf(seal.list);
  this.tweens.add({ targets: seal, scale: 1.35, alpha: 0, duration: 650, ease: 'Cubic.easeOut', onComplete: function(){ seal.destroy(); } });
  this.sparks(seal.x, seal.y, [0x7ff6ff, 0xb98cff, 0xffffff], 28, 140 * s);
};

// The Hack: the Sintonizador raises the Nanocatalizador, rings of light open
// from the hand, and the view moves to the Nodo.
AlianzasScene.prototype.activateNode = function(){
  var self = this, s = this.frame.s;
  this.frozen = true;
  this.prompt.setVisible(false);
  this.player.body.setVelocity(0, 0);
  this.look.setTexture('sint-interact').setAngle(0);
  this.look.setScale(CHAR_H * s / this.look.height);
  this.look.setFlipX(this.facing > 0); // the interact pose faces left on the sheet
  var hx = this.look.x + this.facing * this.look.displayWidth * 0.42, hy = this.look.y - this.look.displayHeight * 0.68;
  for(var i = 0; i < 3; i++){
    var ring = this.add.circle(hx, hy, 10 * s, 0, 0).setStrokeStyle(3, i % 2 ? 0xe8b84b : 0x6cc4ff, 1);
    this.root.add(ring);
    this.tweens.add({ targets: ring, scale: 6, alpha: 0, duration: 900, delay: i * 220, ease: 'Cubic.easeOut' });
  }
  this.sparks(hx, hy, [0x6cc4ff, 0xe8b84b], 22, 90 * s);
  this.time.delayedCall(1000, function(){
    self.cameras.main.fadeOut(350, 5, 8, 20);
    self.cameras.main.once('camerafadeoutcomplete', function(){
      if(alianzasCtl.onInteract) alianzasCtl.onInteract();
    });
  });
};

/* ---------- node: the close-up while the phases are played ---------- */

AlianzasScene.prototype.showNode = function(){
  this.mode = 'node';
  this.frozen = true;
  // The panel's buttons need Space and the arrows back.
  this.input.keyboard.clearCaptures();
  this.input.keyboard.enabled = false;
  this.build();
  this.cameras.main.fadeIn(450, 5, 8, 20);
};

AlianzasScene.prototype.buildNode = function(){
  this.orbitLayer = null;
  var W = this.W, H = this.H;
  var s = Math.max(W / BG_W, H / BG_H); // cover: the close-up fills the stage
  var ox = (W - BG_W * s) / 2, oy = (H - BG_H * s) / 2;
  this.nodeFrame = { s: s, ox: ox, oy: oy };
  this.root.add(this.add.image(ox, oy, 'dc-node-bad').setOrigin(0).setScale(s));
  this.good = this.add.image(ox, oy, 'dc-node-good').setOrigin(0).setScale(s).setAlpha(this.restored);
  this.root.add(this.good);

  var c = this.nodeCenter();
  // The three orbits of the Mapa de Actores, faint until they hold actors.
  this.orbitLayer = this.add.container(c.x, c.y);
  this.root.add(this.orbitLayer);
  var colors = [0x57d9f0, 0x6fe39a, 0xe86bd0], self = this;
  this.orbitR = [130, 185, 240].map(function(r){ return r * s; });
  this.orbitR.forEach(function(r, i){
    var e = self.add.ellipse(0, 0, r * 2, r * 0.9, 0, 0).setStrokeStyle(2, colors[i], self.marks.satellites.length ? 0.55 : 0.18);
    self.orbitLayer.add(e);
  });
  this.marks.satellites.forEach(function(sat, i){ self.drawSatellite(sat, i); });
  for(var t = 0; t < this.marks.threads; t++) this.drawThread(t);
};

AlianzasScene.prototype.nodeCenter = function(){
  var f = this.nodeFrame; return { x: f.ox + NODE_CLOSE.x * f.s, y: f.oy + NODE_CLOSE.y * f.s };
};

// 0 → corrupted art, 1 → purified.
AlianzasScene.prototype.setRestored = function(v){
  this.restored = v;
  if(this.good) this.tweens.add({ targets: this.good, alpha: v, duration: 1200, ease: 'Sine.easeInOut' });
};

// An actor placed on its orbit: a small glowing moon that keeps circling.
// The marks are always recorded, and drawn only while the close-up is on
// screen; buildNode() draws whatever was recorded before it.
AlianzasScene.prototype.nodeShown = function(){ return this.mode === 'node' && !!this.orbitLayer; };

AlianzasScene.prototype.addSatellite = function(orbitIndex, color){
  this.marks.satellites.push({ orbit: orbitIndex, color: color, phase: Math.random() * Math.PI * 2 });
  if(!this.nodeShown()) return;
  this.drawSatellite(this.marks.satellites[this.marks.satellites.length - 1], this.marks.satellites.length - 1);
  this.orbitLayer.list.forEach(function(o){ if(o.type === 'Ellipse') o.setStrokeStyle(2, o.strokeColor, 0.55); });
};
AlianzasScene.prototype.drawSatellite = function(sat, i){
  var r = this.orbitR[sat.orbit], col = Phaser.Display.Color.HexStringToColor(sat.color).color;
  var dot = this.add.circle(0, 0, 6 * this.nodeFrame.s + 2, col, 1);
  var halo = this.add.circle(0, 0, 13 * this.nodeFrame.s + 3, col, 0.25);
  this.orbitLayer.add([halo, dot]);
  var state = { a: sat.phase };
  this.tweens.add({
    targets: state, a: sat.phase + Math.PI * 2, duration: 9000 + sat.orbit * 3000 + i * 300, repeat: -1,
    onUpdate: function(){ var x = Math.cos(state.a) * r, y = Math.sin(state.a) * r * 0.45; dot.setPosition(x, y); halo.setPosition(x, y); }
  });
};

// A thread of light from the Nodo out to a contact.
AlianzasScene.prototype.addThread = function(){ var i = this.marks.threads++; if(this.nodeShown()) this.drawThread(i); };
AlianzasScene.prototype.drawThread = function(i){
  var c = this.nodeCenter(), s = this.nodeFrame.s;
  var a = -Math.PI * 0.95 + i * (Math.PI * 0.9 / 3) + 0.15, len = 330 * s;
  var ex = c.x + Math.cos(a) * len, ey = c.y + Math.sin(a) * len * 0.6 + 120 * s;
  var g = this.add.graphics();
  g.lineStyle(3, 0xe8b84b, 0.85); g.lineBetween(c.x, c.y, ex, ey);
  g.lineStyle(8, 0xe8b84b, 0.15); g.lineBetween(c.x, c.y, ex, ey);
  g.fillStyle(0xffe3a3, 1); g.fillCircle(ex, ey, 5 * s + 2);
  this.root.add(g);
  this.tweens.add({ targets: g, alpha: { from: 0.65, to: 1 }, duration: 1300 + i * 200, yoyo: true, repeat: -1 });
};

AlianzasScene.prototype.burst = function(){
  if(!this.nodeShown()) return;
  var c = this.nodeCenter(), s = this.nodeFrame.s;
  var ring = this.add.circle(c.x, c.y, 40 * s, 0, 0).setStrokeStyle(4, 0x6fe39a, 1);
  this.tweens.add({ targets: ring, scale: 5, alpha: 0, duration: 1100, ease: 'Cubic.easeOut', onComplete: function(){ ring.destroy(); } });
  this.sparks(c.x, c.y, [0xe8b84b, 0x6cc4ff, 0x6fe39a], 26, 160 * s);
};

AlianzasScene.prototype.sparks = function(x, y, colors, n, dist){
  for(var i = 0; i < n; i++){
    var a = i / n * Math.PI * 2, d = dist * (0.6 + Math.random() * 0.6);
    var sp = this.add.circle(x, y, 2 + Math.random() * 2.5, colors[i % colors.length], 1);
    this.tweens.add({
      targets: sp, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0,
      duration: 700 + Math.random() * 500, ease: 'Cubic.easeOut',
      onComplete: (function(o){ return function(){ o.destroy(); }; })(sp)
    });
  }
};
