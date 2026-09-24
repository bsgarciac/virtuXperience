import { pickOne } from '../../../../shared/random.js';
import { solutions, f, vertex } from './math.js';

// The wall bank: 20 walls in 5 tiers. Each play (a round) takes one wall per
// tier, in order. The shot follows f(x) = a·x² + b·x + c from the cannon at
// x = 0; the player dials in the parameters listed in `adjust`, the others
// are fixed. A wall falls when the shot hits its crack at (wall.x, crack).
//
// Run `npm run check:levels` after editing: every wall must have exactly the
// intended solution(s) within the stepper ranges, and each tier's idea has to
// matter (e.g. the rock actually blocks the obvious shot).
var A = { min: -4, max: -0.5, step: 0.5 };
var B = { min: 1, max: 12, step: 1 };
var C = { min: 0, max: 12, step: 1 };

export var TIERS = [
  { // b: the launch slope f'(0)
    name: 'Pendiente', intro: 'Ajusta b, la pendiente de salida, para que la bala dé justo en la grieta.', adjust: { b: B }, fixed: { a: -1, c: 0 },
    hint: function(w, y){ return 'Con a = −1 y c = 0, la altura al llegar al muro es f(' + w + ') = −' + (w * w) + ' + ' + w + '·b. ¿Qué b hace que eso valga <b>' + y + '</b>?'; },
    walls: [ { x: 3, crack: 9 }, { x: 4, crack: 8 }, { x: 2, crack: 10 }, { x: 5, crack: 10 } ] },
  { // a: how closed the parabola is
    name: 'Apertura', intro: 'Ajusta a, la apertura de la parábola, para que la bala dé justo en la grieta.', adjust: { a: A }, fixed: { c: 0 }, // b per wall
    hint: function(w, y, lv){ return 'Aquí b = ' + lv.fixed.b + ' está fijo. Plantea f(' + w + ') = a·' + (w * w) + ' + ' + (lv.fixed.b * w) + ' = ' + y + ' y despeja a. Un a más negativo cierra la parábola.'; },
    walls: [ { x: 2, crack: 8, b: 6 }, { x: 3, crack: 6, b: 8 }, { x: 2, crack: 6, b: 8 }, { x: 3, crack: 9, b: 12 } ] },
  { // the vertex: a horizontal hit means f'(w) = 0
    name: 'Vértice', intro: 'Ajusta a y b: esta grieta solo cede con un impacto horizontal.', adjust: { a: A, b: B }, fixed: { c: 0 }, horizontal: true,
    hint: function(w, y){ return 'Un impacto horizontal significa que la pendiente es cero justo en el muro: f\'(' + w + ') = 0. El vértice de tu parábola debe estar en <b>(' + w + ', ' + y + ')</b>.'; },
    walls: [ { x: 3, crack: 9 }, { x: 4, crack: 8 }, { x: 2, crack: 6 }, { x: 2, crack: 8 } ] },
  { // c: raising the cannon lifts the whole parabola
    name: 'Mástil', intro: 'Sube o baja el cañón (c) para que la bala dé justo en la grieta.', adjust: { c: C }, fixed: {}, // a, b per wall
    hint: function(w, y){ return 'Subir el cañón (c) sube toda la parábola la misma cantidad. Calcula f(' + w + ') con c = 0 y mira cuánto le falta para llegar a <b>' + y + '</b>.'; },
    walls: [ { x: 4, crack: 8, a: -1, b: 4 }, { x: 3, crack: 10, a: -1, b: 4 }, { x: 2, crack: 6, a: -2, b: 3 }, { x: 5, crack: 3, a: -1, b: 5 } ] },
  { // two conditions: clear the rock and hit the crack
    name: 'Roca', intro: 'Ajusta a y b para pasar sobre la roca y dar en la grieta.', adjust: { a: A, b: B }, fixed: { c: 0 },
    hint: function(w, y, lv){ return 'Necesitas f(' + w + ') = ' + y + ' y además f(' + lv.rock.x + ') > ' + lv.rock.h + '. Un a más negativo con un b mayor hace una curva que sube y baja más rápido.'; },
    walls: [ { x: 4, crack: 8, rock: { x: 2, h: 12 } }, { x: 6, crack: 6, rock: { x: 3, h: 8 } },
             { x: 5, crack: 5, rock: { x: 3, h: 10 } }, { x: 3, crack: 12, rock: { x: 2, h: 11 } } ] }
];

// Flattened, self-contained levels.
export var BANK = [];
TIERS.forEach(function(tier, ti){
  tier.walls.forEach(function(w){
    var fixed = Object.assign({}, tier.fixed);
    ['a', 'b', 'c'].forEach(function(k){ if(w[k] !== undefined) fixed[k] = w[k]; });
    var lv = {
      tier: ti, tierName: tier.name, adjust: tier.adjust, fixed: fixed,
      wall: { x: w.x, h: w.crack + 3 }, crack: w.crack, rock: w.rock || null, horizontal: !!tier.horizontal
    };
    lv.hint = tier.hint(w.x, w.crack, lv);
    lv.intro = tier.intro;
    // Vertical extent of the plane: tall enough for the wall, the rock and
    // the highest point of any correct shot.
    var top = Math.max(lv.wall.h, lv.rock ? lv.rock.h : 0);
    solutions(lv).forEach(function(p){
      var v = vertex(p);
      top = Math.max(top, p.c, v.x > 0 && v.x < lv.wall.x ? v.y : f(p, lv.wall.x));
    });
    lv.ymax = Math.ceil(top) + 1;
    BANK.push(lv);
  });
});

export function pickRound(){
  return TIERS.map(function(tier, ti){
    return pickOne(BANK.filter(function(l){ return l.tier === ti; }));
  });
}
