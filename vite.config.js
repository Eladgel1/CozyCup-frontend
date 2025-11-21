import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_BASE_URL;

  return {
    plugins: [react()],
    resolve: { alias: { '@': '/src' } },
    server: target
      ? { proxy: { '/auth': { target, changeOrigin: true } } }
      : undefined,
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: 'tests/setup.js',
      css: true,
      include: ['tests/**/*.test.{js,jsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        reportsDirectory: 'coverage',
      },
    },
  };
});
