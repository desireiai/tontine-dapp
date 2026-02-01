"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAccount, useChainId } from "wagmi";
import { getUsdtAddress } from "@/config/contracts";
import { USDT_DECIMALS } from "@/config/contracts";
import { formatUnits } from "viem";
import type { Address } from "viem";

// ABI ERC20 standard (simplifié)
const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    name: "symbol",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  // Fonction faucet pour MockUSDT
  {
    name: "faucet",
    type: "function",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

/**
 * Hook pour interagir avec le token USDT
 */
export function useUSDT() {
  const { address } = useAccount();
  const chainId = useChainId();
  const usdtAddress = getUsdtAddress(chainId);

  // ============================================
  // Lecture : Balance de l'utilisateur
  // ============================================
  const { 
    data: balance, 
    refetch: refetchBalance 
  } = useReadContract({
    address: usdtAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // ============================================
  // Lecture : Allowance pour un spender
  // ============================================
  const useAllowance = (spenderAddress: Address) => {
    return useReadContract({
      address: usdtAddress,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: address ? [address, spenderAddress] : undefined,
      query: {
        enabled: !!address,
      },
    });
  };

  // ============================================
  // Écriture : Approuver un spender
  // ============================================
  const {
    data: approveHash,
    writeContract: approveWrite,
    isPending: isApproving,
    error: approveError,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = 
    useWaitForTransactionReceipt({ hash: approveHash });

  const approve = async (spenderAddress: Address, amount: bigint) => {
    approveWrite({
      address: usdtAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spenderAddress, amount],
    });
  };

  // ============================================
  // Écriture : Faucet (pour les tests)
  // ============================================
  const {
    data: faucetHash,
    writeContract: faucetWrite,
    isPending: isFauceting,
    error: faucetError,
  } = useWriteContract();

  const { isLoading: isFaucetConfirming, isSuccess: isFaucetConfirmed } = 
    useWaitForTransactionReceipt({ hash: faucetHash });

  const faucet = async () => {
    faucetWrite({
      address: usdtAddress,
      abi: ERC20_ABI,
      functionName: "faucet",
    });
  };

  // ============================================
  // Formatage
  // ============================================
  const formattedBalance = balance 
    ? formatUnits(balance as bigint, USDT_DECIMALS) 
    : "0";

  return {
    // State
    usdtAddress,
    balance: balance as bigint | undefined,
    formattedBalance,

    // Actions
    approve,
    useAllowance,
    faucet,

    // Approve transaction state
    isApproving,
    isApproveConfirming,
    isApproveConfirmed,
    approveError,
    approveHash,

    // Faucet transaction state
    isFauceting,
    isFaucetConfirming,
    isFaucetConfirmed,
    faucetError,
    faucetHash,

    // Refetch
    refetchBalance,
  };
}
