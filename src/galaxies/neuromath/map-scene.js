import Phaser from 'phaser';
import { TOPICS, LEVELS, NODES } from './data.js';
import { isDone, isUnlocked, topicFullyDone, allDone } from './progress.js';
import { isPlayable, attemptOpenNode } from './planets.js';
import { showTooltip, hideTooltip } from '../../shared/tooltip.js';

/* ---- Rocket cursors ---- */
// The player's cursor over the map is a little rocket instead of the
// default arrow — idle while floating, tilted while flying (panning), and
// bigger while hovering a planet you can land on.
function rocketCursor(rotateDeg, size){
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '">' +
    '<text x="50%" y="58%" font-size="' + Math.round(size*0.82) + '" text-anchor="middle" dominant-baseline="middle" ' +
    'transform="rotate(' + rotateDeg + ' ' + (size/2) + ' ' + (size/2) + ')">🚀</text></svg>';
  var hot = Math.round(size/2);
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '") ' + hot + ' ' + hot + ', auto';
}
var CURSOR_IDLE = rocketCursor(0, 30);
var CURSOR_FLYING = rocketCursor(-16, 32);
var CURSOR_HOVER = rocketCursor(0, 38);

/* ---- Map scene: the winding path of planets ---- */
function ColorNum(hex){ return Phaser.Display.Color.HexStringToColor(hex).color; }

export function MapScene(){ Phaser.Scene.call(this, { key: 'MapScene' }); }
MapScene.prototype = Object.create(Phaser.Scene.prototype);
MapScene.prototype.constructor = MapScene;

MapScene.prototype.create = function(){
  this.W = this.scale.width;
  this.H = this.scale.height;
  this.centerX = this.W / 2;
  this.amplitude = Math.min(150, this.W * 0.30);

  this.computeLayout();
  this.drawBackground();
  this.drawPath();
  this.nodeLayer = this.add.container(0,0);
  this.drawTopicBanners();
  this.drawNodes();
  this.drawRewards();
  this.setupControls();

  this.cameras.main.setBounds(0, 0, this.W, this.worldHeight);
  this.scrollToFrontier(true);

  var self = this;
  this.scale.on('resize', function(){ self.scene.restart(); });
};

MapScene.prototype.computeLayout = function(){
  var y = 170;
  this.bannerYs = [];
  this.positions = [];
  var self = this;
  TOPICS.forEach(function(topic, ti){
    y += 78;
    self.bannerYs.push(y - 20);
    LEVELS.forEach(function(level, li){
      self.positions.push(y);
      y += 172;
    });
    y += 46; // room for reward gem
  });
  this.worldHeight = y + 220;

  var n = NODES.length;
  this.nodeX = [];
  for(var i=0;i<n;i++){
    var t = i / (n-1);
    this.nodeX.push(this.centerX + this.amplitude * Math.sin(t * Math.PI * 3.3 + 0.4));
  }
};

