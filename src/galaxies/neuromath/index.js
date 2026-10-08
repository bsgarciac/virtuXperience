import { defineGalaxy } from '../../atlas/define.js';
import { LESSONS } from './lessons/index.js';
import { openBridge } from './games/bridge/controller.js';
import { openCannon } from './games/cannon/controller.js';

// The Neuromath galaxy: a solar system around the Matriz Lógica, one planet
// per subarea, each with its chain of islands (one challenge per level).
export default defineGalaxy({
  id: 'neuromath', name: 'Neuromath', emblem: 'Σ',
  sun: { label: 'MATRIZ LÓGICA', glyph: 'Σ' },

  planets: [
    {id:'calc', name:'Cálculo',                    glyph:'∫', color:'#9b8cf2', tag:'El estudio del cambio y la acumulación'},
    {id:'fund', name:'Fundamentos de matemáticas', glyph:'±', color:'#e8b84b', tag:'Las bases de toda operación matemática'},
    {id:'alg',  name:'Álgebra',                    glyph:'x²',color:'#e2708f', tag:'El lenguaje de las incógnitas'},
    {id:'est',  name:'Estadística',                glyph:'μ', color:'#4fbf8b', tag:'El arte de leer los datos'}
  ],
  levels: [
    {id:'inicial',    label:'Inicial'},
    {id:'intermedio', label:'Intermedio'},
    {id:'avanzado',   label:'Avanzado'}
  ],

  // Only the islands listed here are built; every other one stays locked.
  // Each game exposes open(island, onFinish) and calls onFinish(score, close)
  // when the player completes it. cells: Células Lógicas for the first win.
  games: {
    'fund-inicial':   { title: 'Puente de operaciones', open: openBridge, cells: 100 },
    'alg-intermedio': { title: 'Cañón parabólico', open: openCannon, cells: 100 }
  },
  lessons: LESSONS,

  // The BIOSA story as told here: the Neblina Gris spreads from planet to
  // planet, and each island the player solves pushes it back.
  intro: [
    { who: 'aura', text: 'Sintonizador, aquí Aura. Te hablo desde la <b>Matriz Lógica</b> del sector Neuromath. Tenemos un problema.' },
    { who: 'luma', text: 'Y yo soy Luma. Estos planetas brillaban: sus colonias se hacían preguntas y los números fluían entre ellas como luz.' },
    { who: 'aura', text: 'Pero empezaron a automatizarlo todo sin entenderlo. La Matriz se descalibró y apareció la <b>Neblina Gris</b>.' },
    { who: 'luma', text: 'La neblina se propaga de planeta en planeta y congela las ideas. Todo lo que toca pierde su color.' },
    { who: 'aura', text: 'Cada planeta tiene sus <b>islas</b>, y cada isla guarda un <b>Nodo de Pregunta</b>. Resuélvelo y la neblina retrocede. Explora los planetas en el orden que quieras. Si te trabas, pídeme una pista y te explico la lógica.' },
    { who: 'luma', text: 'Yo te recordaré para quién lo haces. No vinimos a destruir la máquina: vinimos a <b>restaurar el flujo</b>.' }
  ],
  // First-visit briefings, keyed by island id.
  briefings: {
    'fund-inicial': [
      { who: 'luma', text: 'En esta isla los rovers llevan cristales de energía entre colonias. La neblina derrumbó los puentes y las dejó aisladas.' },
      { who: 'aura', text: 'Cada puente se arma con una expresión y su largo es el resultado. El <b>orden de las operaciones</b> decide si llega al otro lado.' }
    ],
    'alg-intermedio': [
      { who: 'luma', text: 'Aquí la neblina se endureció en muros de cristal opaco que bloquean el paso de los rovers.' },
      { who: 'aura', text: 'El cañón dispara siguiendo la parábola <b>f(x) = a·x² + b·x + c</b>. Ajusta sus parámetros para dar en la grieta y el muro caerá.' }
    ]
  }
});
