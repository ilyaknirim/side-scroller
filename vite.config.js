import { defineConfig } from 'vite';

export default defineConfig({
  base: '/side-scroller/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
