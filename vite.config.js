import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5199, open: false },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1400,
  },
});
