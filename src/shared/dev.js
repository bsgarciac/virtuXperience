import { showToast } from './toast.js';

// Developer mode: shortcuts to skip walks, phases and whole islands while
// testing or demoing. It's switched on by opening the site with
// ?dev=<code>; only the code's SHA-256 is here, so reading the source
// doesn't give it away. The code lives in .dev-code (git-ignored). This is a
// convenience lock, not security: anyone with the code — or who edits
// localStorage — gets it. ?dev=off switches it off.
var CODE_SHA256 = '45ed90a7d861d13bbb80f2a0afb0f4b68a19c1373131ff5b643b2ae85927a118';
var KEY = 'vx_dev_mode';

export function isDev(){
  try{ return localStorage.getItem(KEY) === '1'; }catch(e){ return false; }
}

// Reads ?dev=… once at startup, then drops it from the URL (and history).
(function readUrl(){
  var m = window.location.search.match(/[?&]dev=([^&#]*)/);
  if(!m) return;
  var code = decodeURIComponent(m[1]);
  var url = window.location.href.replace(/([?&])dev=[^&#]*&?/, '$1').replace(/[?&]$/, '').replace(/\?#/, '#');
  if(code === 'off'){
    try{ localStorage.removeItem(KEY); }catch(e){ /* ignore */ }
    window.location.replace(url);
    return;
  }
  if(!window.crypto || !window.crypto.subtle) return;
  window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(code)).then(function(buf){
    var hex = Array.prototype.map.call(new Uint8Array(buf), function(b){ return ('0' + b.toString(16)).slice(-2); }).join('');
    if(hex === CODE_SHA256){
      try{ localStorage.setItem(KEY, '1'); }catch(e){ /* ignore */ }
    }
    window.location.replace(url);
  });
})();

/* ---- the dev bar: a small panel of shortcuts, over everything ---- */
// Actions come in groups ('island' from the atlas, 'game' from the open
// mini-game) so each side can replace or clear its own.
var groups = {};
var bar = null;

function render(){
  if(!isDev()) return;
  if(!bar){
    bar = document.createElement('div');
    bar.id = 'dev-bar';
    document.body.appendChild(bar);
  }
  var list = [];
  Object.keys(groups).forEach(function(g){ list = list.concat(groups[g]); });
  bar.innerHTML = '<span class="dev-tag" title="Modo desarrollador (?dev=off para salir)">DEV</span>';
  list.forEach(function(a){
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = a.label;
    b.addEventListener('click', function(){ a.run(); });
    bar.appendChild(b);
  });
}

export function setDevActions(group, actions){
  groups[group] = actions || [];
  render();
}

if(isDev()){
  render();
  setTimeout(function(){ showToast('🛠 Modo desarrollador activo'); }, 600);
}
