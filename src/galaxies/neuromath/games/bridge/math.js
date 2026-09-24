// Arithmetic for the bridge: operators, evaluation (the right way and the
// common wrong ways) and the step-by-step solution shown to the player.
// Pure functions, no DOM — scripts/check-levels.js imports this too.
export var OP_ADD = '+', OP_SUB = '−', OP_MUL = '×';
export var OP_NAMES = {}; OP_NAMES[OP_ADD] = 'suma'; OP_NAMES[OP_SUB] = 'resta'; OP_NAMES[OP_MUL] = 'multiplicación';

export function fmtNum(n){ return n < 0 ? '−' + Math.abs(n) : String(n); }

function applyOp(a, op, b){ return op === OP_ADD ? a + b : (op === OP_SUB ? a - b : a * b); }
function isAdditive(t){ return t === OP_ADD || t === OP_SUB; }

// Solves a token list (numbers, operators, '(' and ')') one operation at a
// time and records each step with the rule that made it go first:
//   precedence = true  → the real rules: parentheses, then ×, then + and −
//                        from left to right.
//   precedence = false → plain left to right, ignoring that × goes first
//                        (parentheses still respected). This is the most
//                        common mistake, so the feedback replays it.
// Returns { value, steps: [{ a, op, b, c, why }] }.
export function solve(tokens, precedence){
  var steps = [];
  function apply(a, op, b, why){
    var c = applyOp(a, op, b);
    steps.push({ a: a, op: op, b: b, c: c, why: why });
    return c;
  }
  function reduceFlat(arr, inParens){
    var i;
    if(precedence){
      var mixed = arr.some(isAdditive);
      while((i = arr.indexOf(OP_MUL)) !== -1){
        arr.splice(i - 1, 3, apply(arr[i - 1], OP_MUL, arr[i + 1],
          inParens ? 'paréntesis primero' : (mixed ? 'la multiplicación va primero' : OP_NAMES[OP_MUL])));
      }
    }
    while(arr.length > 1){
      arr.splice(0, 3, apply(arr[0], arr[1], arr[2],
        inParens ? 'paréntesis primero' : (arr.length > 3 ? 'de izquierda a derecha' : OP_NAMES[arr[1]])));
    }
    return arr[0];
  }
  var t = tokens.slice();
  var close;
  while((close = t.indexOf(')')) !== -1){
    var open = t.lastIndexOf('(', close);
    t.splice(open, close - open + 1, reduceFlat(t.slice(open + 1, close), true));
  }
  return { value: reduceFlat(t, false), steps: steps };
}

export function evaluate(tokens){ return solve(tokens, true).value; }

export function stripParens(tokens){
  return tokens.filter(function(t){ return t !== '(' && t !== ')'; });
}

export function stepText(s){ return fmtNum(s.a) + ' ' + s.op + ' ' + fmtNum(s.b) + ' = ' + fmtNum(s.c); }

// tpl: n = number slot, o = operator slot, ( ) = fixed parentheses.
export function templateSlots(tpl){ return tpl.split(' '); }

function permutations(list){
  if(list.length <= 1) return [list.slice()];
  var out = [], seen = {};
  list.forEach(function(x, i){
    if(seen[x]) return; // skip duplicate values (e.g. two 3s)
    seen[x] = true;
    var rest = list.slice(0, i).concat(list.slice(i + 1));
    permutations(rest).forEach(function(p){ out.push([x].concat(p)); });
  });
  return out;
}

// Every distinct way to place a level's tiles into its template, as token
// lists aligned index-by-index with the template's slots.
export function arrangements(level){
  var slots = templateSlots(level.tpl), out = [];
  permutations(level.nums).forEach(function(np){
    permutations(level.ops).forEach(function(op){
      var ni = 0, oi = 0;
      out.push(slots.map(function(c){ return c === 'n' ? np[ni++] : (c === 'o' ? op[oi++] : c); }));
    });
  });
  return out;
}

export function solutions(level){
  return arrangements(level).filter(function(t){ return evaluate(t) === level.target; });
}
