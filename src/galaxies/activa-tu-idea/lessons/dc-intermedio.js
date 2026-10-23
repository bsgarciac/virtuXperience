// Isla de Cómo montar un emprendimiento: applying to a call for funding.
export default {
  icon: '📝',
  title: 'Cómo postular a una convocatoria',
  lead: 'Una <b>convocatoria</b> es un concurso para conseguir recursos. Se gana siguiendo un orden.',
  blocks: [
    { type: 'cards', heading: 'Palabras clave', items: [
      { icon: '📋', title: 'TDR', text: 'Las reglas del concurso: quién puede postular y qué piden.' },
      { icon: '🤝', title: 'Carta de intención', text: 'Un aliado que te respalda por escrito.' },
      { icon: '🛠️', title: 'Subsanación', text: 'El plazo para corregir lo que falta.' },
      { icon: '🎤', title: 'Pitch', text: 'Tu presentación corta ante el comité.' }
    ] },
    { type: 'compare', heading: 'Ojo con el orden',
      bad: { title: 'Correr a llenar el formulario', text: 'Sin leer las reglas, te rechazan en el primer filtro.' },
      good: { title: 'Prepararte paso a paso', text: 'Cada paso deja listo lo que necesita el siguiente.' } },
    { type: 'tip', text: 'Vas a ordenar los seis pasos de una postulación. Pregúntate qué necesitas tener listo antes de cada uno.' }
  ]
};
