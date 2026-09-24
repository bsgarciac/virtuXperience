// The wider VirtuXperience galaxy map — only Neuromath has a built path so
// far, the rest are shown as "próximamente" so the galaxy-select screen
// reads as a real hub rather than a single dead-end button.
export var GALAXIES = [
  { id:'neuromath',    name:'Neuromath',    sub:'Matemáticas + IA', enabled:true,
    colors:{ g1:'#57d9c9', g2:'#9b8cf2', g3:'#e8b84b' } },
  { id:'comunicarte',  name:'ComunicArte',  sub:'Próximamente', enabled:false,
    colors:{ g1:'#6b7fc9', g2:'#3f4d8a' } },
  { id:'latidosocial', name:'LatidoSocial', sub:'Próximamente', enabled:false,
    colors:{ g1:'#c97ba0', g2:'#7a3f5c' } },
  { id:'voxcivitas',   name:'VoxCivitas',   sub:'Próximamente', enabled:false,
    colors:{ g1:'#c99a5a', g2:'#8a5f2e' } }
];
