import { defineGalaxy } from '../../atlas/define.js';
import { LESSONS } from './lessons/index.js';
import { openBridge } from './games/bridge/controller.js';
import { openCannon } from './games/cannon/controller.js';
import { createRecursoGame, recursoGames, numberedIslands } from '../../shared/game/recurso.js';
import { PATHS, pathOf } from './recursos.js';

// Each planet's path mixes videos (islands) and Genially (meteors) from the
// old site with our own games (comets): see recursos.js.
var openRecurso = createRecursoGame({
  galaxy: 'neuromath', name: 'Neuromath', emblem: 'Σ', planets: PATHS,
  outro: 'Cada nodo que completas despeja un poco más la Neblina Gris. ¡Sigue tu camino!'
});
var games = recursoGames(PATHS, openRecurso);
// Our games. Each one exposes open(island, onFinish) and calls
// onFinish(score, close) when the player completes it. cells: Células
// Lógicas for the first win.
games['fund-inicial'] = { title: 'Puente de operaciones', open: openBridge, cells: 100 };
games['alg-intermedio'] = { title: 'Cañón parabólico', open: openCannon, cells: 100 };

function planet(id, name, glyph, color, tag){
  return { id: id, name: name, glyph: glyph, color: color, tag: tag, islands: numberedIslands(pathOf(id)) };
}

// The Neuromath galaxy: a solar system around the Matriz Lógica, one planet
// per subarea, each with its path of nodes.
export default defineGalaxy({
  id: 'neuromath', name: 'Neuromath', emblem: 'Σ',
  sun: { label: 'MATRIZ LÓGICA', glyph: 'Σ' },

  planets: [
    planet('calc', 'Cálculo',                    '∫',  '#9b8cf2', 'El estudio del cambio y la acumulación'),
    planet('fund', 'Fundamentos de matemáticas', '±',  '#e8b84b', 'Las bases de toda operación matemática'),
    planet('alg',  'Álgebra',                    'x²', '#e2708f', 'El lenguaje de las incógnitas'),
    planet('est',  'Estadística',                'μ',  '#4fbf8b', 'El arte de leer los datos'),
    planet('des',  'Desafíomente',               '∴',  '#57d9f0', 'Los cuatro pensamientos matemáticos'),
    planet('ia',   'IA y Matemáticas',           'ƒ',  '#6c8cff', 'Herramientas digitales para resolver y graficar')
  ],

  games: games,
  lessons: LESSONS,

  // The BIOSA story as told here: the Neblina Gris spreads from planet to
  // planet, and each node the player solves pushes it back.
  intro: [
    { who: 'luma', text: 'Sintonizador, aquí Luma. Te hablo desde la <b>Matriz Lógica</b> del sector Neuromath. Tenemos un problema.' },
    { who: 'luma', text: 'Estos planetas brillaban: sus colonias se hacían preguntas y los números fluían entre ellas como luz.' },
    { who: 'luma', text: 'Pero empezaron a automatizarlo todo sin entenderlo. La Matriz se descalibró y apareció la <b>Neblina Gris</b>.' },
    { who: 'luma', text: 'La neblina se propaga de planeta en planeta y congela las ideas. Todo lo que toca pierde su color.' },
    { who: 'luma', text: 'Cada planeta tiene un camino de <b>nodos</b>: islas con videos, meteoros con recursos interactivos y cometas con los grandes retos. Cada uno guarda un <b>Nodo de Pregunta</b>. Resuélvelo y la neblina retrocede. Explora los planetas en el orden que quieras. Si te trabas, pídeme una pista y te explico la lógica.' },
    { who: 'luma', text: 'Y te recordaré para quién lo haces. No vinimos a destruir la máquina: vinimos a <b>restaurar el flujo</b>.' }
  ],
  // First-visit briefings, keyed by island id.
  briefings: {
    'fund-inicial': [
      { who: 'luma', text: 'En este cometa los rovers llevan cristales de energía entre colonias. La neblina derrumbó los puentes y las dejó aisladas.' },
      { who: 'luma', text: 'Cada puente se arma con una expresión y su largo es el resultado. El <b>orden de las operaciones</b> decide si llega al otro lado.' }
    ],
    'alg-intermedio': [
      { who: 'luma', text: 'Aquí la neblina se endureció en muros de cristal opaco que bloquean el paso de los rovers.' },
      { who: 'luma', text: 'El cañón dispara siguiendo la parábola <b>f(x) = a·x² + b·x + c</b>. Ajusta sus parámetros para dar en la grieta y el muro caerá.' }
    ]
  }
});
