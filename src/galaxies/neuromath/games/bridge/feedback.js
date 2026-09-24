import { fmtNum, solve, stripParens, stepText, solutions } from './math.js';

// Works out *why* a bridge came out wrong, so the feedback can point at the
// mistake instead of only saying "too short / too long":
//   'order'     → the tiles would reach the target read left to right, so the
//                 player most likely forgot that × goes before + and −.
//   'parens'    → the tiles would reach the target without the parentheses,
//                 so the player skipped solving the parentheses first.
//   'placement' → neither: some tiles are in the wrong place. wrongSlots are
//                 the slots that differ from the closest correct arrangement
//                 (left empty when that is every tile — marking them all
//                 would say nothing). leftToRight is set when reading the
//                 tiles left to right would give a different length, so the
//                 feedback can still point out that × went first.
// tokens are aligned index-by-index with the level template (and so with the
// controller's slots).
export function diagnose(level, tokens){
  var T = level.target;
  var sol = solve(tokens, true);
  var d = { value: sol.value, steps: sol.steps, cause: null, wrongSteps: null, wrongSlots: [], leftToRight: null };
  if(sol.value === T){ d.cause = 'win'; return d; }

  var ltr = solve(tokens, false);
  if(ltr.value === T){ d.cause = 'order'; d.wrongSteps = ltr.steps; return d; }

  if(tokens.indexOf('(') !== -1){
    var flat = solve(stripParens(tokens), true);
    if(flat.value === T){ d.cause = 'parens'; d.wrongSteps = flat.steps; return d; }
  }

  d.cause = 'placement';
  var best = null;
  solutions(level).forEach(function(s){
    var diff = [];
    s.forEach(function(t, i){ if(t !== tokens[i]) diff.push(i); });
    if(!best || diff.length < best.length) best = diff;
  });
  var tileCount = tokens.filter(function(t){ return t !== '(' && t !== ')'; }).length;
  d.wrongSlots = best && best.length < tileCount ? best : [];
  if(ltr.value !== sol.value) d.leftToRight = ltr.value;
  return d;
}

var CIRCLED = ['①', '②', '③', '④', '⑤'];

function stepsListHtml(steps, withWhy){
  return '<ol class="fb-steps">' + steps.map(function(s, i){
    return '<li><span class="fb-n">' + CIRCLED[i] + '</span><b>' + stepText(s) + '</b>' +
      (withWhy ? '<em>' + s.why + '</em>' : '') + '</li>';
  }).join('') + '</ol>';
}

function inlineSteps(steps){
  return steps.map(function(s){ return '<b>' + stepText(s) + '</b>'; }).join(' → ');
}

// { title, html } for the feedback card under the expression.
export function feedbackCard(d, T){
  if(d.cause === 'win'){
    return { title: '¡Puente perfecto! Así se calcula:', html: stepsListHtml(d.steps, true) };
  }
  if(d.cause === 'order'){
    return {
      title: 'El error está en el orden de las operaciones',
      html: '<p>Parece que calculaste de izquierda a derecha: ' + inlineSteps(d.wrongSteps) + ', y eso sí daría ' + T + ' m. ' +
        'Pero <strong>la multiplicación se resuelve antes que la suma y la resta</strong>, así que tu puente en realidad mide ' + fmtNum(d.value) + ' m:</p>' +
        stepsListHtml(d.steps, true)
    };
  }
  if(d.cause === 'parens'){
    return {
      title: 'El error está en el paréntesis',
      html: '<p>Parece que resolviste sin tener en cuenta el paréntesis: ' + inlineSteps(d.wrongSteps) + ', y eso sí daría ' + T + ' m. ' +
        'Pero <strong>lo que está entre paréntesis se resuelve primero</strong>, así que tu puente en realidad mide ' + fmtNum(d.value) + ' m:</p>' +
        stepsListHtml(d.steps, true)
    };
  }
  var marked = d.wrongSlots.length > 0;
  var where = marked
    ? 'Las fichas con borde rojo no van en ese lugar: cámbialas.'
    : (d.steps.some(function(s){ return s.why === 'paréntesis primero'; })
        ? 'Prueba otra combinación: piensa qué operación debe ir dentro del paréntesis, porque se resuelve primero.'
        : 'Prueba otra combinación: piensa qué multiplicación te acerca a ' + T + ' m.');
  var order = d.leftToRight === null ? ''
    : ' Ojo: de izquierda a derecha daría ' + fmtNum(d.leftToRight) + ' m, pero <strong>la multiplicación va primero</strong>.';
  return {
    title: marked ? 'El error está en las fichas marcadas' : 'Ninguna ficha quedó en su lugar',
    html: '<p>' + where + order + ' Así se calculó tu puente:</p>' + stepsListHtml(d.steps, true)
  };
}
