import {defineConfig} from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@fake-data': path.resolve(__dirname, './src/fake-data'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    }
  }
});
