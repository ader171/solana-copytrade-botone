// src/tests/swap.test.ts
import { Connection, VersionedTransaction, PublicKey } from "@solana/web3.js";
import Jupiter from "@jup-ag/api"; // Corrected import
import { executeJupiterSwap } from "../../src/utils/swapUtils"; // Update path
import { detectSwapFromTransaction } from "../../src/utils/tradeDetection"; // Update path

// Use real-looking dummy keys (they don't have to be valid, but should be formatted as PublicKey strings)
const dummyPubkey1 = new PublicKey("So11111111111111111111111111111111111111112");
const dummyPubkey2 = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const dummyAccountKey1 = new PublicKey("4VjRwuE1tsrbAUgdQEe62nq6vTdedFKqKM5KpX7JJvp4");
const dummyAccountKey2 = new PublicKey("F1C3X8ySUq2oFTQeak7PkG7fiG8GqFEga29kmMGsUZDK");
const JUPITER_PROGRAM_ID = new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");

describe("Swap Detection", () => {
  test("Detects Jupiter swaps", async () => {
const mockTx = {
  slot: 123456,
  meta: {
    fee: 5000,
    err: null,
    preBalances: [2000000000], // e.g., 2 SOL in lamports
    postBalances: [1000000000], // e.g., 1 SOL remaining
    preTokenBalances: [
      {
        mint: dummyPubkey1.toBase58(),
        accountIndex: 0,
        uiTokenAmount: {
          uiAmount: 2,
          decimals: 9,
          tokenSymbol: "SOL",
          amount: "2000000000"
        }
      }
    ],
    postTokenBalances: [
      {
        mint: dummyPubkey2.toBase58(),
        accountIndex: 0,
        uiTokenAmount: {
          uiAmount: 100,
          decimals: 6,
          tokenSymbol: "USDC",
          amount: "100000000"
        }
      }
    ]
  },
  transaction: {
    signatures: ["dummySignature"],
    message: {
      accountKeys: [
        { pubkey: dummyAccountKey1, signer: true, writable: true },
        { pubkey: dummyAccountKey2, signer: false, writable: false }
      ],
      recentBlockhash: "dummyBlockhash",
      instructions: [
        {
          programId: JUPITER_PROGRAM_ID,
          accounts: [dummyAccountKey1, dummyAccountKey2],
          data: "3a2f9c"
        }
      ]
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

