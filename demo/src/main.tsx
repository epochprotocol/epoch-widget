import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider, http } from 'wagmi';
import { arbitrum, base, baseSepolia, optimism, optimismSepolia, polygon, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import './index.css';
import '@epoch-protocol/epoch-intent-widget/styles.css';
import '@rainbow-me/rainbowkit/styles.css';
import 'sonner/dist/styles.css';
import { Toaster } from 'sonner';
import {
  AllowedPrivateData,
  WalletAdapterNetwork,
} from '@miden-sdk/miden-wallet-adapter-base';
import { MidenFiSignerProvider } from '@miden-sdk/miden-wallet-adapter-react';
import { themeToCssVars, LIGHT_THEME } from '@epoch-protocol/epoch-intent-widget';
import App from './app/App';

// Project the library's `--epoch-*` design tokens onto `:root` so Tailwind
// utilities aliased in `index.css` (`bg-canvas`, `text-fg`, `border-line`, …)
// resolve everywhere — including portalled modals rendered into
// `document.body`. We write to `document.documentElement.style` instead of a
// wrapper `<div style={...}>` because portal children sit outside the React
// tree and can't inherit from a JSX ancestor.
{
  const vars = themeToCssVars(LIGHT_THEME) as Record<string, string>;
  for (const [key, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(key, value);
  }
}

const config = getDefaultConfig({
  appName: 'EpochIntentWidget Demo',
  projectId: 'demo', // WalletConnect project ID — replace with a real one for WC support
  chains: [base, optimism, polygon, arbitrum, baseSepolia, sepolia, optimismSepolia],
  transports: {
    [base.id]:       http('https://mainnet.base.org'),
    [optimism.id]:   http('https://mainnet.optimism.io'),
    [polygon.id]:    http('https://polygon.lava.build'),
    [arbitrum.id]:   http('https://arb1.arbitrum.io/rpc'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [sepolia.id]:    http('https://eth-sepolia-testnet.api.pocket.network'),
    [optimismSepolia.id]: http('https://sepolia.optimism.io'),
  },
  ssr: false,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <MidenFiSignerProvider
            network={WalletAdapterNetwork.Testnet}
            appName="Epoch Intent Widget Demo"
            allowedPrivateData={AllowedPrivateData.Assets}
          >
            <App />
            <Toaster position="bottom-right" closeButton duration={5000} />
          </MidenFiSignerProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
