import { Address } from "viem";
import { sepolia, mainnet, hardhat } from "wagmi/chains";

// ============================================
// Adresses des contrats par réseau
// ============================================

interface ContractAddresses {
  factory: Address;
  usdt: Address;
}

type ChainAddresses = {
  [chainId: number]: ContractAddresses;
};

// Adresses déployées (à mettre à jour après chaque déploiement)
export const CONTRACT_ADDRESSES: ChainAddresses = {
  // Sepolia Testnet
  [sepolia.id]: {
    factory: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address) || "0x0000000000000000000000000000000000000000",
    usdt: (process.env.NEXT_PUBLIC_USDT_ADDRESS as Address) || "0x0000000000000000000000000000000000000000",
  },
  
  // Ethereum Mainnet
  [mainnet.id]: {
    factory: "0x0000000000000000000000000000000000000000", // À déployer
    usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Vrai USDT
  },
  
  // Localhost (Hardhat)
  [hardhat.id]: {
    factory: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address) || "0x0000000000000000000000000000000000000000",
    usdt: (process.env.NEXT_PUBLIC_USDT_ADDRESS as Address) || "0x0000000000000000000000000000000000000000",
  },
};

// ============================================
// Fonctions utilitaires
// ============================================

/**
 * Obtenir l'adresse de la Factory pour un réseau donné
 */
export function getFactoryAddress(chainId: number): Address {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`Réseau non supporté: ${chainId}`);
  }
  return addresses.factory;
}

/**
 * Obtenir l'adresse USDT pour un réseau donné
 */
export function getUsdtAddress(chainId: number): Address {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`Réseau non supporté: ${chainId}`);
  }
  return addresses.usdt;
}

/**
 * Vérifier si les contrats sont déployés sur un réseau
 */
export function areContractsDeployed(chainId: number): boolean {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) return false;
  
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  return addresses.factory !== zeroAddress && addresses.usdt !== zeroAddress;
}

// ============================================
// Constantes des contrats
// ============================================

// Décimales USDT
export const USDT_DECIMALS = 6;

// Rôles (hash keccak256)
export const ROLES = {
  DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
  PRESIDENT_ROLE: "0x8da5cb5b000000000000000000000000000000000000000000000000000000",
  MANAGER_ROLE: "0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08",
} as const;
