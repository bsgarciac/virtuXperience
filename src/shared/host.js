// When embedded in an <iframe>, the host page learns about progress through
// postMessage events: { source: 'virtuxperience', type, ...payload }.
// Standalone (not in an iframe) this is a no-op.
export function notifyHost(type, payload){
  if(window.parent === window) return;
  var msg = { source: 'virtuxperience', type: type };
  for(var k in payload) msg[k] = payload[k];
  try{ window.parent.postMessage(msg, '*'); }catch(e){ /* host unreachable */ }
}
