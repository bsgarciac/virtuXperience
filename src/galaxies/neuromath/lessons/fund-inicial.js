// Fundamentos · Inicial: the order of operations, for the bridge game.
export default {
  icon: '🧮',
  title: 'Jerarquía de operaciones',
  lead: 'Si una cuenta mezcla operaciones, <b>no</b> se resuelve de izquierda a derecha: hay un orden.',
  blocks: [
    { type: 'steps', heading: 'El orden, paso a paso', items: [
      { title: '( ) Paréntesis', text: 'Lo de adentro va primero.' },
      { title: '× ÷ Multiplica y divide', text: 'De izquierda a derecha.' },
      { title: '+ − Suma y resta', text: 'Al final, de izquierda a derecha.' }
    ] },
    { type: 'compare', heading: 'Ejemplo: $3 + 4 \\times 2$',
      bad: { title: 'Sumar primero', text: '$7 \\times 2 = 14$' },
      good: { title: 'Multiplicar primero', text: '$3 + 8 = 11$' } },
    { type: 'tip', text: 'En esta isla, el largo de cada puente es el resultado de tu expresión. Si te saltas el orden, el puente se queda corto o se pasa.' }
  ]
};
