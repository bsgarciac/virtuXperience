import { GUIDES, guidePortraitHtml } from './guides.js';
import { sfx, reducedMotion } from './fx.js';

// A short story scene told by the guide, one line at a time.
// lines: [{ who: 'luma', text }]. opts: { eyebrow, doneLabel, onDone }.
// onDone runs whether the player reads to the end or skips.
var root = document.createElement('div');
root.id = 'dialogue';
root.setAttribute('role', 'dialog');
root.setAttribute('aria-modal', 'true');
root.innerHTML =
  '<div class="dlg-card">' +
    '<div class="dlg-eyebrow hud-eyebrow"></div>' +
    '<div class="dlg-main">' +
      '<div class="dlg-portrait"></div>' +
      '<div class="dlg-body">' +
        '<div class="dlg-who"></div>' +
        '<p class="dlg-text" aria-live="polite"></p>' +
      '</div>' +
    '</div>' +
    '<div class="dlg-foot">' +
      '<div class="dlg-dots"></div>' +
      '<button type="button" class="btn-secondary dlg-skip">Saltar</button>' +
      '<button type="button" class="btn-primary dlg-next"></button>' +
    '</div>' +
  '</div>';
document.body.appendChild(root);

var el = {
  card: root.querySelector('.dlg-card'), eyebrow: root.querySelector('.dlg-eyebrow'), portrait: root.querySelector('.dlg-portrait'),
  who: root.querySelector('.dlg-who'), text: root.querySelector('.dlg-text'),
  dots: root.querySelector('.dlg-dots'), skip: root.querySelector('.dlg-skip'), next: root.querySelector('.dlg-next')
};
var cur = null;

// Typewriter: the line's text appears a few letters per frame (its HTML,
// like <b>, stays intact). Clicking "Siguiente" while it types finishes it.
var typing = null;
function typeLine(){
  stopTyping();
  if(reducedMotion()) return;
  var nodes = [], walker = document.createTreeWalker(el.text, NodeFilter.SHOW_TEXT);
  while(walker.nextNode()) nodes.push({ node: walker.currentNode, full: walker.currentNode.nodeValue });
  nodes.forEach(function(n){ n.node.nodeValue = ''; });
  var ni = 0, ci = 0, count = 0;
  typing = { nodes: nodes, raf: 0 };
  el.text.classList.add('typing');
  function step(){
    for(var k = 0; k < 2 && ni < nodes.length; k++){
      var n = nodes[ni];
      ci++;
      n.node.nodeValue = n.full.slice(0, ci);
      if(ci >= n.full.length){ ni++; ci = 0; }
      if(++count % 5 === 0) sfx('blip');
    }
    if(ni < nodes.length) typing.raf = requestAnimationFrame(step);
    else stopTyping();
  }
  typing.raf = requestAnimationFrame(step);
}
function stopTyping(){
  if(!typing) return;
  cancelAnimationFrame(typing.raf);
  typing.nodes.forEach(function(n){ n.node.nodeValue = n.full; });
  typing = null;
  el.text.classList.remove('typing');
}

function render(){
  var line = cur.lines[cur.i], g = GUIDES[line.who], last = cur.i === cur.lines.length - 1;
  el.card.className = 'dlg-card ' + line.who;
  if(el.portrait.dataset.who !== line.who){
    el.portrait.innerHTML = guidePortraitHtml(line.who);
    el.portrait.dataset.who = line.who;
  }
  el.who.innerHTML = '<b>' + g.name + '</b><i>' + g.role + '</i>';
  el.text.innerHTML = line.text;
  var dots = '';
  for(var i = 0; i < cur.lines.length; i++) dots += '<span class="' + (i === cur.i ? 'on' : '') + '"></span>';
  el.dots.innerHTML = dots;
  el.next.textContent = last ? cur.doneLabel : 'Siguiente →';
  el.skip.hidden = last;
  // restart the line's entrance animation
  el.card.classList.remove('enter'); void el.card.offsetWidth; el.card.classList.add('enter');
  typeLine();
}

function finish(){
  if(!cur) return;
  stopTyping();
  var done = cur.onDone;
  cur = null;
  root.classList.remove('open');
  document.removeEventListener('keydown', onKey);
  if(done) done();
}

function advance(){
  if(!cur) return;
  if(typing){ stopTyping(); return; }
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
