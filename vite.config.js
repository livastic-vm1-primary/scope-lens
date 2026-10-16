import { defineConfig } from 'vite';

export default defineConfig({
  base: '/scope-lens/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2022',
  },
  define: {
    'process.env': {},
  },
});
