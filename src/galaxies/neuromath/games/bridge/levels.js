import { OP_ADD, OP_SUB, OP_MUL } from './math.js';

// tpl: n = number slot, o = operator slot, ( ) = fixed parentheses.
// Every level was brute-forced offline: each has at least one solution and
// reading it left-to-right gives a different (wrong) value than the correct one.
export var BRIDGE_LEVELS = [
  { nums:[3,4,2],   ops:[OP_ADD,OP_MUL],         tpl:'n o n o n',     target:11,
    hint:'La multiplicación se resuelve antes que la suma. Prueba distintas posiciones y compara el resultado paso a paso.' },
  { nums:[10,2,3],  ops:[OP_SUB,OP_MUL],         tpl:'n o n o n',     target:4,
    hint:'También aquí la multiplicación va primero. Pregúntate qué producto necesitas restarle a 10 para llegar a 4.' },
  { nums:[2,3,5,4], ops:[OP_ADD,OP_MUL,OP_SUB],  tpl:'n o n o n o n', target:19,
    hint:'Con cuatro números, busca primero qué producto te acerca más a 19 y luego ajusta con la suma y la resta.' },
  { nums:[2,3,4],   ops:[OP_ADD,OP_MUL],         tpl:'( n o n ) o n', target:20,
    hint:'Lo que está entre paréntesis se resuelve primero. Prueba una suma dentro del paréntesis para que crezca antes de multiplicar.' }
];
