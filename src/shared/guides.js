// The guide of the BIOSA narrative: Luma (blue), the crystal fox from the
// team's art. She explains the mechanics, gives the hints and says why a
// challenge matters to the people of the sector. (There used to be a second,
// gold guide; the team dropped her, so every line is Luma's.)
// img: the head, for small avatars; portrait: the bust, for the dialogue.
// Paths are relative to index.html (files in public/).
export var GUIDES = {
  luma: { name: 'Luma', role: 'Mentora del Sintonizador', glyph: '◈', img: 'assets/guides/luma.jpg', portrait: 'assets/guides/luma-bust.jpg' }
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
