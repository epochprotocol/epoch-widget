import type { EpochIntentWidgetProps } from 'epoch-intent-widget';

export type ScenarioProps = Omit<EpochIntentWidgetProps, 'isOpen' | 'onClose' | 'api'>;

export interface Scenario {
  id: string;
  name: string;
  tagline: string;
  props: ScenarioProps;
}

export const PAY_SCENARIOS: Scenario[] = [
  {
    id: 'flat-pay',
    name: 'Flat pay',
    tagline: 'Send a fixed USDC amount to a wallet — the simplest prop shape, no nested intent.',
    props: {
      mode: 'pay',
      title: 'Send USDC',
      submitButtonText: 'Send',
      toAddress: '0x4235215114484bACDfF0071dB54Dc9faaD3489a9',
      toAmount: '0.15',
      toChainId: 8453,
      toToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
  },
  {
    id: 'raffle-mainnet',
    name: 'Raffle Ticket',
    tagline: 'Fixed-output mainnet purchase. The user pays whatever it costs in their token to receive exactly 5 USDC worth on Base.',
    props: {
      title: 'Buy Raffle Ticket',
      submitButtonText: 'Buy Ticket',
      intent: {
        requiredToken: {
          address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          symbol: 'USDC',
          decimals: 6,
        },
        requiredAmount: BigInt(5_000_000),
        destinationChainName: 'Base',
        positionLabel: '1 Raffle Ticket',
        config: {
          protocol: 'raffles',
          action: 'buyTicket',
          extraDataTypestring: 'address raffleAddress,uint256 numberOfTickets',
          extraData: {
            raffleAddress: '0x0000000000000000000000000000000000000001',
            numberOfTickets: '1',
          },
          fixedOutput: true,
          destinationChainId: 8453,
        },
      },
    },
  },
  {
    id: 'vault-deposit',
    name: 'Vault Deposit',
    tagline: 'Variable-input deposit. The user picks how much to put in; the widget routes it to a vault on Base.',
    props: {
      title: 'Deposit to Vault',
      submitButtonText: 'Deposit',
      intent: {
        requiredToken: {
          address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          symbol: 'USDC',
          decimals: 6,
        },
        requiredAmount: BigInt(10_000_000),
        destinationChainName: 'Base',
        positionLabel: '10 USDC Vault Deposit',
        config: {
          protocol: 'my-dapp',
          action: 'deposit',
          extraDataTypestring: 'address vault',
          extraData: { vault: '0x0000000000000000000000000000000000000002' },
          fixedOutput: false,
          destinationChainId: 8453,
        },
      },
    },
  },
  {
    id: 'testnet-locked',
    name: 'Testnet (locked)',
    tagline: 'Same raffle flow on Base Sepolia. The network toggle is hidden — useful for staging environments.',
    props: {
      title: 'Testnet Raffle',
      submitButtonText: 'Buy Ticket',
      network: 'testnet',
      allowNetworkToggle: false,
      intent: {
        requiredToken: {
          address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69',
          symbol: 'USDC',
          decimals: 18,
        },
        requiredAmount: BigInt('1000000000000000000'),
        destinationChainName: 'Base Sepolia',
        positionLabel: '1 Raffle Ticket',
        config: {
          protocol: 'raffles',
          action: 'buyTicket',
          extraDataTypestring: 'address raffleAddress,uint256 numberOfTickets',
          extraData: {
            raffleAddress: '0x0000000000000000000000000000000000000001',
            numberOfTickets: '1',
          },
          fixedOutput: true,
          destinationTestnetChainId: 84532,
        },
      },
    },
  },
  {
    id: 'testnet-toggle',
    name: 'Testnet (toggleable)',
    tagline: 'Starts on testnet but lets the user flip to mainnet — handy when you want a "try with fake funds" affordance.',
    props: {
      title: 'Raffle (toggleable)',
      submitButtonText: 'Buy Ticket',
      network: 'testnet',
      allowNetworkToggle: true,
      intent: {
        requiredToken: {
          address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69',
          symbol: 'USDC',
          decimals: 18,
        },
        requiredAmount: BigInt('1000000000000000000'),
        destinationChainName: 'Base Sepolia',
        positionLabel: '1 Raffle Ticket',
        config: {
          protocol: 'raffles',
          action: 'buyTicket',
          extraDataTypestring: 'address raffleAddress,uint256 numberOfTickets',
          extraData: {
            raffleAddress: '0x0000000000000000000000000000000000000001',
            numberOfTickets: '1',
          },
          fixedOutput: true,
          destinationTestnetChainId: 84532,
        },
      },
    },
  },
  {
    id: 'evm-swap-quote',
    name: 'Quoted pay-in',
    tagline: 'Pick a source token, see a live quote, get a fixed USDC amount out.',
    props: {
      title: 'Swap into USDC',
      submitButtonText: 'Confirm swap',
      network: 'testnet',
      allowNetworkToggle: true,
      intent: {
        requiredToken: {
          address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69',
          symbol: 'USDC',
          decimals: 18,
        },
        requiredAmount: BigInt('1000000000000000000'),
        destinationChainName: 'Base Sepolia',
        positionLabel: '1 USDC on Base Sepolia (demo)',
        config: {
          protocol: 'raffles',
          action: 'buyTicket',
          extraDataTypestring: 'address raffleAddress,uint256 numberOfTickets',
          extraData: {
            raffleAddress: '0x0000000000000000000000000000000000000001',
            numberOfTickets: '1',
          },
          fixedOutput: true,
          destinationTestnetChainId: 84532,
        },
      },
    },
  },
];

/** Swap mode uses the same intent SDK path as pay; `mode: 'swap'` drives copy and callbacks. */
export const SWAP_SCENARIOS: Scenario[] = [
  {
    id: 'swap-quoted-usdc',
    name: 'Swap into USDC',
    tagline: 'Pick a source token, see a quote, receive a fixed USDC amount on the destination chain.',
    props: {
      mode: 'swap',
      title: 'Swap into USDC',
      submitButtonText: 'Confirm swap',
      network: 'testnet',
      allowNetworkToggle: true,
      intent: {
        requiredToken: {
          address: '0x2BB4FfD7E2c6D432b697554Efd77fA13bdbefd69',
          symbol: 'USDC',
          decimals: 18,
        },
        requiredAmount: BigInt('1000000000000000000'),
        destinationChainName: 'Base Sepolia',
        positionLabel: '1 USDC on Base Sepolia (demo)',
        config: {
          protocol: 'raffles',
          action: 'buyTicket',
          extraDataTypestring: 'address raffleAddress,uint256 numberOfTickets',
          extraData: {
            raffleAddress: '0x0000000000000000000000000000000000000001',
            numberOfTickets: '1',
          },
          fixedOutput: true,
          destinationTestnetChainId: 84532,
        },
      },
    },
  },
];
