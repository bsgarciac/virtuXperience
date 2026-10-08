import { ISLANDS } from './data.js';
import { isDone, resetState } from './progress.js';
import { mapRef } from './map-ref.js';
import { showToast } from '../../shared/toast.js';
import { notifyHost } from '../../shared/host.js';
import { showIntro, resetStory } from './story.js';

var elProgressFill = document.getElementById('progress-fill');
var elProgressLabel = document.getElementById('progress-label');
var elProgressPct = document.getElementById('progress-pct');
export function refreshHud(){
  var count = ISLANDS.filter(function(i){ return isDone(i.id); }).length; // ignores stale saved ids
  var pct = Math.round(count / ISLANDS.length * 100);
  elProgressFill.style.width = pct + '%';
  elProgressLabel.textContent = count + '/' + ISLANDS.length + ' islas';
  elProgressPct.textContent = pct + '%';
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
    showToast('Progreso reiniciado. La neblina volvió a cubrir el sector.');
  }
});

document.getElementById('btn-story').addEventListener('click', function(){ showIntro(); });
