import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Deduplicate React + wagmi so the demo and the widget share the same instance
    dedupe: ['react', 'react-dom', 'wagmi', 'viem', '@tanstack/react-query'],
  },
});
