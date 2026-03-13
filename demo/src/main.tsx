import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider, http } from 'wagmi';
import { arbitrum, base, baseSepolia, optimism, polygon, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import App from './App';

const config = getDefaultConfig({
  appName: 'EpochIntentWidget Demo',
  projectId: 'demo', // WalletConnect project ID — replace with a real one for WC support
  chains: [base, optimism, polygon, arbitrum, baseSepolia, sepolia],
  transports: {
    [base.id]:       http('https://api.zan.top/base-mainnet'),
    [optimism.id]:   http('https://mainnet.optimism.io'),
    [polygon.id]:    http('https://polygon.lava.build'),
    [arbitrum.id]:   http('https://arb1.arbitrum.io/rpc'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [sepolia.id]:    http('https://eth-sepolia-testnet.api.pocket.network'),
  },
  ssr: false,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
