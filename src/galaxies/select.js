import { GALAXIES } from './catalog.js';
import { showToast } from '../shared/toast.js';

var galaxySelect = document.getElementById('galaxy-select');
var galaxyGrid = document.getElementById('galaxy-grid');
var galaxyStars = document.getElementById('galaxy-stars');

(function seedGalaxyStars(){
  var html = '';
  for(var i=0;i<140;i++){
    var top = Math.random()*100, left = Math.random()*100;
    var size = (Math.random()*1.6 + 0.6).toFixed(2);
    var op = (Math.random()*0.6 + 0.25).toFixed(2);
    html += '<i style="top:' + top + '%;left:' + left + '%;width:' + size + 'px;height:' + size + 'px;opacity:' + op + ';"></i>';
  }
  galaxyStars.innerHTML = html;
})();

// onEnter(galaxy) runs when the player picks an enabled galaxy.
export function initGalaxySelect(onEnter){
  GALAXIES.forEach(function(g){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'galaxy-card' + (g.enabled ? '' : ' locked');
    btn.style.setProperty('--g1', g.colors.g1);
    btn.style.setProperty('--g2', g.colors.g2);
    if(g.colors.g3) btn.style.setProperty('--g3', g.colors.g3);
    btn.innerHTML =
      '<span class="galaxy-orb-wrap">' +
        '<span class="galaxy-orb"></span>' +
        (g.enabled ? '' : '<span class="galaxy-lock">🔒</span>') +
      '</span>' +
      '<span class="galaxy-name">' + g.name + '</span>' +
      '<span class="galaxy-sub">' + g.sub + '</span>';
    btn.addEventListener('click', function(){
      if(!g.enabled){ showToast('🔒 La galaxia ' + g.name + ' se abrirá pronto.'); return; }
      galaxySelect.classList.add('hidden');
      onEnter(g);
    });
    galaxyGrid.appendChild(btn);
  });
}

document.getElementById('btn-galaxies').addEventListener('click', function(){
  galaxySelect.classList.remove('hidden');
});
