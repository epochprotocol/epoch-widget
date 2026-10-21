import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  base: "/widget/",
  plugins: [react(), tailwindcss(), wasm()],
  worker: {
    plugins: () => [wasm()],
    format: "es",
  },
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "wagmi",
      "viem",
      "@tanstack/react-query",
      "@epoch-protocol/epoch-commons-sdk",
    ],
  },
  optimizeDeps: {
    exclude: ["@miden-sdk/miden-sdk"],
  },
  build: {
    target: "esnext",
    minify: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/@miden-sdk/")) return "miden";
          if (
            id.includes("/node_modules/@rainbow-me/") ||
            id.includes("/node_modules/@walletconnect/") ||
            id.includes("/node_modules/@reown/")
          ) {
            return "wallet-providers";
          }
          return undefined;
        },
      },
    },
  },
  // Match miden-integration-example: avoid COOP/COEP so Miden transport sync works in dev.
});
