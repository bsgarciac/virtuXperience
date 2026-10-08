import Phaser from 'phaser';
import { galaxy, islandsOf } from './world.js';
import { doneCount, planetFullyDone, galaxyDone } from './progress.js';
import { playableCount } from './islands.js';
import { mapRef } from './map-ref.js';
import { showTooltip, hideTooltip } from '../shared/tooltip.js';
import { ColorNum, blendColor, CURSOR_HOVER, drawStarfield, restartOnResize, setupRocketCursor } from './scene-common.js';

/* ---- System scene: a galaxy's sun and its planets ---- */
// The current galaxy seen from above: its hack (the Matriz Lógica, the
// Nanocatalizador…) burns at the centre as a sun, and each subarea is a
// planet on its own orbit. The player can
// land on any planet, in any order. The Neblina Gris drains a planet's
// colour; it comes back island by island as the player restores them.

var FOG = '#5d6380';
// Where each planet starts on its orbit (radians) and how long a lap takes.
var ORBITS = [
  { start: -2.2, period: 90000 },
  { start: 0.35, period: 120000 },
  { start: 2.6,  period: 155000 },
  { start: -0.9, period: 195000 }
];

export function SystemScene(){ Phaser.Scene.call(this, { key: 'SystemScene' }); }
SystemScene.prototype = Object.create(Phaser.Scene.prototype);
SystemScene.prototype.constructor = SystemScene;

SystemScene.prototype.create = function(){
  mapRef.scene = this;
  this.galaxy = galaxy();
  this.planetDefs = this.galaxy.planets;
  this.W = this.scale.width;
  this.H = this.scale.height;
  this.cx = this.W / 2;
  this.cy = this.H / 2 + 18;
  this.paused = false;

  drawStarfield(this, this.W, this.H);
  this.computeOrbits();
  this.drawOrbits();
  this.drawSun();
  this.drawPlanets();
  this.drawTitle();
  setupRocketCursor(this);
  restartOnResize(this);
};

SystemScene.prototype.computeOrbits = function(){
  // Keep the orbits' proportions on wide screens instead of stretching
  // them edge to edge.
  var maxRy = this.H / 2 - 92;
  var maxRx = Math.min(this.W / 2 - 46, maxRy * 2.2);
  var ry = Math.min(maxRy, maxRx * 0.62);
  this.sunR = Phaser.Math.Clamp(Math.min(maxRx, ry) * 0.22, 26, 60);
  this.planetR = Phaser.Math.Clamp(Math.min(this.W, this.H) * 0.065, 22, 40);
  // Spread the orbits between just outside the sun and the edge of the view.
  var inner = (this.sunR + this.planetR + 14) / Math.max(1, Math.min(maxRx, ry));
  inner = Phaser.Math.Clamp(inner, 0.3, 0.55);
  var n = this.planetDefs.length;
  this.orbits = this.planetDefs.map(function(p, i){
    var f = n === 1 ? (inner + 1) / 2 : inner + (1 - inner) * i / (n - 1);
    var o = ORBITS[i % ORBITS.length];
    return { rx: maxRx * f, ry: ry * f, angle: o.start, speed: Math.PI * 2 / o.period };
  });
};

SystemScene.prototype.drawOrbits = function(){
  var g = this.add.graphics();
  var self = this;
  this.orbits.forEach(function(o, i){
    g.lineStyle(1.5, ColorNum(self.planetDefs[i].color), 0.22);
    g.strokeEllipse(self.cx, self.cy, o.rx * 2, o.ry * 2);
  });
};

