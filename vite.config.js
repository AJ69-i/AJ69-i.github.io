import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the production build also works on GitHub Pages
  // project sites and from sub-folders. For a custom domain you can set '/'.
  base: './',
  server: { open: true },
  build: {
    target: 'es2018',
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
