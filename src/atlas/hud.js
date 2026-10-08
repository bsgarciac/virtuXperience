import { galaxy } from './world.js';
import { isDone, resetState, cells } from './progress.js';
import { mapRef } from './map-ref.js';
import { showToast } from '../shared/toast.js';
import { notifyHost } from '../shared/host.js';
import { showIntro, resetStory } from './story.js';

var elProgressFill = document.getElementById('progress-fill');
var elProgressLabel = document.getElementById('progress-label');
var elProgressPct = document.getElementById('progress-pct');
var elCells = document.getElementById('hud-cells');
var elTitle = document.querySelector('.hud-title');
var elEmblem = document.querySelector('.hud-emblem');

// The Índice de Equilibrio is the share of the current galaxy's islands
// restored; the Células Lógicas wallet is shared by every galaxy.
export function refreshHud(){
  var g = galaxy(), islands = g.islands;
  var count = islands.filter(function(i){ return isDone(i.id); }).length; // ignores stale saved ids
  var pct = Math.round(count / islands.length * 100);
  elProgressFill.style.width = pct + '%';
  elProgressLabel.textContent = 'Equilibrio · ' + count + '/' + islands.length + ' islas';
  elProgressPct.textContent = pct + '%';
  var prev = +elCells.textContent || 0;
  elCells.textContent = cells();
  if(cells() > prev){
    var chip = elCells.parentNode;
    chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
  }
  elTitle.textContent = 'Atlas ' + g.name;
  elEmblem.textContent = g.emblem;
}

var btnInfo = document.getElementById('btn-info');
var infoPop = document.getElementById('info-pop');
btnInfo.addEventListener('click', function(){
  var open = infoPop.classList.toggle('open');
  btnInfo.setAttribute('aria-expanded', open ? 'true' : 'false');
});
document.addEventListener('click', function(e){
  if(!infoPop.contains(e.target) && e.target !== btnInfo && infoPop.classList.contains('open')){
    infoPop.classList.remove('open');
    btnInfo.setAttribute('aria-expanded','false');
  }
});

var btnReset = document.getElementById('btn-reset');
var resetArmed = false, resetTimer = null;
btnReset.addEventListener('click', function(){
  if(!resetArmed){
    resetArmed = true;
    btnReset.classList.add('confirming');
    btnReset.textContent = '¿Confirmar reinicio?';
    resetTimer = setTimeout(function(){
      resetArmed = false;
      btnReset.classList.remove('confirming');
      btnReset.textContent = '⟲ Reiniciar progreso';
    }, 3000);
  } else {
    clearTimeout(resetTimer);
    resetArmed = false;
    btnReset.classList.remove('confirming');
    btnReset.textContent = '⟲ Reiniciar progreso';
    resetState();
    resetStory();
    refreshHud();
    if(mapRef.scene) mapRef.scene.rebuild();
    notifyHost('progress-reset', {});
    showToast('Progreso reiniciado. La neblina volvió a cubrir los sectores.');
  }
});

document.getElementById('btn-story').addEventListener('click', function(){ showIntro(galaxy()); });
