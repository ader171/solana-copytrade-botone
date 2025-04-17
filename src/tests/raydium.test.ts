import { decodeRaydiumInstruction } from "../utils/decodeRaydiumInstruction";
import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";

describe("Raydium Swap Detection", () => {
  test("Detects a Raydium swap transaction", async () => {
    const inputMint = "So11111111111111111111111111111111111111112";
    const outputMint = "MEME111111111111111111111111111111111111111";

    const tx: ParsedTransactionWithMeta = {
      slot: 123,
      blockTime: Date.now(),
      meta: {
        err: null,
        fee: 5000,
        preTokenBalances: [
          {
            mint: inputMint,
            owner: "target_wallet_address",
            uiTokenAmount: {
              uiAmount: 0.5,
              decimals: 9,
              amount: "500000000"
            },
            accountIndex: 0 // ✅ required
          }
        ],
        postTokenBalances: [],
        preBalances: [],
        postBalances: []
      },
      transaction: {
        signatures: ["dummySig"],
        message: {
          recentBlockhash: "dummy",
          accountKeys: [],
          instructions: [
            {
              programId: new PublicKey("RVKd61ztZW9JNUk3JTnYcmcW4ZcE6QA4hayj7TzjRc5"),
              accounts: [
                new PublicKey(inputMint),
                new PublicKey(outputMint)
              ],
              data: "dummyData"
            }
          ]
        }
      }
    };

    const result = await decodeRaydiumInstruction(tx);

    expect(result).toEqual({
      inputToken : inputMint,
      outputToken: outputMint,
      amountIn: 0.5
    });
  });
});

