import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

const widgetRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig({
  plugins: [react(), tailwindcss(), wasm(), topLevelAwait()],
  worker: {
    plugins: () => [wasm(), topLevelAwait()],
    format: 'es',
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'wagmi', 'viem', '@tanstack/react-query'],
    alias: [
      {
        find: '@epoch-protocol/epoch-intent-widget/styles.css',
        replacement: path.join(widgetRoot, 'dist/index.css'),
      },
      {
        find: '@epoch-protocol/epoch-intent-widget',
        replacement: path.join(widgetRoot, 'src/index.ts'),
      },
    ],
  },
  optimizeDeps: {
    // Avoid stale pre-bundles of the linked workspace package when iterating on the widget.
    exclude: ['@miden-sdk/miden-sdk', '@epoch-protocol/epoch-intent-widget'],
  },
  build: {
    target: 'esnext',
  },
  // Match miden-integration-example: avoid COOP/COEP so Miden transport sync works in dev.
});
