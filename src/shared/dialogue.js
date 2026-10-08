import { GUIDES, guideAvatarHtml } from './guides.js';

// A short conversation between the guides, one line at a time.
// lines: [{ who: 'luma'|'aura', text }]. opts: { eyebrow, doneLabel, onDone }.
// onDone runs whether the player reads to the end or skips.
var root = document.createElement('div');
root.id = 'dialogue';
root.setAttribute('role', 'dialog');
root.setAttribute('aria-modal', 'true');
root.innerHTML =
  '<div class="dlg-card">' +
    '<div class="dlg-eyebrow hud-eyebrow"></div>' +
    '<div class="dlg-body">' +
      '<div class="dlg-who"></div>' +
      '<p class="dlg-text" aria-live="polite"></p>' +
    '</div>' +
    '<div class="dlg-foot">' +
      '<div class="dlg-dots"></div>' +
      '<button type="button" class="btn-secondary dlg-skip">Saltar</button>' +
      '<button type="button" class="btn-primary dlg-next"></button>' +
    '</div>' +
  '</div>';
document.body.appendChild(root);

var el = {
  card: root.querySelector('.dlg-card'), eyebrow: root.querySelector('.dlg-eyebrow'),
  who: root.querySelector('.dlg-who'), text: root.querySelector('.dlg-text'),
  dots: root.querySelector('.dlg-dots'), skip: root.querySelector('.dlg-skip'), next: root.querySelector('.dlg-next')
};
var cur = null;

function render(){
  var line = cur.lines[cur.i], g = GUIDES[line.who], last = cur.i === cur.lines.length - 1;
  el.card.className = 'dlg-card ' + line.who;
  el.who.innerHTML = guideAvatarHtml(line.who) + '<span><b>' + g.name + '</b><i>' + g.role + '</i></span>';
  el.text.innerHTML = line.text;
  var dots = '';
  for(var i = 0; i < cur.lines.length; i++) dots += '<span class="' + (i === cur.i ? 'on' : '') + '"></span>';
  el.dots.innerHTML = dots;
  el.next.textContent = last ? cur.doneLabel : 'Siguiente →';
  el.skip.hidden = last;
  // restart the line's entrance animation
  el.card.classList.remove('enter'); void el.card.offsetWidth; el.card.classList.add('enter');
}

function finish(){
  if(!cur) return;
  var done = cur.onDone;
  cur = null;
  root.classList.remove('open');
  document.removeEventListener('keydown', onKey);
  if(done) done();
}

function advance(){
  if(!cur) return;
  if(cur.i >= cur.lines.length - 1){ finish(); return; }
  cur.i++;
  render();
}

function onKey(e){
  if(e.key === 'Escape'){ e.preventDefault(); finish(); }
  else if(e.key === 'ArrowRight'){ e.preventDefault(); advance(); }
}

el.next.addEventListener('click', advance);
el.skip.addEventListener('click', finish);

export function showDialogue(lines, opts){
  opts = opts || {};
  cur = { lines: lines, i: 0, onDone: opts.onDone, doneLabel: opts.doneLabel || 'Continuar' };
  el.eyebrow.textContent = opts.eyebrow || '';
  root.classList.add('open');
  document.addEventListener('keydown', onKey);
  render();
  el.next.focus();
}

export function isDialogueOpen(){ return !!cur; }
