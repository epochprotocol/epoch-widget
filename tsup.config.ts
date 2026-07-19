import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  // Ship widely-compatible output rather than esbuild's default `esnext`, which
  // can emit syntax that trips older consumer bundlers/browsers.
  target: 'es2020',
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'wagmi',
    'viem',
    'lucide-react',
    '@tanstack/react-query',
    '@epoch-protocol/epoch-intents-sdk',
    '@epoch-protocol/epoch-commons-sdk',
  ],
  jsx: 'automatic',
  treeshake: true,
});
