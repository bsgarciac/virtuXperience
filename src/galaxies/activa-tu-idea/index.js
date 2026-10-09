import { defineGalaxy } from '../../atlas/define.js';
import dcInicial from './lessons/dc-inicial.md?raw';
import { openAlianzas } from './games/alianzas/controller.js';

// Activa tu idea: the entrepreneurship sector, around the Nanocatalizador
// Creativo. Here the Sintonizador lands on each island and walks to its
// Nodo (see games/alianzas) instead of flying the map like in Neuromath.
export default defineGalaxy({
  id: 'activa', name: 'Activa tu idea', emblem: '✧',
  sun: { label: 'NANOCATALIZADOR CREATIVO', glyph: '✧' },

  planets: [
    { id: 'dc', name: 'Distrito Cristalino', glyph: '◇', color: '#5fd3c6', tag: 'Redes de apoyo para emprender' }
  ],
  levels: [
    { id: 'inicial',    label: 'Inicial' },
    { id: 'intermedio', label: 'Intermedio' },
    { id: 'avanzado',   label: 'Avanzado' }
  ],

  games: {
    'dc-inicial': { title: 'El Vacío de Alianzas', open: openAlianzas, cells: 150,
                    badge: { id: 'tejedor-alianzas', name: 'Tejedor de Alianzas' } }
  },
  lessons: { 'dc-inicial': dcInicial },

  intro: [
    { who: 'aura', text: 'Sintonizador, aquí Aura. Bienvenido a <b>Activa tu idea</b>, el sector donde las ideas se vuelven proyectos.' },
    { who: 'luma', text: 'Aquí la Neblina Gris no congela números: congela a las personas. Emprendedores trabajando solos, sin saber a quién acudir.' },
    { who: 'aura', text: 'En cada distrito hay un <b>Nodo de Pregunta</b>. Aterriza, camina hasta él y actívalo con tu <b>Nanocatalizador Creativo</b>.' },
    { who: 'luma', text: 'Y recoge las <b>Células Lógicas</b> que encuentres en el camino. Cada una cuenta.' }
  ]
});
