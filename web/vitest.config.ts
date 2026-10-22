import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const engineSrc = fileURLToPath(new URL('../engine/src', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ruko/engine': `${engineSrc}/index.ts`,
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __SITE_URL__: JSON.stringify('http://localhost:5181'),
  },
  server: { fs: { allow: ['.', engineSrc] } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'server/**/*.test.ts'],
    css: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
