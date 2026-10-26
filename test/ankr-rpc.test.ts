import assert from "node:assert/strict";
import test from "node:test";

import { getAnkrBaseRpcUrl } from "../demo/src/config/rpc";

test("uses the Ankr Base RPC with the provided key", () => {
  assert.equal(
    getAnkrBaseRpcUrl(" test-key "),
    "https://rpc.ankr.com/base/test-key",
  );
});

test("keeps Base on Ankr when no key is configured", () => {
  assert.equal(getAnkrBaseRpcUrl(undefined), "https://rpc.ankr.com/base");
});
