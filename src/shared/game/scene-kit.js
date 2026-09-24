import { seeded } from '../random.js';

// Scene pieces shared by the mini-games, mixed into each game's Phaser scene
// with Object.assign(MyScene.prototype, SceneKit). They expect the scene to
// have set, in its layout step:
//   this.W, this.H      stage size
//   this.k              scale factor (1 ≈ a 900×430 stage)
//   this.groundY        y of the ground line
//   this.roverStartX    where the rover parks
//   this.root           a container everything is put() into
//   this.emitters       particle emitters to destroy on rebuild
export var SceneKit = {
  makeTextures: function(){
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
  },

  put: function(obj){ this.root.add(obj); return obj; },

  drawBackdrop: function(){
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
  },

  makeRover: function(){
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
  },

  makeFx: function(){
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
  },

  driveTo: function(x, dur, cb){
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
  },

  resetRover: function(){
    var r = this.rover;
    r.setPosition(this.roverStartX, this.groundY).setRotation(0).setAlpha(0);
    r.wheels.forEach(function(w){ w.rotation = 0; });
    this.tweens.add({ targets: r, alpha: 1, duration: 350 });
  },

  // Flash, confetti and golden sparks at (x, y): the "you did it" burst.
  burstAt: function(x, y){
    this.cameras.main.flash(240, 87, 217, 201);
    this.confetti.explode(80, x, y - 24 * this.k);
    this.sparks.setParticleTint(0xe8b84b);
    this.sparks.explode(26, x, y);
  }
};
