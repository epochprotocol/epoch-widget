/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EPOCH_API_BASE_URL?: string;
  readonly VITE_ALLOCATOR_URL?: string;
  readonly VITE_TESTNET_API_BASE_URL?: string;
  readonly VITE_TESTNET_POSITIONS_API_BASE_URL?: string;
  readonly VITE_MIDENSCAN_URL?: string;
  readonly VITE_MIDEN_RPC_URL?: string;
  readonly VITE_MIDEN_NOTE_TRANSPORT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
