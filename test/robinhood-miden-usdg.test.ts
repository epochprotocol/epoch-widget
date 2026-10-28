import assert from "node:assert/strict";
import test from "node:test";
import { normalizeMidenId } from "@epoch-protocol/epoch-commons-sdk";
import { getMidenFaucetDecimals } from "../demo/src/miden/constants/miden-tokens";
import { getDemoChains, getDemoRpcUrls } from "../demo/src/config/rpc";
import { getMidenChainTokens } from "../src/earn/miden";

test("Robinhood wallet chains retain their own RPC with Infura enabled", () => {
  for (const proxy of [false, true]) {
    const urls = getDemoRpcUrls({ VITE_INFURA_RPC_PROXY_ENABLED: proxy });
    const chains = getDemoChains(urls);
    assert.equal(chains.find((c) => c.id === 4663)?.rpcUrls.default.http[0],
      "https://rpc.mainnet.chain.robinhood.com");
    assert.equal(chains.find((c) => c.id === 46630)?.rpcUrls.default.http[0],
      "https://rpc.testnet.chain.robinhood.com");
  }
});

test("Miden USDG is selectable on mainnet with the supplied faucet and six decimals", () => {
  const token = getMidenChainTokens(false).find((t) => t.symbol === "USDG");
  assert.ok(token);
  assert.equal(token.address, "mm1ar7rgznnerajt52p9ul6rltd8g039qsa");
  assert.equal(token.decimals, 6);
  assert.equal(token.chainId, 999999999);
  assert.ok(!getMidenChainTokens(true).some((t) => t.symbol === "USDG"));
});

test("Robinhood RPC overrides apply to transports and wallet chain metadata", () => {
  const urls = getDemoRpcUrls({
    VITE_INFURA_RPC_PROXY_ENABLED: true,
    VITE_ROBINHOOD_RPC_URL: " https://mainnet.example.test/rpc ",
    VITE_ROBINHOOD_TESTNET_RPC_URL: " https://testnet.example.test/rpc ",
  });
  assert.equal(urls[4663], "https://mainnet.example.test/rpc");
  assert.equal(urls[46630], "https://testnet.example.test/rpc");
  assert.equal(getDemoChains(urls).find((c) => c.id === 4663)?.rpcUrls.default.http[0], urls[4663]);
});


test("Miden USDG wallet hex IDs resolve to the configured faucet decimals", () => {
  const hex = normalizeMidenId("mm1ar7rgznnerajt52p9ul6rltd8g039qsa");
  assert.equal(getMidenFaucetDecimals(hex), 6);
  assert.equal(getMidenFaucetDecimals("mm1ar7rgznnerajt52p9ul6rltd8g039qsa"), 6);
  assert.equal(getMidenFaucetDecimals("unknown-faucet"), undefined);
});
