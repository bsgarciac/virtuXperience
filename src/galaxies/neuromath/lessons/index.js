import fundInicial from './fund-inicial.md?raw';
import algIntermedio from './alg-intermedio.md?raw';

// The short lesson shown when an island opens, keyed by island id. Each one
// is a Markdown file; math goes between $…$ (inline) or $$…$$ (block).
export var LESSONS = {
  'fund-inicial': fundInicial,
  'alg-intermedio': algIntermedio
};
