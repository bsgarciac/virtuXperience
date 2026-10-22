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
    { who: 'luma', text: 'Saludos, Sintonizador. Soy Luma, guardiana de los ecosistemas latentes y tejedora de redes invisibles. Te doy la bienvenida a <b>Activa tu idea</b> en el <b>Distrito Cristalino</b>. Aquí, las chispas del pensamiento se cristalizan en proyectos reales. Calibra tu frecuencia y preparemos el camino.' },
    { who: 'luma', text: 'El entorno está cubierto de <b>Neblina Gris</b> debido al aislamiento de los emprendedores. Avanza por las plataformas de cristal mientras recolectas <b>Células Lógicas</b> hasta llegar al <b>Nodo de Pregunta</b> sumido en la inacción; actívalo con tu <b>Nanocatalizador Creativo</b>, supera los retos para obtener tu insignia y ayudar a restaurar el flujo del distrito.' }
  ]
});
