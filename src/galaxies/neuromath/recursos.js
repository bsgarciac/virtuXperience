// Neuromath's paths: resources from the old "Virtual - Lógico matemático"
// site (uniminuto.edu/virtual-logico-matematico) — videos (islands) and
// Genially (meteors) — mixed with our own games (comets), in a suggested
// learning order per planet. Planets follow the old site's sections;
// "IA y Matemáticas" and "Desafíomente" were sections there too.
//
// Shape and rules (keys never change once deployed): shared/game/recurso.js.
// An entry with only a key ({ key: 'inicial' }) is one of our games: its id
// stays '<planet>-<level>' from before, so progress saved on it is kept.
var G = 'https://view.genially.com/';
var YT = 'https://www.youtube.com/embed/';

export var PATHS = [
  { id: 'calc', islands: [
    { key: 'limite-aprox', title: 'Noción de límite desde la aproximación', kind: 'youtube', src: YT + '42hiACx-ngs' },
    { key: 'infinitamente-cerca', title: 'Infinitamente cerca', kind: 'youtube', src: YT + 'EoenLTTn6_k' },
    { key: 'limite-grafico', title: 'Noción gráfica de límite', kind: 'youtube', src: YT + 'stzNLyLjcx0' },
    { key: 'limite-grafico-1', title: 'Noción gráfica de límite, parte 1', kind: 'genially', src: G + '6abd638a0a6922b5067f208a' },
    { key: 'laterales', title: 'Aproximaciones por la derecha o por la izquierda', kind: 'youtube', src: YT + '-dyrY2gcKhs' },
    { key: 'limite-grafico-2', title: 'Noción gráfica de límite, parte 2: ¿por derecha o por izquierda?', kind: 'genially', src: G + '6abd6384b890bd025fcc7c85' },
    { key: 'grafico-formal', title: 'Aproximaciones: del gráfico al límite formal', kind: 'genially', src: G + '6abd236f73caa2769c70167d' },
    { key: 'factorizacion', title: 'Límites por factorización, recordando a Baldor', kind: 'youtube', src: YT + 'ezJr5aHuteg' },
    { key: 'limites-funciones', title: 'Límites de funciones', kind: 'genially', src: G + '6a297d7488aa0dfa8d2b220a' },
    { key: 'integracion', title: 'Integración de funciones: reglas de integración directa', kind: 'youtube', src: YT + 'pQm1EiEbUsI' }
  ] },
  { id: 'fund', islands: [
    { key: 'signos', title: 'Ley de signos para suma y resta: menos y menos da más', kind: 'youtube', src: YT + 'EmNned8XqE8' },
    { key: 'menos-por-menos', title: 'Menos por menos da más', kind: 'youtube', src: YT + 'uzn8t5U37Wk' },
    { key: 'fracciones', title: 'Algoritmos rápidos para operar fracciones', kind: 'youtube', src: YT + 'our8d5KDT1A' },
    { key: 'jerarquia', title: 'Jerarquía de operaciones', kind: 'youtube', src: YT + 'Ymun1G6e6SM' },
    { key: 'orden', title: 'Orden de las operaciones aritméticas', kind: 'genially', src: G + '68f2abcf5ed3263ceaf438a1' },
    { key: 'inicial' }, // Puente de operaciones
    { key: 'combinadas', title: 'Operaciones combinadas con jerarquía de operaciones', kind: 'youtube', src: YT + 'JJ-yl3cavvM' },
    { key: 'regla-tres', title: 'Regla de tres inversa', kind: 'youtube', src: YT + '3dyex_RGmBU' },
    { key: 'ponte-prueba', title: 'Ponte a prueba: operaciones aritméticas', kind: 'genially', src: G + '6900f0dcee0bda684493e06a' }
  ] },
  { id: 'alg', islands: [
    { key: 'primer-grado', title: 'Ecuaciones de primer grado', kind: 'youtube', src: YT + 'JkKaFvU-RFw' },
    { key: 'resolver-primer-grado', title: 'Cómo resolver ecuaciones de primer grado', kind: 'genially', src: G + '6ad288e6f5320290b07b6fa8' },
    { key: 'lineales', title: 'Ecuaciones lineales', kind: 'youtube', src: YT + 'VcLgPu1lgX8' },
    { key: 'solucion', title: 'Solución de ecuaciones', kind: 'genially', src: G + '68f2b411704c36a0442d3a61' },
    { key: 'polinomios', title: 'Aventura polinómica', kind: 'genially', src: G + '68937abcde38e7bc860e5308' },
    { key: 'intermedio' }, // Cañón parabólico
    { key: 'sistemas', title: 'Noción de sistema de ecuaciones: consistencia e inconsistencia', kind: 'youtube', src: YT + 'gZpjh-2jvGI' },
    { key: 'metodos', title: 'Reducción, sustitución e igualación: ejercicios de aplicación', kind: 'youtube', src: YT + 'U6T9ZaKiFcg' },
    { key: 'refuerzo-sistemas', title: 'Refuerzo: ecuaciones y sistemas de ecuaciones', kind: 'genially', src: G + '6900f0e31208e1ca73183fd2' },
    { key: 'determinantes', title: 'Determinantes: matriz inversa', kind: 'youtube', src: YT + 'BUPVCJRkETY' },
    { key: 'diferenciales', title: 'Ecuaciones diferenciales', kind: 'youtube', src: YT + '8NiA2nociMc' }
  ] },
  { id: 'est', islands: [
    { key: 'que-es', title: '¿Qué es la estadística?', kind: 'youtube', src: YT + '23-go0jo140' },
    { key: 'historia', title: 'Contexto histórico de la estadística', kind: 'youtube', src: YT + 'd8oxGL8tsRk' },
    { key: 'descriptiva', title: '¿Qué es la estadística descriptiva?', kind: 'youtube', src: YT + 'KyKW4XboL7U' },
    { key: 'conceptos', title: 'Conceptos principales', kind: 'youtube', src: YT + 'UlEPlBl3Pqg' },
    { key: 'variables', title: 'Tipos de variables', kind: 'youtube', src: YT + 'DoATvI-idr0' },
    { key: 'estadistica', title: 'Estadística', kind: 'genially', src: G + '6a297d7d197b61e03f46c1dc' },
    { key: 'puntos', title: '¿Quién logra 50.000 puntos?', kind: 'genially', src: G + '69011830ae6025754410b56a' }
  ] },
  { id: 'des', islands: [
    { key: 'numerico', title: 'Pensamiento numérico', kind: 'youtube', src: YT + 'CuLAZupkCCc' },
    { key: 'numerico-desarrollo', title: 'Desarrollo del pensamiento numérico', kind: 'youtube', src: YT + 'XeYZr6x192M' },
    { key: 'numeros', title: 'Sumérgete en los números', kind: 'genially', src: G + '68eeedb6d98d2f8961e01578' },
    { key: 'variacional', title: 'Pensamiento variacional', kind: 'youtube', src: YT + 'W_TH4IbF6Yk' },
    { key: 'variacional-desarrollo', title: 'Desarrollo del pensamiento variacional', kind: 'youtube', src: YT + 'BK-QmHzn4QI' },
    { key: 'geometrico', title: 'Pensamiento geométrico', kind: 'youtube', src: YT + 'XeZHGOy2ehA' },
    { key: 'espacial', title: 'Pensamiento espacial, geométrico y métrico', kind: 'youtube', src: YT + 'Gr3WUPSoEP0' },
    { key: 'aleatorio', title: 'Pensamiento aleatorio', kind: 'youtube', src: YT + 'zc8L-bZMLxM' },
    { key: 'aleatorio-desarrollo', title: 'Desarrollo del pensamiento aleatorio', kind: 'youtube', src: YT + 'zTMgtcdWMVA' }
  ] },
  { id: 'ia', islands: [
    { key: 'editor', title: 'Editor de ecuaciones', kind: 'youtube', src: YT + 'hxI1-9jCcRI' },
    { key: 'symbolab', title: 'Symbolab', kind: 'youtube', src: YT + 'W02KZuaWtZE' },
    { key: 'geogebra', title: 'GeoGebra', kind: 'youtube', src: YT + 'Jk40VnO0MGA' },
    { key: 'desmos', title: 'Desmos', kind: 'youtube', src: YT + '8tjx0hLUqto' },
    { key: 'phet', title: 'PhET Colorado', kind: 'youtube', src: YT + 'IrRRz3P7hB4' }
  ] }
];

// A planet's path, by id (for numberedIslands in index.js).
export function pathOf(id){ return PATHS.find(function(p){ return p.id === id; }); }
