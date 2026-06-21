import path from 'node:path';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    build: {
      sourcemap: true,
    },
    plugins: [
      tanstackRouter(),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        injectManifest: {
          manifestTransforms: [
            (entries) => ({
              manifest: entries.map((e) => ({
                ...e,
                url: e.url === 'index.html' ? '/' : e.url.startsWith('/') ? e.url : `/${e.url}`,
              })),
              warnings: [],
            }),
          ],
        },
        manifest: {
          name: 'Splinter',
          short_name: 'Splinter',
          description: 'Split bills and settle group expenses',
          theme_color: '#267360',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      env.SENTRY_AUTH_TOKEN &&
        sentryVitePlugin({
          org: env.SENTRY_ORG,
          project: env.SENTRY_PROJECT,
          url: env.SENTRY_URL,
          authToken: env.SENTRY_AUTH_TOKEN,
          sourcemaps: {
            // As you're enabling client source maps, you probably want to delete them after they're uploaded to Sentry.
            // Set the appropriate glob pattern for your output folder - some glob examples below:
            filesToDeleteAfterUpload: ['./**/*.map', '.*/**/public/**/*.map', './dist/**/client/**/*.map'],
          },
        }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_APP_BACKEND_URL,
          changeOrigin: true,
        },
        '/media': {
          target: env.VITE_APP_BACKEND_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
