export var TOPICS = [
  {id:'fund', name:'Fundamentos',      glyph:'±', color:'#e8b84b', tag:'Las bases de toda operación matemática'},
  {id:'calc', name:'Cálculo',          glyph:'∫', color:'#9b8cf2', tag:'El estudio del cambio y la acumulación'},
  {id:'alg',  name:'Álgebra',         glyph:'x²',color:'#e2708f', tag:'El lenguaje de las incógnitas'},
  {id:'des',  name:'Desafiómetro',     glyph:'⚡',color:'#f2a34d', tag:'Retos de lógica e ingenio'},
  {id:'est',  name:'Estadística',      glyph:'μ', color:'#4fbf8b', tag:'El arte de leer los datos'}
];
export var LEVELS = [
  {id:'inicial',    label:'Inicial'},
  {id:'intermedio', label:'Intermedio'},
  {id:'avanzado',   label:'Avanzado'}
];

export var NODES = [];
TOPICS.forEach(function(topic, ti){
  LEVELS.forEach(function(level, li){
    NODES.push({
      id: topic.id + '-' + level.id,
      topic: topic, level: level,
      topicIndex: ti, levelIndex: li,
      isLastOfTopic: li === LEVELS.length - 1
    });
  });
});
