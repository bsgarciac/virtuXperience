// Validates the cannon wall bank (run through `npm run check:levels`).
import { BANK } from '../src/galaxies/neuromath/games/cannon/levels.js';
import { solutions, allParams, simulate, f, fmt } from '../src/galaxies/neuromath/games/cannon/math.js';

var failures = 0;
BANK.forEach(function(lv){
  var problems = [];
  var sols = solutions(lv);
  var twoParams = Object.keys(lv.adjust).length > 1;
  if(!sols.length) problems.push('no solution');
  if(sols.length > (twoParams ? 2 : 1)) problems.push(sols.length + ' solutions');
  // Tier ideas must matter:
  if(lv.horizontal && !allParams(lv).some(function(p){ return simulate(lv, p).kind === 'glancing'; }))
    problems.push('no glancing shot possible, the horizontal rule does not matter');
  if(lv.rock && !allParams(lv).some(function(p){ return Math.abs(f(p, lv.wall.x) - lv.crack) < 1e-9 && simulate(lv, p).kind === 'rock'; }))
    problems.push('the rock never blocks a shot aimed at the crack');
  if(lv.adjust.c && simulate(lv, Object.assign({}, lv.fixed, { c: 0 })).kind === 'crack')
    problems.push('works without raising the cannon');
  var label = 'cannon tier ' + (lv.tier + 1) + ' · ' + lv.tierName.padEnd(9) + ' wall x=' + lv.wall.x + ' crack y=' + String(lv.crack).padEnd(3) +
    ' fixed ' + JSON.stringify(lv.fixed).padEnd(15);
  var solText = sols.map(function(p){ return Object.keys(lv.adjust).map(function(k){ return k + '=' + fmt(p[k]); }).join(' '); }).join(' | ');
  if(problems.length){ failures++; console.log('✗ ' + label + ' ' + problems.join(', ')); }
  else console.log('✓ ' + label + ' → ' + solText);
});
console.log('\n' + BANK.length + ' walls, ' + failures + ' invalid');
if(failures) process.exitCode = 1;
