import { GALAXIES } from './catalog.js';
import { showToast } from '../shared/toast.js';
import { galaxySvg } from './galaxy-art.js';
import { startStarfield } from './starfield.js';
import { sfx, warp } from '../shared/fx.js';
import { startVortex, hackStates, openVortex } from './vortex.js';

var galaxySelect = document.getElementById('galaxy-select');
var galaxyGrid = document.getElementById('galaxy-grid');
var galaxyStars = document.getElementById('galaxy-stars');

var stars = startStarfield(galaxyStars, galaxySelect);

// The black hole sits in the middle of the grid, between the two rows of
// galaxies; a Corredor Cuántico joins each galaxy to it (vortex.js).
var SVG_NS = 'http://www.w3.org/2000/svg';
var corridors = document.createElementNS(SVG_NS, 'svg');
corridors.setAttribute('class', 'galaxy-corridors');
corridors.setAttribute('aria-hidden', 'true');
var vortexBtn = document.createElement('button');
vortexBtn.type = 'button';
vortexBtn.className = 'galaxy-vortex';
vortexBtn.innerHTML =
  '<canvas class="vortex-canvas" aria-hidden="true"></canvas>' +
  '<span class="vortex-label">Interferencia Estática</span>' +
  '<span class="vortex-sub"></span>';
var vortex = null;
var cards = [];

// Each corridor: grey and pulling inward (dashes flowing to the hole), the
// galaxy's colour showing through as it is restored, and once its Hack is
// stable, solid colour flowing back out.
function drawCorridors(){
  var box = galaxyGrid.getBoundingClientRect();
  var hole = vortexBtn.querySelector('canvas').getBoundingClientRect();
  if(!box.width || !hole.width) return;
  var hx = hole.left + hole.width / 2 - box.left, hy = hole.top + hole.height / 2 - box.top;
  var states = hackStates(), html = '';
  corridors.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
  cards.forEach(function(c, i){
    var art = c.btn.querySelector('.galaxy-art').getBoundingClientRect();
    var x = art.left + art.width / 2 - box.left, y = art.top + art.height / 2 - box.top;
    var mx = (x + hx) / 2 + (hy - y) * 0.18, my = (y + hy) / 2 + (x - hx) * 0.18;
    var d = 'M' + x.toFixed(1) + ',' + y.toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + hx.toFixed(1) + ',' + hy.toFixed(1);
    var g = states[i];
    html += '<path class="cor-base" d="' + d + '"/>';
    if(g.stable) html += '<path class="cor-glow" d="' + d + '" style="stroke:' + g.colors.g1 + '"/>';
    if(g.frac > 0) html += '<path class="cor-color' + (g.stable ? ' stable' : '') + '" d="' + d + '" style="stroke:' + g.colors.g1 + ';opacity:' + (0.25 + 0.75 * g.frac).toFixed(2) + '"/>';
  });
  corridors.innerHTML = html;
}

// Re-reads progress: the hole, the corridors and each card's count.
function refreshCenter(){
  var states = hackStates();
  var k = states.filter(function(g){ return g.stable; }).length;
  vortexBtn.querySelector('.vortex-sub').textContent = k + '/' + states.length + ' Hacks estables · Toca para saber más';
  vortexBtn.setAttribute('aria-label', 'Interferencia Estática: ' + k + ' de ' + states.length + ' Hacks de Sintonía estables. Abrir.');
  cards.forEach(function(c, i){
    var g = states[i];
    c.prog.textContent = g.stable ? '✓ Hack estable' : (g.done ? g.done + '/' + g.total + ' nodos' : '');
  });
  if(vortex) vortex.refresh();
  drawCorridors();
}

// Replays the cards' entrance each time the screen opens.
function playEntrance(){
  galaxySelect.classList.remove('entering', 'leaving');
  void galaxySelect.offsetWidth;
  galaxySelect.classList.add('entering');
}

