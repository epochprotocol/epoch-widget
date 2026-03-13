// ---- Intent configuration ----

export interface IntentConfig {
  /** Protocol identifier string, e.g. "raffles". Will be keccak256'd internally. */
  protocol: string;
  /** Action identifier string, e.g. "buyTicket". Will be keccak256'd internally. */
  action: string;
  /** Optional override for the protocol hash identifier passed to the Epoch SDK.
   *  If not provided, computed as keccak256(toBytes(protocol)). */
  protocolHashIdentifier?: string;
  /** ABI-encoded type string for any extra parameters, e.g. "address raffleAddress,uint256 numberOfTickets" */
  extraDataTypestring?: string;
  /** Key-value pairs matching extraDataTypestring fields. Values must match the ABI type — use actual booleans for bool, strings for address/bytes32/uint, etc. */
  extraData?: Record<string, string | boolean | number | bigint>;
  /** When true, passes 0 as tokenInAmount and sets fixed-output fields for the backend to compute input. */
  fixedOutput?: boolean;
  /** Destination chain ID for mainnet (default: 8453 Base) */
  destinationChainId?: number;
  /** Destination chain ID for testnet (default: 84532 Base Sepolia) */
  destinationTestnetChainId?: number;
}

// ---- Callback payloads ----

export interface IntentSentPayload {
  nonce: string;
}

export interface IntentCompletePayload {
  nonce: string;
  status: unknown;
}

// ---- Theme / styling ----

export interface EpochWidgetTheme {
  /** Outer overlay backdrop */
  overlay?: string;
  /** Dialog content card */
  container?: string;
  /** Header section (title + description) */
  header?: string;
  /** Title text element */
  title?: string;
  /** Description text element */
  description?: string;
  /** Select/dropdown trigger elements */
  select?: string;
  /** Info/alert boxes */
  alert?: string;
  /** Destructive/error alert boxes */
  alertDestructive?: string;
  /** Submit button */
  button?: string;
  /** Progress stepper container */
  progress?: string;
  /** Balance display box */
  balanceBox?: string;
  /** Scrollable content area */
  scrollArea?: string;
}

// ---- Chain and token types ----

export interface EpochChain {
  id: number;
  name: string;
  network: string;
  rpcUrl?: string;
}

export interface EpochToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

// ---- Widget props ----

export interface EpochIntentWidgetProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Called when the widget wants to close */
  onClose: () => void;

  /** The token required on the destination chain */
  requiredToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  /** Amount of requiredToken required, in raw units (bigint) */
  requiredAmount: bigint;

  /** Epoch Protocol API base URL (e.g. "http://localhost:3000") */
  apiBaseUrl: string;

  /**
   * Override RPC URLs for mainnet chains. Merged with built-in defaults —
   * only the chains you specify are overridden.
   *
   * Example:
   *   customRpcUrls={{ 8453: "https://base-mainnet.g.alchemy.com/v2/YOUR_KEY" }}
   */
  customRpcUrls?: Record<number, string>;

  /**
   * Override RPC URLs for testnet chains. Used when the widget is in testnet
   * mode (enableTestnet=true). Same merging behaviour as customRpcUrls.
   *
   * Example:
   *   testnetRpcUrls={{ 84532: "https://base-sepolia.g.alchemy.com/v2/YOUR_KEY" }}
   */
  testnetRpcUrls?: Record<number, string>;

  /** Describes the cross-chain intent this widget will submit */
  intentConfig: IntentConfig;

  // ---- Callbacks ----
  /** Fired right after the intent is submitted (before execution confirmed) */
  onIntentSent?: (data: IntentSentPayload) => void;
  /** Fired when polling confirms execution is complete */
  onIntentComplete?: (data: IntentCompletePayload) => void;
  /** Fired on any error */
  onError?: (error: Error) => void;

  // ---- Text overrides ----
  title?: string;
  description?: string;
  submitButtonText?: string;
  /** Human-readable name for the destination chain, shown in the UI */
  destinationChainName?: string;

  // ---- Feature flags ----
  /**
   * Force the widget into testnet mode with no toggle shown.
   * Takes precedence over enableTestnet/defaultTestnet when set to true.
   */
  testnet?: boolean;
  /** Show a mainnet/testnet toggle in the UI. Default: false */
  enableTestnet?: boolean;
  /** Start in testnet mode when the toggle is shown. Default: false */
  defaultTestnet?: boolean;

  // ---- Styling ----
  theme?: EpochWidgetTheme;
}
