import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Markdown with LaTeX math: $…$ inline and $$…$$ as a display block. The
// math is pulled out before Markdown runs (so _ and * inside formulas aren't
// read as emphasis) and put back already typeset by KaTeX. Only for the
// app's own lesson files, not for user input.
export function renderMarkdown(md){
  var math = [];
  function stash(tex, display){
    math.push(katex.renderToString(tex.trim(), { displayMode: display, throwOnError: false }));
    return '@@MATH' + (math.length - 1) + '@@';
  }
  var src = md
    .replace(/\$\$([\s\S]+?)\$\$/g, function(_, tex){ return '\n\n' + stash(tex, true) + '\n\n'; })
    .replace(/\$([^\s$](?:[^$\n]*[^\s$])?)\$/g, function(_, tex){ return stash(tex, false); });
  return marked.parse(src).replace(/@@MATH(\d+)@@/g, function(_, i){ return math[+i]; });
}
