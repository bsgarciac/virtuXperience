import { defineGalaxy } from '../../atlas/define.js';
import { createRecursoGame, recursoGalaxy } from '../../shared/game/recurso.js';
import { PLANETS } from './content.js';

// Gerencia+: leadership, agile methods, marketing and people management,
// around the Brújula de Gestión Ágil (the management line's Hack de
// Sintonía, "NaviFlux" in the narrative deck). Its planets and nodes are the
// resources of the old "Virtual - Habilidades Gerenciales" site
// (content.js), each an embedded Genially or YouTube video
// (shared/game/recurso.js). No comets yet: they come with its own games.
var open = createRecursoGame({
  galaxy: 'gerencia', name: 'Gerencia+', emblem: '✚', planets: PLANETS,
  outro: 'Cada nodo que completas afina la brújula de Gerencia+. ¡Sigue tu camino!'
});
var built = recursoGalaxy(PLANETS, open);

export default defineGalaxy({
  id: 'gerencia', name: 'Gerencia+', emblem: '✚',
  sun: { label: 'BRÚJULA DE GESTIÓN ÁGIL', glyph: '✚' },
  planets: built.planets,
  games: built.games,
  lessons: {}, // nodes with a lesson show it before the resource

  intro: [
    { who: 'luma', text: 'Bienvenido a <b>Gerencia+</b>, Sintonizador. Aquí los equipos perdieron el rumbo: la <b>Neblina Gris</b> los dejó sin líderes que escuchen, sin datos para decidir y sin ganas de cambiar.' },
    { who: 'luma', text: 'Con la <b>Brújula de Gestión Ágil</b> volveremos a orientarlos. Recorre cada nodo del camino (las <b>islas</b> son videos y los <b>meteoros</b>, recursos interactivos), pulsa <b>Terminé</b> y ganarás <b>Células Lógicas</b> mientras devuelves el color a sus cuatro planetas.' }
  ]
});
