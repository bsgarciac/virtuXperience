import { defineGalaxy } from '../../atlas/define.js';
import dcInicial from './lessons/dc-inicial.js';
import dcIntermedio from './lessons/dc-intermedio.js';
import dcAvanzado from './lessons/dc-avanzado.js';
import { openAlianzas } from './games/alianzas/controller.js';
import { createRecursoGame, recursoGames, numberedIslands } from '../../shared/game/recurso.js';
import { PATHS, pathOf } from './recursos.js';

// Activa tu idea: the entrepreneurship sector, around the Nanocatalizador
// Creativo. Each planet's path mixes videos (islands) and Genially
// (meteors) from the old site with our own games (comets): see recursos.js.
// On the Distrito Cristalino's comets the Sintonizador lands and walks to
// the Nodo (see games/alianzas) instead of flying the map like in
// Neuromath. Those three were one ("El Vacío de Alianzas") until the team
// split its phases by topic.
var openRecurso = createRecursoGame({
  galaxy: 'activa', name: 'Activa tu idea', emblem: '✧', planets: PATHS,
  outro: 'Cada nodo que completas activa una chispa más del Distrito. ¡Sigue tu camino!'
});
var games = recursoGames(PATHS, openRecurso);
// The comets, each with its own walk and Nodo (games/alianzas/content.js
// ISLANDS); the badge comes with the last one.
games['dc-inicial'] = { title: 'Instituciones', open: openAlianzas, cells: 100 };
games['dc-intermedio'] = { title: 'Cómo montar un emprendimiento', open: openAlianzas, cells: 100 };
games['dc-avanzado'] = { title: 'La Estrategia', open: openAlianzas, cells: 100,
                         badge: { id: 'tejedor-alianzas', name: 'Tejedor de Alianzas' } };

export default defineGalaxy({
  id: 'activa', name: 'Activa tu idea', emblem: '✧',
  sun: { label: 'NANOCATALIZADOR CREATIVO', glyph: '✧' },

  planets: [
    { id: 'dc', name: 'Distrito Cristalino', glyph: '◇', color: '#5fd3c6', tag: 'Emprender con redes de apoyo', islands: numberedIslands(pathOf('dc')) },
    { id: 'inv', name: 'Investigación', glyph: '?', color: '#9b8cf2', tag: 'Preguntar, indagar y descubrir', islands: numberedIslands(pathOf('inv')) }
  ],

  games: games,
  lessons: { 'dc-inicial': dcInicial, 'dc-intermedio': dcIntermedio, 'dc-avanzado': dcAvanzado },

  intro: [
    { who: 'luma', text: 'Saludos, Sintonizador. Soy Luma, guardiana de los ecosistemas latentes y tejedora de redes invisibles. Te doy la bienvenida a <b>Activa tu idea</b> en el <b>Distrito Cristalino</b>. Aquí, las chispas del pensamiento se cristalizan en proyectos reales. Calibra tu frecuencia y preparemos el camino.' },
    { who: 'luma', text: 'El entorno está cubierto de <b>Neblina Gris</b> debido al aislamiento de los emprendedores. Avanza por las plataformas de cristal mientras recolectas <b>Células Lógicas</b> hasta llegar al <b>Nodo de Pregunta</b> sumido en la inacción; actívalo con tu <b>Nanocatalizador Creativo</b>, supera los retos para obtener tu insignia y ayudar a restaurar el flujo del distrito.' }
  ]
});
