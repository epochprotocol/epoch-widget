/**
 * Pay/Swap CTA decision table (pure — no React, no browser).
 * Run: pnpm test:swap
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isPaySwapCtaEnabled,
  resolvePaySwapCta,
  resolvePaySwapCtaLabels,
} from "../src/pay/pay-swap-cta.js";
import { resolveDefaultSource } from "../src/pay/resolve-default-source.js";

const labels = resolvePaySwapCtaLabels(undefined, {
  submit: "Swap",
  configureRequired: "Configure swap",
});

const base = {
  labels,
  hasIntent: true,
  buildError: null,
  fixedOutput: false,
  flow: { isQuoting: false, status: "idle", activeStep: 0 },
  isWrongNetwork: false,
  selectedChain: { id: 8453, name: "Base", network: "base" },
  insufficientBalance: false,
  selectedToken: {
    address: "0xabc",
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin",
    chainId: 8453,
  },
  isMidenSource: false,
  isMidenDest: false,
  midenConnected: false,
};

describe("resolvePaySwapCta", () => {
  it("submits when everything is ready", () => {
    const cta = resolvePaySwapCta(base);
    assert.equal(cta.action, "submit");
    assert.equal(cta.label, "Swap");
    assert.ok(isPaySwapCtaEnabled(cta.action));
  });

  it("asks for configuration when no intent resolved", () => {
    const cta = resolvePaySwapCta({ ...base, hasIntent: false });
    assert.equal(cta.action, "disabled");
    assert.equal(cta.label, "Configure swap");
  });

  it("prefers the concrete build error over the generic hint", () => {
    const cta = resolvePaySwapCta({
      ...base,
      hasIntent: false,
      buildError: "toAmount is not a number",
    });
    assert.equal(cta.label, "toAmount is not a number");
  });

  it("only blocks on quoting for fixed-output flows", () => {
    const quoting = { ...base, flow: { ...base.flow, isQuoting: true } };
    assert.equal(resolvePaySwapCta(quoting).action, "submit");
    const fixed = resolvePaySwapCta({ ...quoting, fixedOutput: true });
    assert.equal(fixed.action, "disabled");
    assert.equal(fixed.label, "Fetching quote…");
  });

  it("names the submit sub-step while in flight", () => {
    const at = (activeStep: number) =>
      resolvePaySwapCta({
        ...base,
        flow: { isQuoting: false, status: "submitting", activeStep },
      }).label;
    assert.equal(at(1), "Preparing…");
    assert.equal(at(2), "Signing…");
    assert.equal(at(3), "Submitting…");
  });

  it("marks completion with the success tone", () => {
    const cta = resolvePaySwapCta({
      ...base,
      flow: { ...base.flow, status: "complete" },
    });
    assert.equal(cta.tone, "success");
    assert.ok(!isPaySwapCtaEnabled(cta.action));
  });

  it("offers the network switch, and it is clickable", () => {
    const cta = resolvePaySwapCta({ ...base, isWrongNetwork: true });
    assert.equal(cta.action, "switch");
    assert.equal(cta.label, "Switch to Base");
    assert.ok(isPaySwapCtaEnabled(cta.action));
  });

  // Ordering is the whole point of the table: an in-flight submit must not be
  // overwritten by a balance complaint the user can no longer act on.
  it("lets in-flight state outrank balance and network complaints", () => {
    const cta = resolvePaySwapCta({
      ...base,
      flow: { isQuoting: false, status: "polling", activeStep: 4 },
      isWrongNetwork: true,
      insufficientBalance: true,
    });
    assert.equal(cta.label, "Waiting for execution…");
  });

  it("reports insufficient balance against the selected token", () => {
    const cta = resolvePaySwapCta({ ...base, insufficientBalance: true });
    assert.equal(cta.label, "Insufficient USDC balance");
  });

  it("honours integrator label overrides", () => {
    const custom = resolvePaySwapCtaLabels(
      { submit: "Trade now", switchNetwork: (c) => `Go to ${c}` },
      { submit: "Swap", configureRequired: "Configure swap" },
    );
    assert.equal(resolvePaySwapCta({ ...base, labels: custom }).label, "Trade now");
    assert.equal(
      resolvePaySwapCta({ ...base, labels: custom, isWrongNetwork: true }).label,
      "Go to Base",
    );
  });

  // The four Miden quadrants — the reason the CTA grew Miden inputs at all.
  it("EVM→EVM: unchanged submit when no Miden leg", () => {
    const cta = resolvePaySwapCta(base);
    assert.equal(cta.action, "submit");
  });

  it("Miden→EVM: prompts a Miden connect before anything else", () => {
    const cta = resolvePaySwapCta({ ...base, isMidenSource: true });
    assert.equal(cta.action, "connectMiden");
    assert.equal(cta.label, "Connect Miden wallet");
    assert.ok(isPaySwapCtaEnabled(cta.action));
  });

  it("EVM→Miden: prompts a Miden connect for the recipient account", () => {
    const cta = resolvePaySwapCta({ ...base, isMidenDest: true });
    assert.equal(cta.action, "connectMiden");
  });

  it("Miden→EVM: submits once the Miden wallet is connected", () => {
    const cta = resolvePaySwapCta({
      ...base,
      isMidenSource: true,
      midenConnected: true,
    });
    assert.equal(cta.action, "submit");
  });

  // The original bug: a Miden source could never advance past "Switch to Miden".
  it("Miden→EVM: never offers a network switch, even if wrong-network leaks", () => {
    const cta = resolvePaySwapCta({
      ...base,
      isMidenSource: true,
      midenConnected: true,
      isWrongNetwork: true,
    });
    assert.notEqual(cta.action, "switch");
    assert.equal(cta.action, "submit");
  });

  it("Miden→Miden: denied — a virtual chain can't be both ends", () => {
    const cta = resolvePaySwapCta({
      ...base,
      isMidenSource: true,
      isMidenDest: true,
      midenConnected: true,
    });
    assert.equal(cta.action, "disabled");
    assert.equal(cta.label, "Select a different destination");
  });
});

const chain = (id: number, name: string) => ({ id, name, network: name });
const token = (address: string, symbol: string, c: ReturnType<typeof chain>) => ({
  address,
  symbol,
  decimals: 6,
  name: symbol,
  chainId: c.id,
  chain: c,
});

const base8453 = chain(8453, "Base");
const arb = chain(42161, "Arbitrum");
const TOKENS = [
  token("0xAAA", "USDC", base8453),
  token("0xBBB", "DAI", base8453),
  token("0xCCC", "USDC", arb),
];

describe("resolveDefaultSource", () => {
  it("returns null when there is nothing to select", () => {
    assert.equal(resolveDefaultSource([], 8453, "0xAAA"), null);
  });

  it("honours an exact chain + token default", () => {
    const got = resolveDefaultSource(TOKENS, 42161, "0xccc");
    assert.equal(got?.chain.id, 42161);
    assert.equal(got?.address, "0xCCC");
  });

  it("falls back to any token on the requested chain", () => {
    const got = resolveDefaultSource(TOKENS, 42161, "0xNOTHERE");
    assert.equal(got?.chain.id, 42161);
  });

  it("falls back to the first token when the chain is unavailable", () => {
    const got = resolveDefaultSource(TOKENS, 999, "0xAAA");
    assert.equal(got?.address, "0xAAA");
    assert.equal(got?.chain.id, 8453);
  });

  it("returns the first token when no default is given", () => {
    assert.equal(resolveDefaultSource(TOKENS)?.address, "0xAAA");
  });
});