SystemScene.prototype.drawSun = function(){
  var r = this.sunR, cx = this.cx, cy = this.cy;
  var done = galaxyDone(this.galaxy);
  var halo2 = this.add.circle(cx, cy, r * 2.4, ColorNum('#e8b84b'), 0.05);
  var halo1 = this.add.circle(cx, cy, r * 1.6, ColorNum('#f2a34d'), 0.12);
  var body = this.add.circle(cx, cy, r, ColorNum('#f2b84b'), 1);
  var inner = this.add.circle(cx - r * 0.18, cy - r * 0.2, r * 0.62, ColorNum('#ffe3a3'), 0.75);
  var core = this.add.circle(cx - r * 0.26, cy - r * 0.28, r * 0.26, 0xffffff, 0.7);
  var glyph = this.add.text(cx, cy, this.galaxy.sun.glyph, { fontFamily:'Cinzel, serif', fontSize: Math.round(r * 0.8) + 'px', fontStyle:'700', color:'#7a4a10' }).setOrigin(0.5).setAlpha(0.75);
  [halo2, halo1, body, inner, core, glyph].forEach(function(o){ o.setDepth(50); });
  this.tweens.add({ targets: halo1, scale: { from: 1, to: 1.15 }, alpha: { from: 0.1, to: 0.2 }, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  this.tweens.add({ targets: halo2, scale: { from: 1, to: 1.1 }, duration: 3400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

  var label = this.add.text(cx, cy + r * 1.25 + 10, done ? '♛ SECTOR RESTAURADO' : this.galaxy.sun.label, {
    fontFamily:'Space Mono, monospace', fontSize:'10px', color: done ? '#e8b84b' : '#c9a35a'
  }).setOrigin(0.5).setDepth(50).setAlpha(0.85);
  label.setLetterSpacing(2);
};

SystemScene.prototype.drawTitle = function(){
  var title = this.add.text(this.cx, 26, 'Sistema ' + this.galaxy.name, {
    fontFamily:'Cinzel, serif', fontSize:'20px', fontStyle:'600', color:'#ecebf7'
  }).setOrigin(0.5, 0).setDepth(200);
  title.setShadow(0, 2, '#05070f', 6, false, true);
  this.add.text(this.cx, 54, 'Elige un planeta: puedes explorarlos en el orden que quieras', {
    fontFamily:'Manrope, sans-serif', fontSize:'12.5px', color:'#9aa3c7',
    align:'center', wordWrap: { width: this.W - 40 }
  }).setOrigin(0.5, 0).setDepth(200);
};

SystemScene.prototype.drawPlanets = function(){
  var self = this;
  this.planets = this.planetDefs.map(function(planet, i){
    var r = self.planetR;
    var total = islandsOf(planet.id).length;
    var done = doneCount(planet.id);
    var mastered = planetFullyDone(planet.id);
    var built = playableCount(planet.id) > 0;
    // The fog drains the colour; each restored island brings part of it back.
    var tint = blendColor(FOG, planet.color, 0.4 + 0.6 * done / total);
    var accent = ColorNum(planet.color);

    var c = self.add.container(0, 0);
    var glow = self.add.circle(0, 0, r + 12, accent, mastered ? 0.3 : (built ? 0.16 : 0.06));
    var ring = null;
    if(mastered){
      ring = self.add.ellipse(0, 0, r * 2.8, r * 0.9, 0, 0);
      ring.setStrokeStyle(2.5, accent, 0.9).setAngle(-18);
    }
    var body = self.add.circle(0, 0, r, tint, 1);
    body.setStrokeStyle(2.4, accent, built ? 1 : 0.5);
    var shade = self.add.circle(r * 0.3, r * 0.34, r * 0.78, 0x05070a, 0.32);
    var shine = self.add.circle(-r * 0.32, -r * 0.36, r * 0.38, 0xffffff, 0.2);
    var glyph = self.add.text(0, -1, planet.glyph, {
      fontFamily:'Cinzel, serif', fontSize: Math.round(r * 0.72) + 'px', fontStyle:'700', color:'#0b1226'
    }).setOrigin(0.5).setAlpha(0.8);
    var name = self.add.text(0, r + 10, planet.name, {
      fontFamily:'Cinzel, serif', fontSize:'13px', fontStyle:'600', color:'#ecebf7',
      align:'center', wordWrap: { width: 130 }
    }).setOrigin(0.5, 0);
    name.setShadow(0, 2, '#05070f', 4, false, true);
    var sub = self.add.text(0, r + 12 + name.height, built ? (mastered ? '💎 ' : '') + done + '/' + total + ' islas' : 'Próximamente', {
      fontFamily:'Space Mono, monospace', fontSize:'10px', color: mastered ? planet.color : '#9aa3c7'
    }).setOrigin(0.5, 0);

    var layers = [glow];
    if(ring) layers.push(ring);
    layers.push(body, shade, shine, glyph, name, sub);
    c.add(layers);

    if(built && !mastered){
      self.tweens.add({ targets: glow, alpha: { from: 0.1, to: 0.28 }, scale: { from: 1, to: 1.12 }, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    body.setInteractive();
    body.input.cursor = CURSOR_HOVER;
    body.on('pointerover', function(){
      self.paused = true;
      body.setStrokeStyle(3.4, accent, 1);
      c.setScale(c.scale * 1.08);
      var rect = self.game.canvas.getBoundingClientRect();
      showTooltip(c.x + rect.left, c.y - r * c.scale + rect.top,
        '<b>' + planet.name + '</b><br>' + planet.tag + '<br>' + (built ? done + '/' + total + ' islas restauradas' : 'Islas próximamente'));
    });
    body.on('pointerout', function(){
      self.paused = false;
      body.setStrokeStyle(2.4, accent, built ? 1 : 0.5);
      hideTooltip();
    });
    body.on('pointerup', function(){
      hideTooltip();
      self.scene.start('IslandScene', { planetId: planet.id });
    });

    var p = { container: c, orbit: self.orbits[i] };
    self.placePlanet(p);
    return p;
  });
};

// Position on the tilted orbit; planets on the near half (lower) are drawn
// in front of the sun and a little bigger, the far half behind and smaller.
SystemScene.prototype.placePlanet = function(p){
  var o = p.orbit;
  var s = Math.sin(o.angle);
  p.container.setPosition(this.cx + Math.cos(o.angle) * o.rx, this.cy + s * o.ry);
  p.container.setDepth(50 + s * 10);
  if(!this.paused) p.container.setScale(0.86 + 0.14 * (s + 1) / 2);
};

SystemScene.prototype.update = function(time, delta){
  if(this.paused || !this.planets) return;
  var self = this;
  this.planets.forEach(function(p){
    p.orbit.angle += p.orbit.speed * delta;
    self.placePlanet(p);
  });
};

SystemScene.prototype.rebuild = function(){ this.scene.restart(); };
