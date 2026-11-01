import { defineConfig, loadEnv } from "vite";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";
import { DEMO_RPC_PATHS, INFURA_NETWORKS } from "./src/config/rpc";

const demoRequire = createRequire(import.meta.url);
const intentsRequire = createRequire(
  demoRequire.resolve("@epoch-protocol/epoch-intents-sdk/package.json"),
);
const intentsMidenAssets = resolve(
  dirname(intentsRequire.resolve("@miden-sdk/miden-sdk/package.json")),
  "dist/st/assets",
);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL("./", import.meta.url)), "");
  const credential = env.INFURA_API_KEY?.trim();
  // INFURA_API_KEY stays server-side: accept the supplied base64 key:secret
  // credential and attach Basic authentication only on the upstream request.
  const decodedCredential = credential ? Buffer.from(credential, "base64").toString("utf8") : "";
  const separator = decodedCredential.indexOf(":");
  const projectId = decodedCredential.slice(0, separator);
  const projectSecret = decodedCredential.slice(separator + 1);
  if (credential && (!/^[a-fA-F0-9]{32}$/.test(projectId) || !projectSecret)) {
    throw new Error("INFURA_API_KEY must be a base64-encoded Infura key:secret credential");
  }
  const proxy = credential ? Object.fromEntries(
    // Match path boundaries: /base must not capture /base-sepolia.
    Object.entries(DEMO_RPC_PATHS).map(([chainId, path]) => [`^${path}(?:/|\\?|$)`, {
      target: `https://${INFURA_NETWORKS[Number(chainId)]}.infura.io/v3/${projectId}`,
      changeOrigin: true,
      // The project ID is already in the URL; Infura expects an empty Basic username.
      headers: { Authorization: `Basic ${Buffer.from(`:${projectSecret}`).toString("base64")}` },
      rewrite: (requestPath: string) => requestPath.slice(path.length),
    }]),
  ) : undefined;
  return {
  define: {
    "import.meta.env.VITE_INFURA_RPC_PROXY_ENABLED": JSON.stringify(Boolean(credential)),
  },
  base: "/widget/",
  plugins: [react(), tailwindcss(), wasm()],
  server: {
    proxy,
    port: 5175,
    fs: {
      // Linked SDKs live outside the widget workspace. Permit only their
      // Miden WASM assets; retain Vite's strict filesystem checks elsewhere.
      allow: [fileURLToPath(new URL("../", import.meta.url)), intentsMidenAssets],
    },
  },
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
      // Linked Flows SDK code must use the demo's published Intents SDK too.
      "@epoch-protocol/epoch-intents-sdk",
      // Keep commons package-scoped to preserve local/npm export compatibility.
    ],
  },
  optimizeDeps: {
    exclude: ["@miden-sdk/miden-sdk"],
  },
  preview: {
    proxy,
    allowedHosts: ["miden-integration-example.epochprotocol.xyz"],
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
  };
});
