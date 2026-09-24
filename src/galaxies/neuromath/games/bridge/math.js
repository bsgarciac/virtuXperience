// Arithmetic for the bridge: operators, evaluation with precedence and the
// step-by-step solution shown to the player.
export var OP_ADD = '+', OP_SUB = '−', OP_MUL = '×';
export var OP_NAMES = {}; OP_NAMES[OP_ADD] = 'suma'; OP_NAMES[OP_SUB] = 'resta'; OP_NAMES[OP_MUL] = 'multiplicación';


export function fmtNum(n){ return n < 0 ? '−' + Math.abs(n) : String(n); }

// Tiny recursive-descent evaluator (no eval): * binds tighter than + and -,
// parentheses first.
export function evalTokens(tokens){
  var pos = 0;
  function peek(){ return tokens[pos]; }
  function factor(){
    var t = tokens[pos++];
    if(t === '('){ var v = expr(); if(tokens[pos++] !== ')') throw new Error('paren'); return v; }
    if(typeof t !== 'number') throw new Error('number expected');
    return t;
  }
  function term(){
    var v = factor();
    while(peek() === OP_MUL){ pos++; v = v * factor(); }
    return v;
  }
  function expr(){
    var v = term();
    while(peek() === OP_ADD || peek() === OP_SUB){
      var op = tokens[pos++]; var r = term();
      v = op === OP_ADD ? v + r : v - r;
    }
    return v;
  }
  var out = expr();
  if(pos !== tokens.length) throw new Error('trailing tokens');
  return out;
}

// Same precedence as evalTokens, but records each single operation so the
// player can read how the result was reached.
export function solveSteps(tokens){
  var steps = [];
  function apply(a, op, b){
    var c = op === OP_ADD ? a + b : (op === OP_SUB ? a - b : a * b);
    steps.push(fmtNum(a) + ' ' + op + ' ' + fmtNum(b) + ' = ' + fmtNum(c));
    return c;
  }
  function reduceFlat(arr){
    var i;
    while((i = arr.indexOf(OP_MUL)) !== -1){ arr.splice(i - 1, 3, apply(arr[i - 1], OP_MUL, arr[i + 1])); }
    while(arr.length > 1){ arr.splice(0, 3, apply(arr[0], arr[1], arr[2])); }
    return arr[0];
  }
  var t = tokens.slice();
  var close;
  while((close = t.indexOf(')')) !== -1){
    var open = t.lastIndexOf('(', close);
    t.splice(open, close - open + 1, reduceFlat(t.slice(open + 1, close)));
  }
  return { steps: steps, value: reduceFlat(t) };
}
