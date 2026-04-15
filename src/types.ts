import type { EpochTheme } from './theme';

// ---------------------------------------------------------------------------
// Chain & token metadata
// ---------------------------------------------------------------------------

export interface EpochChain {
  id: number;
  name: string;
  network: string;
  rpcUrl?: string;
  logoURI?: string;
}

export interface EpochToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

// ---------------------------------------------------------------------------
// Intent configuration
// ---------------------------------------------------------------------------

export interface IntentConfig {
  /** Protocol identifier string, e.g. "raffles". Hashed with keccak256 internally. */
  protocol: string;
  /** Action identifier string, e.g. "buyTicket". Hashed with keccak256 internally. */
  action: string;
  /** Optional override for the protocol hash identifier sent to the solver. */
  protocolHashIdentifier?: string;
  /** ABI-encoded type string for extra fields, e.g. `"address raffleAddress,uint256 numberOfTickets"`. */
  extraDataTypestring?: string;
  /** Key-value pairs matching `extraDataTypestring`. */
  extraData?: Record<string, string | boolean | number | bigint>;
  /**
   * When true, `tokenInAmount` is submitted as 0 and the solver performs a
   * reverse quote to compute the required input.
   */
  fixedOutput?: boolean;
  /** Destination chain ID for mainnet flows (default: 8453). */
  destinationChainId?: number;
  /** Destination chain ID for testnet flows (default: 84532). */
  destinationTestnetChainId?: number;
}

// ---------------------------------------------------------------------------
// Grouped prop interfaces
// ---------------------------------------------------------------------------

/** Describes what the user is paying for across chains. */
export interface IntentProps {
  /** The token required on the destination chain. */
  requiredToken: { address: string; symbol: string; decimals: number };
  /** Amount of `requiredToken` needed, in raw units. */
  requiredAmount: bigint;
  /** Cross-chain intent configuration. */
  config: IntentConfig;
  /** Human-readable destination chain name, shown in the summary (e.g. "Base"). */
  destinationChainName?: string;
}

/** API / RPC endpoint configuration. */
export interface ApiConfig {
  /** Epoch allocator API base URL (e.g. `http://localhost:3000`). */
  baseUrl: string;
  /** Override RPC URLs by chain ID for on-chain reads. */
  rpcUrls?: Record<number, string>;
}

// ---------------------------------------------------------------------------
// Custom class names (CSS / Tailwind support)
// ---------------------------------------------------------------------------

/**
 * Class name overrides for every visual slot in the widget. When a className
 * is provided for a slot, the widget skips its default inline styles for that
 * element — giving the consumer full CSS control (vanilla, Tailwind, modules).
 *
 * @example Tailwind
 * ```tsx
 * classNames={{
 *   button: 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold',
 *   container: 'bg-white shadow-2xl rounded-2xl max-w-md',
 * }}
 * ```
 */
export interface EpochClassNames {
  // Layout
  overlay?: string;
  container?: string;
  header?: string;
  body?: string;
  footer?: string;
  // Receive section
  receiveCard?: string;
  receiveAmount?: string;
  receiveLabel?: string;
  // Pay section
  payCard?: string;
  payAmount?: string;
  payLabel?: string;
  // Controls
  button?: string;
  chainSelector?: string;
  tokenSelector?: string;
  // Feedback
  banner?: string;
  progress?: string;
}

// ---------------------------------------------------------------------------
// Callback payloads
// ---------------------------------------------------------------------------

export interface IntentSentPayload {
  nonce: string;
}

export interface IntentCompletePayload {
  nonce: string;
  status: unknown;
}

// ---------------------------------------------------------------------------
// Widget props
// ---------------------------------------------------------------------------

export interface EpochIntentWidgetProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Called when the user dismisses the dialog. */
  onClose: () => void;

  // ---- Intent ---------------------------------------------------------------

  /** Describes the cross-chain intent (token, amount, config). */
  intent: IntentProps;

  // ---- API ------------------------------------------------------------------

  /** Epoch API endpoints and RPC configuration. */
  api: ApiConfig;

  // ---- Network --------------------------------------------------------------

  /** Network mode. Default: `"mainnet"`. */
  network?: 'mainnet' | 'testnet';
  /** Allow the user to toggle mainnet/testnet inside the widget. Default: false. */
  allowNetworkToggle?: boolean;

  // ---- Callbacks ------------------------------------------------------------

  /** Fired when the intent is accepted by the solver. */
  onIntentSent?: (data: IntentSentPayload) => void;
  /** Fired when polling confirms the intent has been executed on-chain. */
  onIntentComplete?: (data: IntentCompletePayload) => void;
  /** Fired on any error during the submit/execute flow. */
  onError?: (error: Error) => void;

  // ---- Customisation --------------------------------------------------------

  /** Title displayed in the dialog header. Default: "Pay". */
  title?: string;
  /** Label on the submit button. Default: "Pay". */
  submitButtonText?: string;

  /**
   * CSS class name overrides for every visual slot. When provided for a slot,
   * the widget skips its built-in inline styles — giving full CSS control
   * (vanilla CSS, Tailwind, CSS Modules, etc.).
   */
  classNames?: EpochClassNames;
  /**
   * Theme tokens (colours, radii, typography). Projected as CSS custom
   * properties on the widget root. Omitted tokens fall back to defaults.
   */
  theme?: EpochTheme;
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export type { EpochTheme } from './theme';
