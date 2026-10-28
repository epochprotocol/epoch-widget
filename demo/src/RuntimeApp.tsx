import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { Toaster } from "sonner";
import { getDemoChains, getDemoRpcUrls } from "./config/rpc";
import { AllowedPrivateData } from "@miden-sdk/miden-wallet-adapter-base";
import { MidenFiSignerProvider } from "@miden-sdk/miden-wallet-adapter-react";
import { MidenProvider } from "@miden-sdk/react";
import {
  themeToCssVars,
  LIGHT_THEME,
} from "@epoch-protocol/epoch-intent-widget";
import App from "./app/App";
import { MIDEN_MAINNET } from "./config/miden-mainnet";
import { MIDEN_MAINNET_WALLET_NETWORK } from "./miden/lib/mainnet-wallet-compat";
import { localSigner } from "./wallet/local-signer";

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

const { connectors } = getDefaultWallets({
  appName: "EpochIntentWidget Demo",
  projectId: "demo", // WalletConnect project ID — replace with a real one for WC support
});

const rpcUrls = getDemoRpcUrls(import.meta.env);
const config = createConfig({
  connectors: [...connectors, localSigner()],
  chains: getDemoChains(rpcUrls),
  transports: Object.fromEntries(
    Object.entries(rpcUrls).map(([chainId, url]) => [Number(chainId), http(url)]),
  ),
  ssr: false,
});

const queryClient = new QueryClient();

const midenConfig = {
  rpcUrl: import.meta.env.VITE_MIDEN_RPC_URL?.trim() || MIDEN_MAINNET.rpcUrl,
  noteTransportUrl:
    import.meta.env.VITE_MIDEN_NOTE_TRANSPORT_URL?.trim() || MIDEN_MAINNET.noteTransportUrl,
};

export default function RuntimeApp() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <MidenProvider config={midenConfig}>
            <MidenFiSignerProvider
              network={MIDEN_MAINNET_WALLET_NETWORK}
              appName="Epoch Intent Widget Demo"
              allowedPrivateData={AllowedPrivateData.Assets}
            >
              <App />
            </MidenFiSignerProvider>
          </MidenProvider>
          <Toaster position="bottom-right" closeButton duration={5000} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
