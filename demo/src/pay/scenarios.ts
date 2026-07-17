import type { EpochIntentWidgetProps } from "@epoch-protocol/epoch-intent-widget";
import {
  DEFAULT_MIDEN_FAUCET,
  MIDEN_VIRTUAL_CHAIN_ID,
} from "@epoch-protocol/epoch-intent-widget";

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
];

// Base Sepolia USDC — public Circle test faucet token.
const BASE_SEPOLIA_USDC =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

export const PAY_TESTNET_SCENARIOS: Scenario[] = [
  {
    id: "flat-pay-testnet",
    name: "Flat pay (Base Sepolia)",
    tagline:
      "Send a fixed test USDC amount on Base Sepolia. Same flat-pay prop shape as mainnet, network flipped to testnet.",
    props: {
      mode: "pay",
      network: "testnet",
      title: "Send test USDC",
      submitButtonText: "Send",
      toAddress: "0x4235215114484bACDfF0071dB54Dc9faaD3489a9",
      toAmount: "0.10",
      toChainId: 84532,
      toToken: BASE_SEPOLIA_USDC,
    },
  },
  {
    id: "flat-pay-op-sepolia",
    name: "Flat pay (Optimism Sepolia)",
    tagline:
      "Send test USDC on Optimism Sepolia (11155420). Uses the bundled registry token for OP Sepolia.",
    props: {
      mode: "pay",
      network: "testnet",
      title: "Send test USDC",
      submitButtonText: "Send",
      toAddress: "0x4235215114484bACDfF0071dB54Dc9faaD3489a9",
      toAmount: "0.10",
      toChainId: 11155420,
      toToken: "0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69",
      toTokenSymbol: "USDC",
      toTokenDecimals: 18,
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

const OP_SEPOLIA_USDC =
  "0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69" as const;

const SWAP_TESTNET_INITIAL_INTENT = {
  requiredToken: {
    address: BASE_SEPOLIA_USDC,
    symbol: "USDC",
    decimals: 6,
  },
  requiredAmount: BigInt(1_000_000), // 1 test USDC
  destinationChainName: "Base Sepolia",
  positionLabel: "1 USDC on Base Sepolia",
  config: {
    protocol: "swap",
    action: "swap",
    fixedOutput: true,
    destinationChainId: 84532,
  },
};

export const SWAP_TESTNET_SCENARIOS: Scenario[] = [
  {
    id: "swap-testnet",
    name: "Swap (Base Sepolia)",
    tagline:
      "Same Swap UX on Base Sepolia. Default destination 1 test USDC on Base Sepolia — both sides re-pickable.",
    props: {
      mode: "swap",
      network: "testnet",
      allowNetworkToggle: true,
      title: "Swap",
      ctaLabels: SHARED_CTA_LABELS,
      usdPriceFor: SHARED_USD_ORACLE,
      intent: SWAP_TESTNET_INITIAL_INTENT,
    },
  },
  {
    id: "swap-op-sepolia",
    name: "Swap (Optimism Sepolia)",
    tagline:
      "Swap UX on Optimism Sepolia. Default destination 1 test USDC on OP Sepolia — both sides re-pickable.",
    props: {
      mode: "swap",
      network: "testnet",
      allowNetworkToggle: true,
      title: "Swap",
      ctaLabels: SHARED_CTA_LABELS,
      usdPriceFor: SHARED_USD_ORACLE,
      intent: {
        requiredToken: {
          address: OP_SEPOLIA_USDC,
          symbol: "USDC",
          decimals: 18,
        },
        requiredAmount: BigInt(1_000_000_000_000_000_000), // 1 USDC (18 decimals)
        destinationChainName: "Optimism Sepolia",
        positionLabel: "1 USDC on Optimism Sepolia",
        config: {
          protocol: "swap",
          action: "swap",
          fixedOutput: true,
          destinationChainId: 11155420,
        },
      },
    },
  },
  {
    id: "swap-miden-to-evm",
    name: "Swap (Miden → Base Sepolia)",
    tagline:
      "Source funds on Miden — the wallet mints a P2ID note the allocator claims — and receive test USDC on Base Sepolia. Opens with Miden preselected; connect a Miden wallet to sign.",
    props: {
      mode: "swap",
      network: "testnet",
      allowNetworkToggle: true,
      title: "Swap from Miden",
      ctaLabels: SHARED_CTA_LABELS,
      usdPriceFor: SHARED_USD_ORACLE,
      intent: SWAP_TESTNET_INITIAL_INTENT,
      defaultSourceChainId: MIDEN_VIRTUAL_CHAIN_ID,
      defaultSourceTokenAddress: DEFAULT_MIDEN_FAUCET.faucetId,
    },
  },
  {
    id: "swap-evm-to-miden",
    name: "Swap (Base Sepolia → Miden)",
    tagline:
      "Pay with test USDC on an EVM chain, receive USDC on Miden. The EVM wallet signs; the recipient is your connected Miden account.",
    props: {
      mode: "swap",
      network: "testnet",
      allowNetworkToggle: true,
      title: "Swap to Miden",
      ctaLabels: SHARED_CTA_LABELS,
      usdPriceFor: SHARED_USD_ORACLE,
      intent: {
        requiredToken: {
          address: DEFAULT_MIDEN_FAUCET.faucetId,
          symbol: DEFAULT_MIDEN_FAUCET.symbol,
          decimals: DEFAULT_MIDEN_FAUCET.decimals,
        },
        requiredAmount: BigInt(1_000_000), // 1 USDC (Miden faucet, 6 decimals)
        destinationChainName: "Miden",
        positionLabel: "1 USDC on Miden",
        config: {
          protocol: "swap",
          action: "swap",
          fixedOutput: true,
          destinationTestnetChainId: MIDEN_VIRTUAL_CHAIN_ID,
        },
      },
      defaultSourceChainId: 84532,
      defaultSourceTokenAddress: BASE_SEPOLIA_USDC,
    },
  },
];
