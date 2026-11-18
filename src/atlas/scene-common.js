import Phaser from 'phaser';

// Pieces both Neuromath map scenes share: the solar system (planets) and
// a planet's island chain.

export function ColorNum(hex){ return Phaser.Display.Color.HexStringToColor(hex).color; }

// Linear blend between two '#rrggbb' colours, t = 0 → a, t = 1 → b.
export function blendColor(a, b, t){
  var ca = Phaser.Display.Color.HexStringToColor(a), cb = Phaser.Display.Color.HexStringToColor(b);
  return Phaser.Display.Color.GetColor(
    Math.round(ca.red + (cb.red - ca.red) * t),
    Math.round(ca.green + (cb.green - ca.green) * t),
    Math.round(ca.blue + (cb.blue - ca.blue) * t)
  );
}

/* ---- Surface texture: craters, bands, rock strata ---- */
// Random but stable per planet (seeded by its id), so a planet always looks
// the same. Light comes from the top left, like the shine on the bodies.
export function seeded(seed){ return new Phaser.Math.RandomDataGenerator([String(seed)]); }

// One crater at (x, y), radius cr; squash < 1 flattens it (seen at an angle,
// on an island's surface).
export function drawCrater(g, x, y, cr, squash){
  var k = squash || 1;
  g.fillStyle(0xffffff, 0.13); g.fillEllipse(x + cr * 0.14, y + cr * 0.14 * k, cr * 2, cr * 2 * k);  // lit rim
  g.fillStyle(0x05070a, 0.3);  g.fillEllipse(x, y, cr * 1.84, cr * 1.84 * k);                         // bowl
  g.fillStyle(0x05070a, 0.2);  g.fillEllipse(x - cr * 0.16, y - cr * 0.16 * k, cr * 1.2, cr * 1.2 * k); // inner shade
}

// Craters and soft patches over a round body of radius r centred at (0, 0).
export function drawPlanetTexture(scene, r, seed){
  var g = scene.add.graphics(), rnd = seeded(seed);
  for(var m = 0; m < 3; m++){ // darker "seas" and lighter highlands
    var mr = r * rnd.realInRange(0.25, 0.45), ma = rnd.angle() * Math.PI / 180, md = rnd.realInRange(0, (r - mr) * 0.9);
    g.fillStyle(m % 2 ? 0xffffff : 0x05070a, m % 2 ? 0.06 : 0.12);
    g.fillEllipse(Math.cos(ma) * md, Math.sin(ma) * md, mr * 2, mr * 1.5);
  }
  var n = Math.max(4, Math.round(r / 6));
  for(var i = 0; i < n; i++){
    var cr = r * rnd.realInRange(0.07, i < 2 ? 0.2 : 0.12);
    var a = rnd.angle() * Math.PI / 180, d = rnd.realInRange(0, (r - cr) * 0.92);
    drawCrater(g, Math.cos(a) * d, Math.sin(a) * d, cr, 1);
  }
  return g;
}

/* ---- Rocket cursors ---- */
// The player's cursor over the map is a little rocket instead of the
// default arrow — idle while floating, tilted while flying (panning), and
// bigger while hovering something you can land on.
function rocketCursor(rotateDeg, size){
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '">' +
    '<text x="50%" y="58%" font-size="' + Math.round(size*0.82) + '" text-anchor="middle" dominant-baseline="middle" ' +
    'transform="rotate(' + rotateDeg + ' ' + (size/2) + ' ' + (size/2) + ')">🚀</text></svg>';
  var hot = Math.round(size/2);
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '") ' + hot + ' ' + hot + ', auto';
}
export var CURSOR_IDLE = rocketCursor(0, 30);
export var CURSOR_FLYING = rocketCursor(-16, 32);
export var CURSOR_HOVER = rocketCursor(0, 38);

