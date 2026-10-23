import katex from 'katex';
import 'katex/dist/katex.min.css';
import { guideAvatarHtml } from './guides.js';

// The topic's lesson as a one-screen infographic instead of paragraphs:
// a title with a big icon, then a few visual blocks, each with very little
// text. Lessons are plain objects (see galaxies/*/lessons/*.js):
//
// { icon, title, lead, blocks: [ block, … ] }, where a block is one of
//   { type: 'cards',   heading, items: [{ icon, title, text, eg, color }] }
//   { type: 'steps',   heading, items: [{ title, text }] }       numbered flow
//   { type: 'formula', heading, tex, parts: [{ tex, text, color }] }
//   { type: 'compare', heading, bad: { title, text }, good: { title, text } }
//   { type: 'tip',     text }                                    Luma's note
// Text may use <b> and $math$ (typeset by KaTeX). Only for the app's own
// lesson files, not for user input.

function inline(text){
  return String(text || '').replace(/\$([^$]+)\$/g, function(_, tex){
    return katex.renderToString(tex, { throwOnError: false });
  });
}

function heading(b){ return b.heading ? '<h3 class="ix-h">' + inline(b.heading) + '</h3>' : ''; }

var BLOCKS = {
  cards: function(b){
    return heading(b) + '<div class="ix-cards">' + b.items.map(function(it){
      return '<div class="ix-card"' + (it.color ? ' style="--c:' + it.color + '"' : '') + '>' +
        '<span class="ix-icon" aria-hidden="true">' + it.icon + '</span>' +
        '<b>' + inline(it.title) + '</b><p>' + inline(it.text) + '</p>' +
        (it.eg ? '<small>Ej.: ' + inline(it.eg) + '</small>' : '') + '</div>';
    }).join('') + '</div>';
  },
  steps: function(b){
    return heading(b) + '<ol class="ix-steps">' + b.items.map(function(it, i){
      return '<li><span class="ix-n" aria-hidden="true">' + (i + 1) + '</span><b>' + inline(it.title) + '</b>' +
        (it.text ? '<p>' + inline(it.text) + '</p>' : '') + '</li>';
    }).join('') + '</ol>';
  },
  formula: function(b){
    return heading(b) + '<div class="ix-formula"><div class="ix-tex">' + katex.renderToString(b.tex, { displayMode: true, throwOnError: false }) + '</div>' +
      (b.parts ? '<div class="ix-parts">' + b.parts.map(function(p){
        return '<span' + (p.color ? ' style="--c:' + p.color + '"' : '') + '><b>' + inline('$' + p.tex + '$') + '</b><span>' + inline(p.text) + '</span></span>';
      }).join('') + '</div>' : '') + '</div>';
  },
  compare: function(b){
    function side(cls, mark, s){ return '<div class="' + cls + '"><i aria-hidden="true">' + mark + '</i><b>' + inline(s.title) + '</b><p>' + inline(s.text) + '</p></div>'; }
    return heading(b) + '<div class="ix-compare">' + side('ix-bad', '✗', b.bad) + side('ix-good', '✓', b.good) + '</div>';
  },
  tip: function(b){
    return '<div class="ix-tip">' + guideAvatarHtml('luma') + '<p>' + inline(b.text) + '</p></div>';
  }
};

export function renderInfographic(lesson){
  return '<div class="ix">' +
    '<div class="ix-hero"><span class="ix-hero-icon" aria-hidden="true">' + lesson.icon + '</span>' +
    '<div><h2>' + inline(lesson.title) + '</h2>' + (lesson.lead ? '<p>' + inline(lesson.lead) + '</p>' : '') + '</div></div>' +
    lesson.blocks.map(function(b){ return '<section class="ix-block">' + BLOCKS[b.type](b) + '</section>'; }).join('') +
    '</div>';
}
