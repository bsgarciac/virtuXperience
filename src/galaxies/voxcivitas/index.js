import { defineGalaxy } from '../../atlas/define.js';
import { createRecursoGame, recursoGalaxy } from '../../shared/game/recurso.js';
import { PLANETS } from './content.js';

// VoxCivitas: citizenship, autonomous learning and life project, around the
// Gafas de Realidad Social. Its planets and islands are the resources of
// the old "Virtual - VoxCivitas" site (content.js), each one an embedded
// Genially or YouTube video (shared/game/recurso.js).
var open = createRecursoGame({
  galaxy: 'voxcivitas', name: 'VoxCivitas', emblem: '◎', planets: PLANETS,
  outro: 'Cada recurso que completas le devuelve la voz a VoxCivitas. ¡Sigue tu camino!'
});
var built = recursoGalaxy(PLANETS, open);

export default defineGalaxy({
  id: 'voxcivitas', name: 'VoxCivitas', emblem: '◎',
  sun: { label: 'GAFAS DE REALIDAD SOCIAL', glyph: '◎' },
  planets: built.planets,
  games: built.games,
  lessons: {}, // islands with a lesson show it before the resource

  intro: [
    { who: 'luma', text: 'Bienvenido a <b>VoxCivitas</b>, Sintonizador. Aquí la <b>Neblina Gris</b> apaga las voces: la gente deja de participar, de preguntarse quién es y de aprender por su cuenta.' },
    { who: 'luma', text: 'Con tus <b>Gafas de Realidad Social</b> verás lo que la niebla esconde. Recorre cada nodo del camino (las <b>islas</b> son videos y los <b>meteoros</b>, recursos interactivos), pulsa <b>Terminé</b> y ganarás <b>Células Lógicas</b> mientras devuelves el color a sus tres planetas.' }
  ]
});
