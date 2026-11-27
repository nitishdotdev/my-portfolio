import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Vercel supplies VERCEL_ENV during its build. Local builds model production by default.
const isIndexableDeployment = [undefined, 'production'].includes(process.env.VERCEL_ENV);

export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  define: {
    __SEO_INDEXABLE__: JSON.stringify(isIndexableDeployment),
    __BUILD_YEAR__: JSON.stringify(new Date().getUTCFullYear()),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  appType: command === 'serve' && !isPreview ? 'spa' : 'mpa',
  server: {
    port: 3000,
    open: true,
  },
}));
