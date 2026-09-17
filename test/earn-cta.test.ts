import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isEarnCtaEnabled, resolveEarnCta } from "../src/earn/earn-cta.js";

const base = {
  earnTab: "deposit" as const,
  fundingSource: "solana" as const,
  flow: {
    isQuoting: false,
    status: "idle",
    quoteError: null,
    requiresFreshSolanaQuote: false,
  },
  isConnected: true,
  midenConnected: false,
  solanaConnected: false,
  solanaConfigured: true,
  solanaCanOpenEscrow: false,
  hasSelectedMarket: true,
  depositAmount: "1",
  hasSelectedPosition: false,
  withdrawAmount: "",
  availableChains: [],
  selectedChain: null,
  effectiveSourceChainId: 1151112,
  effectiveSourceToken: {
    address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chainId: 1151112,
  },
  isWrongNetwork: false,
  insufficientBalance: false,
  insufficientBalanceSymbol: "",
  buildOk: true,
  isSmartWithdrawDegenerate: false,
  midenSmartDestNotReady: false,
  isCrossChain: true,
};

describe("resolveEarnCta Solana deposit", () => {
  it("connects the Solana wallet before allowing an Earn quote", () => {
    const cta = resolveEarnCta(base);
    assert.equal(cta.action, "connectSolana");
    assert.ok(isEarnCtaEnabled(cta.action));
  });

  it("requires a real escrow opener after Solana connects", () => {
    const cta = resolveEarnCta({ ...base, solanaConnected: true });
    assert.equal(cta.action, "disabled");
    assert.equal(cta.label, "Configure Solana escrow");
  });

  it("submits only when the Devnet escrow callback is configured", () => {
    const cta = resolveEarnCta({
      ...base,
      solanaConnected: true,
      solanaCanOpenEscrow: true,
    });
    assert.equal(cta.action, "submit");
    assert.equal(cta.label, "Bridge from Solana + Deposit");
  });

  it("requires a fresh quote after a Solana submission attempt", () => {
    const cta = resolveEarnCta({
      ...base,
      solanaConnected: true,
      solanaCanOpenEscrow: true,
      flow: { ...base.flow, requiresFreshSolanaQuote: true },
    });
    assert.equal(cta.action, "retry");
    assert.equal(cta.label, "Fetch fresh Solana quote");
  });
});
