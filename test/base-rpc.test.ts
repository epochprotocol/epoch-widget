import assert from "node:assert/strict";
import test from "node:test";

import { getBaseRpcUrl } from "../demo/src/config/rpc";

test("uses the local Infura proxy when configured", () => {
  assert.equal(getBaseRpcUrl("ankr-key", " /widget/rpc/base "), "/widget/rpc/base");
});

test("uses the Ankr Base RPC with the provided key", () => {
  assert.equal(
    getBaseRpcUrl(" test-key "),
    "https://rpc.ankr.com/base/test-key",
  );
});

test("uses public Base mainnet RPC when no usable key is configured", () => {
  for (const key of [undefined, "", "  "]) {
    assert.equal(getBaseRpcUrl(key), "https://mainnet.base.org");
  }
});
