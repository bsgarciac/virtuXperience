import { defineGalaxy } from '../../atlas/define.js';
import { createRecursoGame, recursoGalaxy } from '../../shared/game/recurso.js';
import { PLANETS } from './content.js';
import escHiatos from './lessons/esc-hiatos.js';

// ComunicArte: communication skills, around the Holófono Cuántico. Its
// planets and islands are the resources of the old "Virtual - Habilidades
// Comunicativas" site (content.js): one planet per section, one numbered
// island per resource, each an embedded Genially or YouTube video
// (shared/game/recurso.js).
var open = createRecursoGame({
  galaxy: 'comunicarte', name: 'ComunicArte', emblem: '✎', planets: PLANETS,
  outro: 'Cada recurso que completas le devuelve la voz a ComunicArte. ¡Sigue con la próxima isla!'
});
var built = recursoGalaxy(PLANETS, open, 50);

export default defineGalaxy({
  id: 'comunicarte', name: 'ComunicArte', emblem: '✎',
  sun: { label: 'HOLÓFONO CUÁNTICO', glyph: '✎' },
  planets: built.planets,
  games: built.games,
  // Islands with a lesson show it before the resource; the rest go straight to it.
  lessons: { 'esc-hiatos': escHiatos },

  intro: [
    { who: 'luma', text: 'Bienvenido a <b>ComunicArte</b>, Sintonizador. Aquí la <b>Neblina Gris</b> enreda las palabras: las ideas existen, pero no logran llegar a nadie.' },
    { who: 'luma', text: 'Cada isla guarda un recurso para afinar tu escritura, tu voz y tu lectura. Recórrelo completo, pulsa <b>Terminé</b> y con tu <b>Holófono Cuántico</b> devolverás el color a la isla y ganarás <b>Células Lógicas</b>.' }
  ]
});
