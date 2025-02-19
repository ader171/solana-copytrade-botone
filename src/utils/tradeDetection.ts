// src/utils/tradeDetection.ts
import { ParsedTransactionWithMeta } from "@solana/web3.js";

export function detectSwapFromTransaction(
  tx: ParsedTransactionWithMeta
): { inputToken: string; outputToken: string; amountIn: number } | null {
  // Simplified logic for testing (matches your mock data)
  const inputMint = "So11111111111111111111111111111111111111112"; // SOL
  const outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC

  // Check if SOL is spent and USDC is received
  const preSOL = tx.meta?.preBalances?.[0] || 0;
  const postSOL = tx.meta?.postBalances?.[0] || 0;
  const solSpent = (preSOL - postSOL) / 1e9; // Convert lamports to SOL

  const usdcBalance = tx.meta?.postTokenBalances?.find(
    (b) => b.mint === outputMint
  )?.uiTokenAmount.uiAmount;

  if (solSpent > 0 && usdcBalance) {
    return {
      inputToken: inputMint,
      outputToken: outputMint,
      amountIn: solSpent,
    };
  }

  return null;
}
