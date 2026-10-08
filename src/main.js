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
import './styles/story.css';

import { initGalaxySelect } from './galaxies/select.js';
import { SystemScene } from './galaxies/neuromath/system-scene.js';
import { IslandScene } from './galaxies/neuromath/island-scene.js';
import { refreshHud } from './galaxies/neuromath/hud.js';
import { notifyHost } from './shared/host.js';
import { showIntroOnce } from './galaxies/neuromath/story.js';

initGalaxySelect(function(){ showIntroOnce(); });

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
