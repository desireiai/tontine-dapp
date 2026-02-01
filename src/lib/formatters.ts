import { formatUnits, parseUnits } from "viem";
import { USDT_DECIMALS } from "@/config/contracts";

// ============================================
// Formatage des montants
// ============================================

/**
 * Formater un montant USDT (6 décimales) pour l'affichage
 */
export function formatUSDT(amount: bigint): string {
  const formatted = formatUnits(amount, USDT_DECIMALS);
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(formatted));
}

/**
 * Parser un montant USDT depuis une chaîne
 */
export function parseUSDT(amount: string): bigint {
  return parseUnits(amount, USDT_DECIMALS);
}

/**
 * Formater un montant en FCFA (pour l'affichage)
 */
export function formatFCFA(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("fr-FR").format(num) + " FCFA";
}

// ============================================
// Formatage des adresses
// ============================================

/**
 * Tronquer une adresse Ethereum
 */
export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address || address.length < startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Vérifier si une chaîne est une adresse Ethereum valide
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// ============================================
// Formatage des dates
// ============================================

/**
 * Formater un timestamp Unix en date lisible
 */
export function formatDate(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Formater un timestamp en date et heure
 */
export function formatDateTime(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Calculer le nombre de jours restants
 */
export function daysRemaining(deadline: bigint | number): number {
  const now = Date.now() / 1000;
  const target = Number(deadline);
  const diff = target - now;
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60)));
}

/**
 * Formater un mois/année
 */
export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

// ============================================
// Formatage des statuts
// ============================================

import { MemberStatus } from "@/types/tontine";

/**
 * Convertir le statut enum en chaîne lisible
 */
export function formatMemberStatus(status: MemberStatus): string {
  const statusMap: Record<MemberStatus, string> = {
    [MemberStatus.ACTIVE]: "Actif",
    [MemberStatus.BENEFITED]: "A bénéficié",
    [MemberStatus.SUSPENDED]: "Suspendu",
    [MemberStatus.EXCLUDED]: "Exclu",
  };
  return statusMap[status] || "Inconnu";
}

/**
 * Obtenir la couleur du badge selon le statut
 */
export function getStatusColor(status: MemberStatus): string {
  const colorMap: Record<MemberStatus, string> = {
    [MemberStatus.ACTIVE]: "bg-green-500",
    [MemberStatus.BENEFITED]: "bg-blue-500",
    [MemberStatus.SUSPENDED]: "bg-yellow-500",
    [MemberStatus.EXCLUDED]: "bg-red-500",
  };
  return colorMap[status] || "bg-gray-500";
}

// ============================================
// Calculs
// ============================================

/**
 * Calculer le pourcentage de progression
 */
export function calculateProgress(current: bigint, total: bigint): number {
  if (total === BigInt(0)) return 0;
  return Number((current * BigInt(100)) / total);
}

/**
 * Déterminer le niveau de tontine selon le montant
 */
export function getTontineLevel(amountFCFA: number): 1 | 2 | 3 {
  if (amountFCFA < 100000) return 1;
  if (amountFCFA < 1000000) return 2;
  return 3;
}

/**
 * Obtenir les infos du niveau de tontine
 */
export function getLevelInfo(level: 1 | 2 | 3) {
  const levels = {
    1: {
      badge: "Niveau 1 - Petits Montants",
      color: "bg-chart-2",
      avalisation: "Créateur seul",
      garantie: "Aucune",
      description: "Pour les tontines à faible enjeu financier. Le créateur avalise tous les membres."
    },
    2: {
      badge: "Niveau 2 - Montants Intermédiaires",
      color: "bg-secondary",
      avalisation: "Créateur seul",
      garantie: "Caution exigée",
      description: "Garantie supplémentaire requise. Le créateur reste l'avaliseur unique."
    },
    3: {
      badge: "Niveau 3 - Grands Montants",
      color: "bg-primary",
      avalisation: "Membres entre eux",
      garantie: "Caution + avalisation mutuelle",
      description: "Les membres s'avalisent mutuellement avec algorithme de réorganisation dynamique."
    },
  };
  return levels[level];
}
