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
export function restartOnResize(scene, data){
  function onResize(){ scene.scene.restart(data); }
  scene.scale.on('resize', onResize);
  scene.events.once('shutdown', function(){ scene.scale.off('resize', onResize); });
}

// Drag-free pointer handling shared by both scenes: rocket cursor states.
export function setupRocketCursor(scene){
  scene.input.setDefaultCursor(CURSOR_IDLE);
  scene.input.on('pointerdown', function(pointer, currentlyOver){
    if(!currentlyOver || currentlyOver.length === 0) scene.input.setDefaultCursor(CURSOR_FLYING);
  });
  scene.input.on('pointerup', function(){ scene.input.setDefaultCursor(CURSOR_IDLE); });
}
