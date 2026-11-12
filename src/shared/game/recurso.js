import { createShell } from './shell.js';

// "Recurso" islands, for galaxies whose islands are resources migrated from
// the old VirtuXperience site (uniminuto.edu/virtuxperience-home): each
// island plays one Genially or YouTube embed inside the game shell instead
// of a Phaser scene. The island's lesson (if any) comes first; the embed
// fills the stage; the panel has the goal, Luma's hint and "Terminé". The
// embed can't tell us when the player is done, so "Terminé" is what
// restores the island (the team chose this over a timer or a quiz).
//
// A galaxy lists its planets in its content.js:
//   [{ id, name, glyph, color, tag, islands: [
//      { key, title, kind: 'genially' | 'youtube', src, goal?, hint?, recap? } ] }]
// The island id is '<planet>-<key>': never change a key once deployed, it's
// what progress is saved under. Reordering islands is safe.

var DEFAULTS = {
  genially: {
    label: 'Recurso interactivo',
    goal: 'Recorre el recurso interactivo completo y resuelve sus retos.',
    hint: 'Avanza con las flechas del recurso y no te saltes pantallas: los retos del final usan lo que se explica al principio. Cuando termines, pulsa <b>Terminé</b>.'
  },
  youtube: {
    label: 'Video',
    goal: 'Mira el video completo y quédate con sus ideas clave.',
    hint: 'Si algo no te queda claro, retrocede unos segundos o activa los subtítulos. Anota dos ideas clave antes de pulsar <b>Terminé</b>.'
  }
};

// What kind of node each resource is on the map (atlas/define.js NODE_KINDS)
// and what it pays the first time: a video is the lightest, a Genially asks
// more; our own games (comets) pay 100.
var KIND = {
  youtube:  { kind: 'isla',    cells: 20 },
  genially: { kind: 'meteoro', cells: 50 }
};

// The games for a list of planets' resources, for defineGalaxy. Entries
// without a src (e.g. { key: 'inicial' }, a stop that is one of the
// galaxy's own games) are left to the galaxy. open: the galaxy's recurso game.
export function recursoGames(planets, open){
  var games = {};
  planets.forEach(function(p){
    p.islands.forEach(function(r){
      if(!r.src) return;
      games[p.id + '-' + r.key] = { title: r.title, open: open, kind: KIND[r.kind].kind, cells: KIND[r.kind].cells };
    });
  });
  return games;
}

// A planet's own numbered list of stops, for defineGalaxy's planet.islands.
export function numberedIslands(p){
  return p.islands.map(function(r, i){ return { id: r.key, label: String(i + 1) }; });
}

// The planets and games of a galaxy made only of resources.
export function recursoGalaxy(planets, open){
  var defs = planets.map(function(p){
    return { id: p.id, name: p.name, glyph: p.glyph, color: p.color, tag: p.tag, islands: numberedIslands(p) };
  });
  return { planets: defs, games: recursoGames(planets, open) };
}

// One game shell per galaxy. opts: { galaxy (id), name, emblem, planets,
// outro: what Luma says on the final card when the island has no recap }.
// Returns open(island, onFinish, reward) for the galaxy's games.
export function createRecursoGame(opts){
  var resources = {};
  opts.planets.forEach(function(p){
    p.islands.forEach(function(r){ if(r.src) resources[p.id + '-' + r.key] = r; });
  });

  var shell = createShell({
    id: 'recurso-' + opts.galaxy, emblem: opts.emblem, title: opts.name,
    pipsLabel: 'Recurso', hintThinking: 'Luma revisa el recurso',
    panelHtml:
      '<div class="gm-goal"></div>' +
      '<div class="gm-actions">' +
        '<button type="button" class="ai-btn gm-hint-btn">◈ Pregúntale a Luma</button>' +
        '<button type="button" class="btn-primary gm-build">✓ Terminé</button>' +
      '</div>'
  });
  shell.el.root.classList.add('rc-game');

  var current = null; // { island, res, onFinish, reward }

  function removeEmbed(){
    var frame = shell.el.stage.querySelector('.rc-embed');
    if(frame) frame.remove(); // also stops a playing video
  }

  function close(){
    removeEmbed();
    current = null;
    shell.close();
  }

  shell.el.build.addEventListener('click', function(){
    if(!current) return;
    var g = current;
    shell.renderPips(1, 0, true); // restores the stage colour
    shell.hideHint();
    shell.showFinal({
      icon: opts.emblem, title: 'Recurso completado',
      msg: 'Terminaste <b>' + g.res.title + '</b>. La Neblina Gris se disipa de esta isla.',
      rewardsHtml: shell.rewardsHtml(g.reward),
      luma: g.res.recap ? '' : opts.outro,
      recap: g.res.recap,
      onContinue: function(){ g.onFinish(0, close); }
    });
  });

  // onFinish(score, close) runs when the player says they finished.
  return function openRecurso(island, onFinish, reward){
    var res = resources[island.id], d = DEFAULTS[res.kind];
    current = { island: island, res: res, onFinish: onFinish, reward: reward || {} };

    shell.open(island.planet.name + ' · ' + island.name, close, current.reward.wallet);
    shell.setTitle(res.title);
    shell.renderPips(1, 0, false);
    shell.resetHint();
    shell.setHint(function(){ return res.hint || d.hint; });
    shell.el.goal.innerHTML = '<i>' + d.label + '</i> ' + (res.goal || d.goal);

    shell.showLesson(island.lesson, function(){
      var frame = document.createElement('iframe');
      frame.className = 'rc-embed';
      frame.src = res.src;
      frame.title = res.title;
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('allow', 'fullscreen; autoplay; encrypted-media; picture-in-picture');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      shell.el.stage.appendChild(frame);
    });
  };
}
