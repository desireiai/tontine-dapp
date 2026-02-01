"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAccount, useChainId } from "wagmi";
import { getFactoryAddress } from "@/config/contracts";
import { parseUSDT } from "@/lib/formatters";
import type { TontineDeployment } from "@/types/tontine";
import type { Address } from "viem";

// ABI simplifié de TontineFactory (à remplacer par l'ABI complet après compilation)
const FACTORY_ABI = [
  {
    name: "createTontine",
    type: "function",
    inputs: [
      { name: "_name", type: "string" },
      { name: "_symbol", type: "string" },
      { name: "_cotisationAmount", type: "uint256" },
    ],
    outputs: [{ name: "tontineId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "getTontine",
    type: "function",
    inputs: [{ name: "tontineId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "membershipContract", type: "address" },
          { name: "avalisationContract", type: "address" },
          { name: "managerContract", type: "address" },
          { name: "president", type: "address" },
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "cotisationAmount", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "isActive", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    name: "getTontinesByPresident",
    type: "function",
    inputs: [{ name: "president", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    name: "getTontinesCount",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "getAllTontineIds",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    name: "deactivateTontine",
    type: "function",
    inputs: [{ name: "tontineId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * Hook pour interagir avec le contrat TontineFactory
 */
export function useTontineFactory() {
  const { address } = useAccount();
  const chainId = useChainId();
  const factoryAddress = getFactoryAddress(chainId);

  // ============================================
  // Écriture : Créer une tontine
  // ============================================
  const {
    data: createHash,
    writeContract: createTontine,
    isPending: isCreating,
    error: createError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  const handleCreateTontine = async (
    name: string,
    symbol: string,
    cotisationAmountFCFA: string
  ) => {
    // Convertir FCFA en USDT (1 FCFA = 0.0015 USD environ, mais ici on simplifie)
    // En production, utiliser un oracle ou une conversion fixe
    const amountInUSDT = parseUSDT(cotisationAmountFCFA);

    createTontine({
      address: factoryAddress,
      abi: FACTORY_ABI,
      functionName: "createTontine",
      args: [name, symbol, amountInUSDT],
    });
  };

  // ============================================
  // Lecture : Obtenir une tontine par ID
  // ============================================
  const useGetTontine = (tontineId: bigint) => {
    return useReadContract({
      address: factoryAddress,
      abi: FACTORY_ABI,
      functionName: "getTontine",
      args: [tontineId],
    });
  };

  // ============================================
  // Lecture : Obtenir les tontines d'un président
  // ============================================
  const { data: myTontineIds, refetch: refetchMyTontines } = useReadContract({
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: "getTontinesByPresident",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // ============================================
  // Lecture : Nombre total de tontines
  // ============================================
  const { data: tontinesCount } = useReadContract({
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: "getTontinesCount",
  });

  // ============================================
  // Lecture : Tous les IDs de tontine
  // ============================================
  const { data: allTontineIds, refetch: refetchAllTontines } = useReadContract({
    address: factoryAddress,
    abi: FACTORY_ABI,
    functionName: "getAllTontineIds",
  });

  return {
    // State
    factoryAddress,
    myTontineIds: myTontineIds as bigint[] | undefined,
    allTontineIds: allTontineIds as bigint[] | undefined,
    tontinesCount: tontinesCount as bigint | undefined,

    // Actions
    createTontine: handleCreateTontine,
    useGetTontine,

    // Transaction state
    isCreating,
    isConfirming,
    isConfirmed,
    createError,
    createHash,

    // Refetch
    refetchMyTontines,
    refetchAllTontines,
  };
}
