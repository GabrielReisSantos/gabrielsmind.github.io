import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// CyberLab is published at https://gabrielreissantos.com/training/
export default defineConfig({
  base: '/training/',
  plugins: [react()],
  server: { host: '127.0.0.1' },
});
