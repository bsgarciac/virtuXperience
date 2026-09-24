// Validates the bridge exercise bank. Run with `npm run check:levels`.
import { BANK } from '../src/galaxies/neuromath/games/bridge/levels.js';
import { arrangements, solutions, solve, evaluate, stripParens, templateSlots } from '../src/galaxies/neuromath/games/bridge/math.js';

var failures = 0;
BANK.forEach(function(lv, i){
  var slots = templateSlots(lv.tpl);
  var problems = [];
  var nSlots = slots.filter(function(c){ return c === 'n'; }).length;
  var oSlots = slots.filter(function(c){ return c === 'o'; }).length;
  if(nSlots !== lv.nums.length || oSlots !== lv.ops.length) problems.push('tiles do not fit the template');
  var sols = problems.length ? [] : solutions(lv);
  if(!problems.length && !sols.length) problems.push('no solution');
  var parens = slots.indexOf('(') !== -1;
  // The rule must matter: at least one solution breaks if solved the wrong way.
  var ruleMatters = sols.some(function(s){
    return parens ? evaluate(stripParens(s)) !== lv.target : solve(s, false).value !== lv.target;
  });
  if(sols.length && !ruleMatters) problems.push(parens ? 'parentheses do not matter' : 'order of operations does not matter');
  var trap = !problems.length && arrangements(lv).some(function(a){
    return evaluate(a) !== lv.target && (solve(a, false).value === lv.target || (parens && evaluate(stripParens(a)) === lv.target));
  });
  var label = 'tier ' + (lv.tier + 1) + ' · ' + lv.tpl.padEnd(17) + ' ' + JSON.stringify(lv.nums).padEnd(11) + ' ' + lv.ops.join('') + ' = ' + lv.target;
  if(problems.length){ failures++; console.log('✗ ' + label + '  ' + problems.join(', ')); }
  else console.log('✓ ' + label + '  (' + sols.length + ' solution' + (sols.length === 1 ? '' : 's') + (trap ? ', has a left-to-right trap' : '') + ')');
});
console.log('\n' + BANK.length + ' abysses, ' + failures + ' invalid');
process.exit(failures ? 1 : 0);
