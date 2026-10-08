// The two guides of the BIOSA narrative. Luma (gold) is the humanist voice:
// why a challenge matters to the people of the sector. Aura (blue) is the
// logical one: she explains the mechanics and gives the hints.
export var GUIDES = {
  luma: { name: 'Luma', role: 'Conciencia ética', glyph: '✦' },
  aura: { name: 'Aura', role: 'Mentora lógica',   glyph: '◈' }
};

export function guideAvatarHtml(id){
  return '<span class="guide-avatar ' + id + '" aria-hidden="true">' + GUIDES[id].glyph + '</span>';
}