MapScene.prototype.drawBackground = function(){
  var g = this.add.graphics();
  g.fillGradientStyle(ColorNum('#0d1530'), ColorNum('#0d1530'), ColorNum('#060a18'), ColorNum('#060a18'), 1);
  g.fillRect(0, 0, this.W, this.worldHeight);

  // nebula clouds — a handful of soft overlapping blobs for depth
  var nebula = this.add.graphics();
  var nebulaColors = [ColorNum('#3a2e6b'), ColorNum('#1f4a5c'), ColorNum('#5c2e52')];
  for(var nb=0; nb<7; nb++){
    var nx = Math.random()*this.W, ny = Math.random()*this.worldHeight;
    var nr = 90 + Math.random()*160;
    nebula.fillStyle(nebulaColors[nb % nebulaColors.length], 0.05 + Math.random()*0.05);
    nebula.fillCircle(nx, ny, nr);
  }

  // stars — a dense field, plus a sparse handful of bigger "bright" stars
  var stars = this.add.graphics();
  for(var i=0;i<520;i++){
    var sx = Math.random()*this.W, sy = Math.random()*this.worldHeight;
    var r = Math.random()*1.3 + 0.25;
    stars.fillStyle(0xffffff, Math.random()*0.45 + 0.12);
    stars.fillCircle(sx, sy, r);
  }
  var brightStars = this.add.graphics();
  for(var bs=0; bs<26; bs++){
    var bx = Math.random()*this.W, by = Math.random()*this.worldHeight;
    brightStars.fillStyle(0xffffff, 0.85);
    brightStars.fillCircle(bx, by, 1.6);
    brightStars.fillStyle(0xffffff, 0.18);
    brightStars.fillCircle(bx, by, 4);
  }
  this.tweens.add({ targets: stars, alpha: {from:0.5, to:1}, duration: 2600, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
  this.tweens.add({ targets: brightStars, alpha: {from:0.6, to:1}, duration: 1900, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });

  // distant ridges (decorative silhouettes)
  var ridge = this.add.graphics();
  var ridgeColors = [0x141d3b, 0x1a2450];
  for(var r2=0;r2<2;r2++){
    ridge.fillStyle(ridgeColors[r2], 0.55);
    var baseY = this.worldHeight * (0.18 + r2*0.28);
    ridge.beginPath();
    ridge.moveTo(0, baseY + 60);
    var step = this.W/7;
    for(var xx=0; xx<=this.W+step; xx+=step){
      ridge.lineTo(xx, baseY + Math.sin(xx*0.01 + r2)*34 - r2*10);
    }
    ridge.lineTo(this.W, baseY+140);
    ridge.lineTo(0, baseY+140);
    ridge.closePath();
    ridge.fillPath();
  }
};

MapScene.prototype.drawPath = function(){
  var pts = [];
  pts.push(new Phaser.Math.Vector2(this.centerX, 40));
  for(var i=0;i<NODES.length;i++){
    pts.push(new Phaser.Math.Vector2(this.nodeX[i], this.positions[i]));
  }
  pts.push(new Phaser.Math.Vector2(this.centerX, this.worldHeight - 60));

  var curve = new Phaser.Curves.Spline(pts);
  var smooth = curve.getPoints(pts.length * 22);

  var glow = this.add.graphics();
  glow.lineStyle(16, ColorNum('#1c274d'), 0.5);
  glow.strokePoints(smooth, false);

  var base = this.add.graphics();
  base.lineStyle(7, ColorNum('#26305a'), 1);
  base.strokePoints(smooth, false);

  var dots = this.add.graphics();
  dots.fillStyle(ColorNum('#e8b84b'), 0.85);
  for(var d=0; d<smooth.length; d+=5){
    dots.fillCircle(smooth[d].x, smooth[d].y, 1.6);
  }
  this.tweens.add({ targets: dots, alpha: {from:0.55, to:1}, duration: 1700, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
};

MapScene.prototype.drawTopicBanners = function(){
  var self = this;
  TOPICS.forEach(function(topic, ti){
    var by = self.bannerYs[ti];
    var accent = ColorNum(topic.color);

    var glowC = self.add.circle(self.centerX, by, 30, accent, 0.12);
    var ring = self.add.circle(self.centerX, by, 22, ColorNum('#0f1530'), 1);
    ring.setStrokeStyle(2, accent, 0.9);
    var glyph = self.add.text(self.centerX, by, topic.glyph, {
      fontFamily:'Cinzel, serif', fontSize: '18px', color: topic.color, fontStyle:'600'
    }).setOrigin(0.5);

    var label = self.add.text(self.centerX, by + 32, topic.name, {
      fontFamily:'Cinzel, serif', fontSize:'13px', color:'#ecebf7', fontStyle:'600'
    }).setOrigin(0.5, 0);
    label.setShadow(0,2,'#05070f',4,false,true);

    self.nodeLayer.add([glowC, ring, glyph, label]);
  });
};

MapScene.prototype.drawNodes = function(){
  var self = this;
  NODES.forEach(function(node, idx){
    var x = self.nodeX[idx], y = self.positions[idx];
    var unlocked = isPlayable(idx) && isUnlocked(idx);
    var done = isDone(node.id);
    var accent = ColorNum(node.topic.color);
    var radius = 27;

    var container = self.add.container(x, y);
    var glowBg = self.add.circle(0,0, radius+9, accent, done ? 0.22 : (unlocked ? 0.16 : 0));

    // A flattened ring behind the sphere marks the "boss" planet of each
    // topic (Avanzado) — its ends poke out past the sphere's silhouette.
    var ring = null;
    if(node.level.id === 'avanzado'){
      ring = self.add.ellipse(0, 0, radius*2.7, radius*0.95, 0, 0);
      ring.setStrokeStyle(2, accent, unlocked ? 0.8 : 0.3);
      ring.setAngle(-18);
    }

    var bg = self.add.circle(0,0, radius, done ? accent : 0x141d3b, 1);
    bg.setStrokeStyle(2.4, unlocked ? accent : 0x35406e, 1);

    // Cheap pseudo-3D shading so the disc reads as a lit sphere (a planet)
    // rather than a flat badge: a dark crescent low-right, a soft highlight
    // upper-left, both kept well inside bg's radius so nothing overhangs it.
    var shade = self.add.circle(radius*0.30, radius*0.34, radius*0.78, 0x05070a, 0.30);
    var shine = self.add.circle(-radius*0.32, -radius*0.36, radius*0.38, 0xffffff, 0.20);

    var glyph = self.add.text(0,-2, node.topic.glyph, {
      fontFamily:'Cinzel, serif', fontSize:'17px', fontStyle:'600',
      color: done ? '#0b1226' : (unlocked ? node.topic.color : '#4b5588')
    }).setOrigin(0.5);

    var levelTag = self.add.text(0, radius+13, node.level.label.slice(0,1), {
      fontFamily:'Space Mono, monospace', fontSize:'10px', color: unlocked ? '#9aa3c7' : '#4b5588'
    }).setOrigin(0.5);

    var layers = [glowBg];
    if(ring) layers.push(ring);
    layers.push(bg, shade, shine, glyph, levelTag);
    container.add(layers);

    if(done){
      var check = self.add.text(radius*0.62, -radius*0.62, '✓', {
        fontFamily:'Manrope, sans-serif', fontSize:'13px', fontStyle:'800', color:'#0b1226'
      }).setOrigin(0.5);
      var checkBg = self.add.circle(radius*0.62, -radius*0.62, 9, ColorNum('#4fbf8b'), 1);
      container.add([checkBg, check]);
    } else if(!unlocked){
      var lock = self.add.text(radius*0.62, -radius*0.62, '🔒', { fontSize:'12px' }).setOrigin(0.5);
      var lockBg = self.add.circle(radius*0.62, -radius*0.62, 9, ColorNum('#1c274d'), 1);
      lockBg.setStrokeStyle(1.5, 0x35406e, 1);
      container.add([lockBg, lock]);
    }

    if(unlocked && !done){
      self.tweens.add({ targets: glowBg, alpha: {from:0.12, to:0.32}, scale:{from:1, to:1.12}, duration:900, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
    }

    // The circle itself is the interactive object (its own default hit area
    // exactly matches its drawn bounds) rather than a custom hit-shape on the
    // parent container — this is what makes the whole disc clickable, not
    // just a thin ring near the edge.
    bg.setInteractive();
    bg.input.cursor = CURSOR_HOVER;
    bg.on('pointerup', function(pointer){
      if(pointer.getDistance() > 8) return;
      attemptOpenNode(idx);
    });
    bg.on('pointerover', function(pointer){
      var rect = self.game.canvas.getBoundingClientRect();
      var sx = x - self.cameras.main.scrollX + rect.left;
      var sy = y - self.cameras.main.scrollY + rect.top;
      var status = done ? 'Dominado' : (unlocked ? 'Disponible' : (isPlayable(idx) ? 'Bloqueado' : 'Próximamente'));
      showTooltip(sx, sy, '<b>' + node.topic.name + '</b> · ' + node.level.label + '<br>' + status + (isPlayable(idx) ? ' · 🎮 Minijuego' : ''));
      bg.setStrokeStyle(3, accent, 1);
    });
    bg.on('pointerout', function(){ hideTooltip(); bg.setStrokeStyle(2.4, unlocked ? accent : 0x35406e, 1); });

    self.nodeLayer.add(container);
  });
};

MapScene.prototype.drawRewards = function(){
  var self = this;
  TOPICS.forEach(function(topic, ti){
    var lastIdx = ti*3 + 2;
    var x = self.nodeX[lastIdx], y = self.positions[lastIdx] + 56;
    var done = topicFullyDone(topic.id);
    var accent = ColorNum(topic.color);

    var haloR = 20;
    var halo = self.add.circle(x, y, haloR, accent, done ? 0.28 : 0.06);
    var gem = self.add.text(x, y, '◆', { fontFamily:'Manrope, sans-serif', fontSize:'20px', color: done ? topic.color : '#3a447c' }).setOrigin(0.5);
    if(done){
      self.tweens.add({ targets: halo, alpha:{from:0.2, to:0.45}, scale:{from:1, to:1.25}, duration:1300, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
    }
    self.nodeLayer.add([halo, gem]);
  });

  var crownY = this.worldHeight - 110;
  var crownDone = allDone();
  var crownHalo = this.add.circle(this.centerX, crownY, 34, ColorNum('#e8b84b'), crownDone ? 0.3 : 0.05);
  var crown = this.add.text(this.centerX, crownY, '♛', { fontFamily:'Cinzel, serif', fontSize:'30px', color: crownDone ? '#e8b84b' : '#3a447c' }).setOrigin(0.5);
  var crownLabel = this.add.text(this.centerX, crownY+34, crownDone ? 'Atlas Completado' : 'Corona Arcana', {
    fontFamily:'Space Mono, monospace', fontSize:'10.5px', color: crownDone ? '#e8b84b' : '#6b74a0'
  }).setOrigin(0.5);
  if(crownDone){
    this.tweens.add({ targets: crownHalo, alpha:{from:0.25,to:0.5}, scale:{from:1,to:1.3}, duration:1500, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
  }
  this.nodeLayer.add([crownHalo, crown, crownLabel]);
};

MapScene.prototype.setupControls = function(){
  var self = this;
  this.input.setDefaultCursor(CURSOR_IDLE);
  this.input.on('pointermove', function(pointer){
    if(pointer.isDown){
      self.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y);
      hideTooltip();
    }
  });
  this.input.on('pointerdown', function(pointer, currentlyOver){
    if(!currentlyOver || currentlyOver.length === 0) self.input.setDefaultCursor(CURSOR_FLYING);
  });
  this.input.on('pointerup', function(){
    self.input.setDefaultCursor(CURSOR_IDLE);
  });
  this.input.on('wheel', function(pointer, over, dx, dy){
    self.cameras.main.scrollY += dy * 0.6;
    hideTooltip();
  });
};

MapScene.prototype.scrollToFrontier = function(instant){
  var idx = NODES.findIndex(function(n){ return !isDone(n.id); });
  if(idx === -1) idx = NODES.length - 1;
  var targetY = Phaser.Math.Clamp(this.positions[idx] - this.H/2, 0, Math.max(0, this.worldHeight - this.H));
  if(instant){ this.cameras.main.scrollY = targetY; }
  else { this.tweens.add({ targets: this.cameras.main, scrollY: targetY, duration: 650, ease:'Cubic.easeInOut' }); }
};

MapScene.prototype.rebuild = function(){
  this.nodeLayer.destroy(true);
  this.nodeLayer = this.add.container(0,0);
  this.drawTopicBanners();
  this.drawNodes();
  this.drawRewards();
};
