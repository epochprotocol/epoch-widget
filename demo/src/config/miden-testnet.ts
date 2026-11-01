import { testnetGraph } from "@epoch-protocol/epoch-commons-sdk";

export const MIDEN_TESTNET = Object.freeze({
  chainId: testnetGraph.chains.Miden.chainId,
  network: "miden-testnet",
  rpcUrl:
    import.meta.env.VITE_MIDEN_TESTNET_RPC_URL?.trim() ||
    "https://rpc.testnet.miden.io",
  noteTransportUrl:
    import.meta.env.VITE_MIDEN_TESTNET_NOTE_TRANSPORT_URL?.trim() ||
    "https://transport.miden.io",
  explorer: testnetGraph.chains.Miden.explorer,
});
