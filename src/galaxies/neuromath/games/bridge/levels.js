import { OP_ADD, OP_SUB, OP_MUL } from './math.js';
import { pickOne } from '../../../../shared/random.js';

// The exercise bank: 20 abysses in 5 tiers of growing difficulty. Each play
// (a "round") takes one abyss per tier, in order, so a round is 5 abysses
// and replaying the planet brings different ones.
//
// tpl: n = number slot, o = operator slot, ( ) = fixed parentheses.
// Run `npm run check:levels` after editing: every abyss must have a solution,
// and the rule the tier teaches has to matter for it (solving it left to right,
// or ignoring the parentheses, must NOT also land on the target).
export var TIERS = [
  { // × before +
    tpl: 'n o n o n', ops: [OP_ADD, OP_MUL],
    hint: function(T){ return 'La multiplicación se resuelve antes que la suma. Piensa qué producto, sumado al número que queda, da <b>' + T + '</b>.'; },
    abysses: [ { nums:[3,4,2], target:11 }, { nums:[2,5,6], target:17 }, { nums:[3,4,5], target:19 }, { nums:[2,6,10], target:22 } ] },
  { // × before −
    tpl: 'n o n o n', ops: [OP_SUB, OP_MUL],
    hint: function(T){ return 'También aquí la multiplicación va primero. Pregúntate qué producto necesitas restarle al número más grande para llegar a <b>' + T + '</b>.'; },
    abysses: [ { nums:[10,2,3], target:4 }, { nums:[15,2,4], target:7 }, { nums:[18,3,4], target:6 }, { nums:[20,3,5], target:5 } ] },
  { // four numbers, three operations
    tpl: 'n o n o n o n', ops: [OP_ADD, OP_MUL, OP_SUB],
    hint: function(T){ return 'Con cuatro números, busca primero qué producto te acerca más a <b>' + T + '</b> y luego ajusta con la suma y la resta.'; },
    abysses: [ { nums:[2,3,5,4], target:19 }, { nums:[2,3,6,7], target:23 }, { nums:[3,5,7,10], target:16 }, { nums:[2,5,6,8], target:12 } ] },
  { // parentheses first
    tpl: '( n o n ) o n', ops: null, // per abyss
    hint: function(T){ return 'Lo que está entre paréntesis se resuelve primero. Decide qué va dentro para que, al multiplicar, llegues a <b>' + T + '</b>.'; },
    abysses: [ { nums:[2,3,4], ops:[OP_ADD, OP_MUL], target:20 }, { nums:[2,4,7], ops:[OP_ADD, OP_MUL], target:22 },
               { nums:[3,4,5], ops:[OP_SUB, OP_MUL], target:8 }, { nums:[3,5,10], ops:[OP_SUB, OP_MUL], target:15 } ] },
  { // parentheses, then ×, then + and −
    tpl: '( n o n ) o n o n', ops: null,
    hint: function(T){ return 'Primero el paréntesis, luego la multiplicación y al final la suma o la resta. Busca qué producto queda cerca de <b>' + T + '</b>.'; },
    abysses: [ { nums:[3,4,5,8], ops:[OP_ADD, OP_MUL, OP_SUB], target:17 }, { nums:[4,6,9,10], ops:[OP_ADD, OP_MUL, OP_SUB], target:22 },
               { nums:[2,4,5,6], ops:[OP_SUB, OP_MUL, OP_ADD], target:6 }, { nums:[4,6,8,10], ops:[OP_SUB, OP_MUL, OP_ADD], target:24 } ] }
];

// Flattened, self-contained levels: { tier, tpl, nums, ops, target, hint }.
export var BANK = [];
TIERS.forEach(function(tier, ti){
  tier.abysses.forEach(function(a){
    BANK.push({ tier: ti, tpl: tier.tpl, nums: a.nums, ops: a.ops || tier.ops, target: a.target, hint: tier.hint(a.target) });
  });
});

export function pickRound(){
  return TIERS.map(function(tier, ti){
    return pickOne(BANK.filter(function(l){ return l.tier === ti; }));
  });
}
