// Isla de Instituciones: who is who in the entrepreneurship ecosystem.
export default {
  icon: '🏛️',
  title: 'Las instituciones del ecosistema',
  lead: 'Nadie emprende solo: hay entidades que te ayudan, y cada una cumple <b>un</b> rol.',
  blocks: [
    { type: 'cards', heading: 'Tres órbitas, tres roles', items: [
      { icon: '🎓', title: 'Formación', text: 'Te enseñan y te acompañan a armar el negocio.', eg: 'SENA, Ruta N, incubadoras', color: '#57d9f0' },
      { icon: '📜', title: 'Formalización', text: 'Te ayudan a existir legalmente y a conectarte.', eg: 'Cámara de Comercio, DIAN, FENALCO', color: '#6fe39a' },
      { icon: '💰', title: 'Financiación', text: 'Ponen el dinero para arrancar o crecer.', eg: 'Fondo Emprender, Bancóldex', color: '#e86bd0' }
    ] },
    { type: 'steps', heading: 'Lo que harás en esta isla', items: [
      { title: 'Mapa de Actores', text: 'Ubica cada entidad en su órbita.' },
      { title: 'Directorio de Contactos', text: 'Conecta cada necesidad con quien la resuelve.' }
    ] },
    { type: 'tip', text: 'Ante cada entidad pregúntate: ¿me <b>enseña</b>, me <b>formaliza</b> o me <b>financia</b>?' }
  ]
};
