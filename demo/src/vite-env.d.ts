/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INFURA_RPC_PROXY_ENABLED?: boolean;
  readonly VITE_BASE_RPC_URL?: string;
  readonly VITE_ROBINHOOD_RPC_URL?: string;
  readonly VITE_ROBINHOOD_TESTNET_RPC_URL?: string;
  readonly VITE_ANKR_API_KEY?: string;
  readonly VITE_EPOCH_API_BASE_URL?: string;
  readonly VITE_EARN_SOLVER_URL?: string;
  readonly VITE_POSITIONS_API_BASE_URL?: string;
  readonly VITE_TESTNET_API_BASE_URL?: string;
  readonly VITE_TESTNET_POSITIONS_API_BASE_URL?: string;
  readonly VITE_MIDENSCAN_URL?: string;
  readonly VITE_MIDEN_RPC_URL?: string;
  readonly VITE_MIDEN_NOTE_TRANSPORT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
