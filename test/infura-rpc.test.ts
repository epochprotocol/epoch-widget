import assert from "node:assert/strict";
import test from "node:test";
import { createPublicClient, http } from "viem";
import { getDemoChains, getDemoRpcUrls } from "../demo/src/config/rpc";

test("Infura routing also replaces chain metadata used by SDK-created clients", async () => {
  const urls = getDemoRpcUrls({ VITE_INFURA_RPC_PROXY_ENABLED: true });
  assert.equal(urls[137], "/widget/rpc/polygon");
  const chains = getDemoChains(urls);
  for (const chain of chains) {
    if (![4663, 46630].includes(chain.id)) {
      assert.match(chain.rpcUrls.default.http[0], /^\/widget\/rpc\//);
    }
    assert.equal(chain.rpcUrls.default.http[0], urls[chain.id]);
  }
  const polygon = chains.find((chain) => chain.id === 137)!;
  const calls: { url: string; body: unknown }[] = [];
  const client = createPublicClient({
    chain: polygon,
    transport: http(new URL(polygon.rpcUrls.default.http[0], "https://demo.example").href, {
      fetchFn: async (input, init) => {
        const request = input instanceof Request ? input : new Request(input, init);
        const body = await request.json();
        calls.push({ url: request.url, body });
        return new Response(JSON.stringify({ jsonrpc: "2.0", id: body.id, result: "0x2" }));
      },
    }),
  });
  assert.equal(await client.getTransactionCount({
    address: "0x4235215114484bACDfF0071dB54Dc9faaD3489a9",
    blockTag: "pending",
  }), 2);
  assert.equal(calls[0].url, "https://demo.example/widget/rpc/polygon");
  assert.equal((calls[0].body as { method: string }).method, "eth_getTransactionCount");
});

test("public RPC defaults remain usable without a server-side Infura credential", () => {
  const urls = getDemoRpcUrls({});
  assert.equal(urls[137], "https://polygon-bor-rpc.publicnode.com");
  assert.equal(urls[8453], "https://mainnet.base.org");
});

test("proxy routes distinguish mainnet and Sepolia paths and keep authentication server-side", async () => {
  const { default: configFactory } = await import("../demo/vite.config");
  const previous = process.env.INFURA_API_KEY;
  process.env.INFURA_API_KEY = Buffer.from(`${"0".repeat(32)}:test-secret`).toString("base64");
  try {
    const config = await configFactory({ command: "serve", mode: "test" });
    const proxy = config.server!.proxy!;
    for (const [path, hostname] of [
      ["/widget/rpc/polygon", "polygon-mainnet.infura.io"],
      ["/widget/rpc/base", "base-mainnet.infura.io"],
      ["/widget/rpc/base-sepolia", "base-sepolia.infura.io"],
      ["/widget/rpc/optimism-sepolia", "optimism-sepolia.infura.io"],
    ]) {
      const matches = Object.keys(proxy).filter((key) => new RegExp(key).test(path));
      assert.equal(matches.length, 1, `${path} must match exactly one upstream`);
      const route = proxy[matches[0]] as {
        target: string; headers: { Authorization: string }; rewrite(path: string): string;
      };
      assert.equal(new URL(route.target).hostname, hostname);
      assert.equal(route.rewrite(path), "");
      assert.equal(Buffer.from(route.headers.Authorization.slice(6), "base64").toString(), ":test-secret");
    }
    assert.equal(config.define!["import.meta.env.VITE_INFURA_RPC_PROXY_ENABLED"], "true");
    assert.ok(!JSON.stringify(config.define).includes("test-secret"));
  } finally {
    if (previous === undefined) delete process.env.INFURA_API_KEY;
    else process.env.INFURA_API_KEY = previous;
  }
});
