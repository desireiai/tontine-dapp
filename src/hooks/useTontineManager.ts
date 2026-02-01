"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAccount } from "wagmi";
import type { Address } from "viem";
import type { Cycle, MemberRegistration, MemberLevel } from "@/types/tontine";

// ABI simplifié de TontineManager
const MANAGER_ABI = [
  {
    name: "registerMember",
    type: "function",
    inputs: [
      { name: "tontineId", type: "uint256" },
      { name: "member", type: "address" },
      {
        name: "data",
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "avaliseur", type: "address" },
          { name: "ipfsHash", type: "string" },
          { name: "uri", type: "string" },
          { name: "level", type: "uint8" },
        ],
      },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "payCotisation",
    type: "function",
    inputs: [
      { name: "tontineId", type: "uint256" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "getCurrentCycle",
    type: "function",
    inputs: [{ name: "tontineId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "tontineId", type: "uint256" },
          { name: "paymentDeadline", type: "uint256" },
          { name: "totalCollected", type: "uint256" },
          { name: "beneficiaryTokenId", type: "uint256" },
          { name: "beneficiaryAddress", type: "address" },
          { name: "isDistributed", type: "bool" },
          { name: "isActive", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    name: "hasPayedCurrentCycle",
    type: "function",
    inputs: [
      { name: "tontineId", type: "uint256" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    name: "currentCycle",
    type: "function",
    inputs: [{ name: "tontineId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

interface UseTontineManagerProps {
  managerAddress: Address;
  tontineId: bigint;
}

/**
 * Hook pour interagir avec le contrat TontineManager
 */
export function useTontineManager({ managerAddress, tontineId }: UseTontineManagerProps) {
  const { address } = useAccount();

  // ============================================
  // Écriture : Enregistrer un membre
  // ============================================
  const {
    data: registerHash,
    writeContract: registerMemberWrite,
    isPending: isRegistering,
    error: registerError,
  } = useWriteContract();

  const { isLoading: isRegisterConfirming, isSuccess: isRegisterConfirmed } = 
    useWaitForTransactionReceipt({ hash: registerHash });

  const registerMember = async (
    memberAddress: Address,
    data: {
      name: string;
      avaliseur: Address;
      ipfsHash: string;
      uri: string;
      level: MemberLevel;
    }
  ) => {
    registerMemberWrite({
      address: managerAddress,
      abi: MANAGER_ABI,
      functionName: "registerMember",
      args: [tontineId, memberAddress, data],
    });
  };

  // ============================================
  // Écriture : Payer une cotisation
  // ============================================
  const {
    data: payHash,
    writeContract: payCotisationWrite,
    isPending: isPaying,
    error: payError,
  } = useWriteContract();

  const { isLoading: isPayConfirming, isSuccess: isPayConfirmed } = 
    useWaitForTransactionReceipt({ hash: payHash });

  const payCotisation = async (tokenId: bigint) => {
    payCotisationWrite({
      address: managerAddress,
      abi: MANAGER_ABI,
      functionName: "payCotisation",
      args: [tontineId, tokenId],
    });
  };

  // ============================================
  // Lecture : Cycle actuel
  // ============================================
  const { 
    data: currentCycle, 
    refetch: refetchCurrentCycle 
  } = useReadContract({
    address: managerAddress,
    abi: MANAGER_ABI,
    functionName: "getCurrentCycle",
    args: [tontineId],
  });

  // ============================================
  // Lecture : Numéro du cycle actuel
  // ============================================
  const { data: currentCycleNumber } = useReadContract({
    address: managerAddress,
    abi: MANAGER_ABI,
    functionName: "currentCycle",
    args: [tontineId],
  });

  // ============================================
  // Hook pour vérifier si un membre a payé
  // ============================================
  const useHasPaid = (tokenId: bigint) => {
    return useReadContract({
      address: managerAddress,
      abi: MANAGER_ABI,
      functionName: "hasPayedCurrentCycle",
      args: [tontineId, tokenId],
    });
  };

  return {
    // State
    currentCycle: currentCycle as Cycle | undefined,
    currentCycleNumber: currentCycleNumber as bigint | undefined,

    // Actions
    registerMember,
    payCotisation,
    useHasPaid,

    // Register transaction state
    isRegistering,
    isRegisterConfirming,
    isRegisterConfirmed,
    registerError,
    registerHash,

    // Pay transaction state
    isPaying,
    isPayConfirming,
    isPayConfirmed,
    payError,
    payHash,

    // Refetch
    refetchCurrentCycle,
  };
}
