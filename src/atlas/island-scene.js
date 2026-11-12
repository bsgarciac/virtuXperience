import Phaser from 'phaser';
import { galaxy, getPlanet, islandsOf } from './world.js';
import { isDone, planetFullyDone } from './progress.js';
import { isPlayable, isUnlocked, gameTitle, attemptOpenIsland } from './islands.js';
import { mapRef } from './map-ref.js';
import { showTooltip, hideTooltip } from '../shared/tooltip.js';
import { ColorNum, blendColor, CURSOR_HOVER, drawStarfield, restartOnResize, setupRocketCursor, seeded, drawCrater, isMapClick } from './scene-common.js';

/* ---- Island scene: one planet's chain of floating islands ---- */
// Landing on a planet shows its islands — one challenge each — strung along
// a winding path below the planet's horizon, with the mastery gem at the end.

var KIND_ICON = { isla: '▶', meteoro: '✦', cometa: '🎮' }; // in the tooltip, before the title

var backBtn = document.getElementById('btn-back');
backBtn.addEventListener('click', function(){
  if(mapRef.scene && mapRef.scene.goBack) mapRef.scene.goBack();
});

export function IslandScene(){ Phaser.Scene.call(this, { key: 'IslandScene' }); }
IslandScene.prototype = Object.create(Phaser.Scene.prototype);
IslandScene.prototype.constructor = IslandScene;

IslandScene.prototype.create = function(data){
  mapRef.scene = this;
  this.planet = getPlanet(data && data.planetId) || galaxy().planets[0];
  this.islands = islandsOf(this.planet.id);
  this.W = this.scale.width;
  this.H = this.scale.height;
  this.centerX = this.W / 2;
  this.amplitude = Math.min(150, this.W * 0.28);

  this.fogLayer = null; // a restart (resize) already destroyed the old one
  this.computeLayout();
  drawStarfield(this, this.W, this.worldHeight);
  this.drawPlanetHorizon();
  this.drawPath();
  this.nodeLayer = this.add.container(0,0).setDepth(1);
  this.drawIslands();
  this.drawReward();
  this.drawFog(null);
  this.setupControls();

  this.cameras.main.setBounds(0, 0, this.W, this.worldHeight);
  this.scrollToFrontier(true);

  backBtn.hidden = false;
  backBtn.textContent = '← Sistema ' + this.planet.galaxy.name;
  this.events.once('shutdown', function(){ backBtn.hidden = true; hideTooltip(); });
  restartOnResize(this, { planetId: this.planet.id });
};

IslandScene.prototype.goBack = function(){ this.scene.start('SystemScene'); };

IslandScene.prototype.computeLayout = function(){
  this.horizonY = 150;
  var y = this.horizonY + 130;
  this.positions = [];
  this.nodeX = [];
  for(var i = 0; i < this.islands.length; i++){
    this.positions.push(y);
    this.nodeX.push(this.centerX + this.amplitude * Math.sin(i * 2.4 - 0.9));
    y += 230;
  }
  this.gemY = y - 40;
  this.worldHeight = Math.max(this.H, this.gemY + 140);
};

// The planet fills the top of the view; only its lower curve shows, like
// looking up at it from the islands that float below.
IslandScene.prototype.drawPlanetHorizon = function(){
  var p = this.planet, accent = ColorNum(p.color);
  var R = Math.max(this.W * 0.9, 520);
  var cy = this.horizonY - R;
  var tint = blendColor('#5d6380', p.color, planetFullyDone(p.id) ? 1 : 0.55);
  this.add.circle(this.centerX, cy, R + 40, accent, 0.07);
  this.add.circle(this.centerX, cy, R + 16, accent, 0.1);
  var body = this.add.circle(this.centerX, cy, R, tint, 1);
  body.setStrokeStyle(3, accent, 0.9);
  this.drawHorizonTexture(cy, R);
  this.add.circle(this.centerX + R * 0.12, cy + R * 0.08, R * 0.95, 0x05070a, 0.28);

  var title = this.add.text(this.centerX, this.horizonY - 70, p.glyph + '  ' + p.name, {
    fontFamily:'Cinzel, serif', fontSize:'20px', fontStyle:'700', color:'#0b1226',
    align:'center', wordWrap: { width: this.W - 40 }
  }).setOrigin(0.5);
  title.setAlpha(0.85);
  var tag = this.add.text(this.centerX, this.horizonY - 40, p.tag, {
    fontFamily:'Manrope, sans-serif', fontSize:'12.5px', fontStyle:'600', color:'#0b1226',
    align:'center', wordWrap: { width: this.W - 40 }
  }).setOrigin(0.5);
  tag.setAlpha(0.7);
};

