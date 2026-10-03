import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { target: 'es2022' },
  server: {
    proxy: {
      '/api/scd-chapters': {
        target: 'https://redive.suicaodex.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/scd-chapters(?=\/)/, '/v1/chapters'),
      },
    },
  },
});
