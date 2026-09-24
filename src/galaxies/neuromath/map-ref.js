// The live MapScene once Phaser has booted it (null before that), so the HUD
// and the games can ask the map to redraw after progress changes.
export var mapRef = { scene: null };
