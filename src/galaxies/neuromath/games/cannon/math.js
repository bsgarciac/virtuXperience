// Math for the cannon: the shot follows f(x) = a·x² + b·x + c from the
// cannon at x = 0. Pure functions, no DOM — scripts/check-cannon.js uses them.

var EPS = 1e-9;

export var PARAMS = ['a', 'b', 'c'];

// Numbers the Colombian way: comma decimals, real minus sign.
export function fmt(n){
  var r = Math.round(n * 100) / 100;
  var s = String(Math.abs(r)).replace('.', ',');
  return (r < 0 ? '−' : '') + s;
}

// A point, "(3, 9)"; with decimals the separator becomes ";" so the comma
// stays unambiguous: "(0,5; 2,25)".
export function pt(x, y){
  var whole = Math.round(x * 100) % 100 === 0 && Math.round(y * 100) % 100 === 0;
  return '(' + fmt(x) + (whole ? ', ' : '; ') + fmt(y) + ')';
}

export function f(p, x){ return p.a * x * x + p.b * x + p.c; }
export function slope(p, x){ return 2 * p.a * x + p.b; }
export function vertex(p){ var h = -p.b / (2 * p.a); return { x: h, y: f(p, h) }; }

// The first x > 0 where the shot comes back down to the ground (f(x) = 0),
// or null if it never does (a ≥ 0). With c = 0 and b ≤ 0 it never takes off: 0.
export function landing(p){
  if(p.a >= 0) return null;
  if(Math.abs(p.c) < EPS) return p.b > 0 ? -p.b / p.a : 0;
  var disc = p.b * p.b - 4 * p.a * p.c;
  if(disc < 0) return null;
  var r1 = (-p.b + Math.sqrt(disc)) / (2 * p.a), r2 = (-p.b - Math.sqrt(disc)) / (2 * p.a);
  var r = Math.max(r1, r2);
  return r > 0 ? r : 0;
}

// Where the shot ends up, checked in order along its path:
//   ground   lands before (or at the foot of) the wall { x: landing }
//   rock     hits the rock in front of the wall      { x, y }
//   over     clears the wall entirely                { x: wall, y: f(w), land }
//   wall     hits the wall, away from the crack      { x: wall, y: f(w) }
//   glancing hits the crack, but not horizontally    { x: wall, y, slope }
//   crack    breaks the crack                        { x: wall, y }
export function simulate(level, p){
  var w = level.wall.x, r = landing(p);
  // the rock comes first if the shot is still in the air when it gets there
  if(level.rock && (r === null || level.rock.x < r - EPS)){
    var yr = f(p, level.rock.x);
    if(yr < level.rock.h - EPS) return { kind: 'rock', x: level.rock.x, y: yr };
  }
  if(r !== null && r < w + EPS) return { kind: 'ground', x: r, y: 0 };
  var y = f(p, w);
  if(y > level.wall.h + EPS) return { kind: 'over', x: w, y: y, land: r };
  if(Math.abs(y - level.crack) > EPS) return { kind: 'wall', x: w, y: y };
  var s = slope(p, w);
  if(level.horizontal && Math.abs(s) > EPS) return { kind: 'glancing', x: w, y: y, slope: s };
  return { kind: 'crack', x: w, y: y };
}

// Every value a stepper can take.
export function rangeValues(r){
  var out = [];
  for(var v = r.min; v <= r.max + EPS; v += r.step) out.push(Math.round(v * 100) / 100);
  return out;
}

// All parameter combinations the player can dial in for a level.
export function allParams(level){
  var combos = [{}];
  PARAMS.forEach(function(k){
    var vals = level.adjust[k] ? rangeValues(level.adjust[k]) : [level.fixed[k]];
    var next = [];
    combos.forEach(function(c){ vals.forEach(function(v){ var o = Object.assign({}, c); o[k] = v; next.push(o); }); });
    combos = next;
  });
  return combos;
}

export function solutions(level){
  return allParams(level).filter(function(p){ return simulate(level, p).kind === 'crack'; });
}
