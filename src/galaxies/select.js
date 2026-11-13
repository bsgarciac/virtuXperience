import { GALAXIES } from './catalog.js';
import { showToast } from '../shared/toast.js';
import { galaxySvg } from './galaxy-art.js';
import { startStarfield } from './starfield.js';
import { sfx, warp } from '../shared/fx.js';

var galaxySelect = document.getElementById('galaxy-select');
var galaxyGrid = document.getElementById('galaxy-grid');
var galaxyStars = document.getElementById('galaxy-stars');

startStarfield(galaxyStars, galaxySelect);

// Replays the cards' entrance each time the screen opens.
function playEntrance(){
  galaxySelect.classList.remove('entering', 'leaving');
  void galaxySelect.offsetWidth;
  galaxySelect.classList.add('entering');
}

// onEnter(galaxy) runs when the player picks an enabled galaxy.
export function initGalaxySelect(onEnter){
  var busy = false; // a jump is under way
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
      '<span class="galaxy-sub">' + g.sub + '</span>';
    btn.addEventListener('mouseenter', function(){ if(g.enabled && !busy) sfx('hover'); });
    btn.addEventListener('click', function(){
      if(!g.enabled){ showToast('🔒 La galaxia ' + g.name + ' se abrirá pronto.'); return; }
      if(busy) return;
      // The chosen galaxy swells, the rest fade, and a hyperspace jump
      // carries the player into its solar system.
      busy = true;
      btn.classList.add('chosen');
      galaxySelect.classList.remove('entering');
      galaxySelect.classList.add('leaving');
      sfx('whoosh');
      warp([g.colors.g1, g.colors.g2, g.colors.g3 || '#ffffff'], function(){
        galaxySelect.classList.add('hidden');
        btn.classList.remove('chosen');
        busy = false;
        onEnter(g);
      });
    });
    galaxyGrid.appendChild(btn);
  });
}

// Back to the select screen, through a hyperspace jump in the colours given
// (the galaxy the player is leaving); without colours it just appears.
export function openGalaxySelect(colors){
  function show(){
    galaxySelect.classList.remove('hidden');
    playEntrance();
  }
  if(!colors){ show(); return; }
  sfx('whoosh');
  warp(colors, show);
}

playEntrance();
