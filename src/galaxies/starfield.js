// The galaxy-select backdrop: a 3D star field flying towards the viewer.
// Each star has a depth z; it drifts closer every frame and is projected
// with x / z, so it speeds up, grows and brightens as it approaches, then
// respawns far away. Stars also twinkle, and the vanishing point leans a
// little towards the pointer.
//
// Behind the stars, soft nebulae in the galaxies' colours drift and
// breathe; now and then a shooting star crosses the sky. setBoost(k)
// speeds the flight up (hovering a galaxy, and the launch into one).
//
// One <canvas>, no DOM per star. The loop only runs while `host` is shown
// and the tab is visible; with prefers-reduced-motion it paints one still
// frame (no flight, no twinkle).

var DEPTH = 1000;      // far plane
var NEAR = 40;         // a star closer than this respawns far away
var SPEED = 60;        // depth units per second
var TINTS = ['255,255,255', '255,255,255', '255,255,255', '200,225,255', '255,236,200', '205,190,255'];
var NEBULAE = ['#57d9c9', '#9b8cf2', '#ff6fae', '#6c8cff', '#ffa94d', '#f5c84c'];

export function startStarfield(canvas, host){
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1, stars = [], raf = 0, last = 0;
  var lean = { x: 0, y: 0 }, leanTarget = { x: 0, y: 0 };
  var boost = 1, boostTarget = 1;
  var clouds = [], meteors = [], nextMeteor = 1500;

  // Each nebula is pre-rendered once as a blurred blob of a few lobes.
  function makeCloud(i){
    var size = Math.round(Math.max(W, H) * (0.45 + Math.random() * 0.3));
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d'), hex = NEBULAE[i % NEBULAE.length];
    var rgb = [1, 3, 5].map(function(k){ return parseInt(hex.slice(k, k + 2), 16); }).join(',');
    for(var l = 0; l < 5; l++){
      var x = size * (0.3 + Math.random() * 0.4), y = size * (0.3 + Math.random() * 0.4), r = size * (0.18 + Math.random() * 0.22);
      var grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(' + rgb + ',.22)');
      grad.addColorStop(1, 'rgba(' + rgb + ',0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
    }
    return { img: c, size: size, x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 4,
      ph: Math.random() * Math.PI * 2, base: 0.35 + Math.random() * 0.3 };
  }

  function spawnMeteor(){
    var fromLeft = Math.random() < 0.5, ang = (fromLeft ? 0.35 : Math.PI - 0.35) + (Math.random() - 0.5) * 0.3;
    meteors.push({ x: fromLeft ? Math.random() * W * 0.6 : W * 0.4 + Math.random() * W * 0.6, y: Math.random() * H * 0.35,
      vx: Math.cos(ang) * 900, vy: Math.sin(ang) * 900, life: 0, max: 0.7 + Math.random() * 0.5, len: 130 + Math.random() * 120 });
  }

  function spawn(s, anyDepth){
    s.x = (Math.random() * 2 - 1) * W;
    s.y = (Math.random() * 2 - 1) * H;
    s.z = anyDepth ? NEAR + Math.random() * (DEPTH - NEAR) : DEPTH;
    s.px = null; // last projected position, for the short trail
    s.tw = Math.random() * Math.PI * 2;
    s.tws = 1.5 + Math.random() * 3;
    s.tint = TINTS[(Math.random() * TINTS.length) | 0];
    return s;
  }

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.max(260, Math.min(900, Math.round(W * H / 1500)));
    clouds = [];
    for(var c = 0; c < 4; c++) clouds.push(makeCloud(c + ((Math.random() * 6) | 0)));
    stars = [];
    for(var i = 0; i < n; i++) stars.push(spawn({}, true));
    if(reduce || !raf) draw(0, 0);
  }

  function draw(t, dt){
    ctx.clearRect(0, 0, W, H);
    boost += (boostTarget - boost) * Math.min(1, dt * 4);
    // nebulae: drifting, breathing, wrapping around the edges
    ctx.globalCompositeOperation = 'lighter';
    clouds.forEach(function(c){
      if(!reduce){
        c.x += c.vx * dt; c.y += c.vy * dt;
        if(c.x < -c.size / 2) c.x += W + c.size; if(c.x > W + c.size / 2) c.x -= W + c.size;
        if(c.y < -c.size / 2) c.y += H + c.size; if(c.y > H + c.size / 2) c.y -= H + c.size;
      }
      ctx.globalAlpha = c.base * (reduce ? 1 : 0.75 + 0.25 * Math.sin(t / 4000 + c.ph));
      ctx.drawImage(c.img, c.x - c.size / 2 + lean.x * 0.3, c.y - c.size / 2 + lean.y * 0.3);
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    lean.x += (leanTarget.x - lean.x) * 0.04;
    lean.y += (leanTarget.y - lean.y) * 0.04;
    var cx = W / 2 + lean.x, cy = H * 0.45 + lean.y, f = Math.min(W, H) * 0.9;
    for(var i = 0; i < stars.length; i++){
      var s = stars[i];
      if(!reduce){
        s.z -= SPEED * boost * dt;
        if(s.z < NEAR){ spawn(s, false); continue; }
      }
      var sx = cx + s.x / s.z * f, sy = cy + s.y / s.z * f;
      if(sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20){ spawn(s, false); continue; }
      var near = 1 - s.z / DEPTH;                         // 0 far … 1 close
      var fadeIn = Math.min(1, (DEPTH - s.z) / 80);        // don't pop in
      var twinkle = reduce ? 1 : 0.6 + 0.4 * Math.sin(t / 1000 * s.tws + s.tw);
      var a = Math.min(1, 0.4 + near * 0.7) * twinkle * fadeIn;
      var r = 0.6 + near * near * 2.3;
      if(s.px && (near > 0.45 || boost > 2)){
        // close stars leave a faint streak back towards the centre
        ctx.strokeStyle = 'rgba(' + s.tint + ',' + (a * 0.35).toFixed(3) + ')';
        ctx.lineWidth = r;
        ctx.beginPath(); ctx.moveTo(s.px, s.py); ctx.lineTo(sx, sy); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(' + s.tint + ',' + a.toFixed(3) + ')';
      if(r < 1.1) ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
      else { ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill(); }
      s.px = sx; s.py = sy;
    }
    if(reduce) return;
    // shooting stars
    nextMeteor -= dt * 1000;
    if(nextMeteor <= 0){ spawnMeteor(); nextMeteor = 2500 + Math.random() * 4500; }
    for(var m = meteors.length - 1; m >= 0; m--){
      var mt = meteors[m];
      mt.life += dt; mt.x += mt.vx * dt; mt.y += mt.vy * dt;
      var k = mt.life / mt.max;
      if(k >= 1){ meteors.splice(m, 1); continue; }
      var fade = Math.sin(k * Math.PI), sp = Math.hypot(mt.vx, mt.vy);
      var tx = mt.x - mt.vx / sp * mt.len, ty = mt.y - mt.vy / sp * mt.len;
      var grad = ctx.createLinearGradient(tx, ty, mt.x, mt.y);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, 'rgba(255,246,220,' + (0.9 * fade).toFixed(3) + ')');
      ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(mt.x, mt.y); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,' + fade.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(mt.x, mt.y, 2.2, 0, Math.PI * 2); ctx.fill();
    }
  }

  function frame(t){
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    draw(t, dt);
    raf = requestAnimationFrame(frame);
  }

  function running(){ return !host.classList.contains('hidden') && !document.hidden; }
  function sync(){
    if(reduce) return;
    if(running() && !raf){ last = 0; raf = requestAnimationFrame(frame); }
    else if(!running() && raf){ cancelAnimationFrame(raf); raf = 0; }
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(host, { attributes: true, attributeFilter: ['class'] });
  host.addEventListener('pointermove', function(e){
    leanTarget.x = (e.clientX / W - 0.5) * -60;
    leanTarget.y = (e.clientY / H - 0.5) * -40;
  });

  resize();
  sync();

  return { setBoost: function(k){ boostTarget = k; } };
}
