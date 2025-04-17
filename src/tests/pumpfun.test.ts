// src/tests/pumpfun.test.ts
import { PublicKey, ParsedTransactionWithMeta } from "@solana/web3.js";
import { decodeSwapInstruction } from "../utils/decodeSwapInstruction";
import { createPumpFunTx } from "./__mocks__/transactionFactories";
import { estimateUSDFromSolDelta } from "../utils/estimateUSD"; // ✅ Reuse Jupiter logic

jest.mock("@jup-ag/api", () => ({
  __esModule: true,
  createJupiterApiClient: jest.fn(() => ({
    getTokenList: jest.fn().mockResolvedValue([
      { mint: "So11111111111111111111111111111111111111112", decimals: 9 },
      { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 }
    ]),
    decodeTransaction: jest.fn().mockResolvedValue(null) // Force Pump.fun branch
  }))
}));

describe("Pump.fun Swap Detection", () => {
  const MEME_MINT = "E5vT4FAgF8ePgHj1DkUpVt3pP6BRqHdcKrUNyUEcBFL6";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Detects valid Pump.fun SOL→Memecoin swap and estimates USD value", async () => {
    const MOCK_SOL_USD_PRICE = 175.42;

    const tx: ParsedTransactionWithMeta = {
      ...createPumpFunTx(MEME_MINT, 0.5), // 0.5 SOL spent
      slot: 123456,
      blockTime: Date.now()
    };

    const result = await decodeSwapInstruction(tx);
    const estimatedUSD = estimateUSDFromSolDelta(tx.meta!.preBalances, tx.meta!.postBalances, MOCK_SOL_USD_PRICE);

    expect(result).toEqual({
      inputToken: "So11111111111111111111111111111111111111112",
      outputToken: MEME_MINT
    });

    expect(estimatedUSD).toBeCloseTo(87.71, 2); // 0.5 * 175.42
  });

  test("Rejects invalid Pump.fun mint", async () => {
    const invalidMint = "INV*LIDMINT";
    console.log("🔹 Invalid Pump.fun memeMint:", invalidMint);

    expect(() => new PublicKey(invalidMint)).toThrow();
  });
});

