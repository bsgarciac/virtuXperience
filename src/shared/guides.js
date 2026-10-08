// The two guides of the BIOSA narrative. Luma (gold) is the humanist voice:
// why a challenge matters to the people of the sector. Aura (blue) is the
// logical one: she explains the mechanics and gives the hints. Aura is the
// crystal fox from the team's art; Luma keeps a glyph until hers is drawn.
// img: the head, for small avatars; portrait: the bust, for the dialogue.
// Paths are relative to index.html (files in public/).
export var GUIDES = {
  luma: { name: 'Luma', role: 'Conciencia ética', glyph: '✦' },
  aura: { name: 'Aura', role: 'Mentora lógica',   glyph: '◈', img: 'assets/guides/aura.jpg', portrait: 'assets/guides/aura-bust.jpg' }
};

// The large picture beside the dialogue bubble (the glyph, big, when the
// guide has no art yet).
export function guidePortraitHtml(id){
  var g = GUIDES[id];
  return '<span class="guide-portrait ' + id + '" aria-hidden="true">' +
    (g.portrait ? '<img src="' + g.portrait + '" alt="">' : '<i>' + g.glyph + '</i>') + '</span>';
}

export function guideAvatarHtml(id){
  var g = GUIDES[id];
  var inner = g.img ? '<img src="' + g.img + '" alt="">' : g.glyph;
  return '<span class="guide-avatar ' + id + (g.img ? ' has-img' : '') + '" aria-hidden="true">' + inner + '</span>';
}
