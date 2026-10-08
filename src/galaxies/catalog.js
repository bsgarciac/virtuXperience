// The wider VirtuXperience galaxy map — Neuromath and CreaGenesis have a
// built path (atlas/world.js); the rest are shown as "próximamente" so the
// galaxy-select screen reads as a real hub.
export var GALAXIES = [
  { id:'neuromath',    name:'Neuromath',    sub:'Matemáticas + IA', enabled:true,
    colors:{ g1:'#57d9c9', g2:'#9b8cf2', g3:'#e8b84b' } },
  { id:'creagenesis',  name:'CreaGenesis',  sub:'Emprendimiento', enabled:true,
    colors:{ g1:'#6fe39a', g2:'#1f8f87', g3:'#e4ffd9' } },
  { id:'comunicarte',  name:'ComunicArte',  sub:'Próximamente', enabled:false,
    colors:{ g1:'#6c8cff', g2:'#3b4fd1', g3:'#bfd0ff' } },
  { id:'latidosocial', name:'LatidoSocial', sub:'Próximamente', enabled:false,
    colors:{ g1:'#ff6fae', g2:'#a03a8c', g3:'#ffd1e6' } },
  { id:'voxcivitas',   name:'VoxCivitas',   sub:'Próximamente', enabled:false,
    colors:{ g1:'#ffa94d', g2:'#c2502e', g3:'#ffe2a8' } }
];
