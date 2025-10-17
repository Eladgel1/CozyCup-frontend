import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL;

  return {
    plugins: [react()],
    resolve: { alias: { '@': '/src' } },
    server: proxyTarget ? {
      proxy: { '/api': { target: proxyTarget, changeOrigin: true } }
    } : undefined
  };
});