// Deep-space gradient, a few nebula blobs and a twinkling star field over
// a w × h area.
export function drawStarfield(scene, w, h){
  var g = scene.add.graphics();
  g.fillGradientStyle(ColorNum('#0d1530'), ColorNum('#0d1530'), ColorNum('#060a18'), ColorNum('#060a18'), 1);
  g.fillRect(0, 0, w, h);

  var nebula = scene.add.graphics();
  var nebulaColors = [ColorNum('#3a2e6b'), ColorNum('#1f4a5c'), ColorNum('#5c2e52')];
  for(var nb=0; nb<7; nb++){
    nebula.fillStyle(nebulaColors[nb % nebulaColors.length], 0.05 + Math.random()*0.05);
    nebula.fillCircle(Math.random()*w, Math.random()*h, 90 + Math.random()*160);
  }

  // a dense field, plus a sparse handful of bigger "bright" stars
  var count = Math.round(w * h / 2400);
  var stars = scene.add.graphics();
  for(var i=0;i<count;i++){
    stars.fillStyle(0xffffff, Math.random()*0.45 + 0.12);
    stars.fillCircle(Math.random()*w, Math.random()*h, Math.random()*1.3 + 0.25);
  }
  var brightStars = scene.add.graphics();
  for(var bs=0; bs<count/20; bs++){
    var bx = Math.random()*w, by = Math.random()*h;
    brightStars.fillStyle(0xffffff, 0.85);
    brightStars.fillCircle(bx, by, 1.6);
    brightStars.fillStyle(0xffffff, 0.18);
    brightStars.fillCircle(bx, by, 4);
  }
  scene.tweens.add({ targets: stars, alpha: {from:0.5, to:1}, duration: 2600, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
  scene.tweens.add({ targets: brightStars, alpha: {from:0.6, to:1}, duration: 1900, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
}

// Redraw the scene from scratch when the canvas resizes. The listener is
// dropped when the scene shuts down, so a scene the player already left
// isn't brought back by a later resize.
// data.resized tells create() not to replay its entrance animation.
export function restartOnResize(scene, data){
  function onResize(){ scene.scene.restart(Object.assign({}, data, { resized: true })); }
  // a change in the accessibility panel redraws the labels the same way
  var drawnWith = mapA11yKey();
  function onA11y(){ if(mapA11yKey() !== drawnWith) onResize(); }
  scene.scale.on('resize', onResize);
  window.addEventListener('vx-a11y', onA11y);
  scene.events.once('shutdown', function(){
    scene.scale.off('resize', onResize);
    window.removeEventListener('vx-a11y', onA11y);
  });
}

/* ---- Readable map text and the accessibility panel (shared/a11y.js) ---- */
// The map is a canvas, so the page CSS can't reach its labels: they read the
// player's settings here. Text grows less than the HTML panels (up to 1.3×)
// so the path's labels still fit between nodes.
var MAP_ZOOM_MAX = 1.3;
var EASY_FONT = '"Atkinson Hyperlegible", sans-serif';

export function mapA11y(){
  var html = document.documentElement;
  var z = parseFloat(getComputedStyle(html).getPropertyValue('--a11y-zoom')) || 1;
  return {
    zoom: Math.min(z, MAP_ZOOM_MAX),
    contrast: html.classList.contains('a11y-contrast'),
    font: html.classList.contains('a11y-font'),
    spacing: html.classList.contains('a11y-spacing')
  };
}
function mapA11yKey(){
  var a = mapA11y();
  var fontReady = a.font && document.fonts && document.fonts.check('12px ' + EASY_FONT);
  return [a.zoom, a.contrast, a.font, fontReady, a.spacing].join('|');
}

// Lighter version of a '#rrggbb' colour (t = 1 → white).
function lighten(hex, t){
  var c = Phaser.Display.Color.HexStringToColor(hex);
  function ch(v){ return Math.round(v + (255 - v) * t); }
  return Phaser.Display.Color.RGBToString(ch(c.red), ch(c.green), ch(c.blue), 0, '#');
}

// scene.add.text for a label the player reads, following the settings:
// bigger, the easy-reading font, more letter spacing, and in high contrast
// a brighter colour with a dark outline. `onLight` marks dark text drawn on
// a light surface (the planet's horizon): there contrast makes it black.
export function mapLabel(scene, x, y, text, style, onLight){
  var a = mapA11y(), s = Object.assign({}, style);
  if(a.zoom !== 1) s.fontSize = (parseFloat(s.fontSize) * a.zoom).toFixed(1) + 'px';
  if(a.font) s.fontFamily = EASY_FONT;
  if(a.spacing) s.lineSpacing = 6;
  if(a.contrast){
    if(onLight) s.color = '#000000';
    else { s.color = lighten(s.color || '#ffffff', 0.6); s.stroke = '#05070f'; s.strokeThickness = 4; }
  }
  var t = scene.add.text(x, y, text, s);
  if(a.spacing) t.setLetterSpacing(1.5);
  return t;
}

// The label's alpha, or fully opaque in high contrast.
export function labelAlpha(alpha){ return mapA11y().contrast ? 1 : alpha; }

// True when a click really happened on the map: pressed and released on the
// canvas itself. Phaser also reports a release over the canvas area when the
// player clicks an HTML dialog drawn on top of it (a lesson, a briefing, a
// confirm), which used to open whatever node or planet sat underneath.
export function isMapClick(scene, pointer){
  var canvas = scene.game.canvas;
  return pointer.downElement === canvas && pointer.upElement === canvas;
}

// Drag-free pointer handling shared by both scenes: rocket cursor states.
export function setupRocketCursor(scene){
  scene.input.setDefaultCursor(CURSOR_IDLE);
  scene.input.on('pointerdown', function(pointer, currentlyOver){
    if(!currentlyOver || currentlyOver.length === 0) scene.input.setDefaultCursor(CURSOR_FLYING);
  });
  scene.input.on('pointerup', function(){ scene.input.setDefaultCursor(CURSOR_IDLE); });
}
