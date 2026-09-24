// Simulated AI assistant: this prototype makes no live model calls. Each
// game ships canned hints (see the bridge game's levels.js) that appear after a short
// "thinking" delay, so the interaction can be validated before wiring a real model.
export function aiThinkingHtml(label){
  return '<span class="ai-tag">🤖</span><span>' + label + '&hellip;</span>';
}
export function aiBubbleHtml(html){
  return '<span class="ai-tag">🤖</span><span class="ai-msg">' + html + '</span>';
}
