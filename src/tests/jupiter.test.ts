// src/tests/jupiter.test.ts
import { SOL_MINT } from "../constants/mints";
import { PublicKey, ParsedTransactionWithMeta } from "@solana/web3.js";
import { decodeSwapInstruction } from "../utils/decodeSwapInstruction";
import { estimateUSDFromSolDelta } from "../utils/estimateUSD";

jest.mock("@jup-ag/api", () => ({
  __esModule: true,
  createJupiterApiClient: jest.fn(() => ({
    getTokenList: jest.fn().mockResolvedValue([
      { mint: SOL_MINT, decimals: 9 },
      { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 }
    ]),
    decodeTransaction: jest.fn()
  }))
}));

describe("Jupiter Swap Detection", () => {
  const mockSlot = 123456;
  const mockBlockTime = Date.now();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Detects SOL→Memecoin swap and estimates USD value", async () => {
    const MOCK_SOL_USD_PRICE = 175.42;

    const tx: ParsedTransactionWithMeta = {
      slot: mockSlot,
      blockTime: mockBlockTime,
      meta: {
        fee: 5000,
        err: null,
        preBalances: [1e9],
        postBalances: [0],
        preTokenBalances: [],
        postTokenBalances: []
      },
      transaction: {
        signatures: ["dummySignature"],
        message: {
          accountKeys: [],
          recentBlockhash: "dummyBlockhash",
          instructions: [
            {
              programId: new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"),
              data: Buffer.from("0102030405060708090A0B0C0D0E0F10", "hex").toString("base64"),
              accounts: [
                new PublicKey("So11111111111111111111111111111111111111112"),
                new PublicKey("MEME111111111111111111111111111111111111111")
              ]
            }
          ]
        }
      }
    };

    console.log("Test Transaction:", JSON.stringify(tx, null, 2));

    const result = await decodeSwapInstruction(tx);
    const estimatedUSD = estimateUSDFromSolDelta(tx.meta!.preBalances, tx.meta!.postBalances, MOCK_SOL_USD_PRICE);

    expect(result).toEqual({
      inputToken: SOL_MINT,
      outputToken: "MEME111111111111111111111111111111111111111"
    });

    expect(estimatedUSD).toBeCloseTo(175.42, 2);
  });
});

