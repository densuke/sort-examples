import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/sort-examples/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
