// Activa tu idea's paths: resources from the old "Virtual - Proyectos e
// Investigación" site (uniminuto.edu/virtual-proyectos-e-investigacion) —
// videos (islands) and Genially (meteors) — around our own games (comets).
// Its Emprendimiento section joins the Distrito Cristalino, whose three
// comets are the walk-and-Nodo games; Investigación is a planet of its own.
// Left out: "Crecimiento empresarial", which only linked a PDF report.
//
// Shape and rules (keys never change once deployed): shared/game/recurso.js.
// { key: 'inicial' } etc. are the Distrito Cristalino's games: their ids
// stay 'dc-<level>' from before, so progress saved on them is kept.
var G = 'https://view.genially.com/';
var YT = 'https://www.youtube.com/embed/';

export var PATHS = [
  { id: 'dc', islands: [
    { key: 'evolucion', title: 'Evolución histórica del emprendimiento: del trueque a la innovación digital', kind: 'youtube', src: YT + 'f1TeQimW-Yc' },
    { key: 'habilidades', title: 'Habilidades del emprendedor', kind: 'genially', src: G + '68a397133427c12cc0aa8364' },
    { key: 'habilidades-2', title: 'Habilidades de un emprendedor', kind: 'genially', src: G + '68db09a20d0bb970c34577ad' },
    { key: 'ecosistema', title: 'Ecosistema emprendedor y red de apoyo', kind: 'genially', src: G + '68db0cb40c4386cb4bc21f44' },
    { key: 'inicial' }, // Instituciones
    { key: 'formalizacion', title: 'Formalización jurídica', kind: 'youtube', src: YT + '4uPfXn0VDGs' },
    { key: 'formalizacion-paso', title: 'Formalización jurídica: el primer paso para emprender', kind: 'genially', src: G + '6a3074dd44031a75fab69530' },
    { key: 'propuesta-valor', title: '¿Qué es una propuesta de valor?', kind: 'genially', src: G + '6979231c9f937512dbd387c2' },
    { key: 'canvas', title: 'Business Model Canvas', kind: 'genially', src: G + '697924109f937512dbd455d3' },
    { key: 'hipotesis', title: 'Validar hipótesis y desarrollar prototipos', kind: 'genially', src: G + '697923254b30fa672fedc1e5' },
    { key: 'intermedio' }, // Cómo montar un emprendimiento
    { key: 'planeacion', title: 'Planeación ágil y gestión del tiempo', kind: 'youtube', src: YT + 'aDWmHX_eqM8' },
    { key: 'liderazgo', title: 'Liderazgo y cultura ágil en el emprendimiento', kind: 'youtube', src: YT + 'XUlMz2GYpAQ' },
    { key: 'navideno', title: 'Emprendimiento navideño', kind: 'genially', src: G + '69189a348d7d59d1ddc833a8' },
    { key: 'embrujo', title: 'Embrujo del Millón: la innovación se viste de misterio', kind: 'genially', src: G + '68f252a12f7566623efca0ea' },
    { key: 'avanzado' } // La Estrategia
  ] },
  { id: 'inv', islands: [
    { key: 'importancia', title: '¿Por qué es importante la investigación en la educación superior?', kind: 'youtube', src: YT + 'ANZosNE0wq0' },
    { key: 'importancia-reto', title: '¿Por qué es importante la investigación en la educación superior?', kind: 'genially', src: G + '6ad2be0ef5320290b0ac10b6' },
    { key: 'cualidades', title: 'Cualidades de un investigador', kind: 'genially', src: G + '6932083dc79f509a374fabd2' },
    { key: 'pregunta', title: '¿Qué diferencia una pregunta cotidiana de una pregunta de investigación?', kind: 'youtube', src: YT + 's-A1n7ffeyQ' },
    { key: 'pregunta-perfecta', title: 'Misión investigador: domina la pregunta perfecta', kind: 'genially', src: G + '6a4703db4e6617a7efbea9f3' },
    { key: 'errores', title: 'Errores frecuentes al iniciar una investigación', kind: 'genially', src: G + '6a30727f4bb52bb4623da061' },
    { key: 'consejos', title: 'Consejos para realizar investigaciones en la educación superior', kind: 'genially', src: G + '6ad3b58254a64df61a615ba5' },
    { key: 'guia', title: 'Tu guía para investigar como un pro', kind: 'youtube', src: YT + 'K5ATu6b2t2g' }
  ] }
];

export function pathOf(id){ return PATHS.find(function(p){ return p.id === id; }); }
