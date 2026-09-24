import { f, vertex, fmt, pt } from './math.js';

// Turns a shot's outcome (see simulate in math.js) into the feedback card:
// which parameter is off, which way to move it, and why — with the
// calculation behind it as numbered steps. It never gives the value itself.

var CIRCLED = ['①', '②', '③', '④'];
var WHY = {
  a: '<strong>a</strong> controla qué tan cerrada es la parábola: más cerca de 0 se abre y sube más; más negativa se cierra y baja antes.',
  b: '<strong>b</strong> es la pendiente de salida, f\'(0) = b: con más b el disparo sale más empinado y llega más alto.',
  c: '<strong>c</strong> es la altura del cañón, f(0) = c: subirlo sube toda la parábola la misma cantidad.'
};

function stepsHtml(steps){
  return '<ol class="fb-steps">' + steps.map(function(s, i){
    return '<li><span class="fb-n">' + CIRCLED[i] + '</span><b>' + s[0] + '</b>' + (s[1] ? '<em>' + s[1] + '</em>' : '') + '</li>';
  }).join('') + '</ol>';
}

// "f(4) = −1·4² + 6·4 + 0 = 8"
function evalAt(p, x){
  return 'f(' + fmt(x) + ') = ' + fmt(p.a) + '·' + fmt(x) + '² + ' + fmt(p.b) + '·' + fmt(x) + ' + ' + fmt(p.c) + ' = ' + fmt(f(p, x));
}

function vertexSteps(p){
  var v = vertex(p);
  return [
    ['f\'(x) = 2·(' + fmt(p.a) + ')·x + ' + fmt(p.b), 'derivada'],
    ['f\'(x) = 0 → x = ' + fmt(v.x), 'x del vértice = −b / 2a'],
    ['f(' + fmt(v.x) + ') = ' + fmt(v.y), 'altura máxima']
  ];
}

// Every stepper raises f(w) when it goes up (∂f/∂a = w², ∂f/∂b = w, ∂f/∂c = 1),
// so "too low" always means "raise it" for a single adjustable parameter.
var MOVE = {
  a: ['acércalo a 0', 'hazlo más negativo'],
  b: ['auméntalo', 'disminúyelo'],
  c: ['sube el cañón', 'baja el cañón']
};
function oneParamAdvice(key, tooLow){
  return 'El error está en <strong>' + key + '</strong>: ' + MOVE[key][tooLow ? 0 : 1] + '. ' + WHY[key];
}

export function feedbackCard(level, p, out){
  var w = level.wall.x, yc = level.crack;
  var keys = Object.keys(level.adjust);
  var single = keys.length === 1 ? keys[0] : null;
  var target = pt(w, yc);

  if(out.kind === 'crack'){
    return { kind: 'win', title: '¡Muro derribado! Así llegó tu disparo:',
      html: stepsHtml(level.horizontal
        ? vertexSteps(p).concat([['f\'(' + fmt(w) + ') = 0', 'impacto horizontal']])
        : [[evalAt(p, w), 'altura en el muro'], ['= ' + fmt(yc), 'justo la grieta']]) };
  }

  if(out.kind === 'glancing'){
    var v = vertex(p);
    return { kind: 'fail', title: 'Diste en la grieta, pero de lado',
      html: '<p>La grieta solo cede con un <strong>impacto horizontal</strong>: la pendiente en el muro debe ser 0, y la tuya es f\'(' + fmt(w) + ') = ' + fmt(out.slope) + '. ' +
        'Tu vértice está en ' + pt(v.x, v.y) + ' y debe quedar justo en la grieta ' + target + '.</p>' + stepsHtml(vertexSteps(p)) };
  }

  if(level.horizontal){
    var vv = vertex(p);
    var side = vv.x < w - 1e-9 ? 'antes del muro: la curva ya viene bajando cuando llega' : (vv.x > w + 1e-9 ? 'después del muro: la curva todavía sube cuando llega' : 'en el muro, pero a otra altura');
    return { kind: 'fail', title: 'El error está en el vértice',
      html: '<p>Para un impacto horizontal, el vértice debe estar en la grieta ' + target + '. El tuyo está en ' + pt(vv.x, vv.y) + ', ' + side + '. ' +
        'Recuerda que x = −b / 2a: el vértice depende de <strong>a</strong> y de <strong>b</strong> a la vez.</p>' + stepsHtml(vertexSteps(p)) };
  }

  if(out.kind === 'rock'){
    return { kind: 'fail', title: 'El disparo chocó con la roca',
      html: '<p>En x = ' + fmt(level.rock.x) + ' tu bala va a ' + fmt(out.y) + ' m de altura y la roca mide ' + fmt(level.rock.h) + ' m. ' +
        'Necesitas una curva más alta en x = ' + fmt(level.rock.x) + ' que siga llegando a la grieta: prueba un <strong>a</strong> más negativo con un <strong>b</strong> mayor, así sube y baja más rápido.</p>' +
        stepsHtml([[evalAt(p, level.rock.x), 'altura sobre la roca'], [fmt(out.y) + ' < ' + fmt(level.rock.h), 'no alcanza a pasarla']]) };
  }

  var hitY = out.kind === 'ground' ? 0 : out.y;
  var tooLow = out.kind === 'ground' || (out.kind === 'wall' && out.y < yc);
  var what = out.kind === 'ground'
    ? 'La bala tocó el suelo en x = ' + fmt(out.x) + ' (una raíz de f, donde f(x) = 0), ' +
      (out.x < w - 1e-9 ? 'antes de llegar al muro en x = ' + fmt(w) + '.' : 'justo al pie del muro.')
    : out.kind === 'over'
      ? 'La bala pasó por encima del muro: en x = ' + fmt(w) + ' va a ' + fmt(out.y) + ' m y el muro mide ' + fmt(level.wall.h) + ' m.'
      : 'La bala pegó en el muro a ' + fmt(out.y) + ' m de altura, ' + (tooLow ? 'debajo' : 'encima') + ' de la grieta (' + fmt(yc) + ' m).';
  var advice = single ? oneParamAdvice(single, tooLow)
    : 'Necesitas que f(' + fmt(w) + ') ' + (tooLow ? 'suba' : 'baje') + ' hasta ' + fmt(yc) + ': ajusta <strong>a</strong> o <strong>b</strong>. Subir cualquiera de los dos sube la curva en el muro.';
  var steps = out.kind === 'ground'
    ? [['f(x) = 0 → x = ' + fmt(out.x), 'raíz: ahí cae la bala'], [fmt(out.x) + (out.x < w - 1e-9 ? ' < ' : ' = ') + fmt(w), 'no llega a la grieta']]
    : [[evalAt(p, w), 'altura en el muro'], [fmt(hitY) + (tooLow ? ' < ' : ' > ') + fmt(yc), tooLow ? 'le falta altura' : 'le sobra altura']];
  return { kind: 'fail', title: out.kind === 'ground' ? 'El disparo se quedó corto' : (out.kind === 'over' ? 'El disparo se pasó' : 'Pegaste fuera de la grieta'),
    html: '<p>' + what + ' ' + advice + '</p>' + stepsHtml(steps) };
}

