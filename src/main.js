import Phaser from 'phaser';

import './styles/base.css';
import './styles/hud.css';
import './styles/map.css';
import './styles/ai.css';
import './styles/dialogs.css';
import './styles/galaxy-select.css';
import './styles/game-shell.css';
import './styles/bridge.css';
import './styles/cannon.css';
import './styles/alianzas.css';
import './styles/story.css';

import './shared/dev.js'; // reads ?dev=… before anything else
import { initGalaxySelect } from './galaxies/select.js';
import { SystemScene } from './atlas/system-scene.js';
import { IslandScene } from './atlas/island-scene.js';
import { refreshHud } from './atlas/hud.js';
import { mapRef } from './atlas/map-ref.js';
import { galaxy, setGalaxy } from './atlas/world.js';
import { notifyHost } from './shared/host.js';
import { showIntroOnce } from './atlas/story.js';

// Entering a galaxy shows its solar system (the map may still be on the
// previous galaxy's planets or islands) and its intro the first time.
initGalaxySelect(function(g){
  setGalaxy(g.id);
  refreshHud();
  if(mapRef.scene) mapRef.scene.scene.start('SystemScene');
  showIntroOnce(galaxy());
});

function boot(){
  var config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#0b1226',
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    scene: [SystemScene, IslandScene], // the first one starts
    render: { antialias: true }
  };
  var game = new Phaser.Game(config);
  game.events.once('ready', function(){ notifyHost('ready', {}); });
}

refreshHud();
if(document.fonts && document.fonts.ready){
  document.fonts.ready.then(boot).catch(boot);
} else {
  boot();
}
