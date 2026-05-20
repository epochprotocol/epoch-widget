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
    name: 'Flat pay (Trails-style)',
    tagline: 'toAddress / toAmount / toToken / toChainId — no nested intent',
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
    tagline: 'Fixed-output intent on Base mainnet',
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
    tagline: 'Variable-input swap into a vault',
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
    tagline: 'Forced testnet, hide toggle',
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
    tagline: 'Starts on testnet, user can switch',
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
    name: 'EVM swap (quoted pay-in)',
    tagline: 'Pick source token, see quoted input, fixed USDC out — like Miden quote UX, EVM-only',
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
    name: 'Swap (quoted pay-in)',
    tagline: 'Same fixed-output quote flow as EVM swap scenario — with mode="swap"',
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
