import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules') && /react-markdown|remark-|rehype-|highlight.js|lowlight|micromark|mdast|hast|unified/.test(id)) return 'markdown';
        },
      },
    },
  },
});
