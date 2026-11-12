// VoxCivitas's planets and the resources on each, migrated from the old
// "Virtual - VoxCivitas" site (uniminuto.edu/virtual-voxcivitas, one
// article per resource at uniminuto.edu/articulo/<slug>). Planets are the
// old site's sections; each resource is one island, in a suggested
// learning order (the old site had none).
//
// Shape and rules (keys never change once deployed): shared/game/recurso.js.
var G = 'https://view.genially.com/';
var YT = 'https://www.youtube.com/embed/';

export var PLANETS = [
  { id: 'ciu', name: 'Competencias Ciudadanas', glyph: '⌂', color: '#ffa94d', tag: 'Democracia, derechos y participación', islands: [
    { key: 'ciudadano', title: '¿Qué significa ser ciudadano?', kind: 'youtube', src: YT + 'e9NelE8o3Ls' },
    { key: 'democracia', title: 'La democracia: definición y principios fundamentales', kind: 'genially', src: G + '689e29a4e2d97412790c3a74' },
    { key: 'origenes', title: 'Orígenes de la democracia', kind: 'genially', src: G + '69021b2a5151ac3654a4ccf5' },
    { key: 'raices', title: 'Raíces democráticas: un viaje en el tiempo', kind: 'genially', src: G + '68db0adde7d822e192de228d' },
    { key: 'reto-raices', title: 'Reto: raíces democráticas', kind: 'genially', src: G + '68db0af619b5106484a34855' },
    { key: 'tipos', title: 'Tipos de democracia', kind: 'genially', src: G + '6931fa9ac7494dd6abc3b881' },
    { key: 'diversidad', title: 'Diversidad democrática: modelos y variantes', kind: 'genially', src: G + '68f668c031807305a05ccb46' },
    { key: 'pilar', title: 'Democracia: el pilar de la libertad y la justicia', kind: 'genially', src: G + '693b2c5bff7b4aebb801f705' },
    { key: 'derechos', title: 'Democracia y derechos: una relación inseparable', kind: 'genially', src: G + '697a169aed830a46f65f4aa6' },
    { key: 'participa', title: 'Participa y transforma: el poder de tu voz', kind: 'genially', src: G + '697a1f056ccd184ceaf1f0a9' }
  ] },
  { id: 'aut', name: 'Aprendizaje Autónomo', glyph: '⟲', color: '#57d9c9', tag: 'Aprender a aprender, a tu ritmo', islands: [
    { key: 'aprende', title: '¡Aprende a aprender! Descubre tu poder interno', kind: 'genially', src: G + '68a5d96f805f0fe45974a77e' },
    { key: 'autodirigido', title: 'Aprendizaje autónomo: aprendizaje autodirigido y toma de decisiones', kind: 'genially', src: G + '68db0aeaa821e179b54e7150' },
    { key: 'adn', title: 'ADN del aprendiz autónomo', kind: 'genially', src: G + '6a6295f253e68a8f3146a2d5' },
    { key: 'estudiante', title: 'El estudiante ideal', kind: 'genially', src: G + '6a768cde8c8a2c58c1808c7a' },
    { key: 'capitan', title: 'Sé el capitán de tu barco: ¡autonomía al mando!', kind: 'youtube', src: YT + 'c5qeHvqI_9k' },
    { key: 'autonomia', title: '¡Autonomía al mando!', kind: 'genially', src: G + '693208f0c8d0b0de2649d694' },
    { key: 'autorregulacion', title: 'Tu mente, tu regla: domina el arte de autorregularte', kind: 'genially', src: G + '69a7675013ed464609f19a23' },
    { key: 'chispa', title: 'La chispa que enciende el motor: ¡actívate!', kind: 'youtube', src: YT + '9-GTf8wv1UI' },
    { key: 'activa-mente', title: 'Activa tu mente', kind: 'youtube', src: YT + 'BDJJAMIsbKo' },
    { key: 'redes', title: 'El poder de las redes: procesamiento de información', kind: 'genially', src: G + '69021ef90259e432f65efbc1' },
    { key: 'mision-tiempo', title: 'La misión del tiempo: desbloqueando el aprendizaje', kind: 'genially', src: G + '6a565012b1eed0a36e2cec75' },
    { key: 'hackea', title: 'Hackea tu tiempo', kind: 'youtube', src: YT + 'xg2ItDpxhZs' },
    { key: 'productividad', title: 'Técnicas de productividad y gestión del tiempo', kind: 'genially', src: G + '6a26d907191fd32d852a4258' },
    { key: 'digital', title: 'El aprendizaje digital y sus beneficios', kind: 'genially', src: G + '6a25b1443ee37471936b2df3' },
    { key: 'aprendiz-digital', title: 'Aprendiz digital', kind: 'genially', src: G + '6a42ab7d876adad330b6deac' }
  ] },
  { id: 'vida', name: 'Proyecto de Vida', glyph: '✧', color: '#e86bd0', tag: 'Conocerte para decidir tu camino', islands: [
    { key: 'quien-eres', title: '¿Quién eres cuando nadie te mira?', kind: 'genially', src: G + '693af94f97334d10a9f987ea' },
    { key: 'autoconocimiento', title: 'El poder del autoconocimiento en tu proyecto de vida', kind: 'youtube', src: YT + 'Z9IOEjiVCIE' },
    { key: 'autoesquemas', title: 'El árbol de mis autoesquemas', kind: 'genially', src: G + '6928a76bfc75c974d6c21e30' },
    { key: 'espejos', title: 'Cuatro espejos: mi verdad interior', kind: 'youtube', src: YT + 'b8Y76XTWbIM' },
    { key: 'autentico', title: '¿Qué me hace auténtico?', kind: 'genially', src: G + '69021f0070a6f197f31f7ea0' },
    { key: 'dimensiones', title: 'Mis dimensiones', kind: 'youtube', src: YT + 'RTW7yea0MUk' },
    { key: 'cual-dimension', title: '¿En cuál dimensión estoy mejor?', kind: 'genially', src: G + '6abd6509b57547e6666986e5' },
    { key: 'misterios-mente', title: 'Los misterios de tu mente: cómo procesa y aplica el conocimiento', kind: 'genially', src: G + '68db0ae49e9ddbb267616b84' },
    { key: 'creencias', title: 'Tus creencias determinan tu proyecto de vida', kind: 'genially', src: G + '68f668e28265c27636aec5b4' },
    { key: 'etica-moral', title: 'Dimensión ética y moral en tu proyecto de vida', kind: 'genially', src: G + '68f668e931807305a05cf19f' },
    { key: 'etica-accion', title: 'Ética en acción', kind: 'genially', src: G + '69021ef46cafc8da03340cbc' },
    { key: 'miedo-cambio', title: 'El miedo al cambio: cómo convertirlo en motivación', kind: 'genially', src: G + '68db0afc19b5106484a34bb6' },
    { key: 'traza', title: 'Traza tu línea', kind: 'youtube', src: YT + '_9hiktpcwkU' },
    { key: 'futuro', title: 'Diseña el futuro que te hace feliz', kind: 'genially', src: G + '69a7675d6e8e3d46ad66703e' }
  ] }
];
