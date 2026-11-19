import { reducedMotion } from '../shared/fx.js';

// The home page's universe, painted on one fixed <canvas> behind the page:
// the six galaxies circle the black hole of Interferencia Estática on a
// tilted orbit, joined to it by their Corredores Cuánticos, under a drifting
// Neblina Gris. Everything starts grey. The player's light (the pointer, or
// a wandering light on touch screens) clears the fog and brings back the
// colour around it; scrolling the page restores more and more of it, until
// the closing call shows the whole universe in colour. Galaxies the player
// has already restored keep their colour.
//
// home.js drives it with setView({ restore, dim, zoom, fx, fy, scroll }) on
// scroll; every value eases towards its target. The loop only runs while the
// home page is shown and the tab is visible; with reduced motion it paints
// still frames, redrawn when the view changes.

var GREY = [138, 144, 166];
var TILT = 0.34;            // how flat the orbit looks
var PARTS = 320;            // particles per galaxy
var MOTES = 460;            // particles in the hole's disk

function hexToRgb(hex){
  var n = parseInt(hex.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function mix(a, b, k){
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}
function rgba(c, a){ return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a.toFixed(3) + ')'; }
function clamp(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }

// A soft round glow, pre-rendered once per colour.
function glowSprite(rgb, size){
  var c = document.createElement('canvas');
  c.width = c.height = size;
  var g = c.getContext('2d'), grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, rgba(rgb, 0.9));
  grad.addColorStop(0.18, rgba(rgb, 0.45));
  grad.addColorStop(0.5, rgba(rgb, 0.1));
  grad.addColorStop(1, rgba(rgb, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

// A lump of fog: a few overlapping grey lobes.
function fogSprite(){
  var size = 256, c = document.createElement('canvas');
  c.width = c.height = size;
  var g = c.getContext('2d');
  for(var l = 0; l < 6; l++){
    var x = size * (0.28 + Math.random() * 0.44), y = size * (0.3 + Math.random() * 0.4), r = size * (0.16 + Math.random() * 0.2);
    var grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(150,156,178,.13)');
    grad.addColorStop(1, 'rgba(150,156,178,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  return c;
}

// galaxies: [{ id, name, colors: { g1, g2, g3 }, frac }] (frac: share restored)
export function startHero(canvas, host, galaxies){
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1, raf = 0, last = 0, time = 0;
  var stars = [], motes = [], fogs = [], gals = [];
  var fog = document.createElement('canvas'), fctx = fog.getContext('2d');
  var bg = null, greyGlow = glowSprite(GREY, 128);
  var pointer = { x: 0, y: 0, seen: false, at: 0 };
  var light = { x: 0, y: 0, placed: false };
  var view = { restore: 0, dim: 1, zoom: 1, fx: 0.5, fy: 0.5, scroll: 0 };
  var goal = { restore: 0, dim: 1, zoom: 1, fx: 0.5, fy: 0.5, scroll: 0 };
  var hover = -1, onPick = null;

  gals = galaxies.map(function(g, i){
    var stops = [g.colors.g3 || '#ffffff', g.colors.g1, g.colors.g2].map(hexToRgb);
    var arms = i % 2 ? 3 : 2, twist = 3.2 + (i * 0.37) % 1.4, parts = [];
    for(var p = 0; p < PARTS; p++){
      var r = Math.pow(Math.random(), 0.75);
      var arm = (p % arms) / arms * Math.PI * 2;
      var spread = (1 - r) * 0.5 + 0.18;
      var t = r < 0.35 ? Math.random() * 0.5 : r; // dense core, then arms
      parts.push({
        r: r, a: arm + r * twist + (Math.random() - 0.5) * spread,
        col: t < 0.5 ? mix(stops[0], stops[1], t * 2) : mix(stops[1], stops[2], (t - 0.5) * 2),
        s: Math.random() < 0.12 ? 2.6 : 1.7, b: 0.5 + Math.random() * 0.5
      });
    }
    return {
      id: g.id, name: g.name, frac: g.frac || 0, rgb: hexToRgb(g.colors.g1), parts: parts,
      base: i / galaxies.length * Math.PI * 2 - Math.PI / 2, rot: (i * 0.9) % Math.PI - 0.6,
      spin: 0.12 + (i % 3) * 0.03, glow: glowSprite(stops[1], 128), x: 0, y: 0, size: 0, depth: 0, c: 0
    };
  });

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    if(!W || !H) return;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fog.width = Math.ceil(W / 2); fog.height = Math.ceil(H / 2);
    bg = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, Math.max(W, H) * 0.75);
    bg.addColorStop(0, '#141c44');
    bg.addColorStop(0.55, '#0b1226');
    bg.addColorStop(1, '#04060f');
    stars = [];
    var n = Math.round(Math.min(420, W * H / 3200));
    for(var i = 0; i < n; i++){
      stars.push({ x: Math.random() * W, y: Math.random() * H, z: 0.2 + Math.random() * 0.8, ph: Math.random() * 6.3, sp: 0.6 + Math.random() * 1.8 });
    }
    fogs = [];
    for(var f = 0; f < 9; f++){
      fogs.push({ img: fogSprite(), x: Math.random() * W, y: Math.random() * H, size: Math.max(W, H) * (0.45 + Math.random() * 0.35),
        vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 6 });
    }
    if(!light.placed){ light.x = W * 0.7; light.y = H * 0.5; light.placed = true; }
  }

  function camera(){
    var S = Math.min(W * (W < 640 ? 0.36 : 0.3), H * 0.5) * view.zoom;
    return { x: W * view.fx, y: H * view.fy, S: S, h: S * 0.11 };
  }

  function seedMote(m, anywhere, cam){
    m.g = (Math.random() * gals.length) | 0;
    m.u = Math.random();
    m.r = cam.h * (anywhere ? 1.15 + Math.random() * 2.2 : 3.1 + Math.random() * 0.4);
    m.a = Math.random() * Math.PI * 2;
    m.s = 0.6 + Math.random() * 1.2;
    return m;
  }

  // How much the player's light restores at (x, y): 1 at its centre.
  function lit(x, y, L){
    var dx = x - light.x, dy = y - light.y, d2 = dx * dx + dy * dy;
    if(d2 > L * L) return 0;
    var k = 1 - Math.sqrt(d2) / L;
    return k * k * (3 - 2 * k);
  }

  function drawGalaxy(g, L){
    var cr = Math.cos(g.rot), sr = Math.sin(g.rot), size = g.size, depthA = 0.55 + 0.45 * (g.depth + 1) / 2;
    var base = Math.max(view.restore, g.frac);
    // its core: grey fading into its own colour
    var coreC = Math.max(base, lit(g.x, g.y, L));
    var cs = size * (hover === gals.indexOf(g) ? 1.5 : 1.25);
    ctx.globalAlpha = (1 - coreC) * 0.75 * depthA;
    ctx.drawImage(greyGlow, g.x - cs, g.y - cs, cs * 2, cs * 2);
    ctx.globalAlpha = coreC * 0.85 * depthA;
    ctx.drawImage(g.glow, g.x - cs, g.y - cs, cs * 2, cs * 2);
    ctx.globalAlpha = 1;
    var sum = 0;
    for(var i = 0; i < g.parts.length; i++){
      var p = g.parts[i], a = p.a + time * g.spin;
      var lx = Math.cos(a) * p.r, ly = Math.sin(a) * p.r * 0.5;
      var x = g.x + (lx * cr - ly * sr) * size, y = g.y + (lx * sr + ly * cr) * size;
      var c = Math.max(base, lit(x, y, L));
      sum += c;
      ctx.fillStyle = rgba(c > 0.01 ? mix(GREY, p.col, c) : GREY, (0.45 + 0.55 * c) * p.b * depthA);
      ctx.fillRect(x - p.s / 2, y - p.s / 2, p.s, p.s);
    }
    g.c = sum / g.parts.length;
  }

  function drawLabel(g){
    var k = 0.8 + 0.25 * (g.depth + 1) / 2, a = (0.35 + 0.55 * Math.max(g.c, hover === gals.indexOf(g) ? 1 : 0)) * (0.55 + 0.45 * (g.depth + 1) / 2);
    ctx.font = '600 ' + Math.round(12 * k) + 'px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = rgba(mix([200, 204, 222], [255, 255, 255], g.c), a * view.dim);
    ctx.fillText(g.name, g.x, g.y + g.size * 0.78 + 14);
  }

  // The hole's disk: motes circling and falling in; grey, or a galaxy's
  // colour as much as that galaxy is restored.
  function drawMotes(cam, front, dt, L){
    for(var i = 0; i < motes.length; i++){
      var m = motes[i];
      if(front){ // advance once per frame
        m.a += dt * m.s * Math.pow(cam.h * 2 / m.r, 1.5) * 1.1;
        m.r -= dt * cam.h * 0.14 * m.s;
        if(m.r < cam.h * 1.04) seedMote(m, false, cam);
      }
      var sn = Math.sin(m.a);
      if((sn > 0) !== front) continue;
      var x = cam.x + Math.cos(m.a) * m.r, y = cam.y + sn * m.r * TILT;
      var g = gals[m.g], c = m.u < Math.max(view.restore, g.frac) ? 1 : lit(x, y, L);
      var near = clamp(1 - (m.r - cam.h) / (cam.h * 2.4));
      ctx.fillStyle = rgba(c > 0.01 ? mix(GREY, g.rgb, c) : GREY, 0.25 + 0.6 * near);
      var s = 1.2 + near * 1.2;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
  }

  function drawHole(cam){
    var h = cam.h, R = view.restore;
    var tone = mix([155, 140, 242], [255, 236, 200], R);
    // halo
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.scale(1, 0.55);
    var halo = ctx.createRadialGradient(0, 0, h * 0.8, 0, 0, h * 4.2);
    halo.addColorStop(0, rgba(tone, 0.3));
    halo.addColorStop(1, rgba(tone, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(-h * 4.2, -h * 4.2, h * 8.4, h * 8.4);
    ctx.restore();
    // the back of the disk, bent over the top by the hole's gravity
    ctx.strokeStyle = rgba(tone, 0.35 + 0.25 * R);
    ctx.lineWidth = h * 0.16;
    ctx.beginPath(); ctx.ellipse(cam.x, cam.y, h * 1.45, h * 1.2, 0, Math.PI * 1.04, Math.PI * 1.96); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(cam.x, cam.y, h, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba([255, 255, 255], 0.55);
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cam.x, cam.y, h * 1.05, 0, Math.PI * 2); ctx.stroke();
  }

  // Corridors: faint curves from each galaxy to the hole, with sparks that
  // flow in while it is grey and back out once restored.
  function drawCorridors(cam){
    ctx.lineWidth = 1;
    gals.forEach(function(g, i){
      var mx = (g.x + cam.x) / 2 + (cam.y - g.y) * 0.25, my = (g.y + cam.y) / 2 + (g.x - cam.x) * 0.25;
      var c = Math.max(view.restore, g.frac), col = mix(GREY, g.rgb, c);
      ctx.strokeStyle = rgba(col, 0.08 + 0.14 * c);
      ctx.setLineDash([2, 8]);
      ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.quadraticCurveTo(mx, my, cam.x, cam.y); ctx.stroke();
      ctx.setLineDash([]);
      for(var j = 0; j < 4; j++){
        var u = (time * 0.11 + j / 4 + i * 0.07) % 1;
        if(c >= 0.5) u = 1 - u; // restored: flowing back out
        var v = 1 - u, x = v * v * g.x + 2 * v * u * mx + u * u * cam.x, y = v * v * g.y + 2 * v * u * my + u * u * cam.y;
        ctx.fillStyle = rgba(col, 0.5 * Math.sin(u * Math.PI));
        ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  function drawFog(L, dt, cam){
    var fw = fog.width, fh = fog.height;
    fctx.globalCompositeOperation = 'source-over';
    fctx.clearRect(0, 0, fw, fh);
    fogs.forEach(function(f){
      f.x += f.vx * dt; f.y += f.vy * dt;
      var s = f.size;
      if(f.x < -s / 2) f.x = W + s / 2; if(f.x > W + s / 2) f.x = -s / 2;
      if(f.y < -s / 2) f.y = H + s / 2; if(f.y > H + s / 2) f.y = -s / 2;
      fctx.drawImage(f.img, (f.x - s / 2) / 2, (f.y - s / 2) / 2, s / 2, s / 2);
    });
    // the player's light clears a hole in it
    fctx.globalCompositeOperation = 'destination-out';
    var g = fctx.createRadialGradient(light.x / 2, light.y / 2, 0, light.x / 2, light.y / 2, L / 2);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.6, 'rgba(0,0,0,.6)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    fctx.fillStyle = g;
    fctx.fillRect(0, 0, fw, fh);
    // and nothing stands in front of the hole itself
    fctx.fillStyle = '#000';
    fctx.beginPath(); fctx.arc(cam.x / 2, cam.y / 2, cam.h * 0.6, 0, Math.PI * 2); fctx.fill();
    ctx.globalAlpha = (1 - view.restore) * 0.8;
    ctx.drawImage(fog, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  function drawLight(L){
    var a = 0.12 * (1 - view.restore * 0.6);
    var g = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, L * 0.55);
    g.addColorStop(0, 'rgba(108,196,255,' + a.toFixed(3) + ')');
    g.addColorStop(1, 'rgba(108,196,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(light.x - L, light.y - L, L * 2, L * 2);
  }

  function ease(dt){
    var k = dt ? 1 - Math.pow(0.002, dt) : 1;
    Object.keys(goal).forEach(function(key){ view[key] += (goal[key] - view[key]) * k; });
    // the light follows the pointer, or wanders by itself when idle
    var idle = !pointer.seen || performance.now() - pointer.at > 5000;
    var cam = camera();
    var tx = idle ? cam.x + Math.cos(time * 0.32) * cam.S * 0.95 : pointer.x;
    var ty = idle ? cam.y + Math.sin(time * 0.5) * cam.S * 0.42 : pointer.y;
    var lk = dt ? 1 - Math.pow(idle ? 0.25 : 0.0005, dt) : 1;
    light.x += (tx - light.x) * lk; light.y += (ty - light.y) * lk;
  }

  function draw(dt){
    if(!W || !H) return;
    ease(dt);
    var cam = camera(), L = Math.min(W, H) * 0.24;
    if(!motes.length) for(var i = 0; i < MOTES; i++) motes.push(seedMote({}, true, cam));

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    stars.forEach(function(s){
      var y = ((s.y - view.scroll * 0.06 * s.z) % H + H) % H;
      var a = (0.25 + 0.5 * s.z) * (0.6 + 0.4 * Math.sin(time * s.sp + s.ph));
      ctx.fillStyle = 'rgba(220,228,255,' + a.toFixed(3) + ')';
      var sz = s.z > 0.85 ? 1.6 : 1;
      ctx.fillRect(s.x, y, sz, sz);
    });

    // place the galaxies on their orbit
    gals.forEach(function(g){
      var th = g.base + time * 0.035, sn = Math.sin(th);
      g.depth = sn;
      g.x = cam.x + Math.cos(th) * cam.S;
      g.y = cam.y + sn * cam.S * TILT;
      g.size = cam.S * 0.27 * (0.8 + 0.3 * (sn + 1) / 2);
    });
    var order = gals.slice().sort(function(a, b){ return a.depth - b.depth; });

    drawCorridors(cam);
    order.forEach(function(g){ if(g.depth <= 0) drawGalaxy(g, L); });
    drawMotes(cam, false, dt, L);
    drawHole(cam);
    drawMotes(cam, true, dt, L);
    order.forEach(function(g){ if(g.depth > 0) drawGalaxy(g, L); });

    ctx.globalCompositeOperation = 'source-over';
    drawFog(L, dt, cam);
    ctx.globalCompositeOperation = 'lighter';
    drawLight(L);
    ctx.globalCompositeOperation = 'source-over';
    order.forEach(drawLabel);

    // the page's sections dim the sky behind them
    if(view.dim < 0.999){
      ctx.fillStyle = 'rgba(4,6,15,' + (1 - view.dim).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  function frame(t){
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    time += dt;
    draw(dt);
    raf = requestAnimationFrame(frame);
  }
  function running(){ return !host.classList.contains('hidden') && !document.hidden && !reducedMotion(); }
  function sync(){
    if(running() && !raf){ last = 0; raf = requestAnimationFrame(frame); }
    else if(!running() && raf){ cancelAnimationFrame(raf); raf = 0; }
    if(!raf) draw(0);
  }

  // Which galaxy is under (x, y), front ones first.
  function galaxyAt(x, y){
    var best = -1, bestDepth = -2;
    gals.forEach(function(g, i){
      var dx = x - g.x, dy = y - g.y;
      if(dx * dx + dy * dy < g.size * g.size * 0.8 && g.depth > bestDepth){ best = i; bestDepth = g.depth; }
    });
    return best;
  }

  host.addEventListener('pointermove', function(e){
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.at = performance.now();
    if(e.pointerType === 'mouse' || e.pointerType === 'pen') pointer.seen = true;
    hover = view.dim > 0.8 && !e.target.closest('button, a, input, label, .home-card, .home-panel') ? galaxyAt(e.clientX, e.clientY) : -1;
    host.classList.toggle('over-galaxy', hover >= 0);
    if(!raf) draw(0);
  });
  host.addEventListener('pointerdown', function(e){
    // a tap moves the light there for a while
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.at = performance.now(); pointer.seen = true;
  });
  host.addEventListener('click', function(e){
    if(hover < 0 || !onPick || e.target.closest('button, a, input, label')) return;
    onPick(gals[hover].id);
  });
  window.addEventListener('resize', function(){ resize(); motes = []; sync(); });
  window.addEventListener('vx-a11y', sync);
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(host, { attributes: true, attributeFilter: ['class'] });

  resize();
  sync();

  return {
    setView: function(v, now){
      Object.keys(v).forEach(function(k){ goal[k] = v[k]; if(now) view[k] = v[k]; });
      if(!raf) draw(0);
    },
    setProgress: function(list){
      list.forEach(function(g, i){ if(gals[i]) gals[i].frac = g.frac || 0; });
      if(!raf) draw(0);
    },
    onPick: function(fn){ onPick = fn; },
    hovered: function(){ return hover >= 0 ? gals[hover].id : null; }
  };
}
