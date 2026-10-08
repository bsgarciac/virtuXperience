// The galaxy-select backdrop: a 3D star field flying towards the viewer.
// Each star has a depth z; it drifts closer every frame and is projected
// with x / z, so it speeds up, grows and brightens as it approaches, then
// respawns far away. Stars also twinkle, and the vanishing point leans a
// little towards the pointer.
//
// One <canvas>, no DOM per star. The loop only runs while `host` is shown
// and the tab is visible; with prefers-reduced-motion it paints one still
// frame (no flight, no twinkle).

var DEPTH = 1000;      // far plane
var NEAR = 40;         // a star closer than this respawns far away
var SPEED = 60;        // depth units per second
var TINTS = ['255,255,255', '255,255,255', '255,255,255', '200,225,255', '255,236,200', '205,190,255'];

export function startStarfield(canvas, host){
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, dpr = 1, stars = [], raf = 0, last = 0;
  var lean = { x: 0, y: 0 }, leanTarget = { x: 0, y: 0 };

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
    var n = Math.max(200, Math.min(650, Math.round(W * H / 2200)));
    stars = [];
    for(var i = 0; i < n; i++) stars.push(spawn({}, true));
    if(reduce || !raf) draw(0, 0);
  }

  function draw(t, dt){
    ctx.clearRect(0, 0, W, H);
    lean.x += (leanTarget.x - lean.x) * 0.04;
    lean.y += (leanTarget.y - lean.y) * 0.04;
    var cx = W / 2 + lean.x, cy = H * 0.45 + lean.y, f = Math.min(W, H) * 0.9;
    for(var i = 0; i < stars.length; i++){
      var s = stars[i];
      if(!reduce){
        s.z -= SPEED * dt;
        if(s.z < NEAR){ spawn(s, false); continue; }
      }
      var sx = cx + s.x / s.z * f, sy = cy + s.y / s.z * f;
      if(sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20){ spawn(s, false); continue; }
      var near = 1 - s.z / DEPTH;                         // 0 far … 1 close
      var fadeIn = Math.min(1, (DEPTH - s.z) / 80);        // don't pop in
      var twinkle = reduce ? 1 : 0.6 + 0.4 * Math.sin(t / 1000 * s.tws + s.tw);
      var a = Math.min(1, 0.4 + near * 0.7) * twinkle * fadeIn;
      var r = 0.6 + near * near * 2.3;
      if(s.px && near > 0.45){
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
}
