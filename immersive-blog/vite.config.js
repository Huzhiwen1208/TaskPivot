import { defineConfig } from 'vite';

export default defineConfig({
  // 使用相对路径，方便部署到任意静态托管子目录
  base: './',
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Three.js 单独分包，便于浏览器长期缓存与首屏懒加载
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
    reporters: 'default',
  },
});
