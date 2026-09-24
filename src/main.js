import Phaser from 'phaser';

import './styles/base.css';
import './styles/hud.css';
import './styles/map.css';
import './styles/ai.css';
import './styles/dialogs.css';
import './styles/galaxy-select.css';
import './styles/bridge.css';

import { initGalaxySelect } from './galaxies/select.js';
import { MapScene } from './galaxies/neuromath/map-scene.js';
import { mapRef } from './galaxies/neuromath/map-ref.js';
import { refreshHud } from './galaxies/neuromath/hud.js';
import { notifyHost } from './shared/host.js';

initGalaxySelect(function(){
  if(mapRef.scene) mapRef.scene.scrollToFrontier(true);
});

function boot(){
  var config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#0b1226',
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    scene: [MapScene],
    render: { antialias: true }
  };
  var game = new Phaser.Game(config);
  game.events.once('ready', function(){
    mapRef.scene = game.scene.getScene('MapScene');
    notifyHost('ready', {});
  });
  // Fallback in case 'ready' already fired synchronously
  setTimeout(function(){ if(!mapRef.scene) mapRef.scene = game.scene.getScene('MapScene'); }, 50);
}

refreshHud();
if(document.fonts && document.fonts.ready){
  document.fonts.ready.then(boot).catch(boot);
} else {
  boot();
}
