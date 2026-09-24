import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset URLs so the build works from any path (e.g. an iframe
  // pointing at a subfolder of the host site).
  base: './',
  build: {
    // Phaser alone is ~1.2 MB minified; keep it in its own cacheable chunk.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: { manualChunks: function(id){ if(id.indexOf('node_modules/phaser') !== -1) return 'phaser'; } }
    }
  }
});
