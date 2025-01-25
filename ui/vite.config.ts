import {TanStackRouterVite} from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import {defineConfig, loadEnv} from 'vite';
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = {...process.env, ...loadEnv(mode, process.cwd())};

  return {
    plugins: [
      react(),
      TanStackRouterVite(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@fake-data': path.resolve(__dirname, './src/fake-data'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_APP_BACKEND_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
