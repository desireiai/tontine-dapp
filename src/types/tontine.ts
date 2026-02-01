// ============================================
// Types pour les smart contracts Tontine
// ============================================

import { Address } from "viem";

// Enums correspondant aux contrats Solidity
export enum MemberLevel {
  STANDARD = 0,
  PREMIUM = 1,
  VIP = 2,
}

export enum MemberStatus {
  ACTIVE = 0,
  BENEFITED = 1,
  SUSPENDED = 2,
  EXCLUDED = 3,
}

// ============================================
// Types Membre
// ============================================

export interface MemberRegistration {
  name: string;
  avaliseur: Address;
  ipfsHash: string;
  uri: string;
  level: MemberLevel;
}

export interface MemberInfo {
  tokenId: bigint;
  name: string;
  wallet: Address;
  montantCotisation: bigint;
  caution: bigint;
  avaliseur: Address;
  createdAt: bigint;
  lastTransferAt: bigint;
  position: number;
  penaltiesAccumulated: number;
  partsCount: number;
  status: MemberStatus;
  level: MemberLevel;
  ipfsHash: string;
}

export interface MemberDisplay {
  id: number;
  name: string;
  wallet: string;
  status: "active" | "benefited" | "suspended" | "excluded";
  position: number;
  cotisations: "À jour" | "En retard";
  avaliseur: string;
  hasPaidCurrentCycle: boolean;
}

// ============================================
// Types Tontine
// ============================================

export interface TontineConfig {
  cotisationAmount: bigint;
  memberCount: number;
  isActive: boolean;
}

export interface TontineDeployment {
  membershipContract: Address;
  avalisationContract: Address;
  managerContract: Address;
  president: Address;
  name: string;
  symbol: string;
  cotisationAmount: bigint;
  createdAt: bigint;
  isActive: boolean;
}

export interface TontineDisplay {
  id: number;
  name: string;
  symbol: string;
  president: string;
  cotisationAmount: string; // Formaté en USDT
  memberCount: number;
  currentCycle: number;
  totalCollected: string;
  isActive: boolean;
  createdAt: Date;
}

// ============================================
// Types Cycle
// ============================================

export interface Cycle {
  tontineId: bigint;
  paymentDeadline: bigint;
  totalCollected: bigint;
  beneficiaryTokenId: bigint;
  beneficiaryAddress: Address;
  isDistributed: boolean;
  isActive: boolean;
}

export interface CycleDisplay {
  cycleNumber: number;
  paymentDeadline: Date;
  totalCollected: string;
  beneficiary: {
    tokenId: number;
    name: string;
    address: string;
  };
  isDistributed: boolean;
  isActive: boolean;
  progress: number; // Pourcentage de cotisations payées
}

// ============================================
// Types Cotisation
// ============================================

export interface CotisationHistory {
  cycleNumber: number;
  month: string;
  amount: string;
  status: "complete" | "en-cours" | "en-retard";
  beneficiary: string;
  paidAt?: Date;
}

// ============================================
// Types pour les formulaires
// ============================================

export interface CreateTontineForm {
  name: string;
  symbol: string;
  cotisationAmount: string;
  // Champs additionnels pour l'UI (non stockés on-chain)
  frequence: "mensuel" | "bimensuel" | "trimestriel";
  dateLimite: number;
  maxMembres: number;
  maxParts: number;
  penaliteAvant: number;
  penaliteApres: number;
  delaiExclusion: number;
  reglement?: string;
}

export interface AddMemberForm {
  name: string;
  wallet: string;
  phone: string;
  avaliseur: string;
  parts: number;
  level: MemberLevel;
  ipfsHash?: string;
}

// ============================================
// Types pour les événements
// ============================================

export interface TontineCreatedEvent {
  tontineId: bigint;
  president: Address;
  membershipContract: Address;
  avalisationContract: Address;
  managerContract: Address;
  name: string;
  cotisationAmount: bigint;
}

export interface CotisationPaidEvent {
  tontineId: bigint;
  cycleId: bigint;
  tokenId: bigint;
  amount: bigint;
}

export interface BenefitDistributedEvent {
  tontineId: bigint;
  cycleId: bigint;
  beneficiary: Address;
  amountNet: bigint;
}

// ============================================
// Types utilitaires
// ============================================

export type TransactionStatus = "idle" | "pending" | "success" | "error";

export interface TransactionState {
  status: TransactionStatus;
  hash?: string;
  error?: string;
}
