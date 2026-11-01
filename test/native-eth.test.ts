import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EPOCH_SUPPORTED_TOKENS,
  EPOCH_TESTNET_TOKENS,
  NATIVE_ETH_ADDRESS,
  getEpochTokensByChainEnv,
} from "../src/epoch-config.js";

test("the widget token registry offers ETH separately from WETH", () => {
  for (const [isTestnet, chainIds, tokens] of [
    [false, [1, 10, 8453, 42161, 4663], EPOCH_SUPPORTED_TOKENS],
    [true, [84532, 11155111, 11155420, 46630], EPOCH_TESTNET_TOKENS],
  ] as const) {
    for (const chainId of chainIds) {
      const chainTokens = getEpochTokensByChainEnv(chainId, isTestnet);
      assert.ok(chainTokens.some((token) => token.symbol === "ETH" && token.address === NATIVE_ETH_ADDRESS));
    }
  }

  const baseTokens = getEpochTokensByChainEnv(8453, false);
  assert.ok(baseTokens.some((token) => token.symbol === "WETH" && token.address !== NATIVE_ETH_ADDRESS));
  assert.equal(getEpochTokensByChainEnv(137, false).some((token) => token.symbol === "ETH"), false);
  assert.equal(
    EPOCH_SUPPORTED_TOKENS.some((token) => token.symbol === "ETH" && token.chainId === 999999999),
    false,
  );
});
