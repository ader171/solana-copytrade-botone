// src/tests/swap.test.ts
import { Connection, VersionedTransaction, PublicKey } from "@solana/web3.js";
import Jupiter from "@jup-ag/api"; // Corrected import
import { executeJupiterSwap } from "./utils/swapUtils"; // Update path
import { detectSwapFromTransaction } from "../src/utils/tradeDetection"; // Update path

const JUPITER_PROGRAM_ID = new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");

describe("Swap Detection", () => {
  test("Detects Jupiter swaps", async () => {
    const mockTx = {
      meta: {
        preTokenBalances: [{
          mint: "So11111111111111111111111111111111111111112",
          uiTokenAmount: { uiAmount: 1, tokenSymbol: "SOL" }
        }],
        postTokenBalances: [{
          mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          uiTokenAmount: { uiAmount: 100, tokenSymbol: "USDC" }
        }]
      },
      transaction: {
        message: {
          instructions: [{ programId: JUPITER_PROGRAM_ID.toBase58() }]
        }
      }
    };

    const result = detectSwapFromTransaction(mockTx);
    expect(result).toEqual({
      inputToken: "So11111111111111111111111111111111111111112",
      outputToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      amountIn: 1
    });
  });
});
