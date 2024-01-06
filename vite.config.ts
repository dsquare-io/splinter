import {defineConfig} from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@fake-data': path.resolve(__dirname, './src/fake-data'),
    },
  },
});
