// Procedural spiral-galaxy art for the galaxy-select cards: a soft halo, a
// few blurred spiral arms with crisp stars scattered along them, and a bright
// core, all in the galaxy's own colours. Seeded by the galaxy id, so each one
// keeps the same shape (arm count, twist, tilt) on every load.

function seeded(str){
  var h = 2166136261;
  for(var i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function(){
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex){
  var n = parseInt(hex.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
// Colour at t (0..1) along the stops, as rgb().
function mix(stops, t){
  var seg = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
  var local = t * (stops.length - 1) - seg;
  var a = stops[seg], b = stops[seg + 1];
  return 'rgb(' + [0, 1, 2].map(function(k){ return Math.round(a[k] + (b[k] - a[k]) * local); }).join(',') + ')';
}

function f1(n){ return n.toFixed(1); }

// animate: whether the arms slowly turn (off for locked galaxies; CSS also
// stops it when the player prefers reduced motion).
export function galaxySvg(g, animate){
  var rand = seeded(g.id);
  var uid = 'gx-' + g.id;
  var stops = [g.colors.g3 || g.colors.g1, g.colors.g1, g.colors.g2].map(hexToRgb);
  var arms = rand() < 0.5 ? 2 : 3;
  var twist = 3.4 + rand() * 1.4;
  var tilt = 0.55 + rand() * 0.2;
  var angle = Math.round(rand() * 180 - 90);

  var glow = '', stars = '';
  for(var a = 0; a < arms; a++){
    var base = a / arms * Math.PI * 2;
    for(var k = 0; k < 70; k++){
      var t = k / 70;
      var th = base + t * twist;
      var r = 7 + t * 84;
      var x = Math.cos(th) * r, y = Math.sin(th) * r;
      var col = mix(stops, t);
      if(k % 3 === 0){
        glow += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(11 - t * 7) + '" fill="' + col + '" opacity="' + f1(0.55 - t * 0.35) + '"/>';
      }
      // a couple of stars per step, scattered around the arm
      for(var s = 0; s < 2; s++){
        var spread = 4 + t * 12;
        var sx = x + (rand() - 0.5) * spread, sy = y + (rand() - 0.5) * spread;
        var sr = 0.5 + rand() * (1.6 - t);
        stars += '<circle cx="' + f1(sx) + '" cy="' + f1(sy) + '" r="' + f1(sr) + '" fill="' + (rand() < 0.3 ? '#fff' : col) + '" opacity="' + f1(0.5 + rand() * 0.5) + '"/>';
      }
    }
  }
  // loose halo stars
  for(var d = 0; d < 40; d++){
    var hr = 20 + rand() * 75, ha = rand() * Math.PI * 2;
    stars += '<circle cx="' + f1(Math.cos(ha) * hr) + '" cy="' + f1(Math.sin(ha) * hr) + '" r="' + f1(0.4 + rand() * 0.7) + '" fill="#fff" opacity="' + f1(0.25 + rand() * 0.45) + '"/>';
  }

  // One turn every ~40 s, each galaxy at its own pace (galaxy-select.css).
  var spin = animate ? ' class="galaxy-spin" style="--spin:' + (36 + Math.round(rand() * 12)) + 's"' : '';

  return '<svg class="galaxy-art" viewBox="-100 -100 200 200" aria-hidden="true">' +
    '<defs>' +
      '<radialGradient id="' + uid + '-halo"><stop offset="0" stop-color="' + g.colors.g1 + '" stop-opacity=".45"/><stop offset=".55" stop-color="' + g.colors.g2 + '" stop-opacity=".14"/><stop offset="1" stop-color="' + g.colors.g2 + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + uid + '-core"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="' + (g.colors.g3 || g.colors.g1) + '" stop-opacity=".9"/><stop offset="1" stop-color="' + g.colors.g1 + '" stop-opacity="0"/></radialGradient>' +
      '<filter id="' + uid + '-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>' +
    '</defs>' +
    '<g transform="rotate(' + angle + ') scale(1 ' + f1(tilt) + ')">' +
      '<circle r="98" fill="url(#' + uid + '-halo)"/>' +
      '<g' + spin + '>' +
        '<g filter="url(#' + uid + '-blur)">' + glow + '</g>' +
        stars +
      '</g>' +
      '<circle r="26" fill="url(#' + uid + '-core)"/>' +
    '</g>' +
  '</svg>';
}
