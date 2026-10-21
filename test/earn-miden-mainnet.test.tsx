import assert from "node:assert/strict";
import test from "node:test";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";

import { useEarnEngine } from "../src/earn/use-earn-engine";
import type { EarnMidenAdapter } from "../src/types";

const wagmiConfig = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
});

const midenAdapter: EarnMidenAdapter = {
  enabled: true,
  connected: false,
  assets: [],
  createP2IDNote: async () => ({ success: false }),
};

function MainnetMidenProbe() {
  const engine = useEarnEngine({
    isOpen: true,
    onClose: () => undefined,
    api: { baseUrl: "https://allocator.example.test" },
    network: "mainnet",
    earnMiden: midenAdapter,
  });

  return createElement("output", null, String(engine.midenEnabled));
}

test("mainnet earn exposes Miden when an enabled adapter is supplied", () => {
  const queryClient = new QueryClient();
  const markup = renderToStaticMarkup(
    createElement(
      WagmiProvider,
      { config: wagmiConfig },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(MainnetMidenProbe),
      ),
    ),
  );

  assert.equal(markup, "<output>true</output>");
});
