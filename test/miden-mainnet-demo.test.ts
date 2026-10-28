import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  BASE_MAINNET_USDC,
  MIDEN_MAINNET,
  resolveEpochApiBaseUrl,
} from "../demo/src/config/miden-mainnet";
import {
  MIDEN_MAINNET_WALLET_NETWORK,
  requirePublicMidenAccount,
} from "../demo/src/miden/lib/mainnet-wallet-compat";
import viteConfig from "../demo/vite.config";

test("Miden bridge exposes only Base USDC to native Miden USDCX at six decimals", () => {
  assert.deepEqual(BASE_MAINNET_USDC, {
    symbol: "USDC",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    chainId: 8453,
  });
  assert.equal(MIDEN_MAINNET.chainId, 999_999_999);
  assert.equal(MIDEN_MAINNET.network, "miden-mainnet");
  assert.equal(MIDEN_MAINNET.rpcUrl, "https://rpc.cedar.miden.io");
  assert.equal(MIDEN_MAINNET.noteTransportUrl, "https://transport.cedar.miden.io");
  assert.equal(MIDEN_MAINNET.explorer, "https://midenscan.com");
  assert.equal(MIDEN_MAINNET.usdcx.symbol, "USDCX");
  assert.equal(MIDEN_MAINNET.usdcx.decimals, 6);
  assert.match(MIDEN_MAINNET.usdcx.faucetId, /^mm1/);
});

test("browser API configuration uses the Vite value and otherwise stays same-origin", () => {
  assert.equal(
    resolveEpochApiBaseUrl({
      VITE_EPOCH_API_BASE_URL: " https://api.example.test/ ",
    }),
    "https://api.example.test",
  );
  assert.equal(resolveEpochApiBaseUrl({}), "/allocator");
});

test("widget demo is built beneath the hosted /widget/ path", () => {
  assert.equal(viteConfig.base, "/widget/");
});

test("positions API permits localhost HTTP and requires HTTPS for remote hosts", () => {
  const env = readFileSync(new URL("../demo/.env", import.meta.url), "utf8");
  const value = env.match(/^VITE_POSITIONS_API_BASE_URL=(.+)$/m)?.[1];
  assert.ok(value, "VITE_POSITIONS_API_BASE_URL must be configured");

  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  assert.ok(url.protocol === "https:" || (local && url.protocol === "http:"));
});

test("Bread compatibility boundary sends the raw mainnet wire value", () => {
  assert.equal(MIDEN_MAINNET_WALLET_NETWORK, "mainnet");
});

test("private Miden accounts are rejected before quote construction", () => {
  assert.throws(
    () =>
      requirePublicMidenAccount({
        toString: () => "0xprivate",
        isPublic: () => false,
      }),
    /public Miden account/i,
  );
  assert.equal(
    requirePublicMidenAccount({
      toString: () => "0xpublic",
      isPublic: () => true,
    }),
    "0xpublic",
  );
});

test("a private Bread account still resolves as Miden source metadata", async () => {
  const compatModule = await import(
    "../demo/src/miden/lib/mainnet-wallet-compat"
  );
  const normalizeMidenAccount = (
    compatModule as typeof compatModule & {
      normalizeMidenAccount?: (accountId: {
        toString(): string;
        isPublic(): boolean;
      }) => { hex: string; isPublic: boolean };
    }
  ).normalizeMidenAccount;

  assert.equal(typeof normalizeMidenAccount, "function");
  assert.deepEqual(
    normalizeMidenAccount?.({
      toString: () => "0x0e9089055fb6f54170bbf6159da028",
      isPublic: () => false,
    }),
    {
      hex: "0x0e9089055fb6f54170bbf6159da028",
      isPublic: false,
    },
  );
});