var enter = null; // onEnter from initGalaxySelect
var busy = false;  // a jump is under way

// The chosen galaxy swells, the rest fade, and a hyperspace jump carries the
// player into its solar system. btn is its card (none when the jump starts
// from the home page); atMid runs when the jump hides the screen.
function launch(g, btn, atMid){
  if(busy) return;
  busy = true;
  if(btn) btn.classList.add('chosen');
  galaxySelect.classList.remove('entering');
  galaxySelect.classList.add('leaving');
  stars.setBoost(14);
  sfx('whoosh');
  warp([g.colors.g1, g.colors.g2, g.colors.g3 || '#ffffff'], function(){
    galaxySelect.classList.add('hidden');
    stars.setBoost(1);
    if(btn) btn.classList.remove('chosen');
    busy = false;
    if(atMid) atMid();
    enter(g);
  });
}

// Straight into a galaxy by id (the home page's galaxies).
export function enterGalaxy(id, atMid){
  var g = GALAXIES.find(function(x){ return x.id === id; });
  if(g && g.enabled && enter) launch(g, null, atMid);
}

// onEnter(galaxy) runs when the player picks an enabled galaxy.
export function initGalaxySelect(onEnter){
  enter = onEnter;
  GALAXIES.forEach(function(g, i){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'galaxy-card' + (g.enabled ? '' : ' locked');
    btn.style.setProperty('--g1', g.colors.g1);
    btn.style.setProperty('--g2', g.colors.g2);
    if(g.colors.g3) btn.style.setProperty('--g3', g.colors.g3);
    btn.style.setProperty('--i', i);
    btn.innerHTML =
      '<span class="galaxy-orb-wrap">' +
        galaxySvg(g, g.enabled) +
        (g.enabled ? '' : '<span class="galaxy-lock">🔒</span>') +
      '</span>' +
      '<span class="galaxy-name">' + g.name + '</span>' +
      '<span class="galaxy-sub">' + g.sub + '</span>' +
      '<span class="galaxy-prog"></span>';
    btn.style.gridArea = 'g' + i;
    // Hovering a galaxy speeds the stars up, as if the ship leaned towards it.
    btn.addEventListener('mouseenter', function(){ if(g.enabled && !busy){ sfx('hover'); stars.setBoost(3); } });
    btn.addEventListener('mouseleave', function(){ if(!busy) stars.setBoost(1); });
    btn.addEventListener('click', function(){
      if(!g.enabled){ showToast('🔒 La galaxia ' + g.name + ' se abrirá pronto.'); return; }
      launch(g, btn);
    });
    galaxyGrid.appendChild(btn);
    cards.push({ btn: btn, prog: btn.querySelector('.galaxy-prog') });
    // the hole comes after the first row, so Tab reaches it in reading order
    if(i === 2) galaxyGrid.appendChild(vortexBtn);
  });
  galaxyGrid.insertBefore(corridors, galaxyGrid.firstChild);
  vortex = startVortex(vortexBtn.querySelector('canvas'), galaxySelect);
  vortexBtn.addEventListener('mouseenter', function(){ if(!busy){ sfx('hover'); stars.setBoost(0.4); } });
  vortexBtn.addEventListener('mouseleave', function(){ if(!busy) stars.setBoost(1); });
  vortexBtn.addEventListener('click', function(){ if(!busy) openVortex(); });
  if(window.ResizeObserver) new ResizeObserver(drawCorridors).observe(galaxyGrid);
  refreshCenter();
}

// Back to the select screen, through a hyperspace jump in the colours given
// (the galaxy the player is leaving); without colours it just appears.
export function openGalaxySelect(colors){
  function show(){
    galaxySelect.classList.remove('hidden');
    refreshCenter();
    playEntrance();
  }
  if(!colors){ show(); return; }
  sfx('whoosh');
  warp(colors, show);
}

playEntrance();
