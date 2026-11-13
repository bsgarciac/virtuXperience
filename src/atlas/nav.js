import { galaxy } from './world.js';
import { mapRef } from './map-ref.js';
import { GALAXIES } from '../galaxies/catalog.js';
import { galaxySvg } from '../galaxies/galaxy-art.js';
import { openGalaxySelect } from '../galaxies/select.js';
import { sfx } from '../shared/fx.js';

// The two portholes over the map: top left, a mini view of the galaxy's
// solar system (only on a planet: clicking it flies back out to the
// system); top right, the current galaxy turning (clicking it jumps
// through hyperspace to the galaxy select screen).

var sysBtn = document.getElementById('btn-back');
var galBtn = document.getElementById('btn-galaxies');

function f1(n){ return n.toFixed(1); }

// The galaxy's system in miniature: the sun, one orbit per planet and the
// planets going round (SVG animateMotion), the current one ringed.
function systemMiniSvg(g, planetId){
  var n = g.planets.length, html = '';
  html += '<circle r="15" fill="#f2a34d" opacity=".18"/><circle r="8" fill="#f2b84b"/><circle cx="-2" cy="-2.4" r="4" fill="#ffe3a3" opacity=".8"/>';
  g.planets.forEach(function(p, i){
    var rx = n === 1 ? 30 : 15 + 30 * i / (n - 1), ry = rx * 0.62;
    var path = 'M' + f1(-rx) + ',0 a' + f1(rx) + ',' + f1(ry) + ' 0 1,0 ' + f1(rx * 2) + ',0 a' + f1(rx) + ',' + f1(ry) + ' 0 1,0 ' + f1(-rx * 2) + ',0';
    var here = p.id === planetId;
    html += '<path d="' + path + '" fill="none" stroke="' + p.color + '" stroke-opacity=".35" stroke-width=".8"/>';
    html += '<g>' +
      (here ? '<circle r="7" fill="none" stroke="#fff" stroke-width="1.2" class="nav-here"/>' : '') +
      '<circle r="' + (here ? 4.6 : 3.2) + '" fill="' + p.color + '"/>' +
      '<animateMotion dur="' + (9 + i * 4) + 's" begin="-' + (i * 2.3).toFixed(1) + 's" repeatCount="indefinite" path="' + path + '"/>' +
    '</g>';
  });
  return '<svg viewBox="-50 -50 100 100" aria-hidden="true">' + html + '</svg>';
}

function portholeHtml(art, label, sub){
  return '<span class="nav-port">' + art + '</span>' +
    '<span class="nav-label"><b>' + label + '</b><i>' + sub + '</i></span>';
}

// Called by the island scene when it opens (planet) and closes (null).
export function showSystemNav(planet){
  if(!planet){ sysBtn.hidden = true; return; }
  var g = planet.galaxy;
  sysBtn.innerHTML = portholeHtml(systemMiniSvg(g, planet.id), 'Sistema ' + g.name, '← Volver al sistema');
  sysBtn.setAttribute('aria-label', 'Volver al sistema ' + g.name);
  sysBtn.hidden = false;
}

// Called whenever the player enters a galaxy.
export function refreshGalaxyNav(){
  var g = galaxy(), entry = GALAXIES.find(function(c){ return c.id === g.id; });
  galBtn.innerHTML = portholeHtml(entry ? galaxySvg(entry, true) : '', 'Galaxias', 'Viajar a otra galaxia →');
  galBtn.setAttribute('aria-label', 'Viajar a otra galaxia');
}

function launch(btn){
  btn.classList.remove('launch'); void btn.offsetWidth; btn.classList.add('launch');
}

sysBtn.addEventListener('click', function(){
  if(!mapRef.scene || !mapRef.scene.goBack) return;
  launch(sysBtn);
  mapRef.scene.goBack();
});

galBtn.addEventListener('click', function(){
  launch(galBtn);
  var entry = GALAXIES.find(function(c){ return c.id === galaxy().id; });
  openGalaxySelect(entry ? [entry.colors.g1, entry.colors.g2, entry.colors.g3 || '#ffffff'] : null);
});

sysBtn.addEventListener('mouseenter', function(){ sfx('hover'); });
galBtn.addEventListener('mouseenter', function(){ sfx('hover'); });
