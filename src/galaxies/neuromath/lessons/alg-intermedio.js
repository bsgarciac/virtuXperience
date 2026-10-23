// Álgebra · Intermedio: the quadratic function, for the cannon game.
export default {
  icon: '🎯',
  title: 'La función cuadrática',
  lead: 'Una <b>parábola</b> es la curva de un disparo. Tres números deciden su forma.',
  blocks: [
    { type: 'formula', tex: 'f(x) = a\\,x^2 + b\\,x + c', parts: [
      { tex: 'a', text: 'Apertura. Si es negativo, abre hacia abajo.', color: '#e2708f' },
      { tex: 'b', text: 'Pendiente con la que sale la curva.', color: '#e8b84b' },
      { tex: 'c', text: 'Altura de salida: $f(0) = c$', color: '#57d9c9' }
    ] },
    { type: 'cards', items: [
      { icon: '⛰️', title: 'El vértice', text: 'Es el punto más alto: $x_v = -\\frac{b}{2a}$. Ahí la curva queda plana.' },
      { icon: '🧱', title: 'Golpe horizontal', text: 'Si el vértice cae justo en el muro, la bala llega derecha.' }
    ] },
    { type: 'formula', heading: 'Ejemplo con $a = -1$, $b = 6$, $c = 0$', tex: 'f(2) = -1 \\cdot 4 + 6 \\cdot 2 + 0 = 8' },
    { type: 'tip', text: 'En esta isla, el cañón dispara siguiendo $f(x)$. Ajusta los parámetros hasta que la bala dé en la grieta del muro.' }
  ]
};
