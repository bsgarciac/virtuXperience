// LatidoSocial's planets and the resources on each, migrated from the old
// "Virtual - Misionales" site (uniminuto.edu/virtual-misionales, one
// article per resource at uniminuto.edu/articulo/<slug>). Planets are the
// old site's sections; each resource is one node — a video (island) or a
// Genially (meteor) — in a suggested learning order (the old site had none).
//
// Shape and rules (keys never change once deployed): shared/game/recurso.js.
var G = 'https://view.genially.com/';
var YT = 'https://www.youtube.com/embed/';

export var PLANETS = [
  { id: 'rs', name: 'Responsabilidad Social', glyph: '♡', color: '#ff6fae', tag: 'Principios, legado y transformación social', islands: [
    { key: 'principios', title: 'Principios UNIMINUTO', kind: 'genially', src: G + '6a01dec597d846354c141d8e' },
    { key: 'raices', title: 'Raíces del compromiso social: principios y espiritualidad', kind: 'genially', src: G + '6ab6bb0a78951db863ae796f' },
    { key: 'cartas', title: 'Cartas digitales de principios: el legado vivo del padre Rafael García-Herreros', kind: 'genially', src: G + '6abc1261280079caf02a326a' },
    { key: 'legado', title: 'Legado del padre Rafael García-Herreros', kind: 'genially', src: G + '6a01decfacbb8984e2585df6' },
    { key: 'el-legado', title: 'El legado del padre Rafael García-Herreros', kind: 'genially', src: G + '698b9c532ff2d4979f5a9e06' },
    { key: 'evolucion', title: 'Evolución con propósito: línea de tiempo', kind: 'genially', src: G + '68a49f09aec1e3b8241f2379' },
    { key: 'proyeccion', title: '¿Qué es proyección social?', kind: 'genially', src: G + '68cafd7dcb7e95338dc36a0a' },
    { key: 'compromiso', title: 'Proyección social: compromiso que transforma', kind: 'youtube', src: YT + '4gvdLN7-vvg' },
    { key: 'educacion', title: 'El impacto de la educación en la transformación social', kind: 'genially', src: G + '6a0de8db0152f6fc1c038881' },
    { key: 'pequenos-pasos', title: 'Transformación social: pequeños pasos, grandes cambios', kind: 'genially', src: G + '68db0f0fe7d822e192e0a4ff' },
    { key: 'u-territorios', title: 'La U que transforma territorios', kind: 'youtube', src: YT + '_W-_8LIpaZ4' },
    { key: 'territorio', title: 'Transformando el territorio', kind: 'genially', src: G + '6a46f98ae33f6254b9116585' },
    { key: 'teoria-cambio', title: 'Domina la teoría del cambio', kind: 'genially', src: G + '6a46fbe215dc620202282d7a' }
  ] },
  { id: 'feb', name: 'FEBIPE', glyph: '✦', color: '#c59cff', tag: 'Espiritualidad, ética y sociedad', islands: [
    { key: 'espiritualidad', title: '¿Qué es la espiritualidad humana y cuál es su relación con la ética?', kind: 'youtube', src: YT + 'bRx8PJM1RDY' },
    { key: 'etica', title: 'Hacia una ética espiritualmente responsable', kind: 'youtube', src: YT + 'vJTms50iWRs' },
    { key: 'alma', title: '¡Cuidar el alma también importa!', kind: 'youtube', src: YT + 'CH0EMM3DhL8' },
    { key: 'personas-biblia', title: 'Las personas de la Biblia', kind: 'youtube', src: YT + 'WdqPYH0oOUg' },
    { key: 'ecos', title: 'Ecos de una sociedad milenaria: Biblia y sociedad actual', kind: 'genially', src: G + '6a307864d23f38feda6bb803' }
  ] },
  { id: 'lid', name: 'Liderazgo Social', glyph: '⚑', color: '#ffb36b', tag: 'Liderar para transformar tu entorno', islands: [
    { key: 'entorno', title: 'Transforma tu entorno con tu aprendizaje', kind: 'youtube', src: YT + 'H49Hft_PyoE' },
    { key: 'educar', title: 'Educar para la vida: dignidad humana y compromiso social', kind: 'youtube', src: YT + '-n2A7I37DyU' },
    { key: 'inmediatez', title: '¿Qué es la cultura de la inmediatez?', kind: 'youtube', src: YT + '73Z7C3Sjm_4' },
    { key: 'un-clic', title: 'Con un solo clic: conociendo la cultura de la inmediatez', kind: 'youtube', src: YT + '36C-nKNdmJU' },
    { key: 'tecnologias', title: 'Misión: tecnologías transformantes', kind: 'genially', src: G + '6a47c0d867ca54a0e368392a' }
  ] }
];
