import type { EpochIntentWidgetProps } from "@epoch-protocol/epoch-intent-widget";

export type ScenarioProps = Omit<
  EpochIntentWidgetProps,
  "isOpen" | "onClose" | "api"
>;

export interface Scenario {
  id: string;
  name: string;
  tagline: string;
  props: ScenarioProps;
}

export const PAY_SCENARIOS: Scenario[] = [
  {
    id: "flat-pay",
    name: "Flat pay",
    tagline:
      "Send a fixed USDC amount to a wallet — simplest prop shape, no nested intent.",
    props: {
      mode: "pay",
      title: "Send USDC",
      submitButtonText: "Send",
      toAddress: "0x4235215114484bACDfF0071dB54Dc9faaD3489a9",
      toAmount: "0.15",
      toChainId: 8453,
      toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    },
  },
  {
    id: "raffle-mainnet",
    name: "Raffle ticket",
    tagline:
      "Fixed-output mainnet purchase. Pay whatever in their token, receive 5 USDC worth on Base.",
    props: {
      title: "Buy raffle ticket",
      submitButtonText: "Buy ticket",
      intent: {
        requiredToken: {
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          symbol: "USDC",
          decimals: 6,
        },
        requiredAmount: BigInt(5_000_000),
        destinationChainName: "Base",
        positionLabel: "1 Raffle Ticket",
        config: {
          protocol: "raffles",
          action: "buyTicket",
          extraDataTypestring: "address raffleAddress,uint256 numberOfTickets",
          extraData: {
            raffleAddress: "0x0000000000000000000000000000000000000001",
            numberOfTickets: "1",
          },
          fixedOutput: true,
          destinationChainId: 8453,
        },
      },
    },
  },
  {
    id: "pay-locked-source",
    name: "Locked source (Base USDC)",
    tagline:
      "Pin the source side to USDC on Base — user cannot change it. Useful when host app knows what to charge in.",
    props: {
      mode: "pay",
      title: "Send USDC",
      submitButtonText: "Send",
      toAddress: "0x4235215114484bACDfF0071dB54Dc9faaD3489a9",
      toAmount: "0.15",
      toChainId: 8453,
      toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      sourceChainIds: [8453],
      defaultSourceChainId: 8453,
      defaultSourceTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      lockSourceToken: true,
      usdPriceFor: ({ symbol }) =>
        symbol === "USDC" || symbol === "USDT" || symbol === "DAI" ? 1 : null,
    },
  },
];

const SHARED_USD_ORACLE = ({ symbol }: { symbol: string }) => {
  if (symbol === "USDC" || symbol === "USDT" || symbol === "DAI") return 1;
  if (symbol === "WETH" || symbol === "ETH") return 3500;
  if (symbol === "WBTC" || symbol === "BTC") return 95_000;
  return null;
};

const SHARED_CTA_LABELS = {
  submit: "Confirm swap",
  quoting: "Pricing…",
  preparing: "Wallet ready?",
  signing: "Approve in wallet",
  submitting: "Sending intent…",
  polling: "Settling on-chain…",
  complete: "All done",
};

/**
 * Initial Swap intent — USDC on Base. User can re-pick both sides; the widget
 * uses `protocol: 'swap'` so PaySession derives `TaskType.GetTokenOut` and the
 * SIO server routes through DEX solvers, not the 1delta protocol-interaction
 * path.
 */
const SWAP_INITIAL_INTENT = {
  requiredToken: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const,
    symbol: "USDC",
    decimals: 6,
  },
  requiredAmount: BigInt(1_000_000), // 1 USDC
  destinationChainName: "Base",
  positionLabel: "1 USDC on Base",
  config: {
    protocol: "swap",
    action: "swap",
    fixedOutput: true,
    destinationChainId: 8453,
  },
};

/** Swap mode uses the same intent SDK path as pay; `mode: 'swap'` drives copy and callbacks. */
export const SWAP_SCENARIOS: Scenario[] = [
  {
    id: "swap",
    name: "Swap",
    tagline:
      "User picks both source and destination tokens — classic exchange UX. Initial destination is USDC on Base but the user can change it.",
    props: {
      mode: "swap",
      title: "Swap",
      ctaLabels: SHARED_CTA_LABELS,
      usdPriceFor: SHARED_USD_ORACLE,
      intent: SWAP_INITIAL_INTENT,
    },
  },
];
