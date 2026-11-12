// ComunicArte's planets and the resources on each, migrated from the old
// "Virtual - Habilidades Comunicativas" site
// (uniminuto.edu/virtual-habilidades-comunicativas, one article per
// resource at uniminuto.edu/articulo/<slug>). Planets are the old site's
// sections; each resource is one island, in a suggested learning order (the
// old site had none). Two resources changed section by topic: "Acentuación
// de hiatos y diptongos" (was Oralidad) and "Diapositivas para una
// exposición" (was Escritura).
//
// Shape and rules (keys never change once deployed): shared/game/recurso.js.
var G = 'https://view.genially.com/';
var YT = 'https://www.youtube.com/embed/';

export var PLANETS = [
  { id: 'esc', name: 'Escritura', glyph: '✎', color: '#6c8cff', tag: 'Escribir con claridad y corrección', islands: [
    { key: 'reglas', title: 'Reglas ortográficas: 5 normas generales', kind: 'genially', src: G + '68daed060ede06a343d57d2d' },
    { key: 'agudas', title: 'Palabras agudas, graves, esdrújulas y sobreesdrújulas', kind: 'genially', src: G + '69e2b646a45dee447b4b6bb3' },
    { key: 'tildes', title: 'Acentos y tildes', kind: 'youtube', src: YT + 'iyX0EWNPucY' },
    { key: 'hiatos', title: 'Acentuación de hiatos y diptongos', kind: 'genially', src: G + '6a6ce610c1a24aef26b9a589',
      goal: 'Recorre el recurso: clasifica palabras e identifica diptongos, hiatos y triptongos en cada nivel.',
      hint: 'Avanza nivel por nivel dentro del recurso. Antes de poner la tilde, separa la palabra en sílabas: ¿las dos vocales quedan juntas (diptongo) o en sílabas distintas (hiato)? Esa decisión cambia dónde cae el acento.',
      recap: 'la tilde depende de cómo se separan las vocales: en un hiato con vocal cerrada tónica (como en <i>día</i>) la tilde se escribe siempre.' },
    { key: 'diacritica', title: 'Tilde diacrítica y casos especiales', kind: 'genially', src: G + '69e2b636e4cd84081fcc85fa' },
    { key: 'puntuacion', title: 'Puntuación y acentuación', kind: 'genially', src: G + '689a7e48d75d36c0f88132c2' },
    { key: 'parrafo', title: 'Un párrafo es el comienzo de mil ideas', kind: 'genially', src: G + '6895445f0b7290ad1e2f91f1' },
    { key: 'coherencia', title: 'Scooby Doo y el misterio de la coherencia y la cohesión', kind: 'genially', src: G + '69134adde1876e255f0dbcae' },
    { key: 'pasos', title: 'Pasos para escribir: planeación, redacción, revisión y edición', kind: 'genially', src: G + '6897932d60787a86bad66155' },
    { key: 'resumen', title: 'El resumen', kind: 'genially', src: G + '68a0e2c55842a52fb0fb5d61' },
    { key: 'sintesis', title: 'Juego de síntesis', kind: 'genially', src: G + '697a3b0f9f90db2177152036' },
    { key: 'ensayo', title: 'El ensayo informativo', kind: 'genially', src: G + '68dafbe90ede06a343de3d66' },
    { key: 'comentario', title: 'Comentario crítico', kind: 'genially', src: G + '697a3b381da269514722dbae' },
    { key: 'citar-apa', title: 'Citar en APA', kind: 'genially', src: G + '697a3b6cd60d9456e8479fb3' },
    { key: 'referencias-apa', title: 'Referencias APA', kind: 'genially', src: G + '697a3b86d60d9456e847b229' }
  ] },
  { id: 'ora', name: 'Oralidad', glyph: '❝', color: '#e2708f', tag: 'Hablar con claridad y confianza', islands: [
    { key: 'definicion', title: 'Definición de oralidad y sus características', kind: 'youtube', src: YT + 'WX_Bayl4afU' },
    { key: 'importancia', title: 'Importancia de la comunicación oral en diferentes contextos', kind: 'youtube', src: YT + 'Fr_xsZEkmFQ' },
    { key: 'poder', title: 'El poder de comunicar', kind: 'youtube', src: YT + 'jr7dUU-LARE' },
    { key: 'pronunciacion', title: 'Pronunciación y entonación', kind: 'youtube', src: YT + 'm88EgiJ3JBU' },
    { key: 'hablar-bien', title: 'Hablar bien, comunicar mejor', kind: 'youtube', src: YT + 'HZJ2oLrAVLE' },
    { key: 'miedo', title: '¿Miedo a hablar en público?', kind: 'youtube', src: YT + 'q5CoMHjir8M' },
    { key: 'comunica', title: 'Comunica y conquista', kind: 'genially', src: G + '6939b284cb698f4dbb32ce8e' },
    { key: 'desafio', title: 'Desafío mental', kind: 'genially', src: G + '6939ce5071d8f29cdfec19b2' },
    { key: 'etica', title: 'La ética y la responsabilidad en el discurso oral', kind: 'genially', src: G + '6984b49b8945036e6e936c26' },
    { key: 'digital', title: 'La oralidad digital', kind: 'genially', src: G + '6984b4b2ccbba6e48017d3f6' },
    { key: 'diapositivas', title: 'Diapositivas para una exposición: aspectos iniciales', kind: 'genially', src: G + '69c7434bf985f638cb1e0626' },
    { key: 'exposicion', title: 'La exposición oral académica', kind: 'genially', src: G + '6984b4c6aaf9a133c114c535' }
  ] },
  { id: 'lec', name: 'Lectura', glyph: '¶', color: '#4fbf8b', tag: 'Comprender, inferir y valorar lo que lees', islands: [
    { key: 'universidad', title: 'La comprensión lectora en la universidad', kind: 'youtube', src: YT + 'oEYl8IdnYKA' },
    { key: 'tipos', title: 'Tipos de lectura y enfoques iniciales', kind: 'youtube', src: YT + 'rMgZK_8xge0' },
    { key: 'metacognicion', title: 'Lectura y metacognición: lee y enfócate', kind: 'youtube', src: YT + 'fECxuGVbMi0' },
    { key: 'comprende', title: 'Comprende lo que lees: estrategias de lectura', kind: 'youtube', src: YT + 'MCaM5Qp7hoU' },
    { key: 'lee-entiende', title: 'Lee y entiende con estas estrategias', kind: 'youtube', src: YT + 'qelmPP1Acao' },
    { key: 'estrategias', title: 'Estrategias para mejorar la comprensión', kind: 'youtube', src: YT + 'WgHK3SJ4yKg' },
    { key: 'literal', title: 'Comprensión literal: más estrategias', kind: 'youtube', src: YT + 'ZWhvOy938Go' },
    { key: 'ideas', title: 'Identificación de ideas principales y secundarias', kind: 'youtube', src: YT + 'VVk0pFDiYps' },
    { key: 'explicito', title: 'Análisis explícito: ideas principales y secundarias', kind: 'genially', src: G + '6939af258fe554ed368e181e' },
    { key: 'inferencias', title: 'Las inferencias, hipótesis y análisis implícito', kind: 'genially', src: G + '6939af1d4ab80b4e272e4329' },
    { key: 'critico', title: 'Análisis crítico valorativo', kind: 'genially', src: G + '6939af2b71d8f29cdfd98c52' },
    { key: 'falacias', title: 'Identificación de falacias y sesgos en textos', kind: 'genially', src: G + '69e15995dab3d27e5647e7a2' },
    { key: 'argumentacion', title: 'Lectura y argumentación', kind: 'genially', src: G + '69e159c4bcbf6c4dcde2fcff' },
    { key: 'sin-terror', title: 'Comunicándote sin terror', kind: 'genially', src: G + '68def8aeb3cda70d0a3b8c18' },
    { key: 'laboratorio', title: 'Laboratorio de lectura', kind: 'genially', src: G + '692f4b5525eca5229fc67e26' }
  ] },
  { id: 'mul', name: 'Multilingüismo', glyph: 'Aa', color: '#e8b84b', tag: 'Comunicarte en inglés en la vida diaria', islands: [
    { key: 'weather', title: 'Weather or Not? Talking About the Weather', kind: 'genially', src: G + '697a950edb832ffe0278d06d' },
    { key: 'money', title: 'Money Matters! English for Shopping & Payments', kind: 'genially', src: G + '69a792582b0b6c9175a1ca08' },
    { key: 'movies', title: 'Talking about Movies', kind: 'youtube', src: YT + '2Q10nrtrqyI' },
    { key: 'music', title: 'Talking about Music', kind: 'youtube', src: YT + 'g-t0Zd4OTtg' },
    { key: 'art', title: 'Talking about Art', kind: 'youtube', src: YT + 'SQtnbasmRaU' }
  ] }
];
