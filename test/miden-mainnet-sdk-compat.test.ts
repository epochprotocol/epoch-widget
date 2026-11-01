import assert from "node:assert/strict";
import test from "node:test";

import { ensurePragmaMidenMainnetOracle } from "../demo/src/miden/lib/mainnet-sdk-compat";

test("fills the Pragma Miden mainnet RPC missing from commons SDK 2.0.0", () => {
  const graph = { chains: { Miden: { chainId: 999_999_999 } } };

  const configured = ensurePragmaMidenMainnetOracle(
    graph,
    "https://rpc.cedar.miden.io",
  );

  assert.deepEqual(configured.oracles, {
    PragmaMidenV1: { rpcUrl: "https://rpc.cedar.miden.io" },
  });
});

test("preserves a Pragma Miden RPC supplied by the commons graph", () => {
  const graph = {
    oracles: { PragmaMidenV1: { rpcUrl: "https://configured.example" } },
  };

  const configured = ensurePragmaMidenMainnetOracle(
    graph,
    "https://rpc.cedar.miden.io",
  );

  assert.equal(
    configured.oracles.PragmaMidenV1.rpcUrl,
    "https://configured.example",
  );
});