// Craters and bands on the visible cap of the planet (the band above the
// horizon line), kept clear of the title in the middle.
IslandScene.prototype.drawHorizonTexture = function(cy, R){
  var g = this.add.graphics(), rnd = seeded(this.planet.id), cx = this.centerX;
  var clip = this.make.graphics();
  clip.fillStyle(0xffffff); clip.fillCircle(cx, cy, R - 2);
  g.setMask(clip.createGeometryMask());
  function inside(x, y, m){ var dx = x - cx, dy = y - cy; return dx * dx + dy * dy < (R - m) * (R - m); }
  for(var b = 0; b < 4; b++){ // long soft bands, like on a gas giant
    var by = this.horizonY - 20 - b * 34 - rnd.realInRange(0, 14);
    g.fillStyle(b % 2 ? 0xffffff : 0x05070a, b % 2 ? 0.05 : 0.09);
    g.fillEllipse(cx + rnd.realInRange(-80, 80), by, this.W * rnd.realInRange(0.9, 1.4), rnd.realInRange(12, 26));
  }
  var placed = 0;
  for(var t = 0; t < 120 && placed < 16; t++){
    var cr = rnd.realInRange(5, placed < 4 ? 22 : 12);
    var x = rnd.realInRange(0, this.W), y = rnd.realInRange(-10, this.horizonY - cr);
    if(!inside(x, y, cr + 4)) continue;
    if(Math.abs(x - cx) < 200 && y > this.horizonY - 95) continue; // the title and tag
    drawCrater(g, x, y, cr, 0.75);
    placed++;
  }
};

