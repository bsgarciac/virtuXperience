// Gerencia+'s planets and the resources on each, migrated from the old
// "Virtual - Habilidades Gerenciales" site (uniminuto.edu/virtual-habilidades-
// gerenciales, one article per resource at uniminuto.edu/articulo/<slug>).
// Planets are the old site's sections; each resource is one node — a video
// (isla) or a Genially (meteoro) — in a suggested learning order (the old
// site had none). Left out: "Liderazgo y gestión de los procesos" and
// "Gestión del cambio en el liderazgo" (their articles embed other
// resources' Genially) and the older copy of "Energiza tu equipo".
//
// Shape and rules (keys never change once deployed): shared/game/recurso.js.
var G = 'https://view.genially.com/';
var YT = 'https://www.youtube.com/embed/';

export var PLANETS = [
  { id: 'lgr', name: 'Liderazgo Gerencial', glyph: '★', color: '#f5c84c', tag: 'Liderar personas, procesos y decisiones', islands: [
    { key: 'concepto', title: 'Aproximación al concepto de liderazgo', kind: 'genially', src: G + '68c43de2031d18261302e47b' },
    { key: 'ayer-hoy', title: 'Liderazgo de ayer, hoy y mañana', kind: 'genially', src: G + '6a45264d99541aad007376b0' },
    { key: 'competencias', title: 'Características y competencias de los líderes en el ámbito gerencial', kind: 'genially', src: G + '699db254e55eac24bb2286f2' },
    { key: 'habilidades', title: 'Habilidades personales del líder efectivo', kind: 'genially', src: G + '69aafd0630c4d6416b64aac1' },
    { key: 'camaleonicos', title: 'Liderazgos camaleónicos: inspira, adapta o déjalo fluir', kind: 'genially', src: G + '68d6b72d8758c294b552bc38' },
    { key: 'jefes', title: 'Jefes y compañeros: cuándo mando, cuándo escucho y cuándo negocio', kind: 'genially', src: G + '68d6b728769b5967e877b2ed' },
    { key: 'comunicacion', title: 'Comunicación organizacional', kind: 'genially', src: G + '69a9ee4ed5ce5821fe834c90' },
    { key: 'procesos', title: 'Liderazgo y gestión de procesos', kind: 'genially', src: G + '69def08024862a2c58087105' },
    { key: 'indicadores', title: '¿Estás gestionando con datos o con intuición? El poder de los indicadores de gestión', kind: 'youtube', src: YT + 'im4w0RKtwRA' },
    { key: 'estrategico', title: 'Liderazgo y pensamiento estratégico', kind: 'genially', src: G + '699db2809a0361e02c4642e9' },
    { key: 'decisiones', title: 'Toma de decisiones: el GPS de tu éxito', kind: 'youtube', src: YT + '48cfgp5Uawg' },
    { key: 'tiempo', title: 'Manejo del tiempo: reuniones efectivas', kind: 'genially', src: G + '69a9f13c9364537a8e3f5000' },
    { key: 'reuniones', title: '¿Quién quiere ser productivo? El juego de las reuniones', kind: 'genially', src: G + '68f669bed3be9a613eb10e51' },
    { key: 'cambia-chip', title: '¡Cambia el chip! Lidera sin perder la cabeza', kind: 'genially', src: G + '68f668a2af5c5818ea3dc6c3' },
    { key: 'rse', title: 'Responsabilidad social empresarial', kind: 'genially', src: G + '69c2fd6aa72e2c5c7560abef' },
    { key: 'neoxi', title: 'Misión Neoxi: mentes gerenciales', kind: 'genially', src: G + '68e3f99b452a3094a6709de8' }
  ] },
  { id: 'agil', name: 'Metodologías Ágiles', glyph: '↻', color: '#5fd4e8', tag: 'Scrum, Kanban y equipos que se adaptan', islands: [
    { key: 'empresas', title: 'Empresas en movimiento: descubre el poder de las metodologías ágiles', kind: 'genially', src: G + '691cc532282e270841348ba5' },
    { key: 'manifiesto', title: 'Manifiesto Ágil: flexibilidad, velocidad y trabajo en equipo', kind: 'genially', src: G + '68d6b731ea736df4b9440138' },
    { key: 'confianza', title: 'Del miedo al cambio a la confianza ágil', kind: 'genially', src: G + '6a6cdc01fb8d6d3780e5f910' },
    { key: 'kanban', title: 'Kanban en acción: del caos al flujo ágil', kind: 'genially', src: G + '690ba1b3a9c721b199c9b32f' },
    { key: 'plataformas', title: 'Plataformas digitales de gestión de metodologías ágiles', kind: 'genially', src: G + '68c43ce7e251ccf868468455' },
    { key: 'sprint-ia', title: 'Sprint inteligente: IA en acción en Scrum y Kanban', kind: 'genially', src: G + '6a6d03dbddd7a48d28ac985b' },
    { key: 'safe', title: 'SAFe: escalando la agilidad para un éxito a gran escala', kind: 'genially', src: G + '690ba1b789d2ff1e2a942d35' },
    { key: 'herramientas', title: 'Herramientas ágiles: ¡juega y aprende!', kind: 'genially', src: G + '691cc52f282e2708413488c4' }
  ] },
  { id: 'mkt', name: 'Marketing', glyph: '◈', color: '#ff8a5c', tag: 'Entender al cliente y medir lo que funciona', islands: [
    { key: 'tipos', title: 'Tipos de marketing', kind: 'youtube', src: YT + 'rLMy60bz7Rg' },
    { key: 'innovar', title: '¿Innovar o desaparecer? El nuevo marketing en tiempos de incertidumbre', kind: 'youtube', src: YT + 'OiyDV5lrsL8' },
    { key: 'consumidor', title: 'Psicología del consumidor: neuromarketing y sesgos cognitivos', kind: 'genially', src: G + '6a9af02b9357080302a7c4d9' },
    { key: 'redes', title: 'Marketing en redes sociales', kind: 'genially', src: G + '6abd4244b57547e666511507' },
    { key: 'kpi', title: 'KPI en marketing', kind: 'genially', src: G + '6abd41ed03523f104b0df704' },
    { key: 'pinata', title: 'Piñata viral: estrategias que estallan', kind: 'genially', src: G + '6930a4251f218d94cdffcbea' },
    { key: 'sopa', title: 'Sopa de letras del marketing', kind: 'genially', src: G + '693202ec3937f5c664058b21' }
  ] },
  { id: 'th', name: 'Talento Humano', glyph: '☺', color: '#7be08f', tag: 'Personas, clima y bienestar en el trabajo', islands: [
    { key: 'impacto', title: 'Talento humano y su impacto en la organización', kind: 'genially', src: G + '6a10cdb35a7c072980b0fb6b' },
    { key: 'relaciones', title: 'Gestión de las relaciones laborales', kind: 'genially', src: G + '6a2c39491c0297a14274e4ad' },
    { key: 'motivacion', title: 'Energiza tu equipo: el poder de la motivación organizacional', kind: 'genially', src: G + '699db2979ebed83f590213b7' },
    { key: 'emociones', title: 'Emociones en equipo: cuando sentir es la mejor estrategia', kind: 'youtube', src: YT + 'DV4wYgAdnow' },
    { key: 'clima', title: 'Salvar el clima institucional', kind: 'genially', src: G + '6a317e93285f20a29c3f38e3' },
    { key: 'bienestar', title: 'Porque trabajar no tiene que ser un drama: bienestar laboral ¡ya!', kind: 'youtube', src: YT + 'toGugmq1fX8' },
    { key: 'evaluacion', title: '¿Te evaluaron? Cómo sobrevivir sin perder la cabeza', kind: 'youtube', src: YT + '1HpUN8mUPSQ' }
  ] }
];
