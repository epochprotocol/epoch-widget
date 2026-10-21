import assert from "node:assert/strict";
import test from "node:test";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";

import { useEarnEngine } from "../src/earn/use-earn-engine";
import type { EarnMidenAdapter } from "../src/types";
import { resolveEarnCta } from "../src/earn/earn-cta";
import { useEarnMiden } from "../src/earn/use-earn-miden";
import { DEFAULT_MIDEN_FAUCET, MIDEN_VIRTUAL_CHAIN_ID } from "../src/earn/miden";

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

const midenCtaParams = {
  earnTab: "deposit" as const,
  fundingSource: "miden" as const,
  flow: { isQuoting: false, status: "idle", quoteError: null },
  isConnected: true,
  midenConnected: true,
  midenSourceReady: false,
  hasSelectedMarket: true,
  depositAmount: "0.1",
  hasSelectedPosition: false,
  withdrawAmount: "",
  availableChains: [],
  selectedChain: null,
  effectiveSourceChainId: 999999999,
  effectiveSourceToken: {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "USDCX",
    name: "USDCX",
    decimals: 6,
    chainId: 999999999,
  },
  isWrongNetwork: false,
  insufficientBalance: false,
  insufficientBalanceSymbol: "",
  buildOk: true,
  isSmartWithdrawDegenerate: false,
  midenSmartDestNotReady: false,
  isCrossChain: true,
};

test("Miden earn cannot submit before source metadata is ready", () => {
  assert.deepEqual(resolveEarnCta(midenCtaParams), {
    action: "disabled",
    label: "Preparing Miden account…",
  });
});

test("Miden earn submits once source metadata is ready", () => {
  assert.deepEqual(
    resolveEarnCta({ ...midenCtaParams, midenSourceReady: true }),
    { action: "submit", label: "Bridge from Miden + Deposit" },
  );
});

function PrivateMidenDestinationProbe() {
  const miden = useEarnMiden({
    earnMiden: {
      enabled: true,
      connected: true,
      accountId: "0x0e9089055fb6f54170bbf6159da028",
      accountIsPublic: false,
      assets: [],
      createP2IDNote: async () => ({ success: false }),
    } as EarnMidenAdapter,
    isTestnet: false,
    midenEnabled: true,
    fundingSource: "evm",
    selectedMidenFaucetId: DEFAULT_MIDEN_FAUCET.faucetId,
    earnTab: "withdraw",
    smartWithdraw: true,
    smartDestChainId: MIDEN_VIRTUAL_CHAIN_ID,
    smartDestTokenAddress: DEFAULT_MIDEN_FAUCET.faucetId,
  });

  return createElement("output", null, String(miden.smartDestNotReady));
}

test("private Miden accounts remain blocked as withdrawal destinations", () => {
  assert.equal(
    renderToStaticMarkup(createElement(PrivateMidenDestinationProbe)),
    "<output>true</output>",
  );
});
