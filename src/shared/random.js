export function shuffled(list){
  var a = list.slice();
  for(var i = a.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

export function pickOne(list){ return list[Math.floor(Math.random() * list.length)]; }

// Deterministic pseudo-random so a rebuild (resize) doesn't reshuffle the scenery.
export function seeded(seed){
  var s = seed % 2147483647; if(s <= 0) s += 2147483646;
  return function(){ s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
}
