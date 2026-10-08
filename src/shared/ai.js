import { guideAvatarHtml } from './guides.js';

// Simulated AI assistant, voiced by Aura (see shared/guides.js): this
// prototype makes no live model calls. Each game ships canned hints (see the
// bridge game's levels.js) that appear after a short "thinking" delay, so the
// interaction can be validated before wiring a real model.
export function aiThinkingHtml(label){
  return guideAvatarHtml('aura') + '<span>' + label + '&hellip;</span>';
}
export function aiBubbleHtml(html){
  return guideAvatarHtml('aura') + '<span class="ai-msg"><b class="ai-who">Aura</b> ' + html + '</span>';
}
