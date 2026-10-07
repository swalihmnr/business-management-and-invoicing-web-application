import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    watch: {
      usePolling: true,
      interval: 200,
      ignored: ['**/node_modules/**', '**/.local_db/**', '**/backend/**'],
    },
  },
});
