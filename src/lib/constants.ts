// ============================================
// Constantes de l'application
// ============================================

export const APP_NAME = "Tontine5BLOC";
export const APP_DESCRIPTION = "DApp de gestion de tontine africaine décentralisée";

// ============================================
// Niveaux de tontine
// ============================================

export const TONTINE_LEVELS = {
  LEVEL_1_MAX: 100_000, // < 100K FCFA
  LEVEL_2_MAX: 1_000_000, // 100K - 999K FCFA
  // Niveau 3 = >= 1M FCFA
} as const;

// ============================================
// Fréquences de cotisation
// ============================================

export const FREQUENCIES = [
  { value: "mensuel", label: "Mensuelle", days: 30 },
  { value: "bimensuel", label: "Bi-mensuelle", days: 15 },
  { value: "trimestriel", label: "Trimestrielle", days: 90 },
] as const;

// ============================================
// Limites
// ============================================

export const LIMITS = {
  MIN_MEMBERS: 3,
  MAX_MEMBERS: 50,
  MIN_CONTRIBUTION: 1000, // FCFA
  MAX_SHARES_PER_MEMBER: 3,
  PAYMENT_DEADLINE_MIN: 1,
  PAYMENT_DEADLINE_MAX: 28,
} as const;

// ============================================
// Pénalités par défaut
// ============================================

export const DEFAULT_PENALTIES = {
  BEFORE_BENEFIT: 5000, // FCFA/jour
  AFTER_BENEFIT: 10000, // FCFA/jour
  EXCLUSION_DELAY: 7, // jours
} as const;

// ============================================
// URLs et liens
// ============================================

export const EXTERNAL_LINKS = {
  ETHERSCAN_SEPOLIA: "https://sepolia.etherscan.io",
  ETHERSCAN_MAINNET: "https://etherscan.io",
  GITHUB: "https://github.com/votre-repo/tontine5bloc",
  DOCS: "https://docs.tontine5bloc.com",
} as const;

/**
 * Générer le lien Etherscan pour une transaction
 */
export function getEtherscanTxUrl(hash: string, chainId: number): string {
  const baseUrl = chainId === 1 
    ? EXTERNAL_LINKS.ETHERSCAN_MAINNET 
    : EXTERNAL_LINKS.ETHERSCAN_SEPOLIA;
  return `${baseUrl}/tx/${hash}`;
}

/**
 * Générer le lien Etherscan pour une adresse
 */
export function getEtherscanAddressUrl(address: string, chainId: number): string {
  const baseUrl = chainId === 1 
    ? EXTERNAL_LINKS.ETHERSCAN_MAINNET 
    : EXTERNAL_LINKS.ETHERSCAN_SEPOLIA;
  return `${baseUrl}/address/${address}`;
}

// ============================================
// Messages d'erreur
// ============================================

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: "Veuillez connecter votre portefeuille",
  WRONG_NETWORK: "Veuillez vous connecter au bon réseau",
  INSUFFICIENT_BALANCE: "Solde insuffisant",
  TRANSACTION_FAILED: "La transaction a échoué",
  CONTRACTS_NOT_DEPLOYED: "Les contrats ne sont pas encore déployés sur ce réseau",
  UNAUTHORIZED: "Vous n'êtes pas autorisé à effectuer cette action",
  ALREADY_PAID: "Vous avez déjà payé pour ce cycle",
  INVALID_ADDRESS: "Adresse invalide",
  INVALID_AMOUNT: "Montant invalide",
} as const;

// ============================================
// Messages de succès
// ============================================

export const SUCCESS_MESSAGES = {
  TONTINE_CREATED: "Tontine créée avec succès !",
  MEMBER_ADDED: "Membre ajouté avec succès !",
  CONTRIBUTION_PAID: "Cotisation payée avec succès !",
  BENEFIT_DISTRIBUTED: "Bénéfice distribué avec succès !",
  WALLET_CONNECTED: "Portefeuille connecté !",
} as const;
