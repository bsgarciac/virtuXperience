// The Sintonizador's poses come from the team's concept sheet
// (public/assets/creagenesis/sintonizador.jpg): three figures on a flat grey
// background, no transparency. At load time each pose is cut out of the
// sheet, the grey (and the sheet's guide lines) is keyed out, and only the
// figure itself — the largest connected shape — is kept, so bits of the
// neighbouring pose don't leak in. The result becomes a Phaser texture.
//
// When the art comes as proper transparent PNGs, load them directly and
// drop this file.

// Where each pose sits on the 1400×1045 sheet. faces: which way it looks.
export var POSES = {
  idle:     { x: 30,  y: 90,  w: 400, h: 910, faces: 'front' },
  run:      { x: 430, y: 120, w: 590, h: 860, faces: 'right' },
  interact: { x: 900, y: 90,  w: 480, h: 910, faces: 'left' }
};
var TARGET_H = 380; // texture height in px; the scene scales it down

// Grey background and guide lines: almost no colour, mid brightness.
function isBackdrop(r, g, b){
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  return max - min < 20 && max > 52 && max < 205;
}

// Keeps the largest 4-connected opaque region of the mask, clears the rest.
function keepLargest(mask, w, h){
  var label = new Int32Array(w * h), stack = [], best = 0, bestSize = 0, next = 0;
  for(var start = 0; start < w * h; start++){
    if(!mask[start] || label[start]) continue;
    next++; var size = 0;
    stack.push(start); label[start] = next;
    while(stack.length){
      var p = stack.pop(); size++;
      var x = p % w, y = (p / w) | 0;
      if(x > 0 && mask[p - 1] && !label[p - 1]){ label[p - 1] = next; stack.push(p - 1); }
      if(x < w - 1 && mask[p + 1] && !label[p + 1]){ label[p + 1] = next; stack.push(p + 1); }
      if(y > 0 && mask[p - w] && !label[p - w]){ label[p - w] = next; stack.push(p - w); }
      if(y < h - 1 && mask[p + w] && !label[p + w]){ label[p + w] = next; stack.push(p + w); }
    }
    if(size > bestSize){ bestSize = size; best = next; }
  }
  for(var i = 0; i < w * h; i++) mask[i] = label[i] === best ? 1 : 0;
}

function cutPose(sheet, pose){
  var k = TARGET_H / pose.h;
  var w = Math.round(pose.w * k), h = TARGET_H;
  var c = document.createElement('canvas');
  c.width = w; c.height = h;
  var ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(sheet, pose.x, pose.y, pose.w, pose.h, 0, 0, w, h);
  var img = ctx.getImageData(0, 0, w, h), d = img.data;
  var mask = new Uint8Array(w * h);
  for(var i = 0; i < w * h; i++) mask[i] = isBackdrop(d[i*4], d[i*4+1], d[i*4+2]) ? 0 : 1;
  keepLargest(mask, w, h);

  // Trim to the figure, so the texture's bottom edge is the feet.
  var minX = w, minY = h, maxX = 0, maxY = 0;
  for(var p = 0; p < w * h; p++){
    if(!mask[p]){ d[p*4+3] = 0; continue; }
    var x = p % w, y = (p / w) | 0;
    if(x < minX) minX = x; if(x > maxX) maxX = x;
    if(y < minY) minY = y; if(y > maxY) maxY = y;
  }
  ctx.putImageData(img, 0, 0);
  var out = document.createElement('canvas');
  out.width = maxX - minX + 1; out.height = maxY - minY + 1;
  out.getContext('2d').drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

// Adds 'sint-idle', 'sint-run' and 'sint-interact' to the scene's textures
// from the already-loaded 'sint-sheet' image. Cheap to call again.
export function makeSintonizadorTextures(scene){
  if(scene.textures.exists('sint-idle')) return;
  var sheet = scene.textures.get('sint-sheet').getSourceImage();
  Object.keys(POSES).forEach(function(name){
    scene.textures.addCanvas('sint-' + name, cutPose(sheet, POSES[name]));
  });
}
