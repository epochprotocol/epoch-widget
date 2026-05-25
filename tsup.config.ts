import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'wagmi',
    'viem',
    '@epoch-protocol/epoch-intents-sdk',
    '@epoch-protocol/epoch-commons-sdk',
    '@epoch-protocol/epoch-flows-sdk',
  ],
  jsx: 'transform',
  treeshake: true,
});