IslandScene.prototype.drawPath = function(){
  var pts = [new Phaser.Math.Vector2(this.centerX, this.horizonY)];
  for(var i = 0; i < this.islands.length; i++){
    pts.push(new Phaser.Math.Vector2(this.nodeX[i], this.positions[i]));
  }
  pts.push(new Phaser.Math.Vector2(this.centerX, this.gemY));

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
  for(var d = 0; d < smooth.length; d += 5){
    dots.fillCircle(smooth[d].x, smooth[d].y, 1.6);
  }
  this.tweens.add({ targets: dots, alpha: {from:0.55, to:1}, duration: 1700, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
};

IslandScene.prototype.drawIslands = function(){
  var self = this;
  var planet = this.planet;
  var accent = ColorNum(planet.color);
  this.nodeTweened = [];
  this.islands.forEach(function(island, idx){
    var x = self.nodeX[idx], y = self.positions[idx];
    var playable = isPlayable(island);
    var unlocked = playable && isUnlocked(island);
    var done = isDone(island.id);
    var container = self.add.container(x, y);
    var ctx = { island: island, planet: planet, accent: accent, done: done, unlocked: unlocked, rnd: seeded(island.id) };
    var drawn = (NODE_DRAW[island.kind] || drawIsla)(self, ctx);
    var r = drawn.r, glowBg = drawn.glow, layers = drawn.layers;

    var label = self.add.text(0, drawn.labelY, island.name + (playable ? ' · ' + gameTitle(island) : ''), {
      fontFamily:'Space Mono, monospace', fontSize:'11px', color: unlocked || done ? '#c3c9e6' : '#5d6690'
    }).setOrigin(0.5, 0);
    layers.push(label);
    container.add(layers);

    var bx = r * 1.15, by = -r * 0.42;
    if(done){
      var checkBg = self.add.circle(bx, by, 9, ColorNum('#4fbf8b'), 1);
      var check = self.add.text(bx, by, '✓', {
        fontFamily:'Manrope, sans-serif', fontSize:'13px', fontStyle:'800', color:'#0b1226'
      }).setOrigin(0.5);
      container.add([checkBg, check]);
    } else if(!unlocked){
      var lockBg = self.add.circle(bx, by, 9, ColorNum('#1c274d'), 1);
      lockBg.setStrokeStyle(1.5, 0x35406e, 1);
      var lock = self.add.text(bx, by, '🔒', { fontSize:'12px' }).setOrigin(0.5);
      container.add([lockBg, lock]);
    }

    if(unlocked && !done){
      self.nodeTweened.push(glowBg);
      self.tweens.add({ targets: glowBg, alpha: {from:0.12, to:0.32}, scale:{from:1, to:1.12}, duration:900, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
    }
    // islands float: a slow bob, each at its own pace
    self.nodeTweened.push(container);
    self.tweens.add({ targets: container, y: y - 5, duration: 2200 + idx * 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // An invisible ellipse over surface and rock is the click target, so
    // the whole island is clickable rather than just its outline.
    var hit = self.add.ellipse(0, drawn.hit.y, drawn.hit.w, drawn.hit.h, 0x000000, 0.001);
    container.add(hit);
    hit.setInteractive();
    hit.input.cursor = CURSOR_HOVER;
    hit.on('pointerup', function(pointer){
      if(pointer.getDistance() > 8 || !isMapClick(self, pointer)) return;
      attemptOpenIsland(island);
    });
    hit.on('pointerover', function(){
      var rect = self.game.canvas.getBoundingClientRect();
      var sx = x - self.cameras.main.scrollX + rect.left;
      var sy = container.y - drawn.tipY - self.cameras.main.scrollY + rect.top;
      var fem = island.kind === 'isla';
      var status = done ? (fem ? 'Restaurada' : 'Restaurado') : (unlocked ? 'Disponible' : (playable ? (fem ? 'Bloqueada' : 'Bloqueado') : 'Próximamente'));
      showTooltip(sx, sy, '<b>' + island.name + '</b> · ' + planet.name + '<br>' + (playable ? KIND_ICON[island.kind] + ' ' + gameTitle(island) + ' · ' : '') + status);
      drawn.outline(true);
    });
    hit.on('pointerout', function(){ hideTooltip(); drawn.outline(false); });

    self.nodeLayer.add(container);
  });
};

// The planet's mastery gem waits at the end of the path.
IslandScene.prototype.drawReward = function(){
  var x = this.centerX, y = this.gemY;
  var done = planetFullyDone(this.planet.id);
  var accent = ColorNum(this.planet.color);
  var halo = this.add.circle(x, y, 22, accent, done ? 0.28 : 0.06);
  var gem = this.add.text(x, y, '◆', { fontFamily:'Manrope, sans-serif', fontSize:'22px', color: done ? this.planet.color : '#3a447c' }).setOrigin(0.5);
  var label = this.add.text(x, y + 26, done ? 'Gema obtenida' : 'Gema de maestría', {
    fontFamily:'Space Mono, monospace', fontSize:'10.5px', color: done ? this.planet.color : '#6b74a0'
  }).setOrigin(0.5);
  if(done){
    this.nodeTweened.push(halo);
    this.tweens.add({ targets: halo, alpha:{from:0.2, to:0.45}, scale:{from:1, to:1.25}, duration:1300, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
  }
  this.nodeLayer.add([halo, gem, label]);
};

IslandScene.prototype.setupControls = function(){
  var self = this;
  setupRocketCursor(this);
  this.input.on('pointermove', function(pointer){
    if(pointer.isDown){
      self.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y);
      hideTooltip();
    }
  });
  this.input.on('wheel', function(pointer, over, dx, dy){
    self.cameras.main.scrollY += dy * 0.6;
    hideTooltip();
  });
};

// The first island still to restore that the player can actually play;
// islands that aren't built yet don't hold the fog back.
IslandScene.prototype.frontierIndex = function(){
  var idx = this.islands.findIndex(function(i){ return !isDone(i.id) && isPlayable(i); });
  if(idx === -1) idx = this.islands.findIndex(function(i){ return !isDone(i.id) && !isPlayable(i); });
  return idx;
};

IslandScene.prototype.scrollToFrontier = function(instant){
  var idx = this.frontierIndex();
  if(idx === -1) idx = this.islands.length - 1;
  var targetY = Phaser.Math.Clamp(this.positions[idx] - this.H/2, 0, Math.max(0, this.worldHeight - this.H));
  if(instant){ this.cameras.main.scrollY = targetY; }
  else { this.tweens.add({ targets: this.cameras.main, scrollY: targetY, duration: 650, ease:'Cubic.easeInOut' }); }
};

// restoredId: the island the player just finished, if any — the fog then
// rolls back from where it was instead of just appearing in its new place.
IslandScene.prototype.rebuild = function(restoredId){
  var oldTop = this.fogTop;
  this.tweens.killTweensOf(this.nodeTweened);
  this.nodeLayer.destroy(true);
  this.nodeLayer = this.add.container(0,0).setDepth(1);
  this.drawIslands();
  this.drawReward();
  this.drawFog(restoredId ? oldTop : null);
  if(restoredId) this.restoreBurst(this.islands.findIndex(function(i){ return i.id === restoredId; }));
};

/* ---- Neblina Gris ---- */
// A drifting grey fog covers every island past the first unfinished one.
// Its leading edge creeps back and forth (it is spreading), and it rolls back
// each time an island is restored.
IslandScene.prototype.fogTexture = function(){
  if(this.textures.exists('fog-puff')) return;
  var size = 128, tex = this.textures.createCanvas('fog-puff', size, size), ctx = tex.getContext();
  var grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  tex.refresh();
};

// fromTop: the fog's previous top edge, to animate it rolling back from there.
IslandScene.prototype.drawFog = function(fromTop){
  if(this.fogLayer){
    this.tweens.killTweensOf(this.fogTweened);
    this.fogLayer.destroy(true);
    this.fogLayer = null;
  }
  this.fogTweened = [];
  var idx = this.frontierIndex();
  if(idx === -1){ this.fogTop = null; return; }
  this.fogTexture();

  var top = this.positions[idx] + 80;
  this.fogTop = top;
  var fogColor = ColorNum('#8a90a6');
  var layer = this.add.container(0, 0).setDepth(2);
  this.fogLayer = layer;

  // Three bands of puffs, each drifting sideways at its own pace.
  var bottom = this.worldHeight + 320;
  for(var band = 0; band < 3; band++){
    var sub = this.add.container(0, 0);
    for(var y = top + 30 + band * 23; y < bottom; y += 70){
      for(var k = 0; k < 3; k++){
        var puff = this.add.image(Math.random() * this.W, y + Math.random() * 40, 'fog-puff');
        puff.setTint(fogColor).setAlpha(0.07 + Math.random() * 0.06).setScale(2.2 + Math.random() * 1.6);
        sub.add(puff);
      }
    }
    layer.add(sub);
    this.fogTweened.push(sub);
    this.tweens.add({ targets: sub, x: { from: -40, to: 40 }, duration: 9000 + band * 3500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: band * 700 });
  }

  // The leading edge: puffs that reach up towards the free islands and pull back.
  for(var e = 0; e < 7; e++){
    var ex = (e + 0.5) / 7 * this.W + (Math.random() - 0.5) * 40;
    var edge = this.add.image(ex, top + 30, 'fog-puff');
    edge.setTint(fogColor).setAlpha(0.14).setScale(1.5 + Math.random() * 0.8);
    layer.add(edge);
    this.fogTweened.push(edge);
    this.tweens.add({ targets: edge, y: top - 6 - Math.random() * 22, scale: edge.scale * 1.15, duration: 2600 + Math.random() * 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: Math.random() * 1500 });
  }

  var label = this.add.text(this.W - 16, top + 26, '◌ NEBLINA GRIS', {
    fontFamily: 'Space Mono, monospace', fontSize: '10px', color: '#aab0c6'
  }).setOrigin(1, 0.5).setAlpha(0.75);
  label.setLetterSpacing(2);
  layer.add(label);

  if(fromTop != null && fromTop < top){
    layer.y = fromTop - top;
    this.fogTweened.push(layer);
    this.tweens.add({ targets: layer, y: 0, duration: 1800, delay: 350, ease: 'Cubic.easeInOut' });
  }
};

// A ring of light and a spray of gold and blue sparks where an
// island gets its colour back.
IslandScene.prototype.restoreBurst = function(idx){
  if(idx < 0) return;
  var x = this.nodeX[idx], y = this.positions[idx];
  var ring = this.add.circle(x, y, 30, 0, 0).setDepth(3);
  ring.setStrokeStyle(3, ColorNum(this.planet.color), 1);
  this.tweens.add({ targets: ring, scale: 3.2, alpha: 0, duration: 1100, ease: 'Cubic.easeOut', onComplete: function(){ ring.destroy(); } });
  var colors = [ColorNum('#e8b84b'), ColorNum('#6cc4ff')];
  for(var i = 0; i < 18; i++){
    var a = i / 18 * Math.PI * 2, d = 60 + Math.random() * 50;
    var spark = this.add.circle(x, y, 2.5 + Math.random() * 2, colors[i % 2], 1).setDepth(3);
    this.tweens.add({
      targets: spark, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0,
      duration: 900 + Math.random() * 500, ease: 'Cubic.easeOut',
      onComplete: (function(sp){ return function(){ sp.destroy(); }; })(spark)
    });
  }
};

// The three kinds of node (atlas/define.js NODE_KINDS), each drawn around
// (0, 0) in its container: { r, glow, layers, outline(hover) }. glow pulses
// while the node is available; outline highlights it on hover. Colours
// follow the same rule for all: grey under the fog, faint while it waits,
// the planet's colour once restored.

// Isla (a video): a floating island, rocky underside and a grassy top.
function drawIsla(self, ctx){
  var island = ctx.island, planet = ctx.planet, accent = ctx.accent, done = ctx.done, unlocked = ctx.unlocked;
  var r = 40;
  var glowBg = self.add.circle(0, r * 0.2, r + 16, accent, done ? 0.22 : (unlocked ? 0.16 : 0));

  // The rocky underside: a jagged cone hanging from the surface, with a
  // lighter stratum so it reads as stone.
  var rockPts = [
    {x:-r*1.22, y:0}, {x:r*1.22, y:0}, {x:r*0.85, y:r*0.5}, {x:r*0.4, y:r*0.95},
    {x:r*0.05, y:r*1.45}, {x:-r*0.3, y:r*0.95}, {x:-r*0.9, y:r*0.55}
  ];
  var rock = self.add.graphics();
  rock.fillStyle(ColorNum(done ? '#6a5a8c' : (unlocked ? '#4c4370' : '#2f2b4c')), 1);
  rock.fillPoints(rockPts, true);
  rock.fillStyle(ColorNum(done ? '#82719f' : (unlocked ? '#5e5486' : '#38345a')), 1);
  rock.fillPoints([
    {x:-r*1.1, y:r*0.1}, {x:r*1.1, y:r*0.1}, {x:r*0.75, y:r*0.4}, {x:-r*0.8, y:r*0.45}
  ], true);
  rock.fillStyle(0x05070a, 0.25); // shadowed right flank
  rock.fillPoints([{x:r*0.3, y:r*0.2}, {x:r*1.0, y:r*0.2}, {x:r*0.4, y:r*0.95}, {x:r*0.05, y:r*1.45}], true);
  // strata and pebbles, so the underside reads as layered stone
  var rnd = ctx.rnd;
  rock.lineStyle(1.4, 0x05070a, 0.35);
  [0.62, 0.86, 1.1].forEach(function(f){
    var hw = r * 1.15 * (1 - f / 1.5);
    rock.beginPath(); rock.moveTo(-hw, r * f);
    rock.lineTo(-hw * 0.3, r * (f + 0.05)); rock.lineTo(hw * 0.35, r * (f - 0.03)); rock.lineTo(hw, r * (f + 0.02));
    rock.strokePath();
  });
  for(var pb = 0; pb < 9; pb++){
    var py = rnd.realInRange(0.25, 1.2), phw = r * 1.1 * (1 - py / 1.5);
    rock.fillStyle(pb % 3 ? 0x05070a : 0xffffff, pb % 3 ? 0.3 : 0.12);
    rock.fillCircle(rnd.realInRange(-phw, phw), r * py, rnd.realInRange(1.2, 2.6));
  }
  rock.lineStyle(1.6, unlocked || done ? accent : 0x35406e, 0.55);
  rock.strokePoints(rockPts, true);

  // The surface: green-ish with the planet's colour once restored, faint
  // while it waits, grey under the fog.
  var topColor = done ? accent : (unlocked ? blendColor('#1c274d', planet.color, 0.5) : ColorNum('#2a3152'));
  var top = self.add.ellipse(0, 0, r * 2.5, r * 0.95, topColor, 1);
  top.setStrokeStyle(2.4, unlocked || done ? accent : 0x35406e, 1);
  var shine = self.add.ellipse(-r * 0.45, -r * 0.12, r * 0.9, r * 0.28, 0xffffff, done ? 0.22 : 0.08);
  // small craters on the surface, flattened by the angle (kept off the glyph)
  var craters = self.add.graphics();
  [[-0.72, 0.12, 0.16], [0.62, -0.1, 0.13], [0.3, 0.22, 0.09], [-0.32, -0.24, 0.08]].forEach(function(c){
    drawCrater(craters, r * c[0] + rnd.realInRange(-3, 3), r * c[1], r * c[2], 0.42);
  });

  var glyph = self.add.text(0, -2, planet.glyph, {
    fontFamily:'Cinzel, serif', fontSize:'20px', fontStyle:'700',
    color: done ? '#0b1226' : (unlocked ? planet.color : '#4b5588')
  }).setOrigin(0.5);

  var layers = [glowBg, rock, top, craters, shine, glyph];

  // A crystal spire marks the last island of the planet (Avanzado).
  if(island.isLastOfPlanet){
    var crystal = self.add.graphics();
    crystal.fillStyle(unlocked || done ? accent : 0x35406e, done ? 1 : 0.8);
    crystal.fillPoints([{x:r*0.72, y:-r*1.05}, {x:r*0.88, y:-r*0.55}, {x:r*0.72, y:-r*0.2}, {x:r*0.56, y:-r*0.55}], true);
    layers.splice(4, 0, crystal);
  }
  return { r: r, glow: glowBg, layers: layers,
    labelY: r * 1.45 + 12, hit: { y: r * 0.3, w: r * 2.6, h: r * 2.1 }, tipY: r * 0.5,
    outline: function(on){ top.setStrokeStyle(on ? 3.2 : 2.4, on || unlocked || done ? accent : 0x35406e, 1); } };
}

// Meteoro (a Genially): a jagged rock falling through space, a flame trail
// streaming up behind it.
function drawMeteoro(self, ctx){
  var accent = ctx.accent, done = ctx.done, unlocked = ctx.unlocked, rnd = ctx.rnd, planet = ctx.planet;
  var r = 34, lit = done || unlocked;
  var glowBg = self.add.circle(0, 0, r + 18, accent, done ? 0.22 : (unlocked ? 0.16 : 0));

  // The trail: three tapering flames, hot near the rock, fading behind it.
  var flameColor = done ? accent : (unlocked ? ColorNum('#ff9a4d') : ColorNum('#3a4066'));
  var trail = self.add.graphics();
  [[1.0, 0.16, 3.6], [0.85, 0.24, 3.0], [0.68, 0.34, 2.4], [0.5, 0.55, 1.8]].forEach(function(f){
    trail.fillStyle(f[1] > 0.5 && lit ? ColorNum('#ffe2a8') : flameColor, lit ? f[1] : 0.25);
    trail.fillPoints([
      { x: -r * 0.75 * f[0], y: -r * 0.45 * f[0] },
      { x: r * f[2] * 0.95, y: -r * f[2] * 1.05 },
      { x: r * 0.45 * f[0], y: r * 0.75 * f[0] }
    ], true);
  });
  for(var sp = 0; sp < 16; sp++){ // sparks shed along the trail
    var t = rnd.realInRange(1.0, 3.4);
    trail.fillStyle(lit ? ColorNum('#ffe2a8') : 0x4b5588, lit ? rnd.realInRange(0.4, 0.9) : 0.3);
    trail.fillCircle(r * t * 0.9 + rnd.realInRange(-10, 10), -r * t + rnd.realInRange(-10, 10), rnd.realInRange(1.2, 2.6));
  }

  // The rock: an irregular polygon with a lit facet, craters and a shadow.
  var pts = [];
  for(var i = 0; i < 11; i++){
    var a = (i / 11) * Math.PI * 2, rr = r * rnd.realInRange(0.84, 1.06);
    pts.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr });
  }
  var rock = self.add.graphics();
  rock.fillStyle(ColorNum(done ? '#6a5a8c' : (unlocked ? '#4c4370' : '#2f2b4c')), 1);
  rock.fillPoints(pts, true);
  rock.fillStyle(ColorNum(done ? '#82719f' : (unlocked ? '#5e5486' : '#38345a')), 1);
  rock.fillPoints(pts.slice(5, 11).map(function(p){ return { x: p.x * 0.8 - r * 0.08, y: p.y * 0.8 - r * 0.08 }; }), true);
  rock.fillStyle(0x05070a, 0.28);
  rock.fillPoints(pts.slice(0, 5).concat([{ x: 0, y: 0 }]), true);
  [[-0.38, -0.3, 0.2], [0.35, 0.28, 0.16], [0.42, -0.36, 0.11], [-0.3, 0.42, 0.12]].forEach(function(c){
    drawCrater(rock, r * c[0], r * c[1], r * c[2], 0.9);
  });
  rock.lineStyle(2.2, lit ? accent : 0x35406e, done ? 1 : 0.8);
  rock.strokePoints(pts, true);
  var ring = self.add.circle(0, 0, r * 1.08, 0x000000, 0);

  var glyph = self.add.text(0, 0, planet.glyph, {
    fontFamily:'Cinzel, serif', fontSize:'18px', fontStyle:'700',
    color: done ? '#ffffff' : (unlocked ? planet.color : '#4b5588')
  }).setOrigin(0.5);

  if(lit){ // the flames flicker
    self.nodeTweened.push(trail);
    self.tweens.add({ targets: trail, alpha: { from: 0.75, to: 1 }, duration: 260 + rnd.between(0, 120), yoyo: true, repeat: -1 });
  }
  var layers = [glowBg, trail, rock, ring, glyph];

  if(lit){
    // Embers: hot specks that break off the rock and race up the trail,
    // cooling from white to orange to red as they fade.
    var EMBER = [0xfff1c4, 0xffc15a, 0xff8a3d, 0xff5a2e];
    // A soft fire glow along the trail, under the embers.
    var blaze = self.add.graphics();
    for(var b = 0; b <= 30; b++){
      var bt = b / 30;
      blaze.fillStyle(bt < 0.35 ? 0xffd27a : 0xff7a3a, 0.09 * (1 - bt));
      blaze.fillCircle(r * 3.2 * bt * 0.95, -r * 3.2 * bt * 1.05, r * (0.75 - 0.45 * bt));
    }
    blaze.setBlendMode(Phaser.BlendModes.ADD);
    self.nodeTweened.push(blaze);
    self.tweens.add({ targets: blaze, alpha: { from: 0.7, to: 1 }, duration: 180, yoyo: true, repeat: -1 });
    layers.splice(2, 0, blaze);
    for(var e = 0; e < 32; e++){
      var ember = self.add.circle(0, 0, rnd.realInRange(1.6, 3.8), EMBER[e % EMBER.length], 1);
      ember.setBlendMode(Phaser.BlendModes.ADD);
      var reach = rnd.realInRange(1.6, 3.8);
      self.nodeTweened.push(ember);
      self.tweens.add({
        targets: ember,
        x: { from: rnd.realInRange(-r * 0.4, r * 0.5), to: r * reach * 0.95 + rnd.realInRange(-14, 14) },
        y: { from: rnd.realInRange(-r * 0.5, r * 0.3), to: -r * reach * 1.05 + rnd.realInRange(-14, 14) },
        alpha: { from: 1, to: 0 }, scale: { from: 1, to: 0.3 },
        duration: rnd.between(600, 1300), delay: rnd.between(0, 1300), repeat: -1, ease: 'Quad.easeOut'
      });
      layers.splice(2, 0, ember); // behind the rock, over the trail
    }
  }
  return { r: r, glow: glowBg, layers: layers,
    labelY: r * 1.2 + 10, hit: { y: -r * 0.2, w: r * 3, h: r * 3 }, tipY: r * 0.9,
    outline: function(on){ ring.setStrokeStyle(on ? 2.4 : 0, accent, on ? 0.9 : 0); } };
}

// Cometa (one of our games, the big challenge): an icy nucleus in a glowing
// coma, a curved dust tail of soft light and a straight blue ion tail, with
// sparks drifting off it — the most striking thing on the path. Lit layers
// use additive blending so overlaps glow instead of stacking flat.
function drawCometa(self, ctx){
  var accent = ctx.accent, done = ctx.done, unlocked = ctx.unlocked, rnd = ctx.rnd, planet = ctx.planet;
  var r = 34, lit = done || unlocked;
  var ADD = Phaser.BlendModes.ADD;
  // Dust takes the planet's colour once restored; while waiting it's a
  // pale gold, like sunlight on ice. Under the fog everything is grey.
  var dustColor = done ? accent : (unlocked ? ColorNum('#ffd98a') : ColorNum('#3a4066'));
  var ionColor = lit ? ColorNum('#9fe8ff') : ColorNum('#33395c');
  var glowBg = self.add.circle(0, 0, r * 2.2, accent, done ? 0.16 : (unlocked ? 0.12 : 0));

  // Dust tail: soft discs along a curve sweeping up-left, shrinking and
  // fading with distance from the head.
  var dust = self.add.graphics();
  var tip = { x: -r * 6.4, y: -r * 4.2 }, bend = { x: -r * 1.6, y: -r * 3.6 };
  for(var i = 0; i <= 80; i++){
    var t = i / 80, u = 1 - t;
    var cx = 2 * u * t * bend.x + t * t * tip.x, cy = 2 * u * t * bend.y + t * t * tip.y;
    var rad = r * (0.62 - 0.4 * t) * (1 + 0.35 * t);
    dust.fillStyle(dustColor, (lit ? 0.13 : 0.06) * Math.pow(u, 1.3));
    dust.fillCircle(cx, cy, rad);
  }
  if(lit) dust.setBlendMode(ADD);

  // Ion tail: thin straight streaks pointing straight away from the sun.
  var ion = self.add.graphics();
  [[0.5, 0.42, 7.4], [0.28, 0.6, 6.4], [0.12, 0.85, 5.2]].forEach(function(f){
    ion.fillStyle(ionColor, lit ? f[1] * 0.55 : 0.2);
    ion.fillPoints([
      { x: r * f[0] * 0.6, y: -r * f[0] }, { x: -r * f[2], y: -r * f[2] * 0.42 }, { x: -r * f[0] * 0.6, y: r * f[0] * 0.5 }
    ], true);
  });
  if(lit) ion.setBlendMode(ADD);

  // Coma: a soft halo built from concentric discs, brightest at the head.
  var coma = self.add.graphics();
  for(var k = 0; k < 24; k++){ // many faint discs, so the halo has no visible rings
    coma.fillStyle(lit ? (k < 14 ? dustColor : 0xffffff) : 0x3a4066, lit ? 0.035 : 0.025);
    coma.fillCircle(0, 0, r * (2.0 - k * 0.05));
  }
  if(lit) coma.setBlendMode(ADD);

  // Nucleus: a bright icy core with a darker irregular rock showing through.
  var coreColor = done ? blendColor('#ffffff', planet.color, 0.45) : (unlocked ? ColorNum('#f2fbff') : ColorNum('#2f3557'));
  var nucleus = self.add.circle(0, 0, r * 0.82, coreColor, 1);
  nucleus.setStrokeStyle(2, lit ? 0xffffff : 0x35406e, lit ? 0.95 : 1);
  var ice = self.add.graphics();
  ice.fillStyle(lit ? 0xffffff : 0x4b5588, lit ? 0.7 : 0.2);
  ice.fillEllipse(-r * 0.28, -r * 0.3, r * 0.42, r * 0.26);
  ice.fillStyle(0x0b1226, lit ? 0.08 : 0.2);
  ice.fillCircle(r * 0.25, r * 0.22, r * 0.28);

  var glyph = self.add.text(0, 1, planet.glyph, {
    fontFamily:'Cinzel, serif', fontSize:'28px', fontStyle:'700',
    color: lit ? '#0b1226' : '#4b5588'
  }).setOrigin(0.5);

  var layers = [glowBg, dust, ion, coma, nucleus, ice, glyph];

  if(lit){
    // The coma breathes and the tails shimmer.
    self.nodeTweened.push(coma, dust, ion);
    self.tweens.add({ targets: coma, scale: { from: 0.94, to: 1.08 }, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    self.tweens.add({ targets: [dust, ion], alpha: { from: 0.78, to: 1 }, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Sparks peel off the head and drift down the tail, fading out.
    for(var sp = 0; sp < 7; sp++){
      var spark = self.add.circle(0, 0, rnd.realInRange(1.4, 2.6), sp % 3 ? 0xffffff : dustColor, 1);
      spark.setBlendMode(ADD);
      var tt = rnd.realInRange(0.45, 1);
      self.nodeTweened.push(spark);
      self.tweens.add({
        targets: spark,
        x: { from: rnd.realInRange(-6, 6), to: tip.x * tt + rnd.realInRange(-18, 18) },
        y: { from: rnd.realInRange(-6, 6), to: tip.y * tt + rnd.realInRange(-18, 18) },
        alpha: { from: 0.95, to: 0 },
        duration: rnd.between(1800, 2800), delay: rnd.between(0, 2400), repeat: -1, ease: 'Sine.easeOut'
      });
      layers.splice(3, 0, spark);
    }
  }
  return { r: r, glow: glowBg, layers: layers,
    labelY: r * 1.9 + 8, hit: { y: -r * 0.3, w: r * 3.6, h: r * 3.4 }, tipY: r * 1.1,
    outline: function(on){ nucleus.setStrokeStyle(on ? 3.4 : 2, on ? accent : (lit ? 0xffffff : 0x35406e), 1); } };
}

var NODE_DRAW = { isla: drawIsla, meteoro: drawMeteoro, cometa: drawCometa };
