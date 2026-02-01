import { http, createConfig } from "wagmi";
import { mainnet, sepolia, hardhat } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// Configuration des RPC personnalisés
const sepoliaRpc = process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://rpc.sepolia.org";
const mainnetRpc = process.env.NEXT_PUBLIC_MAINNET_RPC || "https://eth.llamarpc.com";
const localhostRpc = process.env.NEXT_PUBLIC_LOCALHOST_RPC || "http://127.0.0.1:8545";

// Configuration Wagmi
export const config = createConfig({
  chains: [sepolia, mainnet, hardhat],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [sepolia.id]: http(sepoliaRpc),
    [mainnet.id]: http(mainnetRpc),
    [hardhat.id]: http(localhostRpc),
  },
});

// Chaîne par défaut
export const defaultChain = process.env.NEXT_PUBLIC_DEFAULT_CHAIN === "mainnet" 
  ? mainnet 
  : process.env.NEXT_PUBLIC_DEFAULT_CHAIN === "localhost"
  ? hardhat
  : sepolia;

// Export des chaînes pour utilisation ailleurs
export { mainnet, sepolia, hardhat };
