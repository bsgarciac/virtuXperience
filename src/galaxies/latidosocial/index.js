import { defineGalaxy } from '../../atlas/define.js';
import { createRecursoGame, recursoGalaxy } from '../../shared/game/recurso.js';
import { PLANETS } from './content.js';

// LatidoSocial: social responsibility, faith and ethics, and social
// leadership — UNIMINUTO's mission — around the Pulsar Social. Its planets
// and nodes are the resources of the old "Virtual - Misionales" site
// (content.js), each an embedded Genially or YouTube video
// (shared/game/recurso.js). No comets yet: they come with its own games.
var open = createRecursoGame({
  galaxy: 'latidosocial', name: 'LatidoSocial', emblem: '♡', planets: PLANETS,
  outro: 'Cada nodo que completas hace latir más fuerte a LatidoSocial. ¡Sigue tu camino!'
});
var built = recursoGalaxy(PLANETS, open);

export default defineGalaxy({
  id: 'latidosocial', name: 'LatidoSocial', emblem: '♡',
  sun: { label: 'PULSAR SOCIAL', glyph: '♡' },
  planets: built.planets,
  games: built.games,
  lessons: {}, // nodes with a lesson show it before the resource

  intro: [
    { who: 'luma', text: 'Bienvenido a <b>LatidoSocial</b>, Sintonizador. Aquí late el corazón de la comunidad, pero la <b>Neblina Gris</b> lo está apagando: la gente se aísla y olvida que transformar su entorno también es tarea suya.' },
    { who: 'luma', text: 'Con el <b>Pulsar Social</b> volveremos a sincronizar ese latido. Recorre cada nodo del camino (las <b>islas</b> son videos y los <b>meteoros</b>, recursos interactivos), pulsa <b>Terminé</b> y ganarás <b>Células Lógicas</b> mientras devuelves el color a sus tres planetas.' }
  ]
});
