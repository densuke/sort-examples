import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/sort-examples/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  worker: {
    // モジュールワーカーとして別ファイルに出力（data:URL回避）
    format: 'es'
  }
});
